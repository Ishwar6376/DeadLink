import { Url } from "../../model/urlModel.js";

export default async function verifyQuick(req: any, res: any) {
  const { id } = req.body;

  const record = await Url.findOne({ url_id: id });

  if (!record) {
    return res.status(404).json({ message: "Link not found" });
  }

  if (Date.now() > record.expiry.getTime()) {
    return res.status(400).json({ message: "Link has expired" });
  }

  return res.status(200).json({ message: "Link is valid" });
}
