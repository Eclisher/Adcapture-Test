export async function handleCMP(page) {
    try {
        await page.evaluate(() => {
            // @ts-ignore
            window.didomiOnReady = window.didomiOnReady || [];
            // @ts-ignore
            window.didomiOnReady.push((Didomi) => {
                try {
                    Didomi.setUserAgreeToAll();
                }
                catch { }
            });
        });
    }
    catch { }
    const selectors = [
        'button:has-text("Tout accepter")',
        'button:has-text("Accepter et fermer")',
        'button:has-text("J\'accepte")',
        'button:has-text("Accept all")',
        'button:has-text("Agree")',
        'button:has-text("Continuer sans accepter")',
        'button:has-text("Refuser tout")',
        ".didomi-continue-without-agreeing",
        "#didomi-notice-agree-button",
    ];
    for (let attempt = 0; attempt < 3; attempt++) {
        for (const frame of page.frames()) {
            for (const selector of selectors) {
                try {
                    const btn = frame.locator(selector).first();
                    if (await btn.isVisible({ timeout: 1500 })) {
                        await btn.click({ timeout: 5000 });
                        await page.waitForTimeout(1500);
                        return;
                    }
                }
                catch { }
            }
        }
        await page.waitForTimeout(1200);
    }
}
//# sourceMappingURL=cmp.service.js.map