import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import feedbackRoutes from "./routes/feedBackRoutes.js";

dotenv.config();
const app = express();
// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL, 
  credentials: true
}));

connectDB();

// Routes
app.use('/api/auth', authRouter);
app.use("/email", emailRoutes);
app.use("/api/feedback", feedbackRoutes);
// Start Server
const port = process.env.PORT || 4000;
app.listen(port, ()=> console.log(`Server started on PORT:${port}`));
