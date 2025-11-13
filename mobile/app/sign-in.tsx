import { loginUser } from "@/api/auth";
import { useStoreAuth } from "@/store/authStore";
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
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignInScreen() {
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

      // 👇 Handle based on backend or status
      if (response.status === 404) {
        setErrorMsg("❌ User or email not found.");
      } else if (response.status === 401) {
        setErrorMsg("🔒 Incorrect password. Please try again.");
      } else {
        setErrorMsg(response.message || "⚠️ Login failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Sign-in error:", err);
      setErrorMsg("⚠️ Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <Text style={{ fontSize: 26, fontWeight: "700", marginBottom: 20, textAlign: "center" }}>
              Sign In
            </Text>

            {/* Username or Email */}
            <TextInput
              value={usernameEmail}
              onChangeText={(text) => {
                setUsernameEmail(text);
                setErrorMsg(null);
              }}
              placeholder="Username or Email"
              placeholderTextColor="#888"
              autoCapitalize="none"
              style={{
                borderColor: "#ccc",
                borderWidth: 1,
                padding: 12,
                borderRadius: 8,
                color: "#000",
                marginBottom: 12,
              }}
            />

            {/* Password */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderColor: "#ccc",
                borderWidth: 1,
                borderRadius: 8,
                marginBottom: errorMsg ? 6 : 16,
              }}
            >
              <TextInput
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrorMsg(null);
                }}
                placeholder="Password"
                placeholderTextColor="#888"
                secureTextEntry={!showPassword}
                style={{
                  flex: 1,
                  padding: 12,
                  color: "#000",
                }}
              />
              <Pressable
                onPress={() => setShowPassword((prev) => !prev)}
                style={{ paddingHorizontal: 12 }}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={22}
                  color="#555"
                />
              </Pressable>
            </View>

            {/* Inline Error */}
            {errorMsg && (
              <Text style={{ color: "red", marginBottom: 10, textAlign: "center" }}>
                {errorMsg}
              </Text>
            )}

            {/* Sign In Button */}
            <Pressable
              onPress={handleSignIn}
              disabled={loading || !canSubmit}
              style={{
                backgroundColor: canSubmit ? "#007BFF" : "#ccc",
                padding: 14,
                borderRadius: 8,
                alignItems: "center",
                marginTop: 10,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
                  Sign In
                </Text>
              )}
            </Pressable>

            {/* Links */}
          <View style={{ marginTop: 20, alignItems: "center" }}>
            <Link href="/forgot-password" onPress={goToForgotPassword} push style={{paddingBottom: 10}}>
              <Text style={{ color: "#007BFF", marginBottom: 10 }}>Forgot Password?</Text>
            </Link>

            <Link href="/create-account" onPress={goToCreateAccount} push>
              <Text style={{ color: "#007BFF", marginBottom: 10}}>Don’t have an account? Create one</Text>
            </Link>
          </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}