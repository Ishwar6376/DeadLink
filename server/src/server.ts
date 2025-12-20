import express from "express";
import cors from "cors";
import "dotenv/config";

import passRoute from "./routes/passRoute";
import useRoute from "./routes/short";
import qrRoute from "./routes/qrRoute";
import quick from "./routes/quick";
import oneTime from "./routes/oneTime";
import redirect from "./routes/redirect"
import test from "./test/test"
import slug from "./routes/slugRoute"
import saveUser from "./routes/saveUser"

import dashboard from "./routes/dashboard/dashboard";
import removePassRoute from "./routes/removePass";
import deleteRoute from "./routes/delete";
import updateRoute from "./routes/update";
import localAnalyzer from "./routes/localAnalyzer";

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



app.get("/", (req, res) => {
  res.json({ message: "Server is running good" });
});

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

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(Number(PORT), "0.0.0.0", () =>
    console.log(`Server running at ${PORT}`)
  );
});

export default app;