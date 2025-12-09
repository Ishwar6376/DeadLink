import Router from "express";
import { User } from "../model/userModel";
import { getAuth } from "@clerk/express";
const router = Router();

router.post("/", async (req, res) => {
    const name=req.body.name;
    const email=req.body.email;
    const userId=getAuth(req).userId
    try {
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
        return false;
    }
});

export default router