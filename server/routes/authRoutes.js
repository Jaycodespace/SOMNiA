import express from 'express';
import { login, logout, refreshToken, register, checkUsername, checkEmail } from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';

const authRouter = express.Router();
authRouter.post("/login", login);
authRouter.post("/refresh", refreshToken);
authRouter.post("/logout", userAuth, logout);
authRouter.post('/register', register);

authRouter.post("/check-username", checkUsername);
authRouter.post("/check-email", checkEmail);
// authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);
// authRouter.post('/verify-account', userAuth, verifyEmail);
// authRouter.get('/is-auth', userAuth, isAuthenticated);
// authRouter.post('/send-reset-otp', sendResetOtp);
// authRouter.post('/reset-password', resetPassword);



export default authRouter;
