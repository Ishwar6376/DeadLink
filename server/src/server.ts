import express from "express";
import cors from "cors";
import "dotenv/config";

import passRoute from "./routes/passRoute";
import useRoute from "./routes/short";
import qrRoute from "./routes/qrRoute";
import quick from "./routes/quick";
import oneTime from "./routes/oneTime";
import agent from "./routes/agent";
import redirect from "./routes/redirect"
import verification from "./routes/verification"

import {
  clerkMiddleware,
  requireAuth,
  getAuth,
} from "@clerk/express";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://client:5173",
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Clerk-Signature"],
  })
);

app.use(clerkMiddleware());

app.get("/", (req, res) => {
  res.json({ message: "Server is runnig good" });
});

app.use("/api/short", useRoute);
app.use("/api/qr", qrRoute);
// app.use("/api/verify", verification)
app.use("/api/redirect", redirect)
app.use("/api/agent", agent);


app.use("/api/quick", quick);
app.use("/api/pass", passRoute);
app.use("/api/oneTime", oneTime);


app.get("/api/me",requireAuth(), (req, res) => {
  const auth = getAuth(req);
  console.log(auth);
  res.json({
    message: "You are authenticated ",
    userId: auth.userId,
    sessionId: auth.sessionId,
  });
});


async function connectDB() {
  try {
    const mongoose = await import("mongoose");
    await mongoose.connect(process.env.MONGODB_URL!);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("DB error:", err);
  }
}

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(Number(PORT), "0.0.0.0", () =>
    console.log(`Server running at ${PORT}`)
  );
});

export default app;