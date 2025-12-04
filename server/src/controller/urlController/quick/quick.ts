import { Url } from "../../../model/urlModel";

export default async function custom(url: string, expiry: Date) {
    console.log("Inside the custom function");
    const already=await Url.findOneAndUpdate({shortUrl:url},{expiry: expiry},{new: true});
    return already  
}   