import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  passwordStrength: { score: number; feedback: string } | null;
};

const PasswordStrengthBar: React.FC<Props> = ({ passwordStrength }) => {
  if (!passwordStrength) return null;
  const { score, feedback } = passwordStrength;
  const colors = ["red", "orange", "gold", "green"];

  return (
    <View style={styles.container}>
      <View style={styles.barBackground}>
        <View
          style={[
            styles.barFill,
            {
              width: `${(score / 4) * 100}%`,
              backgroundColor: colors[Math.min(score, 3)],
            },
          ]}
        />
      </View>
      <Text style={[styles.text, { color: colors[Math.min(score, 3)] }]}>
        Password strength: {feedback}
      </Text>
    </View>
  );
};

export default PasswordStrengthBar;

const styles = StyleSheet.create({
  container: { marginBottom: 10 },
  barBackground: {
    height: 6,
    backgroundColor: "#ccc",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },
  barFill: { height: "100%" },
  text: { fontSize: 14 },
});
