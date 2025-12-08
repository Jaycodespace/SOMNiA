import BackgroundWrapper from "@/components/theme/BackgroundWrapper";
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
    <BackgroundWrapper showLogo={false}>
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    }}
  >
    <View
      style={{
        width: "100%",
        backgroundColor: colors.card,
        padding: 24,
        borderRadius: 16,
        alignItems: "center",
        elevation: 30
      }}
    >
      {/* SOMNIA Logo */}
      <Image
        source={
          useThemeStore.getState().theme === "dark"
            ? require("@/assets/images/somnia_text_dark.png")
            : require("@/assets/images/somnia_text_light.png")
        }
        style={{
          width: imageWidth,
          height: undefined,
          aspectRatio: 3.5,
          marginBottom: 50,
        }}
        resizeMode="contain"
      />
      <Image
        source={require("@/assets/images/bear_welcome.png")}
        style={{
          width: imageWidth,
          height: undefined,
          aspectRatio: 3.5,
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
        This app supports our research on identifying and predicting
        possible causes of insomnia. Through data analysis and AI, we
        aim to better understand sleep disorders.
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
  </View>
</BackgroundWrapper>

  );
}
