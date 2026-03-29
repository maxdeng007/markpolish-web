const { chromium } = require("playwright");

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.setViewport({ width: 390, height: 844 });
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/Users/dengzhou/Desktop/Project/Markpolish-web/tmp/mobile-default.png', fullPage: true });
    await browser.close();
    console.log('Screenshot saved:', path);
})();
})();
