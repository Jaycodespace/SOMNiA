import { useHealthStore } from "@/store/health/healthStore";
import { useThemeStore } from "@/store/themeStore";
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
import BackgroundWrapper from "../theme/BackgroundWrapper";

export default function HealthGuard({ children }: { children: React.ReactNode }) {
  const { colors } = useThemeStore();
  const { sdkStatus, isChecking, checkHealthConnect } = useHealthStore();

  // 🧩 1️⃣ Check on mount
  useEffect(() => {
    checkHealthConnect();
  }, [checkHealthConnect]);

  // 🔁 2️⃣ Re-check on app resume
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
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
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={require("@/assets/images/health_connect_logo.png")}
          style={{ width: 100, height: 100, marginBottom: 25 }}
          resizeMode="contain"
        />

        <ActivityIndicator size="large" color={colors.primary} />

        <Text style={{ marginTop: 10, color: colors.text, fontSize: 16 }}>
          Checking Health Connect...
        </Text>
      </View>
    );
  }

  // ❌ Not available UI – now themed
  if (
    sdkStatus === SdkAvailabilityStatus.SDK_UNAVAILABLE ||
    sdkStatus === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED
  ) {
    const openPlayStore = async () => {
      const url =
        "https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata";

      if (await Linking.canOpenURL(url)) {
        Linking.openURL(url);
      }
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
            color: colors.text,
          }}
        >
          Health Connect Required
        </Text>

        <Text
          style={{
            color: colors.subtleText,
            textAlign: "center",
            fontSize: 15,
            marginBottom: 25,
            lineHeight: 22,
          }}
        >
          To continue, please install or update Health Connect from the Play
          Store.
        </Text>

        {/* Primary button */}
        <Pressable
          onPress={openPlayStore}
          style={{
            backgroundColor: colors.primary,
            paddingVertical: 14,
            paddingHorizontal: 40,
            borderRadius: 10,
            elevation: 3,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
            Open Play Store
          </Text>
        </Pressable>

        {/* Retry */}
        <Pressable onPress={() => checkHealthConnect(true)} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.primary, fontWeight: "500", fontSize: 15 }}>
            Retry
          </Text>
        </Pressable>
      </View>
      </View>
      </BackgroundWrapper>
    );
  }

  // ✅ HC available
  return <>{children}</>;
}
