import express from "express";
import cors from "cors";
import "dotenv/config";

import passRoute from "./routes/passRoute";
import useRoute from "./routes/useRoute";
import qrRoute from "./routes/qrRoute";
import quick from "./routes/quick";
import oneTime from "./routes/oneTime";

// 👇 Clerk imports
import {
  clerkMiddleware,
  requireAuth,
  getAuth,
} from "@clerk/express";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://client:5173"],
    credentials: true,
  })
);


app.use(clerkMiddleware());



app.get("/", (req, res) => {
  res.json({ message: "DeadLink backend running (public) ✅" });
});


app.use("/api/short", requireAuth(), useRoute);
app.use("/api/qr", requireAuth(), qrRoute);
app.use("/api/quick", requireAuth(), quick);
app.use("/api/pass", requireAuth(), passRoute);
app.use("/api/oneTime", requireAuth(), oneTime);

app.get("/api/me", requireAuth(), (req, res) => {
  const auth = getAuth(req);
  res.json({
    message: "You are authenticated 🎉",
    userId: auth.userId,
    sessionId: auth.sessionId,
  });
});

async function connectDB(): Promise<void> {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.warn("MONGO_URI not set; skipping DB connection.");
    return;
  }

  try {
    const mongoose = await import("mongoose");
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to DB:", err);
    throw err;
  }
}

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB();
    console.log("Database connected");

    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();


