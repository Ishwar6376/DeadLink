import express from "express";
import { createCustomSlug } from "../controller/urlController/slug/slug";

const router = express.Router();

router.post("/", createCustomSlug);

export default router;
