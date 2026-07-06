import { Url } from "../../../model/urlModel.js";
import { Request, Response } from "express";
import { idGenerator } from "../../../utils/idGenerator.js";
import { slugBloomFilter } from "../../../utils/bloomFilter.js";
import { getAuth } from "@clerk/express";
import { User } from "../../../model/userModel.js";

export const checkSlugAvailability = async (req: Request, res: Response) => {
  try {
    const { slug } = req.query;
    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ message: "Slug is required" });
    }

    // validate slug
    const slugRegex = /^[a-zA-Z0-9-_]{3,30}$/;
    if (!slugRegex.test(slug)) {
      return res.status(400).json({ message: "Invalid slug format" });
    }

    // Fast path using Bloom Filter
    if (slugBloomFilter.mightContain(slug)) {
      // It might be taken. We must verify with DB to avoid false positives.
      const existing = await Url.findOne({ shortUrl: slug });
      if (existing) {
        return res.json({ available: false });
      }
    }

    // Not in bloom filter, or false positive => It's available
    return res.json({ available: true });

  } catch (err) {
    console.error("Error checking slug availability:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

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

    // Ensure the exact slug is used, not appending nanoid
    let slugPath = slug;

    // Check with bloom filter & DB
    if (slugBloomFilter.mightContain(slugPath)) {
      const existing = await Url.findOne({ shortUrl: slugPath });
      if (existing) {
        return res.status(400).json({ message: "Custom slug is already taken." });
      }
    }

    // Build final short URL (for frontend only)
    const domain = process.env.DOMAIN || "http://localhost:5173";
    const fullUrl = `${domain}/${slugPath}`;
    const id = await idGenerator.getNextId(); // We still need a unique url_id internally for other logic

    const { userId } = getAuth(req);
    const user = userId ? await User.findOne({ userId }) : null;

    const doc = await Url.create({
      url,
      url_id: id,
      shortUrl: slugPath,      
      isSlug: true, 
      user: user ? user._id : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    // Add to bloom filter after successful save
    slugBloomFilter.add(slugPath);

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