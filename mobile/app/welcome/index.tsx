import { useAppStore } from "@/store/appStore";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

export default function WelcomeScreen() {
  const { hasSeenWelcome, loadAppState } = useAppStore();

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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  const handleContinue = () => {
    router.replace("/welcome/setup-health-perm");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 10 }}>
        Welcome to Your App 🎉
      </Text>
      <Text style={{ color: "#555", textAlign: "center", marginBottom: 30 }}>
        We’re glad you’re here! Let’s get started.
      </Text>
      <Pressable
        onPress={handleContinue}
        style={{
          backgroundColor: "#007BFF",
          paddingVertical: 12,
          paddingHorizontal: 30,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>Continue</Text>
      </Pressable>
    </View>
  );
}
