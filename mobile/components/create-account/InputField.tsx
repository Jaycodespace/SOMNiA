import React from "react";
import { Text, TextInput, View, StyleSheet } from "react-native";

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  status?: string | null;
  hint?: string;
  keyboardType?: "default" | "email-address";
};

const InputField: React.FC<Props> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  status,
  hint,
  keyboardType = "default",
}) => {
  const borderColor =
    status === "available"
      ? "green"
      : status === "taken" || status === "invalid"
      ? "red"
      : "#ccc";

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || label}
        secureTextEntry={secureTextEntry}
        style={[styles.input, { borderColor }]}
        placeholderTextColor="#888"
        keyboardType={keyboardType}
      />
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
};

export default InputField;

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    color: "#000",
    fontSize: 16,
  },
  hint: { fontSize: 13, color: "gray", marginTop: 2 },
});
