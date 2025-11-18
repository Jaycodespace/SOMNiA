import { resetPassword } from "@/api/auth";
import BackgroundWrapper from "@/components/theme/BackgroundWrapper";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewPasswordScreen() {
  const { email, code } = useLocalSearchParams<{ email: string; code: string }>();
  const { colors } = useThemeStore();

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Password strength calculation
  const strength = useMemo(() => {
    if (pw.length < 6) return "weak";
    if (pw.match(/[A-Z]/) && pw.match(/[0-9]/)) return "strong";
    return "medium";
  }, [pw]);

  const canSubmit = pw.trim().length >= 6 && pw === pw2;

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      if (!email || !code) {
        setErrorMsg("Missing reset verification data.");
        return;
      }

      const result = await resetPassword(email as string, code as string, pw);

      if (result.success) {
        router.replace("/sign-in");
      } else {
        setErrorMsg(result.message || "Failed to update password.");
      }
    } catch (error) {
      setErrorMsg("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const strengthColor =
    strength === "weak"
      ? "red"
      : strength === "medium"
      ? "#e0a200"
      : "#2ecc71";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <BackgroundWrapper showLogo={false}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ThemeToggle />

          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingHorizontal: 24,
              paddingVertical: 20,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={{
                backgroundColor: colors.card,
                padding: 22,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 26,
                  fontWeight: "700",
                  marginBottom: 20,
                  color: colors.text,
                  textAlign: "center",
                }}
              >
                Set New Password
              </Text>

              {/* Password Input */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 10,
                  backgroundColor: colors.card,
                  marginBottom: 8,
                }}
              >
                <TextInput
                  value={pw}
                  onChangeText={setPw}
                  secureTextEntry={!show}
                  placeholder="New password"
                  placeholderTextColor={colors.subtleText}
                  style={{
                    flex: 1,
                    padding: 14,
                    fontSize: 16,
                    color: colors.text,
                  }}
                />
                <Pressable onPress={() => setShow((p) => !p)} style={{ padding: 12 }}>
                  <Ionicons
                    name={show ? "eye-off" : "eye"}
                    size={22}
                    color={colors.subtleText}
                  />
                </Pressable>
              </View>

              {/* Password Strength */}
              {pw.length > 0 && (
                <Text
                  style={{
                    marginBottom: 16,
                    color: strengthColor,
                    fontWeight: "600",
                  }}
                >
                  Strength: {strength.toUpperCase()}
                </Text>
              )}

              {/* Confirm Password */}
              <TextInput
                value={pw2}
                onChangeText={setPw2}
                secureTextEntry={!show}
                placeholder="Confirm new password"
                placeholderTextColor={colors.subtleText}
                style={{
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 10,
                  padding: 14,
                  fontSize: 16,
                  color: colors.text,
                  backgroundColor: colors.card,
                  marginBottom: errorMsg ? 8 : 18,
                }}
              />

              {/* Errors */}
              {pw2.length > 0 && pw !== pw2 && (
                <Text style={{ color: "red", marginBottom: 10 }}>
                  Passwords do not match.
                </Text>
              )}

              {errorMsg && (
                <Text style={{ color: "red", marginBottom: 12, textAlign: "center" }}>
                  {errorMsg}
                </Text>
              )}

              {/* Submit Button */}
              <Pressable
                onPress={handleSubmit}
                disabled={!canSubmit || loading}
                style={{
                  backgroundColor: canSubmit ? colors.primary : colors.border,
                  padding: 15,
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "600", fontSize: 17 }}>
                    Save Password
                  </Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </BackgroundWrapper>
    </SafeAreaView>
  );
}
