import { nanoid } from "nanoid";
import { Url } from "../../../model/urlModel";
import { Request, Response } from "express";

export default async function sorter(req: Request, res: Response) {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "Original URL is required" });
    }

    const already = await Url.findOne({ url });

    if (already) {
      return res.status(200).json({
        shortUrl: already.shortUrl,
        id: already.url_id
      });
    }

    let id = nanoid(8);
    let existing = await Url.findOne({ url_id: id });

    while (existing) {
      id = nanoid(8);
      existing = await Url.findOne({ url_id: id });
    }

    const shortUrl = `http://deadlink/${id}`;

    const newUrl = new Url({
      url_id: id,
      url,
      shortUrl,
      clicks: 0,
    });

    await newUrl.save();

    return res.status(200).json({
      shortUrl,
      id,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
