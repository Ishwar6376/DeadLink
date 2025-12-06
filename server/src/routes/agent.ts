import { Router } from "express";

import {analyzeWebsite} from "../controller/agent/agent";

const router = Router();

router.post("/", analyzeWebsite);

export default router