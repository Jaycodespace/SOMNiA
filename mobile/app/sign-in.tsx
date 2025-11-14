import { loginUser } from "@/api/auth";
import { useStoreAuth } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
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

import ThemeToggle from "@/components/theme/ThemeToggle";
import { useThemeStore } from "@/store/themeStore";

// Background images for light/dark theme
const lightBg = require("@/assets/images/noon_sky.png");
const darkBg = require("@/assets/images/night_sky.png");
const lightLogo = require("@/assets/images/somnia_logo_light.png");
const darkLogo = require("@/assets/images/somnia_logo_dark.png");


export default function SignInScreen() {
  const { colors, theme } = useThemeStore();
  const bgImage = theme === "light" ? lightBg : darkBg;
  const logoImage = theme === "light" ? lightLogo : darkLogo;

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

      if (response.status === 404) setErrorMsg("❌ User or email not found.");
      else if (response.status === 401) setErrorMsg("🔒 Incorrect password.");
      else setErrorMsg(response.message || "Login failed.");
    } catch {
      setErrorMsg("⚠️ Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* 🌄 Background Image */}
      <ImageBackground
        source={bgImage}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <ImageBackground
        source={logoImage}
        style={{ flex: 1 }}
        resizeMode="cover"
        imageStyle={{ opacity: 0.4 }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Toggle Theme Button */}
          <ThemeToggle />

          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingHorizontal: 24,
            }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Card Container */}
            <View
              style={{
                backgroundColor: colors.card,
                padding: 20,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowRadius: 10,
                elevation: 4,
              }}
            >
              {/* Title */}
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "700",
                  marginBottom: 20,
                  textAlign: "center",
                  color: colors.text,
                }}
              >
                Sign In
              </Text>

              {/* Username / Email */}
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
                  padding: 12,
                  borderRadius: 10,
                  color: colors.text,
                  backgroundColor: colors.card,
                  marginBottom: 12,
                }}
              />

              {/* Password */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 10,
                  backgroundColor: colors.card,
                  marginBottom: errorMsg ? 6 : 16,
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
                    padding: 12,
                    color: colors.text,
                  }}
                />

                <Pressable
                  onPress={() => setShowPassword((prev) => !prev)}
                  style={{ paddingHorizontal: 12 }}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={22}
                    color={colors.subtleText}
                  />
                </Pressable>
              </View>

              {/* Error */}
              {errorMsg && (
                <Text
                  style={{
                    color: "red",
                    marginBottom: 10,
                    textAlign: "center",
                  }}
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
                  padding: 14,
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: colors.text, fontWeight: "600", fontSize: 16, }}>
                    Sign In
                  </Text>
                )}
              </Pressable>

              {/* Links */}
              <View style={{ marginTop: 22, alignItems: "center" }}>
                <Link href="/forgot-password" onPress={goToForgotPassword} push>
                  <Text style={{ color: colors.primary, marginBottom: 10 }}>
                    Forgot Password?
                  </Text>
                </Link>

                <Link href="/create-account" onPress={goToCreateAccount} push>
                  <Text style={{ color: colors.primary }}>
                    Don’t have an account? Create one
                  </Text>
                </Link>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
      </ImageBackground>
    </SafeAreaView>
  );
}
