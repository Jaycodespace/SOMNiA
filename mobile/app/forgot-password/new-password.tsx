import { resetPassword } from "@/api/auth";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView, Platform,
  Pressable,
  ScrollView,
  Text, TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const lightBg = require("@/assets/images/noon_sky.png");
const darkBg = require("@/assets/images/night_sky.png");

export default function NewPasswordScreen() {
  const { email, code } = useLocalSearchParams<{ email: string; code: string }>();
  const { colors, theme } = useThemeStore();
  const bgImage = theme === "light" ? lightBg : darkBg;

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
                  color: colors.text,
                  textAlign: "center",
                }}
              >
                Set New Password
              </Text>

              {/* Password */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 10,
                  backgroundColor: colors.card,
                  marginBottom: 12,
                }}
              >
                <TextInput
                  value={pw}
                  onChangeText={(t) => setPw(t)}
                  secureTextEntry={!show}
                  placeholder="New password"
                  placeholderTextColor={colors.subtleText}
                  style={{ flex: 1, padding: 12, color: colors.text }}
                />
                <Pressable onPress={() => setShow((p) => !p)} style={{ padding: 12 }}>
                  <Ionicons name={show ? "eye-off" : "eye"} size={22} color={colors.subtleText} />
                </Pressable>
              </View>

              {/* Confirm password */}
              <TextInput
                value={pw2}
                onChangeText={(t) => setPw2(t)}
                secureTextEntry={!show}
                placeholder="Confirm password"
                placeholderTextColor={colors.subtleText}
                style={{
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 10,
                  padding: 12,
                  color: colors.text,
                  marginBottom: errorMsg ? 6 : 16,
                  backgroundColor: colors.card,
                }}
              />

              {errorMsg && (
                <Text style={{ color: "red", marginBottom: 10, textAlign: "center" }}>
                  {errorMsg}
                </Text>
              )}

              <Pressable
                onPress={handleSubmit}
                disabled={!canSubmit || loading}
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
                  <Text style={{ color: colors.text, fontWeight: "600", fontSize: 16 }}>
                    Save Password
                  </Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

      </ImageBackground>
    </SafeAreaView>
  );
}
