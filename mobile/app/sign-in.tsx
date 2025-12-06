import { loginUser } from "@/api/auth";
import BackgroundWrapper from "@/components/theme/BackgroundWrapper";
import LogoProvider from "@/components/theme/LogoProvider";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useStoreAuth } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useState } from "react";
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
export default function SignInScreen() {
  const { colors } = useThemeStore();

  const [usernameEmail, setUsernameEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { login, goToForgotPassword, goToCreateAccount } = useStoreAuth();

  const canSubmit = usernameEmail.trim().length > 0 && password.trim().length > 0;

  const handleSignIn = async () => {
    if (!canSubmit) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await loginUser(usernameEmail.trim(), password.trim());

      if (response.success) {
        login(response.user);
        router.replace("/(protected)");
        return;
      }

      if (response.status === 404) setErrorMsg("User or email not found.");
      else if (response.status === 401) setErrorMsg("Incorrect password.");
      else setErrorMsg(response.message || "Login failed.");
    } catch {
      setErrorMsg("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <BackgroundWrapper>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ThemeToggle />
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingHorizontal: 28,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={{
                backgroundColor: colors.card + "DD", // 87% opacity (glass look)
                padding: 24,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: colors.border,
                shadowColor: "#000",
                shadowOpacity: 0.9,
                shadowRadius: 16,
                elevation: 5,
              }}
            >
              <View style={{ width: "100%", height: 80 }}>
              <LogoProvider
                source={
                  useThemeStore.getState().theme === "dark"
                    ? require ("@/assets/images/somnia_text_dark.png")
                    : require("@/assets/images/somnia_text_light.png")
                }
              />
              </View>
              <View style={{ alignItems: "center", marginBottom: 24 }}>
                <Text
                  style={{
                    marginTop: 12,
                    fontSize: 28,
                    fontWeight: "700",
                    color: colors.text,
                  }}
                >
                  Sign in
                </Text>
              </View>

              {/* Inputs */}
              <TextInput
                value={usernameEmail}
                onChangeText={(t) => {
                  setUsernameEmail(t);
                  setErrorMsg(null);
                }}
                placeholder="Username or Email"
                placeholderTextColor={colors.subtleText}
                autoCapitalize="none"
                style={{
                  borderColor: colors.border,
                  borderWidth: 1,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderRadius: 14,
                  color: colors.text,
                  backgroundColor: colors.card,
                  marginBottom: 16,
                  fontSize: 15,
                }}
              />

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 14,
                  backgroundColor: colors.card,
                  marginBottom: errorMsg ? 8 : 20,
                  paddingRight: 12,
                }}
              >
                <TextInput
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    setErrorMsg(null);
                  }}
                  placeholder="Password"
                  placeholderTextColor={colors.subtleText}
                  secureTextEntry={!showPassword}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    color: colors.text,
                    fontSize: 15,
                  }}
                />

                <Pressable onPress={() => setShowPassword((p) => !p)}>
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={22}
                    color={colors.subtleText}
                  />
                </Pressable>
              </View>

              {errorMsg && (
                <Text
                  style={{ color: "red", marginBottom: 14, textAlign: "center" }}
                >
                  {errorMsg}
                </Text>
              )}

              {/* Sign In Button */}
              <Pressable
                onPress={handleSignIn}
                disabled={loading || !canSubmit}
                style={{
                  backgroundColor: canSubmit ? colors.primary : colors.border,
                  paddingVertical: 16,
                  borderRadius: 14,
                  alignItems: "center",
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text
                    style={{
                      color: colors.text,
                      fontWeight: "700",
                      fontSize: 16,
                    }}
                  >
                    Sign In
                  </Text>
                )}
              </Pressable>

              <View style={{ marginTop: 28, alignItems: "center" }}>
                <Link href="/forgot-password" onPress={goToForgotPassword} push>
                  <Text style={{ color: colors.primary, marginBottom: 10 }}>
                    Forgot Password?
                  </Text>
                </Link>

                <Link href="/create-account" onPress={goToCreateAccount} push>
                  <Text style={{ color: colors.primary }}>
                    Dont have an account? Create one
                  </Text>
                </Link>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </BackgroundWrapper>
    </SafeAreaView>
  );
}
