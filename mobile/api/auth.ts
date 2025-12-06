import * as SecureStore from "expo-secure-store";
import { postData } from "./client";

export const loginUser = async (usernameEmail: string, password: string) => {
  const result = await postData("/api/auth/login", { usernameEmail, password });

  if (result.success) {
    await SecureStore.setItemAsync("authToken", result.accessToken);
    await SecureStore.setItemAsync("refreshToken", result.refreshToken);
  }

  return result;
};

export const requestPasswordReset = async (email: string) => {
  return await postData("/email/forgot-password", { email });
};

export const verifyResetCode = async (email: string, code: string) => {
  return await postData("/email/verify-reset-code", { email, code });
};

export const resendResetCode = async (email: string) => {
  return await postData("/email/forgot-password", { email });
};

export const resetPassword = async (email: string, code: string, newPassword: string) => {
  return await postData("/api/auth/reset-password", {
    email,
    code,
    newPassword,
  });
};