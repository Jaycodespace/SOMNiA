import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Base user attributes
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, default: "" },
    password: { type: String, required: true },
    refreshToken: { type: String, default: null },

    // Reset password token
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    // Anti spam reset tokens
    resetRequestCount: { type: Number, default: 0 },
    resetBlockedUntil: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },

    // Anti spam verify tokens
    verifyResetAttempts: { type: Number, default: 0 },
    verifyResetBlockedUntil: { type: Date },

  },
  { timestamps: true }
);

mongoose.set('autoIndex', true);

const userModel = mongoose.models.User || mongoose.model("User", userSchema);
export default userModel;
