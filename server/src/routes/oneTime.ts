import Router from "express";
import oneTime from "../controller/urlController/oneTime/oneTime.js";

const router = Router();

router.post("/", async(req, res) => {
    const url = req.body.url;
    try {
        const response = await oneTime(url);
        res.status(200).json({ response });
    } catch (error) {
        res.status(500).json({ error: "Error  setting link for one time" });
    }
});

export default router