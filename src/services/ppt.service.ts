import PptxGenJS from "pptxgenjs";
import fs from "fs";

export async function generatePPT(data: any, campaignId: string) {
  const pptx = new (PptxGenJS as any).default();

  // 🔵 Slide 1 - Cover
  const slide1 = pptx.addSlide();
  slide1.addText(data.campaignName, { x: 1, y: 1, fontSize: 24 });
  slide1.addText(`Annonceur: ${data.advertiser}`, { x: 1, y: 2 });
  slide1.addText(`Agence: ${data.agency}`, { x: 1, y: 2.5 });
  slide1.addText(`Total URLs: ${data.results.length}`, { x: 1, y: 3 });

  // 🟡 Slides par URL
  for (const r of data.results) {
    const slide = pptx.addSlide();

    slide.addText(r.url, { x: 0.5, y: 0.3, fontSize: 12 });

    if (r.screenshotPath && fs.existsSync(r.screenshotPath)) {
      slide.addImage({
        path: r.screenshotPath,
        x: 0.5,
        y: 1,
        w: 9,
        h: 5,
      });
    }

    slide.addText(`Status: ${r.status}`, { x: 0.5, y: 6.5 });
    slide.addText(`Ads: ${r.adSlotsDetected}`, { x: 3, y: 6.5 });
  }

  // 🟢 Slide finale - SUMMARY (IMPORTANT EXERCICE)
  const summarySlide = pptx.addSlide();

  summarySlide.addText("Summary Report", {
    x: 0.5,
    y: 0.3,
    fontSize: 18,
    bold: true,
  });

  let y = 1;

  for (const r of data.results) {
    summarySlide.addText(`${r.url} | ${r.status} | ads: ${r.adSlotsDetected}`, {
      x: 0.5,
      y,
      fontSize: 12,
    });
    y += 0.4;
  }

  const filePath = `output/${campaignId}.pptx`;
  await pptx.writeFile({ fileName: filePath });

  return filePath;
}
