import { Themes } from "@/constants/themes";
import { useThemeStore } from "@/store/themeStore";
import React from "react";
import { StatusBar, StyleSheet } from "react-native";
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

  // Keep persistent animated state
  const progress = useSharedValue(theme === "dark" ? 1 : 0);

  // Smooth transition every time theme changes
  React.useEffect(() => {
    progress.value = withTiming(theme === "dark" ? 1 : 0, { duration: 350 });
  }, [theme]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [
        Themes.light.colors.background,
        Themes.dark.colors.background,
      ]
    )
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* status bar matches animated background */}
      <AnimatedStatusBar theme={theme} progress={progress} />
      {children}
    </Animated.View>
  );
}

function AnimatedStatusBar({ theme, progress }: any) {
  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [
        Themes.light.colors.background,
        Themes.dark.colors.background,
      ]
    )
  }));

  return (
    <Animated.View style={[styles.statusBar, animatedStyle]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statusBar: {
    height: 32,
  },
});
