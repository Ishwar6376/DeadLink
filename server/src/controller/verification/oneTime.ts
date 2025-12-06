import { Url } from "../../model/urlModel";

export default async function verifyOneTime(req: any, res: any) {
  const { id } = req.body;

  const record = await Url.findOne({ url_id: id });

  if (!record) {
    return res.status(404).json({ message: "Link not found" });
  }

  if (record.isSingleValid && record.clicks > 0) {
    return res.status(400).json({ message: "Link has already been used" });
  }

  return res.status(200).json({ valid: true });
}
