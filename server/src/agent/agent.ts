import axios from "axios";
import { AxiosResponse } from 'axios';
import { JSDOM } from "jsdom";
import puppeteer from "puppeteer";
import { Url } from "../model/urlModel";

// -------------------------------------------------------------
// CONSTANTS
// -------------------------------------------------------------
const OPENROUTER_API = process.env.OPENROUTER_API;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const LLAMA_MODEL = "meta-llama/llama-3-8b-instruct"; // FREE MODEL

interface OpenRouterMessage {
  role: string;
  content: string;
}

interface OpenRouterChoice {
  message: OpenRouterMessage;
}

interface OpenRouterResponse {
  choices: OpenRouterChoice[];
}

interface SafetyResult {
  safety_score?: number;
  risk_level?: "LOW" | "MEDIUM" | "HIGH";
  possible_phishing?: boolean;
  fraud_indicator?: boolean;
  is_adult_content?: boolean;
  is_violent?: boolean;
  age_rating?: "3+" | "7+" | "13+" | "16+" | "18+";
  content_categories?: string[];
  reasons?: string[];
  raw_response?: string;
}

async function llamaRequest(prompt: string): Promise<string> {
  if (!OPENROUTER_API) {
    throw new Error("OPENROUTER_API missing in .env");
  }

  const response: AxiosResponse<OpenRouterResponse> = await axios.post(
    OPENROUTER_URL,
    {
      model: LLAMA_MODEL,
      messages: [{ role: "user", content: prompt }],
    },
    {
      headers: {
        Authorization: `Bearer ${OPENROUTER_API}`,
        "Content-Type": "application/json",
      },
      timeout: 60000,
    }
  );

  return response.data.choices[0].message.content;
}


async function summarizePage(text: string, url: string): Promise<string> {
  const prompt = `
Summarize the following webpage into short bullet points.
Ignore ads, menus, and irrelevant content.

URL: ${url}

Content:
"""${text.slice(0, 8000)}"""
`;

  return llamaRequest(prompt);
}

async function analyzeSafety(text: string, url: string): Promise<SafetyResult> {
  const prompt = `
Analyze this webpage and return ONLY JSON in exactly this format:

{
  "safety_score": number,
  "risk_level": "LOW" | "MEDIUM" | "HIGH",
  "possible_phishing": boolean,
  "fraud_indicator": boolean,
  "is_adult_content": boolean,
  "is_violent": boolean,
  "age_rating": "3+" | "7+" | "13+" | "16+" | "18+",
  "content_categories": string[],
  "reasons": string[]
}

Content:
"""${text.slice(0, 8000)}"""

Return ONLY the JSON. No explanation.
`;

  const raw = await llamaRequest(prompt);

  try {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      return JSON.parse(raw.slice(start, end + 1));
    }
  } catch {
    // ignore JSON error
  }

  return { raw_response: raw };
}


async function fetchPageHtml(url: string): Promise<string> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const html = await page.content();
    await browser.close();
    return html;
  } catch (error: unknown) {
    await browser.close();
    const msg = error instanceof Error ? error.message : "Unknown Puppeteer error";
    throw new Error("Puppeteer failed: " + msg);
  }
}

function extractText(html: string): string {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  document.querySelectorAll("script, style, nav, footer, header, noscript, aside")
    .forEach((el) => el.remove());

  const main =
    document.querySelector("main") ||
    document.querySelector("article") ||
    document.querySelector("#content") ||
    document.body;

  return (main?.textContent || "").replace(/\s+/g, " ").trim();
}


function computeHeuristicRisk(url: string, html: string): number {
  let score = 50;

  if (!url.startsWith("https://")) score -= 10;
  if (html.toLowerCase().includes("win money")) score -= 20;
  if (html.toLowerCase().includes("credit card")) score -= 25;
  if (html.length < 500) score -= 10;

  return Math.max(0, Math.min(100, score));
}


export const analyzeWebsite = async (req:any, res:any) => {
  try {

    const { id } = req.body;
    console.log(id);
    const urlDoc = await Url.findOne({ url_id: id });
    if (!urlDoc) return res.status(400).json({ error: "Invalid link" });

    const url = urlDoc.url;
    console.log("analyzing ",url);
    // Scrape
    const html = await fetchPageHtml(url);
    const text = extractText(html);

    if (text.length < 120) {
      return res.status(400).json({
        error: "Not enough readable content for analysis.",
      });
    }
    const [summary, safety] = await Promise.all([
      summarizePage(text, url),
      analyzeSafety(text, url),
    ]);

    const heuristic = computeHeuristicRisk(url, html);

    const finalScore =
      typeof safety.safety_score === "number"
        ? Math.round(safety.safety_score * 0.7 + heuristic * 0.3)
        : heuristic;

    res.json({
      url,
      summary,
      safety_ai: safety,
      heuristics: { heuristic_score: heuristic },
      final_safety_score: finalScore,
      raw_preview: text.slice(0, 300),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown server error";
    console.error("AnalyzeWebsite Error:", msg);
    res.status(500).json({ error: msg });
  }
};
