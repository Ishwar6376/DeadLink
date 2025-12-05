import express from "express";
import { Url } from "../model/urlModel";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const id = req.body.id;
    console.log(id);
    const urlDoc = await Url.findOne({ url_id: id });

    if (!urlDoc) {
      return res.status(404).send("Invalid link");
    }

    console.log(urlDoc.url);

    return res.status(200).json({
      url: urlDoc.url
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

export default router;
