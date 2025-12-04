import {Router} from "express";
import sorter from "../controller/urlController/sorter/sorter";

const router = Router();

router.post("/", sorter);

export default router;