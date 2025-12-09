import puppeteer from "puppeteer";

let browser  = null;

async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox"]
    });
  }
  return browser;
}

export async function scrape_page({ url }) {
  const browser = await getBrowser();
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

  const html = await page.content();
  await page.close();

  return { html };
}
