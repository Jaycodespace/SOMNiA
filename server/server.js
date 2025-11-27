import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";

import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import bpRouter from './routes/bpRoutes.js';
import stepRouter from "./routes/stepRoutes.js";
import heartRateRouter from "./routes/heartRateRoutes.js";
import sleepSessionRouter  from "./routes/sleepSessionRoutes.js";
import spo2Router from "./routes/spo2Routes.js";


const app = express();
const port = process.env.PORT || 4000
connectDB();

const allowedOrigins = [
    'http://localhost:5173',         // Vite (web) frontend
    'https://som-ni-a.vercel.app',  // Deployed frontend         
    'http://localhost:8081',         // Expo Go default local web (Expo dev tools)
    'http://localhost:8080',         // Expo Go default local web (Expo dev tools)
    'http://localhost:4000',
    'http://localhost:19006',        // Expo web
    'exp://127.0.0.1:19000',         // Expo mobile local dev (iOS/Android)
    'http://192.168.254.142:4000',
    'http://192.168.1.8:4000',  
    'https://somnia-17eu.onrender.com',    // Replace with your LAN IP if using physical device
  ];
  

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie', 'Set-Cookie']
}));

// Other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//API Endpoints
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/bp', bpRouter);
app.use('/api/step',stepRouter);
app.use('/api/heartRate',heartRateRouter);
app.use('/api/sleepSession', sleepSessionRouter);
app.use('/api/spo2', spo2Router);
app.listen(port, ()=> console.log(`Server started on PORT:${port}`));

