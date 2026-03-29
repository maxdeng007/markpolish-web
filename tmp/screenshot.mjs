import { chromium } from "playwright";
(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
    await page.waitForSelector("body", { timeout: 10000 });
    await page.screenshot({ path: "/Users/dengzhou/Desktop/Project/Markpolish-web/tmp/mobile-default.png", fullPage: true });
    await browser.close();
})();
