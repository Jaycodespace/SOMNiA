import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

export const register = async (req, res) => {
    const { name, email, password, birthdate, gender  } = req.body;

    if (!name || !email || !password || !birthdate || !gender) {
        return res.status(400).json({ success: false, message: 'Missing required details' });
    }

    // Validate gender value
    const allowedGenders = ["Male", "Female", "Prefer not to say"];
    if (!allowedGenders.includes(gender)) {
        return res.status(400).json({
        success: false,
        message: "Invalid gender value",
        });
    }

    try {
        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userModel({
            name,
            email,
            password: hashedPassword,
            birthdate: new Date(birthdate)  ,
            gender
        });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        /*
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        */
       
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to SOMNiA',
            text: `Welcome to SOMNiA webiste. Your account has been 
            created with email id: ${email}`,
        }

        
        await transporter.sendMail(mailOptions);

        return res.status(201).json({ success: true, message: "User registered successfully" });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Required details missing' });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        /*
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        */

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        
        return res.status(200).json({ success: true, message: "Login successful", token, user_id: user._id});

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


export const logout = async (req, res) => {
    try {
        // Clear the token cookie with all necessary options
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
            path: '/',
            expires: new Date(0)
        });

        // Force clear session
        req.session = null;
        
        return res.status(200).json({ success: true, message: 'Logged Out!' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const sendVerifyOtp = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);

        if (user.isAccountVerified) {
            return res.json({ success: false, message: "Account Already Verified" });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;  
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP.',
            text: `Your OTP is ${otp}. Verify your account using this OTP.`
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "Verification OTP sent to email" });

    } catch (error) {

        res.json({ success: false, message: error.message });
    }
};


export const verifyEmail = async(req,res) =>{
    const {userId, otp} = req.body;

    if(!userId || !otp){
        res.json({success:false, message: "Missing Details"});
    }

    try {
        const user = await userModel.findById(userId);

        if(!user){
            return res.json({success:false, message: "User not found."});
        }

        if(user.verifyOtp === '' || user.verifyOtp !== otp){
            return res.json({success:false, message: "Invalid OTP."});
        }

        if(user.verifyOtpExpireAt < Date.now()){
            return res.json({success: false, message: 'OTP Expired'});
        }

        user.isAccountVerified = true;
        user.verifyOTp = '';
        user.verifyOtpExprieAt = 0;

        await user.save()
        res.json({success: true, message: "Email verified successfully"});
    } catch (error) {
        res.json({success:false, message:  error.message});

    }
}

export const isAuthenticated = async(req,res)=>{
    try {
        res.json({ success: true });

    } catch (error) {
        res.json({ success: false, message: error.message });

    }
}


export const sendResetOtp = async(req,res)=>{
    const {email} = req.body;

    if(!email){
        return res.json({success:false, message: "Email is required"});
    }

    
    
    try {
        const user = await userModel.findOne({email});
        
        if(!user){
            res.json({success: false, message: "User not found!"});
        }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;  
    await user.save();

    const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: 'Password Reset OTP.',
        text: `Your OTP for resetting your password is ${otp} 
        Use this OTP to proceed with resetting your password.`
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Otp sent to your email" });

    } catch (error) {
        res.json({ success: false, message: error.message });

    }
}

export const resetPassword = async (req,res) =>{
    const {email, otp, newPassword} = req.body;

    if(!email || !otp || !newPassword){
        return res.json({success:false,message:'Email, OTP, and new password are required'})
    }

    try {
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success:false, message: "User not found."});
        }

        if(user.resetOtp === "" || user.resetOtp !== otp){
            return res.json({sucess:false, message: "Invalid OTP"});
        }

        if(user.resetOtpExpireAt < Date.now()){
            return res.json({sucess:false, message: "OTP Expired"});
        }

        const hashPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.json({success:true, message: "Password has been reset successfully"});
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}