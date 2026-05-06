import * as PptxGenJS from "pptxgenjs";
import fs from "fs";
export async function generatePPT(data, campaignId) {
    const pptx = new PptxGenJS();
    const slide1 = pptx.addSlide();
    slide1.addText(data.campaignName, { x: 1, y: 1, fontSize: 24 });
    slide1.addText(`Annonceur: ${data.advertiser}`, { x: 1, y: 2 });
    slide1.addText(`Agence: ${data.agency}`, { x: 1, y: 2.5 });
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
    const filePath = `output/${campaignId}.pptx`;
    await pptx.writeFile({ fileName: filePath });
    return filePath;
}
//# sourceMappingURL=ppt.service.js.map