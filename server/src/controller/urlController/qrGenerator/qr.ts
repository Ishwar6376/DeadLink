import qrcode from "qrcode";
import { Url } from "../../../model/urlModel";

export default async function qrGenerator(url: string) {

    const already=await Url.findOne({url})
    if(already){
        console.log(typeof(already.qr))
        return already.qr
    }
  const qr = await qrcode.toDataURL(url, {
    margin: 1,
    width: 400,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });

  await Url.findOneAndUpdate(
    { qr },
    { $set: { qr } }

  );
  return qr;
}
