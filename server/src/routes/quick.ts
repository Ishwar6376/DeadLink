import { Router } from "express";
import custom from "../controller/urlController/quick/quick";

const router = Router();

router.post("/", async (req, res) => {
    const url = req.body.url;
    const expiry = req.body.expiry;
    try {
        const response = await custom(url, expiry);
        res.status(200).json({ response });
    } catch (error) {
        res.status(500).json({ error: "Error generating QR code" });
    }
});

export default router
