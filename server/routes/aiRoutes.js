// server/routes/aiRoutes.js

import express from "express";
import userAuth from "../middleware/userAuth.js";

import { calculateInsomniaRisk } from "../controllers/insomniaScoreController.js";

const aiRouter = express.Router();

// POST → call AI and save a new risk score
// userAuth attaches req.user based on your auth cookie / token
aiRouter.post("/insomnia-risk", userAuth, calculateInsomniaRisk);

export default aiRouter;
