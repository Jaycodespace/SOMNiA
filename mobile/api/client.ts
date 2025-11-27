import { useStoreAuth } from "@/store/authStore";
import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

async function getTokens() {
  const accessToken = await SecureStore.getItemAsync("authToken");
  const refreshToken = await SecureStore.getItemAsync("refreshToken");
  return { accessToken, refreshToken };
}

async function saveTokens(accessToken: string, refreshToken?: string) {
  await SecureStore.setItemAsync("authToken", accessToken);
  if (refreshToken) await SecureStore.setItemAsync("refreshToken", refreshToken);
}

// api/client.ts
export const postData = async (endpoint: string, data: any) => {
  const { accessToken, refreshToken } = await getTokens();
  const { forceLogout } = useStoreAuth.getState();

  try {
    let response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(data),
    });

    // 🔁 Token refresh logic (keep this same)
    if (response.status === 401 && refreshToken) {
      console.log("Access token expired, trying refresh...");
      const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: refreshToken }),
      });

      const refreshData = await refreshRes.json();

      if (refreshData.success && refreshData.accessToken) {
        await saveTokens(refreshData.accessToken, refreshData.refreshToken);
        response = await fetch(`${API_URL}${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${refreshData.accessToken}`,
          },
          body: JSON.stringify(data),
        });
      } else {
        await forceLogout("Session expired. Please sign in again.");
        return { success: false, message: "Session expired" };
      }
    }

    const result = await response.json().catch(() => ({}));

    // ✅ Don’t throw errors — return them cleanly
    return {
      success: response.ok,
      status: response.status,
      message: result.message || `HTTP ${response.status}`,
      ...result,
    };
  } catch (error: unknown) {
    console.error("API error:", error);
    const message = error instanceof Error ? error.message : "Unexpected error";
    return { success: false, message };
  }
};
