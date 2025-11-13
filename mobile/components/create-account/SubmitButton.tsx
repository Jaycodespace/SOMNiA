import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

type Props = {
  onPress: () => void;
  loading?: boolean;
  enabled?: boolean;
};

const SubmitButton: React.FC<Props> = ({ onPress, loading, enabled }) => {
  const backgroundColor = enabled ? "#007BFF" : "#ccc";

  return (
    <Pressable
      onPress={onPress}
      disabled={!enabled || loading}
      style={[styles.button, { backgroundColor }]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.text}>Create Account</Text>
      )}
    </Pressable>
  );
};

export default SubmitButton;

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  text: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
