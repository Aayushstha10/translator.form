import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import citizenRoutes from "./routes/citizen.js";
import translateRoutes from "./routes/translate.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/citizens", citizenRoutes);
app.use("/api/translate", translateRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 5000;

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/nepali_citizenship";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (no DB)`);
    });
  });