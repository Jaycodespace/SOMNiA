import React from "react";
import { Image, ImageSourcePropType, StyleSheet, View, ViewStyle } from "react-native";

interface LogoProviderProps {
  source: ImageSourcePropType;
  opacity?: number;
  style?: ViewStyle;
}

export default function LogoProvider({ source, opacity = 1, style }: LogoProviderProps) {
  return (
    <View style={[styles.container, style]}>
      <Image
        source={source}
        style={[styles.image, { opacity }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,                 // <- Fill parent height/width
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",            // <- takes full width
    height: "100%",           // <- takes full height (this fixes your issue)
  },
});
