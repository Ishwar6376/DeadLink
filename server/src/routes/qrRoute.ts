import {Router } from "express"
import qrGenerator from "../controller/urlController/qrGenerator/qr.js";
const router = Router();

router.post("/", async (req, res) => {
    const url = req.body.url; 
    try {
        const qr = await qrGenerator(url);
        res.status(200).json({ qr });
    } catch (error) {
        res.status(500).json({ error: "Error generating QR code" });
    }
});

export default router
