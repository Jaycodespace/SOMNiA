import BackgroundWrapper from "@/components/theme/BackgroundWrapper";
import { useStoreAuth } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BackButton from "@/components/create-account/BackButton";
import InputField from "@/components/create-account/InputField";
import PasswordStrengthBar from "@/components/create-account/PasswordStrengthBar";
import SubmitButton from "@/components/create-account/SubmitButton";
import useCheckEmail from "@/hooks/create-account/useCheckEmail";
import useCheckUsername from "@/hooks/create-account/useCheckUsername";
import usePasswordStrength from "@/hooks/create-account/usePasswordStrength";

import ThemeToggle from "@/components/theme/ThemeToggle";
import { useThemeStore } from "@/store/themeStore";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function CreateAccountScreen() {
  const { colors } = useThemeStore();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { backToSignIn } = useStoreAuth();

  const usernameStatus = useCheckUsername(username);
  const emailStatus = useCheckEmail(email);
  const passwordStrength = usePasswordStrength(password);

  const canSubmit =
    usernameStatus === "available" &&
    emailStatus === "available" &&
    password.length >= 6 &&
    password === confirmPassword;

  const handleCreateAccount = async () => {
    if (!canSubmit) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Account created! Please sign in.");
        backToSignIn();
      } else alert(data.message || "Registration failed.");
    } catch (err) {
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <BackgroundWrapper>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        >
          <ThemeToggle />

          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 28 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View
              style={{
                backgroundColor: colors.card + "DD", // 87% opacity (glass look)
                padding: 26,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: colors.border,
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 5,
                marginBottom: 24,
              }}
            >
              <View style={{ alignItems: "center", marginBottom: 24 }}>
                <Text style={{ marginTop: 12, fontSize: 22, fontWeight: "700", color: colors.text }}>
                  Create Account
                </Text>
              </View>

              {/* Username */}
              <InputField
                label="Username"
                value={username}
                onChangeText={setUsername}
                status={usernameStatus}
                hint={
                  username.length > 0 && username.length < 3
                    ? "⚠️ Must be at least 3 characters"
                    : usernameStatus === "taken"
                    ? "❌ Username already taken"
                    : usernameStatus === "available"
                    ? "✅ Username available"
                    : undefined
                }
              />

              {/* Email */}
              <InputField
                label="Email"
                value={email}
                onChangeText={setEmail}
                status={emailStatus}
                keyboardType="email-address"
                hint={
                  emailStatus === "invalid"
                    ? "❌ Invalid email format"
                    : emailStatus === "taken"
                    ? "❌ Email already used"
                    : emailStatus === "available"
                    ? "✅ Email available"
                    : undefined
                }
              />

              {/* Password */}
              <View style={{ position: "relative" }}>
                <InputField
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 10, top: 38, padding: 5 }}
                >
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={colors.subtleText} />
                </TouchableOpacity>
              </View>

              <PasswordStrengthBar passwordStrength={passwordStrength} />

              {/* Confirm Password */}
              <View style={{ position: "relative" }}>
                <InputField
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  hint={
                    confirmPassword.length > 0 && password !== confirmPassword
                      ? "❌ Passwords do not match"
                      : undefined
                  }
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: "absolute", right: 10, top: 38, padding: 5 }}
                >
                  <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color={colors.subtleText} />
                </TouchableOpacity>
              </View>

              <SubmitButton onPress={handleCreateAccount} loading={loading} enabled={canSubmit} />

              <BackButton onPress={backToSignIn} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </BackgroundWrapper>
    </SafeAreaView>
  );
}