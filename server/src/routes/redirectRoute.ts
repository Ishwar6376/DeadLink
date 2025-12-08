import { Router } from "express";
import { Url } from "../model/urlModel";

const router = Router();

// GET /:slug/:id
router.get("/:slug/:id", async (req, res) => {
  try {
    const { slug, id } = req.params;

    const slugPath = `${slug}/${id}`;

    const doc = await Url.findOne({ shortUrl: slugPath });

    if (!doc) {
      return res.status(404).send("Short link not found");
    }

    // Increase click count optionally
    doc.clicks += 1;
    await doc.save();

    return res.redirect(doc.url);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal server error");
  }
});

export default router;
