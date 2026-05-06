export async function autoScroll(page) {
    let previousHeight = 0;
    while (true) {
        const currentHeight = await page.evaluate(() => document.body.scrollHeight);
        if (currentHeight === previousHeight)
            break;
        await page.evaluate((h) => window.scrollTo(0, h), currentHeight);
        await page.waitForTimeout(800);
        previousHeight = currentHeight;
    }
    await page
        .waitForFunction(() => {
        return document.querySelectorAll("iframe").length > 5;
    }, { timeout: 10000 })
        .catch(() => { });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);
}
//# sourceMappingURL=scroll.service.js.map