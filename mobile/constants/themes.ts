export type ThemeType = "light" | "dark";

export const LightTheme = {
  type: "light" as ThemeType,
  colors: {
    background: "#FFF7ED",     // sunrise beige
    card: "#FFE4C4",           // warm peach
    primary: "#FF8C42",        // soft orange
    text: "#3A2E2A",
    subtleText: "#6A5F5A",
    border: "#F2D3B3",
  },
};

export const DarkTheme = {
  type: "dark" as ThemeType,
  colors: {
    background: "#0D1B2A",     // deep night blue
    card: "#1B263B",
    primary: "#415A77",
    text: "#E0E1DD",
    subtleText: "#778DA9",
    border: "#25344A",
  },
};

export const Themes = {
  light: LightTheme,
  dark: DarkTheme,
};
