import express from "express";
import Citizen from "../models/Citizen.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const citizen = await Citizen.create(req.body);
    res.status(201).json(citizen);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/", async (_req, res) => {
  try {
    const citizens = await Citizen.find().sort({ createdAt: -1 });
    res.json(citizens);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const citizen = await Citizen.findById(req.params.id);
    if (!citizen) return res.status(404).json({ error: "Not found" });
    res.json(citizen);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
