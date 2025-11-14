import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet } from "react-native";

export default function ThemeToggle() {
  const { theme, toggleTheme, colors } = useThemeStore();

  return (
    <Pressable onPress={toggleTheme} style={styles.button}>
      <Ionicons
        name={theme === "light" ? "moon" : "sunny"}
        size={22}
        color={colors.text}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    alignSelf: "flex-end",
  },
});
