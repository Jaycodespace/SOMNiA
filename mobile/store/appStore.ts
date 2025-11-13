import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

type AppState = {
  hasSeenWelcome: boolean | null; // null = not yet checked
  setHasSeenWelcome: (value: boolean) => Promise<void>;
  loadAppState: () => Promise<void>;
};

export const useAppStore = create<AppState>((set) => ({
  hasSeenWelcome: false,

  loadAppState: async () => {
    try {
      const stored = await AsyncStorage.getItem("hasSeenWelcome");
      set({ hasSeenWelcome: stored === "true" });
    } catch (err) {
      console.error("Error loading app state:", err);
      set({ hasSeenWelcome: false });
    }
  },

  setHasSeenWelcome: async (value) => {
    try {
      await AsyncStorage.setItem("hasSeenWelcome", value ? "true" : "false");
      set({ hasSeenWelcome: value });
    } catch (err) {
      console.error("Error saving welcome state:", err);
    }
  },
}));
