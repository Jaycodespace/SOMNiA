import express from "express";
import {
  calculateInsomniaRisk,
  getLatestInsomniaRisk,
  getInsomniaRiskHistory,
} from "../controllers/insomniaScoreController.js";

const aiRouter = express.Router();

// POST → call AI and save a new risk score
router.post("/insomnia-risk", calculateInsomniaRisk);

// GET → fetch latest saved risk for a user
router.get("/insomnia-risk/:userId/latest", getLatestInsomniaRisk);

// Optional: GET → full history for charts
router.get("/insomnia-risk/:userId/history", getInsomniaRiskHistory);

export default aiRouter;
