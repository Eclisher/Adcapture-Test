import { chromium } from "playwright";
(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto("https://example.com");
    await page.screenshot({ path: "output/test.png", fullPage: true });
    await browser.close();
})();
//# sourceMappingURL=test-playwright.js.map