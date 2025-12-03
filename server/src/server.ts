import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./database/connect";




const app = express();

await connectDB();

console.log("Database connected");

const PORT= process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


