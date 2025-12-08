import { useThemeStore } from "@/store/themeStore";
import { ReactNode } from "react";
import { ImageBackground, StyleSheet, View } from "react-native";

// Backgrounds
const lightBg = require("@/assets/images/noon_sky.png");
const darkBg = require("@/assets/images/night_sky.png");

// Logo overlays
const lightLogo = require("@/assets/images/somniaLogo_light.png");
const darkLogo = require("@/assets/images/somniaLogo_BG.png");

interface Props {
  children: ReactNode;
  showLogo?: boolean; // optional
  logoOpacity?: number; // optional control
}

export default function BackgroundWrapper({
  children,
  showLogo = true,
  logoOpacity = 0.35,
}: Props) {
  const { theme } = useThemeStore();

  const bgImage = theme === "light" ? lightBg : darkBg;
  const logoImage = theme === "light" ? lightLogo : darkLogo;

  return (
    <ImageBackground source={bgImage} style={styles.full} resizeMode="cover">
      {showLogo ? (
        <ImageBackground
          source={logoImage}
          style={styles.full}
          resizeMode="cover"
          imageStyle={{ opacity: logoOpacity }}
        >
          {children}
        </ImageBackground>
      ) : (
        <View style={styles.full}>{children}</View>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  full: {
    flex: 1,
  },
});
