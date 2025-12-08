import { Url } from "../../../model/urlModel";
import { Request, Response } from "express";
import { nanoid } from "nanoid";

export const createCustomSlug = async (req: Request, res: Response) => {
  try {
    const { url, slug } = req.body;

    if (!url) {
      return res.status(400).json({ message: "URL is required" });
    }

    if (!slug) {
      return res.status(400).json({ message: "Slug is required" });
    }

    // validate slug
    const slugRegex = /^[a-zA-Z0-9-_]{3,30}$/;
    if (!slugRegex.test(slug)) {
      return res.status(400).json({
        message: "Invalid slug. Use 3-30 characters (letters, numbers, - or _)",
      });
    }

    // Generate slug/id path
    let id = nanoid(6);
    let slugPath = `${slug}/${id}`;

    // ensure unique slug/id
    let existing = await Url.findOne({ shortUrl: slugPath });

    while (existing) {
      id = nanoid(6);
      slugPath = `${slug}/${id}`;
      existing = await Url.findOne({ shortUrl: slugPath });
    }

    // Build final short URL (for frontend only)
    const domain = process.env.DOMAIN || "http://localhost:5173";
    const fullUrl = `${domain}/${slugPath}`;

    // Save ONLY slug/id in DB (shortUrl)
    const doc = await Url.create({
      url,
      url_id: id,
      shortUrl: slugPath,       // 👈 only store `slug/id`
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(201).json({
      message: "Custom unique URL created",
      shortUrl: fullUrl,        // 👈 frontend needs full URL
      slugPath: slugPath,       // 👈 DB stored value
      id,
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};
