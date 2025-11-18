import { useAppStore } from "@/store/appStore";
import { useThemeStore } from "@/store/themeStore";
import { router } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";

export default function WelcomeScreen() {
  const { hasSeenWelcome, loadAppState } = useAppStore();
  const { colors } = useThemeStore();

  const screenWidth = Dimensions.get("window").width;
  const imageWidth = screenWidth * 0.8; // 80%

  useEffect(() => {
    loadAppState();
  }, [loadAppState]);

  useEffect(() => {
    if (hasSeenWelcome) {
      router.replace("/(protected)");
    }
  }, [hasSeenWelcome]);

  if (hasSeenWelcome === null) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const handleContinue = () => {
    router.replace("/welcome/setup-health-perm");
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        backgroundColor: colors.background,
      }}
    >

      {/* --- SOMNIA Image --- */}
      <Image
        source={require("@/assets/images/somnia_text.png")}
        style={{
          width: imageWidth,
          height: undefined,
          aspectRatio: 3.5, // adjust if needed
          marginBottom: 24,
        }}
        resizeMode="contain"
      />

      <Text
        style={{
          fontSize: 26,
          fontWeight: "700",
          marginBottom: 16,
          color: colors.text,
          textAlign: "center",
        }}
      >
        Welcome to SOMNiA Mobile
      </Text>

      <Text
        style={{
          color: colors.subtleText,
          textAlign: "center",
          marginBottom: 32,
          fontSize: 20,
          lineHeight: 22,
        }}
      >
        This app is part of a research exploration aimed at identifying and
        predicting the probable causes of insomnia. By analyzing data patterns
        and applying machine learning techniques, the platform seeks to uncover
        insights that could contribute to a better understanding of sleep
        disorders.
      </Text>

      <Pressable
        onPress={handleContinue}
        style={{
          backgroundColor: colors.primary,
          paddingVertical: 12,
          paddingHorizontal: 30,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: colors.text, fontWeight: "600", fontSize: 16 }}>
          Continue
        </Text>
      </Pressable>
    </View>
  );
}
