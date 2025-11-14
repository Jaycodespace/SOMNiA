import { useThemeStore } from "@/store/themeStore";
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

type Props = {
  onPress: () => void;
  loading?: boolean;
  enabled?: boolean;
  label?: string;
};

const SubmitButton: React.FC<Props> = ({
  onPress,
  loading,
  enabled = true,
  label = "Create Account",
}) => {
  const { colors } = useThemeStore();

  const backgroundColor = enabled ? colors.primary : colors.border;
  const textColor = colors.text; // dynamic from theme

  return (
    <Pressable
      onPress={onPress}
      disabled={!enabled || loading}
      style={[styles.button, { backgroundColor }]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
};

export default SubmitButton;

const styles = StyleSheet.create({
  button: {
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  text: {
    fontWeight: "600",
    fontSize: 16,
  },
});
