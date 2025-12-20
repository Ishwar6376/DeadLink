import { Router } from "express";
import { Url } from "../model/urlModel";

const router = Router();

// DELETE /api/delete/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Url.findById(id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    await doc.deleteOne();
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
