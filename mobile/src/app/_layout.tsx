import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { Slot } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View, Text } from "react-native";

import { useHealthStore } from "../store/healthStore";
import { SdkAvailabilityStatus } from "react-native-health-connect";

export default function RootLayout() {
  const { checkHealthConnect, isChecking, sdkStatus, isInitialized } = useHealthStore();

  useEffect(() => {
    checkHealthConnect(); // Runs once on app load
  }, []);

  // Show loading UI while checking SDK
  if (isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Checking Health Connect...</Text>
      </View>
    );
  }

  // If device does NOT support Health Connect
  if (sdkStatus !== SdkAvailabilityStatus.SDK_AVAILABLE) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ fontSize: 18, textAlign: "center", marginBottom: 10 }}>
          Health Connect is not available on this device.
        </Text>
        <Text style={{ color: "#999", textAlign: "center" }}>
          Some features may be limited.
        </Text>
      </View>
    );
  }

  // If SDK did NOT initialize (even if device supports it)
  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Failed to initialize Health Connect.</Text>
      </View>
    );
  }

  // ─── SUCCESS: Load app ─────────────────────────
  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Slot />
      </SafeScreen>
    </SafeAreaProvider>
  );
}
