import pLimit from "p-limit";
import { capturePage } from "./browser.service.js";

const limit = pLimit(2); 

export async function processCampaign(targets: { url: string }[]) {
  const start = Date.now();

  const results = await Promise.all(
    targets.map((t) => limit(() => capturePage(t.url))),
  );

  const summary = {
    totalUrls: targets.length,
    successful: results.filter((r) => r.status === "success").length,
    failed: results.filter((r) => r.status === "failed").length,
    blocked: 0,
    noAdSlot: results.filter((r) => r.status === "no_ad_slot").length,
    durationSeconds: Math.round((Date.now() - start) / 1000),
  };

  return { results, summary };
}
