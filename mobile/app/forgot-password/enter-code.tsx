import { resendResetCode, verifyResetCode } from "@/api/auth";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useThemeStore } from "@/store/themeStore";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text, TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const lightBg = require("@/assets/images/noon_sky.png");
const darkBg = require("@/assets/images/night_sky.png");

export default function EnterCodeScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { colors, theme } = useThemeStore();
  const bgImage = theme === "light" ? lightBg : darkBg;

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleVerify = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      if (!email) {
        setErrorMsg("Missing email.");
        return;
      }

      const result = await verifyResetCode(email as string, code);

      if (result.success) {
        router.push({
          pathname: "/forgot-password/new-password",
          params: {
            email,
            code,
          }
        });
      } else {
        setErrorMsg(result.message || "Invalid reset code.");
      }
    } catch (err) {
      setErrorMsg("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setErrorMsg(null);

    const result = await resendResetCode(email as string);

    if (!result.success) {
      setErrorMsg(result.message || "Failed to resend code.");
    }

    setResending(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ImageBackground source={bgImage} style={{ flex: 1 }}>

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
            }}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={{
                backgroundColor: colors.card,
                padding: 20,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 26,
                  fontWeight: "700",
                  marginBottom: 20,
                  textAlign: "center",
                  color: colors.text,
                }}
              >
                Enter Verification Code
              </Text>

              <TextInput
                value={code}
                onChangeText={(t) => {
                  setCode(t);
                  setErrorMsg(null);
                }}
                placeholder="123456"
                keyboardType="numeric"
                maxLength={6}
                placeholderTextColor={colors.subtleText}
                style={{
                  borderColor: colors.border,
                  borderWidth: 1,
                  padding: 12,
                  borderRadius: 10,
                  backgroundColor: colors.card,
                  color: colors.text,
                  textAlign: "center",
                  fontSize: 20,
                  letterSpacing: 6,
                  marginBottom: errorMsg ? 6 : 16,
                }}
              />

              {errorMsg && (
                <Text style={{ color: "red", marginBottom: 10, textAlign: "center" }}>
                  {errorMsg}
                </Text>
              )}

              <Pressable
                onPress={handleVerify}
                disabled={loading || code.length < 6}
                style={{
                  backgroundColor: code.length === 6 ? colors.primary : colors.border,
                  padding: 14,
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: colors.text, fontWeight: "600", fontSize: 16 }}>
                    Verify Code
                  </Text>
                )}
              </Pressable>

              <Pressable onPress={handleResend} style={{ marginTop: 20 }}>
                <Text
                  style={{
                    color: colors.primary,
                    textAlign: "center",
                  }}
                >
                  {resending ? "Resending..." : "Resend Code"}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

      </ImageBackground>
    </SafeAreaView>
  );
}
