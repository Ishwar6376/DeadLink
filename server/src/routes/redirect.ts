import { Url } from "../model/urlModel";
import Router from "express";

const router=Router();
router.post("/", async (req, res) => {
  try {
    const { id, password } = req.body;

    const doc = await Url.findOne({ url_id: id });
    if (!doc) {
      return res.status(404).json({ status: "not_found", message: "Invalid link" });
    }

    // EXPIRED LINK
    if (doc.expiry && Date.now() > doc.expiry.getTime()) {
      return res.status(410).json({ status: "expired", message: "This link has expired." });
    }

    // ONE-TIME LINK ALREADY USED
    if (doc.isSingleValid && doc.clicks > 0) {
      return res.status(409).json({ status: "used", message: "This one-time link has already been used." });
    }

    // PASSWORD PROTECTED (NO PASSWORD PROVIDED)
    if (doc.password && !password) {
      return res.status(401).json({ status: "password_required" });
    }

    // WRONG PASSWORD
    if (doc.password && password !== doc.password) {
      return res.status(403).json({ status: "wrong_password" });
    }

    // UPDATE CLICK COUNT
    doc.clicks += 1;
    await doc.save();

    // NORMALIZE URL
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