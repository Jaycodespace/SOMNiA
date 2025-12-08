// server/routes/aiRoutes.js

import express from "express";
import { getInsomniaRisk } from "../services/aiService.js";
import InsomniaRisk from "../models/insomniaRisk.js";

const router = express.Router();

router.post("/insomnia-risk", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Missing userId",
      });
    }

    // Call service (this may return insufficientData: true)
    const result = await getInsomniaRisk(userId);

    // 🔴 CASE 1: No data → DO NOT SAVE to DB
    if (result.insufficientData) {
      return res.status(200).json({
        success: false,
        message: result.message, // "Insufficient data to compute insomnia risk..."
        data: null,
      });
    }

    // ✅ CASE 2: We have a real risk value → save it
    const riskDoc = await InsomniaRisk.create({
      user: userId,
      risk: result.insomnia_risk,
      // store whatever else you want:
      rawResponse: result,
    });

    return res.status(200).json({
      success: true,
      data: {
        person_id: result.person_id,
        insomnia_risk: result.insomnia_risk,
        message: result.message || "Insomnia risk computed successfully.",
        dbId: riskDoc._id,
      },
    });
  } catch (err) {
    console.error("AI error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to compute insomnia risk.",
    });
  }
});

export default router;
