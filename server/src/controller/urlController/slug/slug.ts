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

    let id = nanoid(6);
    let slugPath = `${slug}/${id}`;

    let existing = await Url.findOne({ shortUrl: slugPath });

    while (existing) {
      id = nanoid(6);
      slugPath = `${slug}/${id}`;
      existing = await Url.findOne({ shortUrl: slugPath });
    }

    // Build final short URL (for frontend only)
    const domain = process.env.DOMAIN || "http://localhost:5173";
    const fullUrl = `${domain}/${slugPath}`;

    const doc = await Url.create({
      url,
      url_id: id,
      shortUrl: slugPath,      
      isSlug: true, 
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await doc.save();

    return res.status(201).json({
      message: "Custom unique URL created",
      shortUrl: fullUrl,        
      slugPath: slugPath,       
      id,
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};