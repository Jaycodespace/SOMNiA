export type ThemeType = "light" | "dark";

export const LightTheme = {
  type: "light" as ThemeType,
  colors: {
    background: "#FFE0B2",
    card: "#FFE4C4",
    cardDarker: "#FFD180",
    primary: "#FF8C42",
    text: "#3A2E2A",
    subtleText: "#6A5F5A",
    border: "#F2D3B3",
    tabBarActiveTint: "#FF6A00",
    tabBarInactiveTint: "#B38A72",
    tabBarBackground: "#FFF3E0",
    gradientStart: "#FFE4C4",
    gradientEnd: "#FF8C42",
    borderStrong: "#D81B60",
    borderStrongDark: "#2E3F57",
  },
};

export const DarkTheme = {
  type: "dark" as ThemeType,
  colors: {
    background: "#0D1B2A",
    card: "#1B263B",
    cardDarker: "#0D1B2A",
    primary: "#415A77",
    text: "#E0E1DD",
    subtleText: "#778DA9",
    border: "#25344A",
    tabBarActiveTint: "#7FC8F8",
    tabBarInactiveTint: "#415A77",
    tabBarBackground: "#0F253A",
    gradientStart: "#87CEFA",
    gradientEnd: "#3D2C8D",
    borderStrong: "#4B0082",
    borderStrongDark: "#0D1B2A",
  },
};

export const Themes = {
  light: LightTheme,
  dark: DarkTheme,
};