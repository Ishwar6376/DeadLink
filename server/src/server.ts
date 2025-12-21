import express from "express";
import cors from "cors";
import "dotenv/config";

import useRoute from "./routes/short.js";
import qrRoute from "./routes/qrRoute.js";
import passRoute from "./routes/passRoute.js";
import quick from "./routes/quick.js";
import oneTime from "./routes/oneTime.js";
import redirect from "./routes/redirect.js"
import test from "./test/test.js"
import slug from "./routes/slugRoute.js"
import saveUser from "./routes/saveUser.js"

import dashboard from "./routes/dashboard/dashboard.js";
import removePassRoute from "./routes/removePass.js";
import deleteRoute from "./routes/delete.js";
import updateRoute from "./routes/update.js";
import localAnalyzer from "./routes/localAnalyzer.js";
import { clerkMiddleware } from "@clerk/express";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Server is running good" });
});



app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://dead-link-zeta.vercel.app",
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(clerkMiddleware())

app.use("/api/short", useRoute);
app.use("/api/qr", qrRoute);
app.use("/api/redirect", redirect)
app.use("/api/saveUser", saveUser)


app.use("/api/quick", quick);
app.use("/api/pass", passRoute);
app.use("/api/oneTime", oneTime);
app.use("/api/slug", slug)

app.use("/api/test",test)


app.use("/api/me", dashboard);
app.use("/api/removePass", removePassRoute);
app.use("/api/delete", deleteRoute);
app.use("/api/update", updateRoute);
app.use("/api/analyze", localAnalyzer);


async function connectDB() {
  try {
    const mongoose = await import("mongoose");
    await mongoose.connect(process.env.MONGODB_URL!);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("DB error:", err);
  }
}
const HOST = process.env.NODE_ENV === "production"
  ? "0.0.0.0"
  : "127.0.0.1";

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(Number(PORT), HOST, () => {
      console.log(`Server running on ${HOST}:${PORT}`);
    });
});

export default app;