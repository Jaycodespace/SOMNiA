import mongoose from "mongoose";

const insomniaRiskSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },  // <-- store userId as plain string
    risk: { type: Number, required: true },
    windowDays: { type: Number, default: 21 },
    calculatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);


const InsomniaRisk = mongoose.model("InsomniaRisk", insomniaRiskSchema);
export default InsomniaRisk;
