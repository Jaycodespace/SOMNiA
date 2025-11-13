import { useHealthStore } from "@/store/health/healthStore";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  AppState,
  Image,
  Linking,
  Pressable,
  Text,
  View,
} from "react-native";
import { SdkAvailabilityStatus } from "react-native-health-connect";

export default function HealthGuard({ children }: { children: React.ReactNode }) {
  const { sdkStatus, isChecking, checkHealthConnect } = useHealthStore();

  // 🧩 1️⃣ Check on mount
  useEffect(() => {
    checkHealthConnect();
  }, [checkHealthConnect]);

  // 🔁 2️⃣ Re-check when app returns from background
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        console.log("App resumed — re-checking Health Connect...");
        checkHealthConnect(true);
      }
    });

    return () => subscription.remove();
  }, [checkHealthConnect]);

  // 🕓 Loading UI
  if (isChecking) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <Image
          source={require("@/assets/images/health_connect_logo.png")}
          style={{ width: 100, height: 100, marginBottom: 25 }}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={{ marginTop: 10, color: "#444", fontSize: 16 }}>
          Checking Health Connect...
        </Text>
      </View>
    );
  }

  // ❌ Not available or needs update
  if (
    sdkStatus === SdkAvailabilityStatus.SDK_UNAVAILABLE ||
    sdkStatus === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED
  ) {
    const openPlayStore = async () => {
      const playStoreUrl =
        "https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata";
      const canOpen = await Linking.canOpenURL(playStoreUrl);
      if (canOpen) Linking.openURL(playStoreUrl);
    };

    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
          paddingHorizontal: 30,
        }}
      >
        <Image
          source={require("@/assets/images/health_connect_logo.png")}
          style={{ width: 120, height: 120, marginBottom: 25 }}
          resizeMode="contain"
        />

        <Text
          style={{
            fontSize: 22,
            fontWeight: "700",
            marginBottom: 8,
            color: "#111",
          }}
        >
          Health Connect Required
        </Text>

        <Text
          style={{
            color: "#666",
            textAlign: "center",
            fontSize: 15,
            marginBottom: 25,
            lineHeight: 22,
          }}
        >
          To continue, please install or update Health Connect from the Play
          Store.
        </Text>

        <Pressable
          onPress={openPlayStore}
          style={{
            backgroundColor: "#007BFF",
            paddingVertical: 14,
            paddingHorizontal: 40,
            borderRadius: 10,
            shadowColor: "#007BFF",
            shadowOpacity: 0.3,
            shadowRadius: 5,
            elevation: 3,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
            Open Play Store
          </Text>
        </Pressable>

        {/* 🔁 Retry button manually rechecks */}
        <Pressable
          onPress={() => checkHealthConnect(true)}
          style={{ marginTop: 20 }}
        >
          <Text style={{ color: "#007BFF", fontWeight: "500", fontSize: 15 }}>
            Retry
          </Text>
        </Pressable>
      </View>
    );
  }

  // ✅ Health Connect OK → show app
  return <>{children}</>;
}
