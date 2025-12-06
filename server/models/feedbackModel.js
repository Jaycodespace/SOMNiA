import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null, // optional feedback
  },
  message: {
    type: String,
    required: true,
  },
  screenshot: {
    type: String, // Optional screenshot URL or base64
    default: null,
  },
  category: {
    type: String,
    enum: ["bug", "feature", "UI", "performance", "other"],
    default: "other",
  },
}, { timestamps: true });

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
