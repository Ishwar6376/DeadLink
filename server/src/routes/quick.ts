import { Router } from "express";
import custom from "../controller/urlController/quick/quick.js";

const router = Router();

router.post("/", async (req, res) => {
    const url = req.body.url;
    const duration = req.body.duration; // { days, hours, minutes, seconds }
    
    if (!duration) {
        return res.status(400).json({ error: "Duration is required" });
    }

    try {
        const ms = 
            (duration.days || 0) * 86400000 + 
            (duration.hours || 0) * 3600000 + 
            (duration.minutes || 0) * 60000 + 
            (duration.seconds || 0) * 1000;
            
        const expiryDate = new Date(Date.now() + ms);
        const response = await custom(url, expiryDate);
        res.status(200).json({ response });
    } catch (error) {
        res.status(500).json({ error: "Error setting expiry" });
    }
});

export default router
