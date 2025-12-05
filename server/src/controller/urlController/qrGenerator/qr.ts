import qrcode from "qrcode";
import { Url } from "../../../model/urlModel";

export default async function qrGenerator(url: string) {
  // Check if document already exists
  const existing = await Url.findOne({ originalUrl: url });
  // If exists and already has QR, return it
  if (existing?.qr) return existing.qr;

  // Generate QR
  const qr = await qrcode.toDataURL(url, {
    margin: 1,
    width: 400,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });

  // Update based on the URL (NOT QR)
  const res=await Url.findOne({shortUrl:url})
  if(res){
    res.qr=qr
    await res.save()
  }

  return qr;
}
