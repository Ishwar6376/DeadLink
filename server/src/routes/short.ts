import {Router} from "express";
import shorter from "../controller/urlController/sorter/sorter.js";

const router = Router();

router.post("/", shorter);

export default router;