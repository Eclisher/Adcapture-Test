import type { ElementHandle, Page } from "playwright";

const AD_NETWORKS = [
  "doubleclick",
  "googlesyndication",
  "googletagservices",
  "securepubads",
  "adservice",
  "adsystem",
  "criteo",
  "taboola",
  "outbrain",
  "smartadserver",
];

const KEYWORDS = [
  "ad",
  "ads",
  "advert",
  "banner",
  "slot",
  "gpt",
  "publicit",
  "sponsor",
];

const AD_IFRAME_PATTERNS = [
  "div-gpt-ad",
  "google_ads_iframe",
  "googlesyndication",
  "doubleclick",
  "securepubads",
  "adservice",
  "adsystem",
  "criteo",
  "taboola",
  "outbrain",
];

export async function detectAdSlots(page: Page) {
  const results: any[] = [];
  const viewport = page.viewportSize() ?? { width: 1280, height: 800 };
  const viewportArea = viewport.width * viewport.height;

  const addIfAdFrame = async (frameElement: ElementHandle<Node>) => {
    try {
      const box = await frameElement.boundingBox();
      if (!box) return;

      const src = (await frameElement.getAttribute("src")) ?? "";
      const id = (await frameElement.getAttribute("id")) ?? "";
      const className = (await frameElement.getAttribute("class")) ?? "";
      const srcLower = src.toLowerCase();
      const meta = (id + className).toLowerCase();

      const isAdNetwork = AD_NETWORKS.some((n) => srcLower.includes(n));
      const isKeyword = KEYWORDS.some(
        (k) => meta.includes(k) || srcLower.includes(k),
      );
      const isKnownIframe = AD_IFRAME_PATTERNS.some(
        (pattern) => srcLower.includes(pattern) || meta.includes(pattern),
      );

      if (!isAdNetwork && !isKeyword && !isKnownIframe) return;

      const area = box.width * box.height;
      const ratio = area / viewportArea;
      if (ratio > 0.6) return;
      if (box.width < 50 || box.height < 50) return;

      results.push({
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        type: "iframe",
      });
    } catch {}
  };

  const frames = page.frames();
  for (const frame of frames) {
    const frameElement = await frame.frameElement().catch(() => null);
    if (!frameElement) continue;
    await addIfAdFrame(frameElement);
  }

  const extraSelectors = [
    '[id^="div-gpt-ad"]',
    '[id^="google_ads_iframe"]',
    "[data-adsbygoogle]",
    '[class*="ads"]',
    '[id*="ads"]',
    '[class*="ad-slot"]',
    '[id*="ad-slot"]',
  ];

  const extraElements = await page.$$(extraSelectors.join(", "));
  for (const el of extraElements) {
    try {
      const box = await el.boundingBox();
      if (!box) continue;
      const area = box.width * box.height;
      const ratio = area / viewportArea;
      if (ratio > 0.6) continue;
      if (box.width < 50 || box.height < 50) continue;

      results.push({
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        type: "ad",
      });
    } catch {}
  }

  return results;
}
