import User from "../models/userModel.js";
export const create = async (req, res) => {
    try {
        console.log("create user route hit")
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const user = await User.create({ name, email, password });
        await user.save();
        res.status(201).json({ user });
    } catch (error) {
        console.log("Error in creating a user",error);
        res.status(400).json(error);
    }
}