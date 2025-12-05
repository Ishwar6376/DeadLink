// agent.js
import 'dotenv/config';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import OpenAI from 'openai';
import fs from 'fs';

// -------- CONFIG --------
const DEMO_URL = 'https://example.com';   // replace later with your real link if you want
const OPENAI_MODEL = 'gpt-4.1-mini';
const OUTPUT_FILE = 'summary.json';
// ------------------------

// 1. Fetch HTML of the page
async function fetchPageHtml(url) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (AI summarizer bot)',
  };

  const res = await axios.get(url, {
    headers,
    timeout: 20000, // 20s timeout
    maxRedirects: 5,
  });

  return res.data; // HTML string
}

// 2. Extract main readable text from HTML
function extractMainText(html) {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  // Remove noisy elements
  doc.querySelectorAll('script, style, nav, footer, header, noscript, aside').forEach(
    (el) => el.remove()
  );

  // Try likely content containers first
  const main =
    doc.querySelector('main') ||
    doc.querySelector('article') ||
    doc.querySelector('#content') ||
    doc.body ||
    doc;

  const rawText = main.textContent || '';
  const cleanText = rawText.replace(/\s+/g, ' ').trim(); // collapse whitespace
  return cleanText;
}

// 3. Call OpenAI to summarize
async function summarizeWithOpenAI(text, url) {
  const truncated = text.slice(0, 10000); // basic safety limit

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `
You are an AI agent that summarizes web pages.

Summarize the following web page content in  bullet points.
Focus on the main ideas only.
Ignore navigation menus, cookie banners, sidebars, comments, and ads.

Source URL: ${url}

Content:
"""${truncated}"""
`;

  const response = await client.responses.create({
    model: OPENAI_MODEL,
    input: prompt,
  });

  const summary = response.output[0].content[0].text;
  return summary;
}

// 4. Save summary + metadata to JSON
function saveSummaryToJson(url, summary, fullText, outputPath) {
  const data = {
    url,
    generated_at: new Date().toISOString(),
    summary,
    raw_text_preview: fullText.slice(0, 500), // optional preview
  };

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`\n✅ JSON summary saved to: ${outputPath}`);
}

// 5. Main flow
async function main() {
  const url = process.argv[2] || DEMO_URL;

  console.log(`🌐 Visiting: ${url}\n`);

  let html;
  try {
    html = await fetchPageHtml(url);
  } catch (err) {
    console.error('❌ Error while fetching the page:', err.message || err);
    process.exit(1);
  }

  const text = extractMainText(html);
  if (!text || text.length < 100) {
    console.error('❌ Not enough readable text found on this page to summarize.');
    process.exit(1);
  }

  console.log('🤖 Generating summary with AI...\n');

  let summary;
  try {
    summary = await summarizeWithOpenAI(text, url);
  } catch (err) {
    console.error('❌ Error while calling OpenAI API:', err.message || err);
    process.exit(1);
  }

  console.log('📌 Summary (CLI debug):\n');
  console.log(summary);

  // Save JSON for frontend
  saveSummaryToJson(url, summary, text, OUTPUT_FILE);
}

