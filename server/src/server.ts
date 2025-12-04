import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./database/connect";
import useRoute from './routes/useRoute'
import qrRoute from './routes/qrRoute'
import quick from './routes/quick'

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://client:5173"],
    credentials: true,
  })
);


app.use("/api/short", useRoute);

app.use("/api/qr", qrRoute);

app.use("/api/quick",quick );

await connectDB();

console.log("Database connected");

const PORT= process.env.PORT || 3000;
app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});


