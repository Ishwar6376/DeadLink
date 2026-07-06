import { Url } from "../../../model/urlModel.js";
import bcrypt from "bcryptjs";

export default async function Pass(url:string,pass:string) {
    const res=await Url.findOne({shortUrl:url})
    if(res){
        const salt = await bcrypt.genSalt(10);
        res.password = await bcrypt.hash(pass, salt);
        await res.save()
    }
    return res;
}