import { Themes, ThemeType } from "@/constants/themes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";
import { create } from "zustand";

interface ThemeStore {
  theme: ThemeType;
  colors: typeof Themes.light.colors | typeof Themes.dark.colors;
  setTheme: (theme: ThemeType) => Promise<void>;
  toggleTheme: () => Promise<void>;
  loadSavedTheme: () => Promise<void>;
  loadSystemTheme: () => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: "light",
  colors: Themes.light.colors,

  setTheme: async (theme) => {
    await AsyncStorage.setItem("appTheme", theme);
    set({
      theme,
      colors: Themes[theme].colors,
    });
  },

  toggleTheme: async () => {
    const next = get().theme === "light" ? "dark" : "light";
    await get().setTheme(next);
  },

  loadSavedTheme: async () => {
    const saved = await AsyncStorage.getItem("appTheme");
    if (saved === "light" || saved === "dark") {
      set({ theme: saved, colors: Themes[saved].colors });
    } else {
      get().loadSystemTheme();
    }
  },

  loadSystemTheme: () => {
    const scheme = Appearance.getColorScheme() === "dark" ? "dark" : "light";
    set({
      theme: scheme,
      colors: Themes[scheme].colors,
    });
  },
}));

