import Router from "express";
import { User } from "../model/userModel.js";
import { getAuth } from "@clerk/express";
const router = Router();

router.post("/", async (req, res) => {
    const name=req.body.name;
    const email=req.body.email;
    const userId=getAuth(req).userId || req.body.userId;
    console.log("saveUser route hit:", req.body, "Auth userId:", getAuth(req).userId);
    try {
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized, missing userId" });
        }
        const userExist=await User.findOne({userId:userId});
        if(userExist){
            return res.status(400).json({ message: "User already exists" });
        }
        const newUser={
            name:name,
            email:email,
            userId:userId
        }
        const user=new User(newUser);
        await user.save();
        return res.status(200).json({ message: "User saved successfully" });
    } catch (error) {
        console.error("saveUser error:", error);
        return res.status(500).json({ error: "Server error while saving user" });
    }
});

export default router