import React, { useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import logo from '../assets/SOMNiA_LOGO.png';

const EmailVerify = () => {
  axios.defaults.withCredentials = true;
  const inputRefs = useRef([]);
  const { backendUrl, isLoggedin, userData, refreshUserData } = useContext(AppContext);
  const navigate = useNavigate();

  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text');
    const pasteArray = paste.split('');
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setIsVerifying(true);
      const otpArray = inputRefs.current.map((el) => el?.value || '');
      const otp = otpArray.join('');

      const { data } = await axios.post(
        `${backendUrl}/api/auth/verify-account`,
        { otp },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message || 'Email verified successfully');
        // If your app fetches user data on app load / dashboard mount,
        // just navigate – no need to call getUserData here.
        await refreshUserData();
        navigate('/profile');
      } else {
        toast.error(data.message || 'Invalid code. Please try again.');
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || 'Error verifying email.'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setIsResending(true);
      const { data } = await axios.post(
        `${backendUrl}/api/auth/send-verify-otp`,
        { email: userData?.email }, // adjust if your backend doesn't need this
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message || 'Verification code resent to your email.');
      } else {
        toast.error(data.message || 'Failed to resend verification code.');
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Error resending verification code.'
      );
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    if (isLoggedin && userData?.isAccountVerified) {
      navigate('/profile');
    }
  }, [isLoggedin, userData, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A1628]">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-gray-900/50" />

      {/* Medical cross pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0v60M60 30H0' stroke='%23fff' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '30px 30px',
        }}
      />

      {/* Radial gradient for depth */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-gray-900/80" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full mx-4 sm:mx-6 relative z-10"
      >
        <div className="bg-gray-900/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-800/50 p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <motion.img
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              src={logo}
              alt="Somnia Logo"
              className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3"
            />
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl sm:text-2xl font-light text-white mb-1"
            >
              Verify Your Email
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-400 text-xs sm:text-sm"
            >
              Enter the 6-digit code sent to
              <span className="block font-medium text-gray-200 mt-1">
                {userData?.email || 'your registered email'}
              </span>
            </motion.p>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onSubmit={onSubmitHandler}
            className="space-y-6"
          >
            {/* OTP Inputs */}
            <div
              className="flex justify-center gap-2 sm:gap-3 flex-wrap"
              onPaste={handlePaste}
            >
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    required
                    ref={(el) => (inputRefs.current[index] = el)}
                    onInput={(e) => handleInput(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-10 h-10 sm:w-12 sm:h-12 text-center bg-gray-800/30 border border-gray-700/50 rounded-lg text-white text-lg focus:outline-none focus:border-blue-500 transition-colors"
                  />
                ))}
            </div>

            {/* Resend + Info */}
            <div className="text-center text-xs sm:text-sm text-gray-400 space-y-2">
              <p>Didn&apos;t receive the code?</p>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResending}
                className="text-blue-400 hover:text-blue-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isResending ? 'Resending...' : 'Resend Verification Code'}
              </button>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-xl shadow-blue-500/20 text-sm flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isVerifying ? 'Verifying...' : 'Verify Email'}
            </button>

            {/* Back to Dashboard */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm"
              >
                Back to Dashboard
              </button>
            </div>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerify;
