import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

export default function SyncButton({ onSync }: { onSync: () => void }) {
  return (
    <Pressable style={styles.button} onPress={onSync}>
      <Feather name="refresh-ccw" size={18} color="#fff" />
      <Text style={styles.text}>Sync from Health Connect</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  text: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
