// server/controllers/insomniaScoreController.js

import InsomniaRisk from "../models/insomniaRisk.js";
import { getInsomniaRisk } from "../services/aiService.js";

// Helper to safely extract userId
function getUserId(req) {
  return (
    req.user?.id ||
    req.user?._id ||
    req.user?.userId ||
    req.body?.userId ||
    null
  );
}

// POST /api/ai/insomnia-risk
// Calls AI, saves risk score, returns the saved document
export async function calculateInsomniaRisk(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      console.error(
        "[AI] calculateInsomniaRisk: Missing userId. req.user =",
        req.user
      );
      return res.status(400).json({
        success: false,
        message:
          "Missing userId. Ensure userAuth attaches req.user or send userId in request body.",
        data: null,
      });
    }

    console.log("[AI] calculateInsomniaRisk for user:", userId);

    // 1) Call AI service wrapper
    const aiResult = await getInsomniaRisk(userId);
    console.log("[AI] getInsomniaRisk result:", aiResult);

    const { insufficientData, message, risk } = aiResult;

    // 2) If insufficient data, do NOT save anything
    if (insufficientData) {
      return res.status(200).json({
        success: false,
        message:
          message ||
          "Insufficient wearable data to compute insomnia risk at this time.",
        data: null,
      });
    }

    // 3) Validate that risk is a real number
    if (typeof risk !== "number" || Number.isNaN(risk)) {
      console.error(
        "[AI] Invalid response from AI service, risk is not a number:",
        aiResult
      );
      return res.status(500).json({
        success: false,
        message: "AI service returned an invalid risk value.",
        data: null,
      });
    }

    // 4) Save to Mongo
    const riskDoc = await InsomniaRisk.create({
      user: userId,
      risk,
      source: "AI_MODEL",
      createdAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Insomnia risk computed and saved successfully.",
      data: riskDoc,
    });
  } catch (err) {
    console.error("[AI] Error in calculateInsomniaRisk:", err);
    return res.status(500).json({
      success: false,
      message: "An error occurred while computing insomnia risk.",
      error: err.message,
      data: null,
    });
  }
}
