
import axios from "axios";
import { JSDOM } from "jsdom";
import OpenAI from "openai";
import { Url } from "../model/urlModel";

const OPENAI_MODEL = "gpt-4.1-mini";

async function fetchPageHtml(url: string): Promise<string> {
  try {
    console.log("Fetching from:", url);
    const apiUrl = `http://api.scraperapi.com?api_key=${process.env.SCRAPER_API}&url=${encodeURIComponent(url)}`;
    const res = await axios.get<string>(apiUrl, { timeout: 20000 });
    return res.data || "";
  } catch (e: any) {
    throw new Error(`ScraperAPI failed: ${e.message}`);
  }
}

function extractMainText(html: string): string {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  doc.querySelectorAll("script, style, nav, footer, header, noscript, aside")
    .forEach((el: Element) => el.remove());

  const main =
    doc.querySelector("main") ||
    doc.querySelector("article") ||
    doc.querySelector("#content") ||
    doc.body;

  const raw = main?.textContent || "";
  return raw.replace(/\s+/g, " ").trim();
}

async function summarizeWithOpenAI(text: string, url: string): Promise<string> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  const prompt = `
You are an AI agent that summarizes web pages.

Summarize the following web page content in bullet points.
Ignore ads, menus, comments, banners.

Source URL: ${url}

Content:
"""${text.slice(0, 10000)}"""
`;
  const response = await client.responses.create({
    model: OPENAI_MODEL,
    input: prompt
  });
  return response.output_text || "No summary returned.";
}

async function analyzeSafety(text: string, url: string): Promise<any> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  const prompt = `
You are a website safety analysis AI.

Analyze the webpage and return JSON ONLY:

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
"""${text.slice(0, 10000)}"""
URL: ${url}
Return ONLY valid JSON.
`;

  const response = await client.responses.create({
    model: "gpt-4.1",
    input: prompt
  });

  return JSON.parse(response.output_text);
}

function computeHeuristicRisk(url: string, html: string) {
  let score = 50;

  if (!url.startsWith("https://")) score -= 10;
  if (html.includes("win money")) score -= 20;
  if (html.includes("enter credit card")) score -= 25;
  if (html.length < 500) score -= 10;

  return Math.max(0, Math.min(100, score));
}

export const analyzeWebsite = async (req: any, res: any) => {
  const {id}=req.body;
  const urlDoc = await Url.findOne({ url_id: id });
  if (!urlDoc) {
    return res.status(400).json({ error: "Not A Valid Link" });
  }

  const url = urlDoc?.url;
  if (!url) return res.status(400).json({ error: "URL is required" });

  console.log(`Analyzing: ${url}`);

  try {
    const html = await fetchPageHtml(url);
    const cleanText = extractMainText(html);

    if (cleanText.length < 100) {
      return res.status(400).json({
        error: "Not enough readable content to analyze this page."
      });
    }
    const summary = await summarizeWithOpenAI(cleanText, url);

    const aiSafety = await analyzeSafety(cleanText, url);

    const heuristicScore = computeHeuristicRisk(url, html);

    const finalScore = Math.round(aiSafety.safety_score * 0.7 + heuristicScore * 0.3);

    const result = {
      url,
      summary,
      safety_ai: aiSafety,
      heuristics: {
        heuristic_score: heuristicScore,
      },
      final_safety_score: finalScore,
      raw_preview: cleanText.slice(0, 400),
    };

    res.json(result);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
};