import express from "express";
import { processCampaign } from "./services/campaign.service.js";
import { generatePPT } from "./services/ppt.service.js";

const app = express();
app.use(express.json());

app.post("/capture", async (req, res) => {
  try {
    const { targets } = req.body;

    if (!targets || !Array.isArray(targets)) {
      return res.status(400).json({ error: "targets is required" });
    }

    for (const target of targets) {
      if (!target || typeof target !== "object" || !target.url) {
        return res.status(400).json({ error: "url is required" });
      }
    }

    const { results, summary } = await processCampaign(targets);

    const campaignId = crypto.randomUUID();

    await generatePPT(
      {
        ...req.body,
        results,
      },
      campaignId,
    );

    return res.json({
      campaignId,
      reportUrl: `http://localhost:3000/reports/${campaignId}.pptx`,
      summary,
      results,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
    });
  }
});

app.get("/reports/:id", (req, res) => {
  const path = `output/${req.params.id}.pptx`;
  res.download(path);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
