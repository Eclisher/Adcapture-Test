import { chromium } from "playwright";
import { autoScroll } from "./scroll.service.js";
import { handleCMP } from "./cmp.service.js";
import { detectAdSlots } from "./ad-detector.service.js";

export async function capturePage(url: string) {
  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();

  try {
    await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    await page.waitForTimeout(2000);
    await handleCMP(page);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    await autoScroll(page);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const iframeCount = await page.$$eval("iframe", (els) => els.length);
    console.log("IFRAMES COUNT:", iframeCount);
    let ads = await detectAdSlots(page);
    console.log("ADS FOUND:", ads.length);
    if (ads.length === 0) {
      await page.waitForTimeout(3000);
      await handleCMP(page);
      await page.waitForLoadState("networkidle");
      ads = await detectAdSlots(page);
      console.log("ADS FOUND AFTER RETRY:", ads.length);
    }
    for (const ad of ads) {
      await page.evaluate((a) => {
        const div = document.createElement("div");

        div.style.position = "absolute";
        div.style.left = a.x + "px";
        div.style.top = a.y + "px";
        div.style.width = a.width + "px";
        div.style.height = a.height + "px";
        div.style.border = "3px solid orange";
        div.style.zIndex = "999999";
        div.style.pointerEvents = "none";

        const label = document.createElement("div");
        label.innerText = "PUB";
        label.style.background = "orange";
        label.style.color = "white";
        label.style.fontSize = "12px";
        label.style.position = "absolute";
        label.style.top = "0";
        label.style.left = "0";

        div.appendChild(label);
        document.body.appendChild(div);
      }, ad);
    }

    const filePath = `output/${new URL(url).hostname}.png`;

    await page.screenshot({
      path: filePath,
      fullPage: true,
    });

    return {
      url,
      status: ads.length === 0 ? "no_ad_slot" : "success",
      adSlotsDetected: ads.length,
      screenshotPath: filePath,
    };
  } catch (error) {
    return {
      url,
      status: "failed",
      adSlotsDetected: 0,
      screenshotPath: null,
    };
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }
}
