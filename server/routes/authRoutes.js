import express from 'express';
import { 
    login, 
    logout, 
    refreshToken, 
    register, 
    checkUsername, 
    checkEmail,
    resetPassword
} from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';

const authRouter = express.Router();
authRouter.post("/login", login);
authRouter.post("/refresh", refreshToken);
authRouter.post("/logout", userAuth, logout);
authRouter.post('/register', register);
authRouter.post("/check-username", checkUsername);
authRouter.post("/check-email", checkEmail);
authRouter.post("/reset-password", resetPassword);
export default authRouter;
