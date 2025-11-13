import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

const BackButton = ({ onPress }: { onPress: () => void }) => (
  <Pressable onPress={onPress} style={styles.button}>
    <Text style={styles.text}>Back to Sign In</Text>
  </Pressable>
);

export default BackButton;

const styles = StyleSheet.create({
  button: {
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  text: { color: "#000" },
});
