import { useThemeStore } from "@/store/themeStore";
import React from "react";
import { Pressable, Text } from "react-native";

export default function BackButton({ onPress }: { onPress: () => void }) {
  const { colors } = useThemeStore();

  return (
    <Pressable onPress={onPress} style={{ marginTop: 16, alignSelf: "center" }}>
      <Text style={{ color: colors.primary }}>
        Back to Sign In
      </Text>
    </Pressable>
  );
}
