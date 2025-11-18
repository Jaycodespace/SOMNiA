// app/forgot-password/index.tsx
import { requestPasswordReset } from "@/api/auth";
import BackgroundWrapper from "@/components/theme/BackgroundWrapper";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useStoreAuth } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPasswordEmail() {
  const { colors } = useThemeStore();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { backToSignIn } = useStoreAuth();

  const handleNext = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setErrorMsg("Please enter your email.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const result = await requestPasswordReset(trimmed);

      if (result?.success) {
        // navigate to enter-code and pass email as param
        router.push({
          pathname: "/forgot-password/enter-code",
          params: { email: trimmed },
        });
      } else {
        // show server-provided message or fallback
        setErrorMsg(result?.message || "Failed to send code. Please try again.");
      }
    } catch (e) {
      // network / unexpected error
      setErrorMsg("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    // use store helper if available, fallback to router
    if (backToSignIn) backToSignIn();
    else router.replace("/sign-in");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <BackgroundWrapper showLogo={false}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
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
                backgroundColor: colors.card + "DD", // 87% opacity (glass look)
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
                  color: colors.text,
                  textAlign: "center",
                }}
              >
                Reset Password
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
                Enter the email associated with your account and we’ll send you a
                verification code.
              </Text>

              {/* Input */}
              <View
                style={{
                  marginBottom: errorMsg ? 6 : 18,
                }}
              >
                <Text style={{ color: colors.subtleText, marginBottom: 6, fontSize: 14 }}>
                  Email Address
                </Text>

                <View
                  style={{
                    borderWidth: 1.5,
                    borderColor: errorMsg ? "#E03E3E" : colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    backgroundColor: colors.card,
                  }}
                >
                  <TextInput
                    value={email}
                    onChangeText={(t) => {
                      setEmail(t);
                      setErrorMsg(null);
                    }}
                    placeholder="example@email.com"
                    placeholderTextColor={colors.subtleText}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={{
                      color: colors.text,
                      fontSize: 15,
                    }}
                    returnKeyType="send"
                    onSubmitEditing={handleNext}
                  />
                </View>
              </View>

              {/* Error Msg */}
              {errorMsg && (
                <Text
                  style={{
                    color: "#E03E3E",
                    marginBottom: 14,
                    textAlign: "left",
                    fontSize: 13,
                  }}
                >
                  {errorMsg}
                </Text>
              )}

              {/* Button */}
              <Pressable
                onPress={handleNext}
                disabled={loading || !email.trim()}
                style={({ pressed }) => ({
                  backgroundColor: email.trim() ? colors.primary : colors.border,
                  paddingVertical: 15,
                  borderRadius: 14,
                  alignItems: "center",
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                })}
              >
                {loading ? (
                  <ActivityIndicator color={colors.text} />
                ) : (
                  <Text style={{ color: colors.text, fontWeight: "600", fontSize: 16 }}>
                    Send Code
                  </Text>
                )}
              </Pressable>

              {/* Back Link */}
              <Pressable
                onPress={handleBack}
                style={{ marginTop: 20, alignItems: "center" }}
              >
                <Text style={{ color: colors.primary, fontSize: 14 }}>
                  Back to Sign In
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </BackgroundWrapper>
    </SafeAreaView>
  );
}
