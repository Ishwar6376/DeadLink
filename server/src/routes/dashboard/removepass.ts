import { Url } from "../../model/urlModel.js";
export default async function removePass(url: string) {
    const res = await Url.findOne({ shortUrl: url });
    if (res) {
        res.password = null;
        await res.save();
    }
    return res;
}