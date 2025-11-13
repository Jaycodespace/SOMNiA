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
