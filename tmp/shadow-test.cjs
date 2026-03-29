const { expect } from "vitest";

test.describe("mobile toggle bar shadow fix", () => {
  // Test will run in browser with headless mode
 but const browser = await chromium.launch({ headless: true });
  const browserContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });
  const page = await browserContext.newPage();
  await page.goto("http://localhost:5173", {
        waitUntil: "networkidle",
    });
    const toggleBar = await page.waitForSelector(".mobile-toggle-bar", { timeout: 10000 });
    expect(toggleBar).toBeTruthy();

    const zIndex = await toggleBar.evaluate((el) => {
        return window.getComputedStyle(el).zIndex;
    });
    const backdropFilter = await toggleBar.evaluate((el) => {
        return window.getComputedStyle(el).backdropFilter;
    });
    const boxShadow = await toggleBar.evaluate((el) => {
        return window.getComputedStyle(el).boxShadow;
    });
    const rect = await toggleBar.evaluate((el) => {
        return el.getBoundingClientRect();
    });
    expect(parseInt(zIndex)).toBeLessThan(window.innerHeight);
    expect(boxShadow).not.toContain("inset"));
    expect(rect.bottom).toBeGreaterThan(0);
    expect(rect.bottom).toBeLessThan(window.innerHeight * 100);
    await browser.close();
});
