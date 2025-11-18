import { useThemeStore } from "@/store/themeStore";
import React, { useRef } from "react";
import { NativeSyntheticEvent, StyleSheet, TextInput, TextInputKeyPressEventData, View } from "react-native";

export default function OtpInput({
  code,
  setCode,
  length = 6,
}: {
  code: string;
  setCode: (val: string) => void;
  length?: number;
}) {
  const { colors } = useThemeStore();
  const refs = useRef<TextInput[]>([]);

  // Auto-paste support
  const handleFullPaste = (text: string) => {
    if (text.length === length) {
      setCode(text);
      refs.current[length - 1]?.blur();
      return true;
    }
    return false;
  };

  const handleChange = (text: string, index: number) => {
    // If user pasted a full code into any box
    if (text.length > 1 && handleFullPaste(text)) {
      return;
    }

    const newCode = code.split("");
    newCode[index] = text.slice(-1);

    const joined = newCode.join("");
    setCode(joined);

    if (text && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    const key = e.nativeEvent.key;

    if (key === "Backspace" && !code[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, i) => {
        const char = code[i] || "";

        return (
          <TextInput
            key={i}
            ref={(r) => {
              refs.current[i] = r!;
            }}
            keyboardType="number-pad"
            maxLength={1}
            value={char}
            onChangeText={(text) => handleChange(text, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
            style={[
              styles.box,
              {
                borderColor: colors.border,
                backgroundColor: colors.card,
                color: colors.text,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },
  box: {
    flex: 1,            // makes each box scale evenly
    maxWidth: 52,       // prevents boxes from becoming too wide on tablets
    height: 55,
    borderWidth: 1.5,
    borderRadius: 12,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
  },
});
