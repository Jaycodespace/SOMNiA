import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    birthdate: { type: Date, required: true }, 
    verifyOtp: { type: String, default: '' },
    verifyOtpExpireAt: { type: Number, default: 0 },
    isAccountVerified: { type: Boolean, default: false },
    resetOtp: { type: String, default: '' },
    resetOtpExpireAt: { type: String, default: 0 },
    gender: {
    type: String,
    enum: ["Male", "Female", "Prefer not to say"],
    required: true,
  },
});



const userModel = mongoose.models.user ||mongoose.model('user', userSchema);

export default userModel;