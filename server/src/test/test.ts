import { Router, Request, Response } from 'express';
import puppeteer, { Browser, Page } from 'puppeteer'; // Added types for better TS support

const router = Router();

/**
 * Helper function to perform the scraping using Puppeteer
 * @param targetUrl The URL to scrape
 * @returns A promise that resolves to an array of scraped text content
 */
async function scrapeProductPrices(targetUrl: string): Promise<(string | null)[]> {
    let browser: Browser | null = null;
    try {
        // 1. Launch a browser instance (headless: 'new' is the modern standard)
        browser = await puppeteer.launch({ headless: true });
        const page: Page = await browser.newPage();
        
        console.log(`Navigating to: ${targetUrl}`);
        
        // 2. Navigate and wait for the network to be idle (usually means the page finished loading)
        await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 }); // Added timeout

        // 3. Evaluate JavaScript inside the page to select and extract data
        const data = await page.evaluate(() => {
            // This code runs in the browser context.
            // Select elements with the class '.js-product-price'
            const elements = Array.from(document.querySelectorAll('.js-product-price'));
            // Map the NodeList to an array of text content
            return elements.map(el => el ? el.textContent : null);
        });

        console.log('Scraped data:', data);
        return data;

    } catch (error) {
        console.error(`Error during Puppeteer operation for ${targetUrl}:`, error);
        // Rethrow the error to be caught by the Express router handler
        throw new Error('Failed to scrape content from the URL.');
    } finally {
        // Ensure the browser is closed, even if an error occurred
        if (browser) {
            await browser.close();
        }
    }
}


// Corrected Router Handler
router.get("/", async (req: Request, res: Response) => {
    // 1. Get the URL from a query parameter (e.g., /scrape?url=https://example.com)
    const targetUrl = req.query.url as string;
    
    // 2. Validate the URL parameter
    if (!targetUrl) {
        return res.status(400).json({ error: "Missing 'url' query parameter. Usage: /scrape?url=https://example.com" });
    }

    try {
        console.log(`Starting scrap for: ${targetUrl}`);
        
        // 3. Execute the scraping logic
        const scrapedData = await scrapeProductPrices(targetUrl);
        
        // 4. Send the scraped data back to the client
        return res.json({ 
            sourceUrl: targetUrl, 
            data: scrapedData 
        });
        
    } catch (error) {
        // 5. Handle any errors from the scraping function
        console.error("Express Error:", error);
        return res.status(500).json({ 
            error: (error as Error).message || "Internal server error during web scraping." 
        });
    }
});

export default router;