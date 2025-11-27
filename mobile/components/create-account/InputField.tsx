import { useThemeStore } from "@/store/themeStore";
import React from "react";
import { Text, TextInput, View } from "react-native";

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
  const { colors } = useThemeStore();

  const borderColor =
    status === "available"
      ? "green"
      : status === "taken" || status === "invalid"
      ? "red"
      : colors.border;

  return (
    <View style={{ marginVertical: 8 }}>
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || label}
        secureTextEntry={secureTextEntry}
        style={{
          borderWidth: 1,
          borderRadius: 8,
          padding: 10,
          fontSize: 16,
          borderColor,
          backgroundColor: colors.card,
          color: colors.text,
          marginTop: 4,
        }}
        placeholderTextColor={colors.subtleText}
        keyboardType={keyboardType}
      />

      {hint && <Text style={{ fontSize: 13, color: "gray", marginTop: 2 }}>{hint}</Text>}
    </View>
  );
};

export default InputField;
