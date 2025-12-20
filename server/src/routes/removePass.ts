import { Router } from "express";
import removePassFn from "./dashboard/removepass.js";

const router = Router();

// POST /api/removePass
// body: { shortUrl: string }
router.post("/", async (req, res) => {
  try {
    const { shortUrl } = req.body;
    if (!shortUrl) return res.status(400).json({ error: "shortUrl required" });

    const result = await removePassFn(shortUrl);
    if (!result) return res.status(404).json({ error: "Link not found" });
    return res.status(200).json({ success: true, link: result });
  } catch (err) {
    console.error("removePass route error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
