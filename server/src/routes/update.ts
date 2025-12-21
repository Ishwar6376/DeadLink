import { Router } from "express";
import { Url } from "../model/urlModel.js";

const router = Router();

// POST /api/update/:id
router.post("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body || {};

    const doc = await Url.findById(id);
    if (!doc) return res.status(404).json({ error: "Not found" });

    // Update allowed fields
    if (typeof payload.url === "string") doc.url = payload.url;
    if (payload.password === null) doc.password = null;
    else if (typeof payload.password === "string") doc.password = payload.password;
    if (payload.expiry) doc.expiry = new Date(payload.expiry);
    if (typeof payload.isSingleValid === "boolean") doc.isSingleValid = payload.isSingleValid;
    if (payload.linkCntLimit !== undefined) doc.linkCntLimit = payload.linkCntLimit;
    if (payload.isPublic !== undefined) (doc as any).isPublic = payload.isPublic;

    await doc.save();
    return res.status(200).json({ updated: doc });
  } catch (err) {
    console.error("Update error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
