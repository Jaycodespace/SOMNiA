import React, { ReactNode } from "react";
import {
    ImageBackground,
    ImageSourcePropType,
    StyleSheet,
    View,
} from "react-native";

interface OverlayWrapperProps {
  children: ReactNode;

  /** Optional overlay image */
  overlayImage?: ImageSourcePropType;

  /** Opacity of overlay image */
  opacity?: number;

  /** Enable or disable overlay layer */
  enabled?: boolean;

  /** Base background color behind the overlay */
  backgroundColor?: string; // <-- NEW
}

export default function OverlayWrapper({
  children,
  overlayImage,
  opacity = 0.1,
  enabled = true,
  backgroundColor = "transparent", // default transparent
}: OverlayWrapperProps) {
  return (
    <View style={[styles.full, { backgroundColor }]}>
      {enabled && overlayImage ? (
        <ImageBackground
          source={overlayImage}
          style={styles.full}
          resizeMode="cover"
          imageStyle={{ opacity }}
        >
          {children}
        </ImageBackground>
      ) : (
        <View style={styles.full}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  full: {
    flex: 1,
  },
});
