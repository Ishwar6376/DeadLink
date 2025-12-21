import { Router } from "express";
const router = Router();
import  verifyOneTime  from "../controller/verification/oneTime.js";
import  verifyQuick  from "../controller/verification/quick.js";
import  verifyPass  from "../controller/verification/pass.js";

router.post("/oneTime",verifyOneTime)
router.post("/quick",verifyQuick)
router.post("/pass",verifyPass)
export default router