import express from "express";
import { forgotPassword, verifyResetCode } from "../controllers/emailController.js";

const router = express.Router();

router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);

export default router;
