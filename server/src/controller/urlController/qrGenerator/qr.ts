import qrcode from "qrcode";
import { Url } from "../../../model/urlModel";

export default async function qrGenerator(url: string) {
  // Try to find document by shortUrl first, then by original url field
  const doc = (await Url.findOne({ shortUrl: url })) || (await Url.findOne({ url }));

  // If a QR already exists for this document, return it
  if (doc && doc.qr) return doc.qr;

  // Determine the value to encode in the QR (prefer shortUrl if available)
  const toEncode = doc?.shortUrl ?? url;

  // Generate QR Data URL
  const qr = await qrcode.toDataURL(toEncode, {
    margin: 1,
    width: 400,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });

  // Persist QR on the document if we found one
  if (doc) {
    doc.qr = qr;
    await doc.save();
  }

  return qr;
}
