import { Url } from "../../model/urlModel";

export default async function verifyPass(req: any, res: any) {
  const { id, pass } = req.body;

  const record = await Url.findOne({ url_id: id });

  if (!record) {
    return res.status(404).json({ message: "Link not found" });
  }

  if (record.password !== pass) {
    return res.status(400).json({ message: "Password incorrect" });
  }

  return res.status(200).json({ message: "Password matched" });
}
