import { resendResetCode, verifyResetCode } from "@/api/auth";
import OtpInput from "@/components/inputs/OtpInput";
import BackgroundWrapper from "@/components/theme/BackgroundWrapper";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useThemeStore } from "@/store/themeStore";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EnterCodeScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { colors } = useThemeStore();

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
            }}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={{
                backgroundColor: colors.card + "DD",
                padding: 28,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: colors.border + "55",
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 16,
                elevation: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "700",
                  marginBottom: 8,
                  textAlign: "center",
                  color: colors.text,
                }}
              >
                Enter Verification Code
              </Text>

              <Text
                style={{
                  color: colors.subtleText,
                  textAlign: "center",
                  marginBottom: 24,
                  fontSize: 15,
                  lineHeight: 22,
                }}
              >
                We sent a 6-digit code to{" "}
                <Text style={{ color: colors.text, fontWeight: "600" }}>
                  {email}
                </Text>
              </Text>

              {/* OTP INPUT */}
              <OtpInput code={code} setCode={setCode} />

              {errorMsg && (
                <Text
                  style={{
                    color: "#E03E3E",
                    marginTop: 6,
                    marginBottom: 16,
                    fontSize: 13,
                    textAlign: "left",
                  }}
                >
                  {errorMsg}
                </Text>
              )}

              {/* VERIFY BUTTON */}
              <Pressable
                onPress={handleVerify}
                disabled={loading || code.length < 6}
                style={({ pressed }) => ({
                  backgroundColor:
                    code.length === 6 ? colors.primary : colors.border,
                  paddingVertical: 15,
                  borderRadius: 14,
                  alignItems: "center",
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                })}
              >
                {loading ? (
                  <ActivityIndicator color={colors.text} />
                ) : (
                  <Text
                    style={{
                      color: colors.text,
                      fontWeight: "600",
                      fontSize: 16,
                    }}
                  >
                    Verify Code
                  </Text>
                )}
              </Pressable>

              {/* RESEND */}
              <Pressable onPress={handleResend} style={{ marginTop: 20 }}>
                <Text
                  style={{
                    color: colors.primary,
                    textAlign: "center",
                    fontSize: 14,
                  }}
                >
                  {resending ? "Resending..." : "Resend Code"}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

      </BackgroundWrapper>
    </SafeAreaView>
  );
}
