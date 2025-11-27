import express from "express";
import { submitFeedback } from "../controllers/feedBackController.js";
import optionalAuth from "../middleware/optionalAuth.js";

const router = express.Router();

// Guest OR logged-in allowed
router.post("/", optionalAuth, submitFeedback);

export default router;
