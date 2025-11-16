import { requestPasswordReset } from "@/api/auth";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useStoreAuth } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const lightBg = require("@/assets/images/noon_sky.png");
const darkBg = require("@/assets/images/night_sky.png");

export default function ForgotPasswordEmail() {
  const { colors, theme } = useThemeStore();
  const bgImage = theme === "light" ? lightBg : darkBg;

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { backToSignIn } = useStoreAuth();

  const handleNext = async () => {
    if (!email.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const result = await requestPasswordReset(email.trim());

      if (result.success) {
        router.push({
          pathname: "/forgot-password/enter-code",
          params: { email: email.trim() }
        });
      } else {
        setErrorMsg(result.message || "Failed to send code.");
      }
    } catch (e) {
      setErrorMsg("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ImageBackground source={bgImage} style={{ flex: 1 }} resizeMode="cover">

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
                  color: colors.text,
                  textAlign: "center",
                }}
              >
                Reset Password
              </Text>

              <TextInput
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setErrorMsg(null);
                }}
                placeholder="Enter your email"
                placeholderTextColor={colors.subtleText}
                autoCapitalize="none"
                keyboardType="email-address"
                style={{
                  borderColor: colors.border,
                  borderWidth: 1,
                  padding: 12,
                  borderRadius: 10,
                  backgroundColor: colors.card,
                  color: colors.text,
                  marginBottom: errorMsg ? 6 : 16,
                }}
              />

              {errorMsg && (
                <Text style={{ color: "red", marginBottom: 10, textAlign: "center" }}>
                  {errorMsg}
                </Text>
              )}

              <Pressable
                onPress={handleNext}
                disabled={loading || !email.trim()}
                style={{
                  backgroundColor: email.trim() ? colors.primary : colors.border,
                  padding: 14,
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: colors.text, fontWeight: "600", fontSize: 16 }}>
                    Send Code
                  </Text>
                )}
              </Pressable>

              <Pressable
                onPress={backToSignIn}
                style={{ marginTop: 20, alignItems: "center" }}
              >
                <Text style={{ color: colors.primary }}>Back to Sign In</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}
