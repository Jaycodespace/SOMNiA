import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
// import userRouter from "./routes/userRoutes.js";
// import bpRouter from './routes/bpRoutes.js';
// import stepRouter from "./routes/stepRoutes.js";
// import heartRateRouter from "./routes/heartRateRoutes.js";
// import sleepSessionRouter  from "./routes/sleepSessionRoutes.js";

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
// app.use('/api/user', userRouter);
// app.use('/api/bp', bpRouter);
// app.use('/api/step',stepRouter);
// app.use('/api/heartRate',heartRateRouter);
// app.use('/api/sleepSession', sleepSessionRouter);

// Start Server
const port = process.env.PORT || 4000;
app.listen(port, ()=> console.log(`Server started on PORT:${port}`));
