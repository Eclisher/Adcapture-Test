import express from "express";
import { capturePage } from "./services/browser.service.js";

const app = express();
app.use(express.json());

app.post("/capture", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "url is required" });
    }

    const result = await capturePage(url);

    return res.json({
      campaignId: crypto.randomUUID(),
      ...result,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "internal error",
    });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});