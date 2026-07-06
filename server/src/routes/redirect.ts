import { Url } from "../model/urlModel.js";
import {Router} from "express";
import {getShortUrl,setShortUrl} from "../cache/url.cache.js";
import bcrypt from "bcryptjs";
import { kafkaClient } from "../utils/kafka.js";

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
    const cached=await getShortUrl(id);
    console.log("cached",cached);
    if (cached) {
      await kafkaClient.sendClickEvent(id);
      return res.status(200).json({
        status: "safe",
        url: cached,
      });
    }
    
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

    if (doc.password) {
      if (!password) {
        return res.status(405).json({ status: "password_required",message:"Password is needed" });
      }
      let isMatch = false;
      if (doc.password.startsWith("$2")) {
        isMatch = await bcrypt.compare(password, doc.password);
      } else {
        isMatch = password === doc.password;
        if (isMatch) {
            const salt = await bcrypt.genSalt(10);
            doc.password = await bcrypt.hash(password, salt);
        }
      }

      if (!isMatch) {
        return res.status(403).json({ status: "wrong_password" });
      }
    }
    // Asynchronously send click event to Kafka instead of blocking DB write
    await kafkaClient.sendClickEvent(doc.url_id);
    const normalizedUrl = /^https?:\/\//i.test(doc.url)
      ? doc.url
      : `https://${doc.url}`;
    

    const ttlSeconds = doc.expiry 
      ? Math.max(1, Math.floor((doc.expiry.getTime() - Date.now()) / 1000)) 
      : 86400; // default 24h cache if no expiry

    if (!doc.password && !doc.isSingleValid) {
      await setShortUrl(id, normalizedUrl, ttlSeconds);
    }
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