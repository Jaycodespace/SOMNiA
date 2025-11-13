import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, default: "" },
    password: { type: String, required: true },
    refreshToken: { type: String, default: null },
  },
  { timestamps: true }
);

mongoose.set('autoIndex', true);

const userModel = mongoose.models.User || mongoose.model("User", userSchema);
export default userModel;
