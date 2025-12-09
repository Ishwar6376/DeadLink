import { Router } from "express";
import { getAuth } from "@clerk/express";
import { Url } from "../../model/urlModel";
import { User } from "../../model/userModel";

const router = Router();

router.get("/", async (req, res) => {
  try {

    const { userId } = getAuth(req);
    
    console.log(userId);

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

   
    const dbUser = await User.findOne({ userId:userId });

    if (!dbUser) {
      return res.status(404).json({ error: "User not found in database" });
    }

    const urls = await Url.find({ user: dbUser._id });
    return res.status(200).json({ urls });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
