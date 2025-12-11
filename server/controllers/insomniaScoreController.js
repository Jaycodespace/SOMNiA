import { getInsomniaRisk } from "../services/aiService.js";
import InsomniaRisk from "../models/insomniaRisk.js";

/**
 * POST /insomnia-risk
 * Triggers the AI service and (if successful) stores a new InsomniaRisk document.
 */
export const calculateInsomniaRisk = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Missing userId",
      });
    }

    // Call service (this may return { insufficientData: true, message: "..." })
    const result = await getInsomniaRisk(userId);

    // CASE 1: Not enough data -> do not save anything, just return message
    if (result.insufficientData) {
      return res.status(200).json({
        success: false,
        message: result.message,
        data: null,
      });
    }

    // CASE 2: We have a valid risk value -> persist in DB
    const riskDoc = await InsomniaRisk.create({
      user: userId,
      risk: result.insomnia_risk,
      windowDays: result.windowDays || 21,
      calculatedAt: new Date(),
      // If you want to keep the raw payload, add it to the schema first
      // rawResponse: result,
    });

    return res.status(200).json({
      success: true,
      data: {
        person_id: result.person_id,
        insomnia_risk: result.insomnia_risk,
        message: result.message || "Insomnia risk computed successfully.",
        dbId: riskDoc._id,
        calculatedAt: riskDoc.calculatedAt,
      },
    });
  } catch (err) {
    console.error("AI error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to compute insomnia risk.",
    });
  }
};

/**
 * GET /insomnia-risk/:userId/latest
 * Returns the most recent risk score for a given user, without calling the AI again.
 */
export const getLatestInsomniaRisk = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Missing userId",
      });
    }

    const latest = await InsomniaRisk.findOne({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!latest) {
      return res.status(200).json({
        success: false,
        message: "No insomnia risk score found for this user.",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: latest.user,
        insomnia_risk: latest.risk,
        windowDays: latest.windowDays,
        calculatedAt: latest.calculatedAt,
        id: latest._id,
      },
    });
  } catch (err) {
    console.error("Get latest insomnia risk error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve insomnia risk.",
    });
  }
};

/**
 * Optional: GET /insomnia-risk/:userId/history
 * Returns all saved risk scores for charts / history views.
 */
export const getInsomniaRiskHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Missing userId",
      });
    }

    const history = await InsomniaRisk.find({ user: userId })
      .sort({ createdAt: 1 }) // oldest → newest
      .lean();

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history.map((item) => ({
        id: item._id,
        insomnia_risk: item.risk,
        windowDays: item.windowDays,
        calculatedAt: item.calculatedAt,
      })),
    });
  } catch (err) {
    console.error("Get insomnia risk history error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve insomnia risk history.",
    });
  }
};
