import { json } from "body-parser";
import { Url } from "../../../model/urlModel";
export default async function oneTime(url: string) {
    const res = await Url.findOne({ shortUrl: url });
    if(res){
        res.isSingleValid=true;
        await res.save()
    }
    return res;
}