import { Url } from "../../../model/urlModel"

export default async function Pass(url:string,pass:string) {
    const res=await Url.findOne({shortUrl:url})
    if(res){
        res.password=pass
        await res.save()
    }
    return res;
}