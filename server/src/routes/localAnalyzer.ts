import { Router } from "express";
import { analyzeWebsite } from "../agent/agent";

const router = Router();
router.post("/", async (req, res) => {
  return analyzeWebsite(req, res);
});

export default router;
