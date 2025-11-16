import transporter from "../config/mailer.js";
import userModel from "../models/userModel.js";
import crypto from "crypto";

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await userModel.findOne({ email: normalizedEmail });

    // generic response
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If the account exists, a reset code will be sent.",
      });
    }

    const now = Date.now();

    // ----------------------------------
    //   Handle block + auto-reset count
    // ----------------------------------
    if (user.resetBlockedUntil && user.resetBlockedUntil > now) {
      const secondsLeft = Math.ceil((user.resetBlockedUntil - now) / 1000);

      return res.status(429).json({
        success: false,
        message: `Too many reset requests. Try again in ${secondsLeft} seconds.`,
      });
    }

    // If block expired → reset attempt count
    if (user.resetBlockedUntil && user.resetBlockedUntil <= now) {
      user.resetBlockedUntil = null;
      user.resetRequestCount = 0;
      await user.save();
    }

    // ----------------------------------
    //         Attempt limiting
    // ----------------------------------
    const MAX_ATTEMPTS = 2;
    const BLOCK_TIME = 60 * 1000; // 1 minute

    if (user.resetRequestCount >= MAX_ATTEMPTS) {
      user.resetBlockedUntil = now + BLOCK_TIME;
      await user.save();

      return res.status(429).json({
        success: false,
        message: "Too many attempts. You are blocked for 1 minute.",
      });
    }

    // Increase attempts (safe)
    user.resetRequestCount += 1;

    // ----------------------------------
    //    Generate 6-digit reset code
    // ----------------------------------
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = crypto
      .createHash("sha256")
      .update(resetCode)
      .digest("hex");

    user.resetPasswordToken = hashedCode;
    user.resetPasswordExpires = now + 5 * 60 * 1000; // 5 minutes
    await user.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Your Password Reset Code",
      html: `
        <div style="text-align: center; font-family: Arial, sans-serif;">
          <img src="https://res.cloudinary.com/dyvsiqgix/image/upload/v1763285395/SOMNiA_n9munn.png" 
              alt="SOMNiA Logo"
              style="width: 420px; margin-bottom: 20px;" />

          <h2 style="color: #333;">Password Reset Request</h2>
          
          <p style="font-size: 16px; color: #555;">
            Here is your password reset code:
          </p>

          <div style="
            font-size: 32px;
            letter-spacing: 6px;
            font-weight: bold;
            margin: 20px auto;
            padding: 10px 20px;
            background: #f3f3f3;
            width: fit-content;
            border-radius: 8px;">
            ${resetCode}
          </div>

          <h3 style="font-size: 14px; color: #777;">
            This code expires in <b>5 minutes</b>.
          </h3>

          <h3 style="font-size: 12px; color: #999; margin-top: 20px;">
            If you did not request this, please ignore this message.
          </h3>
        </div>
      `,
    });


    return res.json({
      success: true,
      message: "Reset code sent (if the account exists).",
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error sending reset email.",
    });
  }
};

export const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and code are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await userModel.findOne({ email: normalizedEmail });

    // Generic message to avoid probing
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset code.",
      });
    }

    const now = Date.now();

    // ----------------------------------
    //   Block brute force attempts
    // ----------------------------------
    const MAX_VERIFY_ATTEMPTS = 5;
    const VERIFY_BLOCK_TIME = 60 * 1000; // 1 minute

    if (user.verifyResetBlockedUntil && user.verifyResetBlockedUntil > now) {
      const secondsLeft = Math.ceil((user.verifyResetBlockedUntil - now) / 1000);
      return res.status(429).json({
        success: false,
        message: `Too many incorrect attempts. Try again in ${secondsLeft} seconds.`,
      });
    }

    // If block expired → reset attempt counter
    if (user.verifyResetBlockedUntil && user.verifyResetBlockedUntil <= now) {
      user.verifyResetBlockedUntil = null;
      user.verifyResetAttempts = 0;
      await user.save();
    }

    // ----------------------------------
    //   Validate Reset Code
    // ----------------------------------

    const hashedIncomingCode = crypto
      .createHash("sha256")
      .update(code)
      .digest("hex");

    // Check token + expiration
    if (
      user.resetPasswordToken !== hashedIncomingCode ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < now
    ) {
      // Increase fail attempt count
      user.verifyResetAttempts += 1;

      // If too many failed attempts → block user
      if (user.verifyResetAttempts >= MAX_VERIFY_ATTEMPTS) {
        user.verifyResetBlockedUntil = now + VERIFY_BLOCK_TIME;
      }

      await user.save();

      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset code.",
      });
    }

    // ----------------------------------
    //   Success: Code is valid!
    // ----------------------------------
    user.verifyResetAttempts = 0; // reset on success
    await user.save();

    return res.json({
      success: true,
      message: "Reset code verified successfully.",
    });

  } catch (error) {
    console.error("Verify Code Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error verifying reset code.",
    });
  }
};
