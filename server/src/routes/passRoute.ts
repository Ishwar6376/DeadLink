import {Router} from "express"
import { Url } from "../model/urlModel";
import Pass from "../controller/urlController/pass/pass"
const router=Router();

router.post("/",async(req,res)=>{
    const url=req.body.url;
    const pass=req.body.pass;
    try {
        const response = await Pass(url,pass);
        res.status(200).json({ response });
    } catch (error) {
        res.status(500).json({ error: "Error setting password" });
    }
})

export default router