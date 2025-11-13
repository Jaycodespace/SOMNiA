import { useStoreAuth } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BackButton from "../components/create-account/BackButton";
import InputField from "../components/create-account/InputField";
import PasswordStrengthBar from "../components/create-account/PasswordStrengthBar";
import SubmitButton from "../components/create-account/SubmitButton";
import useCheckEmail from "../hooks/create-account/useCheckEmail";
import useCheckUsername from "../hooks/create-account/useCheckUsername";
import usePasswordStrength from "../hooks/create-account/usePasswordStrength";
import styles from "../styles/CreateAccount.styles";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function CreateAccountScreen() {
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
        alert("✅ Account created! Please sign in.");
        backToSignIn();
      } else alert(data.message || "Registration failed.");
    } catch (err) {
      console.error("Register error:", err);
      alert("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>

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
              hint={
                emailStatus === "invalid"
                  ? "❌ Invalid email format"
                  : emailStatus === "taken"
                  ? "❌ Email already used"
                  : emailStatus === "available"
                  ? "✅ Email available"
                  : undefined
              }
              keyboardType="email-address"
            />

            {/* Password with toggle */}
            <View style={{ position: "relative" }}>
              <InputField
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 10,
                  top: 38,
                  padding: 5,
                }}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            <PasswordStrengthBar passwordStrength={passwordStrength} />

            {/* Confirm Password with toggle */}
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
                style={{
                  position: "absolute",
                  right: 10,
                  top: 38,
                  padding: 5,
                }}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            <SubmitButton
              onPress={handleCreateAccount}
              loading={loading}
              enabled={canSubmit}
            />

            <BackButton onPress={backToSignIn} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
