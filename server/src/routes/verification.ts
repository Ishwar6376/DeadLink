import { Router } from "express";
const router = Router();
import  verifyOneTime  from "../controller/verification/oneTime";
import  verifyQuick  from "../controller/verification/quick";
import  verifyPass  from "../controller/verification/pass";

router.post("/oneTime",verifyOneTime)
router.post("/quick",verifyQuick)
router.post("/pass",verifyPass)
export default router