import { Url } from "../model/urlModel";
import Router from "express";
import {analyzeWebsite} from "../agent/agent"

const router=Router();
router.post("/", async (req, res) => {
  try {
    console.log("Backed hit")
    const { id, password } = req.body;
    console.log(password,id)

    const doc = await Url.findOne({ url_id: id });
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

    // const response=analyzeWebsite(req,res);
    // console.log(response);
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