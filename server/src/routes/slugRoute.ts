import express from "express";
import { createCustomSlug, checkSlugAvailability } from "../controller/urlController/slug/slug.js";

const router = express.Router();

router.get("/check", checkSlugAvailability);
router.post("/", createCustomSlug);

export default router;
