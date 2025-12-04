import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./database/connect";
import useRoute from './routes/useRoute'


const app = express();
app.use(express.json());
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use("/api/sort", useRoute);

await connectDB();

console.log("Database connected");

const PORT= process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


