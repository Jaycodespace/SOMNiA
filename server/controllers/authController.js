import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator'
import userModel from '../models/userModel.js';
import crypto from "crypto";

export const login = async (req, res) => {
  const { usernameEmail, password } = req.body;

  if (!usernameEmail || !password) {
    return res.status(400).json({
      success: false,
      message: "Required details missing",
    });
  }

  try {
    const normalizedInput = usernameEmail.trim().toLowerCase();
    const user = validator.isEmail(normalizedInput)
      ? await userModel.findOne({ email: normalizedInput })
      : await userModel.findOne({ username: normalizedInput });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    const payload = { 
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });


    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      user: { _id: user._id, username: user.username, email: user.email, name: user.name },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const refreshToken = async (req, res) => {
  const { token } = req.body; // from mobile
  const cookieToken = req.cookies?.refreshToken; // from web

  const clientToken = token || cookieToken;

  if (!clientToken) {
    return res.status(401).json({ success: false, message: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(clientToken, process.env.JWT_REFRESH_SECRET);
    const user = await userModel.findById(decoded.id);

    if (!user || user.refreshToken !== clientToken) {
      return res.status(403).json({ success: false, message: "Invalid refresh token" });
    }

    const payload = { 
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    };

    const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
    const newRefreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });


    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    console.error("Refresh token error:", err.message);
    return res.status(403).json({ success: false, message: "Token expired or invalid" });
  }
};

export const logout = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.refreshToken = null;
    await user.save();

    res.clearCookie("refreshToken");
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

function generateRandomName() {
  const adjectives = ["Brave", "Swift", "Clever", "Calm", "Lucky", "Wild", "Gentle", "Fierce"];
  const animals = ["Tiger", "Falcon", "Wolf", "Panda", "Dolphin", "Hawk", "Bear", "Fox"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const number = Math.floor(Math.random() * 999);
  return `${adj}${animal}${number}`;
}

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    if (!validator.isEmail(normalizedEmail)) {
      return res.status(400).json({ success: false, message: "Invalid email address." });
    }

    if (!/^[a-zA-Z0-9_]{8,20}$/.test(normalizedUsername)) {
      return res.status(400).json({
        success: false,
        message: "Username must be 8–20 characters and only contain letters, numbers, or underscores.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const existingUser = await userModel.findOne({
      $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username or email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      name: generateRandomName(),
    });
    
    await user.save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
      },
      refreshToken,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// --- Check username availability
export const checkUsername = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username || typeof username !== "string") {
      return res.status(400).json({ available: false, message: "Username is required." });
    }

    const normalizedUsername = username.trim().toLowerCase();

    // Validate username format
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(normalizedUsername)) {
      return res.status(400).json({
        available: false,
        message: "Username must be 3–20 characters and only contain letters, numbers, or underscores.",
      });
    }

    const existingUser = await userModel.findOne({ username: normalizedUsername });
    if (existingUser) {
      return res.json({ available: false, message: "Username is already taken." });
    }

    return res.json({ available: true, message: "Username is available." });
  } catch (err) {
    console.error("Check username error:", err);
    res.status(500).json({ available: false, message: "Server error, please try again." });
  }
};

// --- Check email availability
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ available: false, message: "Email is required." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Validate email format
    if (!validator.isEmail(normalizedEmail)) {
      return res.status(400).json({ available: false, message: "Invalid email format." });
    }

    const existingUser = await userModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.json({ available: false, message: "Email is already in use." });
    }

    return res.json({ available: true, message: "Email is available." });
  } catch (err) {
    console.error("Check email error:", err);
    res.status(500).json({ available: false, message: "Server error, please try again." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, reset code, and new password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await userModel.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset request.",
      });
    }

    const now = Date.now();

    // -----------------------------------------
    //    Check if reset code is expired or invalid
    // -----------------------------------------
    const hashedIncomingCode = crypto
      .createHash("sha256")
      .update(code)
      .digest("hex");

    if (
      hashedIncomingCode !== user.resetPasswordToken ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < now
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset code.",
      });
    }

    // -----------------------------------------
    //    Hash new password
    // -----------------------------------------
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;

    // -----------------------------------------
    //    Clear reset-related fields
    // -----------------------------------------
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    // reset rate limiting + attempts
    user.resetRequestCount = 0;
    user.resetBlockedUntil = null;
    user.verifyResetAttempts = 0;
    user.verifyResetBlockedUntil = null;

    // Optionally invalidate refresh tokens (recommended)
    user.refreshToken = null;

    await user.save();

    return res.json({
      success: true,
      message: "Password reset successfully. You may now log in.",
    });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error resetting password.",
    });
  }
};

export const updateName = async (req, res) => {
  try {
    const userId = req.userId; // comes from auth middleware
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Name cannot be empty" 
      });
    }

    // Optional: limit name length
    if (name.length > 40) {
      return res.status(400).json({
        success: false,
        message: "Name is too long (max 40 characters)",
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    user.name = name.trim();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Name updated successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
      }
    });
  } catch (error) {
    console.error("Update name error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password confirmation required",
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // Delete user
    await userModel.findByIdAndDelete(userId);

    // Clear refresh token cookie
    res.clearCookie("refreshToken");

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};




