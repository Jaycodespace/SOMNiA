import Feedback from "../models/feedbackModel.js";

export const submitFeedback = async (req, res) => {
  try {
    const { message, screenshot, category } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const userId = req.user?.id || null;

    const feedback = await Feedback.create({
      userId,
      message,
      screenshot: screenshot || null,
      category: category || "other",
    });

    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback,
    });

  } catch (error) {
    console.error("Feedback error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
