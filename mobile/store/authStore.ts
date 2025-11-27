import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import React from "react";
import { Alert, AppState } from "react-native";
import { create } from "zustand";

type User = {
  username: string;
  email: string;
  name: string;
  createdAt: string;
};

type AuthState = {
  user: User | null;
  isLoggedIn: boolean;
  shouldCreateAccount: boolean;
  forgotPassword: boolean;
  isRestoring: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  forceLogout: (reason?: string) => Promise<void>;
  restoreSession: () => Promise<void>;
  goToCreateAccount: () => void;
  goToForgotPassword: () => void;
  backToSignIn: () => void;

  updateUserName: (name: string) => void; // <-- ADD THIS
};


export const useStoreAuth = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  isRestoring: true,

  login: (user) =>
    set({
      user,
      isLoggedIn: true,
      shouldCreateAccount: false,
      forgotPassword: false,
      isRestoring: false,
    }),

  logout: async () => {
    await SecureStore.deleteItemAsync("authToken");
    await SecureStore.deleteItemAsync("refreshToken");
    set({
      user: null,
      isLoggedIn: false,
      shouldCreateAccount: false,
      forgotPassword: false,
      isRestoring: false,
    });
  },

  forceLogout: async (reason = "Session expired. Please sign in again.") => {
    await SecureStore.deleteItemAsync("authToken");
    await SecureStore.deleteItemAsync("refreshToken");
    set({
      user: null,
      isLoggedIn: false,
      shouldCreateAccount: false,
      forgotPassword: false,
      isRestoring: false,
    });
    Alert.alert("Logged Out", reason);
    router.replace("/sign-in");
  },

  restoreSession: async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      if (!token || !refreshToken) {
        set({ isRestoring: false });
        return;
      }

      const decoded: any = jwtDecode(token);
      const now = Date.now() / 1000;

      // ✅ If still valid
      if (decoded.exp > now) {
        set({
          isLoggedIn: true,
          user: { username: decoded.username, email: decoded.email, name: decoded.name, createdAt: decoded.createdAt },
          isRestoring: false,
        });
        return;
      }

      // 🔁 Try to refresh
      console.log("Access token expired — refreshing...");
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: refreshToken }),
      });

      const data = await res.json();

      if (data.success && data.accessToken) {
        await SecureStore.setItemAsync("authToken", data.accessToken);
        await SecureStore.setItemAsync("refreshToken", data.refreshToken);
        const newDecoded: any = jwtDecode(data.accessToken);

        set({
          isLoggedIn: true,
          user: { username: newDecoded.username, email: newDecoded.email, name: newDecoded.name, createdAt: newDecoded.createdAt },
          isRestoring: false,
        });
      } else {
        console.warn("Refresh failed — forcing logout");
        await useStoreAuth.getState().forceLogout("Session expired. Please log in again.");
      }
    } catch (error) {
      console.warn("Failed to restore session:", error);
      set({ isRestoring: false });
    }
  },

  shouldCreateAccount: false,
  forgotPassword: false,
  goToCreateAccount: () => set({ shouldCreateAccount: true, forgotPassword: false }),
  goToForgotPassword: () => set({ forgotPassword: true, shouldCreateAccount: false }),
  backToSignIn: () => set({ shouldCreateAccount: false, forgotPassword: false }),

  updateUserName: (name: string) =>
  set((state) => ({
    user: state.user ? { ...state.user, name } : null,
  })),
}));

// ✅ Auto token check (every 1 min + on app resume)
export function useAuthSession() {
  const { forceLogout, isLoggedIn } = useStoreAuth();
  const appState = AppState.currentState;

  React.useEffect(() => {
    if (!isLoggedIn) return;

    let interval: ReturnType<typeof setInterval> | null = null;
    let currentState = appState;

    const checkToken = async () => {
      try {
        const token = await SecureStore.getItemAsync("authToken");
        const refreshToken = await SecureStore.getItemAsync("refreshToken");
        if (!token || !refreshToken) return;

        const decoded: any = jwtDecode(token);
        const now = Date.now() / 1000;

        // If token expires in less than 2 minutes, refresh automatically
        if (decoded.exp && decoded.exp - now < 120) {
          console.log("🔄 Token expiring soon — refreshing...");
          const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: refreshToken }),
          });

          const data = await res.json();
          if (data.success && data.accessToken) {
            await SecureStore.setItemAsync("authToken", data.accessToken);
            await SecureStore.setItemAsync("refreshToken", data.refreshToken);
            console.log("✅ Token refreshed silently");
          } else {
            console.warn("⚠️ Refresh failed — force logout");
            await forceLogout("Session expired. Please sign in again.");
          }
        }
      } catch (err) {
        console.warn("Token check error:", err);
      }
    };

    checkToken();
    interval = setInterval(checkToken, 60 * 1000);

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (currentState.match(/inactive|background/) && nextAppState === "active") {
        console.log("📱 App resumed — checking token...");
        checkToken();
      }
      currentState = nextAppState;
    });

    return () => {
      if (interval) clearInterval(interval);
      subscription.remove();
    };
  }, [isLoggedIn, forceLogout, appState]);
}
