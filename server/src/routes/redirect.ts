import { Url } from "../model/urlModel.js";
import Router from "express";

const router=Router();
router.post("/", async (req, res) => {
  try {
    console.log("Backed hit")
    const { id, password } = req.body;
    console.log(password,id)

    if (!id) return res.status(400).json({ status: "bad_request", message: "Missing id" });

    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const segments = String(id).split("/").filter(Boolean);
    const lastSeg = segments.length ? segments[segments.length - 1] : id;

    const regex = new RegExp(escapeRegex(String(lastSeg)) + "$", "i");

    const doc = await Url.findOne({
      $or: [{ url_id: id }, { shortUrl: id }, { url_id: lastSeg }, { shortUrl: { $regex: regex } }],
    });

    if (!doc) {
      return res.status(404).json({ status: "not_found", message: "Invalid link" });
    }

    if (doc.expiry && Date.now() > doc.expiry.getTime()) {
      return res.status(410).json({ status: "expired", message: "This link has expired." });
    }

    if (doc.isSingleValid && doc.clicks > 0) {
      return res.status(409).json({ status: "used", message: "This one-time link has already been used." });
    }

    if (doc.password && !password) {
      return res.status(405).json({ status: "password_required",message:"Password is needed" });
    }

    if (doc.password && password !== doc.password) {
      return res.status(403).json({ status: "wrong_password" });
    }
    doc.clicks += 1;
    await doc.save();
    const normalizedUrl = /^https?:\/\//i.test(doc.url)
      ? doc.url
      : `https://${doc.url}`;
    return res.status(200).json({
      status: "safe",
      url: normalizedUrl,
    });

  } catch (err) {
    console.error("Redirect error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});
export default router