import express from "express";
import { createCustomSlug } from "../controller/urlController/slug/slug.js";

const router = express.Router();

router.post("/", createCustomSlug);

export default router;
