import { Router } from "express";
import { analyzeWebsite } from "../agent/agent";

const router = Router();

// POST /api/analyze
// body: { id: string }
router.post("/", async (req, res) => {
  return analyzeWebsite(req, res);
});

export default router;
