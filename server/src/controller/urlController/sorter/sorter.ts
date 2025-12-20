import { nanoid } from "nanoid";
import { Url } from "../../../model/urlModel.js";
import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { User } from "../../../model/userModel.js";

export default async function sorter(req: Request, res: Response) {
  try {
    const { url } = req.body;
    const { userId } = getAuth(req);
    console.log(url,userId)
    console.log(userId);
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const user =  await User.findOne({ userId:userId });
    console.log("Db user",user);
    let id = nanoid(8);
    while (await Url.findOne({ url_id: id })) id = nanoid(8);

    const shortUrl = `http://localhost:5173/${id}`;

    if (user) {      
      await user.save();

      const newUrl = new Url({
        url_id: id,
        url,
        shortUrl,
        clicks: 0,
        user:  user._id
      });

      await newUrl.save();
      return res.status(200).json({ shortUrl, id });
    }

    const newUrl = new Url({
      url_id: id,
      url,
      shortUrl,
      clicks: 0,
    });
    
    await newUrl.save();

    return res.status(200).json({ shortUrl, id });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
