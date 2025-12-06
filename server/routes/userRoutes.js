import express from "express";
import userAuth from "../middleware/userAuth.js";
import userModel from "../models/userModel.js";

const router = express.Router();

// Simple protected test route
router.get("/profile", userAuth, async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("-password");
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
