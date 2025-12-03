import express from "express";
import mongoose from "mongoose";
import router from "./routes/userRoute.js";
import dotenv from "dotenv";
import cors from "cors";

async function startServer() {
  dotenv.config();
  const app = express();
  app.use(express.json());

  app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
  }));

  const PORT = process.env.PORT || 3000;
  const MONGO_URL = process.env.MONGODB_URL;

  // simple health check
  app.get("/", (req, res) => {
    res.status(200).send("Server is running");
  });

  // example API route
  app.get("/api/home", (req, res) => {
    console.log("Home Route Hit");
    res.json({ message: "Response from server" });
  });


  // user router
  app.use("/api/user", router);

  try {
    await mongoose.connect(MONGO_URL);
    console.log("DB Connected successfully");
    app.listen(PORT, () =>
      console.log(`Server running at PORT: ${PORT}`)
    );
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
}

startServer();
