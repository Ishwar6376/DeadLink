import { Url } from './../../../model/urlModel';
import { Request, Response } from "express";

export const createCustomSlug = async (req: Request, res: Response) => {
  try {
    const { url, slug } = req.body;

    if (!url) {
      return res.status(400).json({ message: "URL is required" });
    }

    if (!slug) {
      return res.status(400).json({ message: "Slug is required" });
    }

    // 1) validate slug
    const slugRegex = /^[a-zA-Z0-9_-]{3,30}$/;
    if (!slugRegex.test(slug)) {
      return res.status(400).json({
        message:
          "Invalid slug. Use 3–30 characters (letters, numbers, - or _)",
      });
    }
    // 3) build short URL from env or fallback
    const domain = process.env.DOMAIN || "http://localhost:5173";
    const shortUrl = `${domain}/${slug}`;

    // 4) save in DB
    const doc = await Url.create({
      url_id: slug,
      url,
      shortUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 5) send response
    return res.status(201).json({
      message: "Custom slug created",
      shortUrl: doc.shortUrl,
      url_id: doc.url_id,
    });
  } catch (err) {
    console.error("Slug controller error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
