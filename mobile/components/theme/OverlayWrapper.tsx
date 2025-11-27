import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, ImageSourcePropType, StyleSheet } from "react-native";

interface OverlayWrapperProps {
  children: React.ReactNode;
  colors: [string, string]; // two gradient colors
  overlayImage?: ImageSourcePropType; // optional overlay image
  overlayOpacity?: number; // optional opacity for overlay image
}

export default function OverlayWrapper({
  children,
  colors,
  overlayImage,
  overlayOpacity = 0.3,
}: OverlayWrapperProps) {
  return (
    <LinearGradient colors={colors} style={styles.container}>
      {overlayImage && (
        <Image
          source={overlayImage}
          style={[styles.overlayImage, { opacity: overlayOpacity }]}
          resizeMode="cover"
        />
      )}
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlayImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },

  content: {
    flex: 1,
  },
});
