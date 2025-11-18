import { useAppStore } from "@/store/appStore";
import { useThemeStore } from "@/store/themeStore";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  Text,
  View,
} from "react-native";
import {
  getGrantedPermissions,
  requestPermission,
  type Permission,
} from "react-native-health-connect";

// Import logos
const healthLogoDark = require("@/assets/images/health_connect_logo.png");
const healthLogoLight = require("@/assets/images/health_connect_logo_white.png");

export default function SetupHealthPermissionsScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { colors, theme } = useThemeStore();
  const { setHasSeenWelcome } = useAppStore();

  const healthPermissions: Permission[] = [
    { accessType: "read", recordType: "ActiveCaloriesBurned" },
    { accessType: "read", recordType: "HeartRate" },
    { accessType: "read", recordType: "Steps" },
    { accessType: "read", recordType: "SleepSession" },
    { accessType: "read", recordType: "ExerciseSession" },
    { accessType: "read", recordType: "TotalCaloriesBurned" },
  ];

  const handleRequestPermissions = async () => {
    try {
      setIsLoading(true);

      const grantedList = await getGrantedPermissions();
      const grantedTypes = grantedList.map((p) => p.recordType);

      const missingPermissions = healthPermissions.filter(
        (perm) => !grantedTypes.includes(perm.recordType)
      );

      if (missingPermissions.length > 0) {
        await requestPermission(missingPermissions);
      }

      const updated = await getGrantedPermissions();
      const updatedTypes = updated.map((p) => p.recordType);

      const stillMissing = healthPermissions.filter(
        (perm) => !updatedTypes.includes(perm.recordType)
      );

      if (stillMissing.length === 0) {
        await setHasSeenWelcome(true);
        Alert.alert("Success", "Health Connect permissions granted!");
        router.replace("/(protected)");
      } else {
        Alert.alert(
          "Permissions Required",
          "Please grant all required permissions in Health Connect to continue."
        );
      }
    } catch (err) {
      console.error("Permission error:", err);
      Alert.alert("Error", "Unable to request Health Connect permissions.");
    } finally {
      setIsLoading(false);
    }
  };

  const healthLogo = theme === "light" ? healthLogoDark : healthLogoLight;

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

      {/* Dynamic Health Connect Logo */}
      <Image
        source={healthLogo}
        resizeMode="contain"
        style={{
          width: 140,
          height: 140,
          marginBottom: 20,
        }}
      />

      <Text
        style={{
          fontSize: 24,
          fontWeight: "700",
          marginBottom: 12,
          color: colors.text,
          textAlign: "center",
        }}
      >
        Set Up Health Connect
      </Text>

      <Text
        style={{
          color: colors.subtleText,
          textAlign: "center",
          marginBottom: 24,
          paddingHorizontal: 6,
        }}
      >
        To provide accurate daily insights, we need access to your sleep,
        steps, heart rate, and related health data.
      </Text>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <Pressable
          onPress={handleRequestPermissions}
          style={{
            backgroundColor: colors.primary,
            paddingVertical: 12,
            paddingHorizontal: 28,
            borderRadius: 8,
            marginTop: 6,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontWeight: "600",
              fontSize: 16,
            }}
          >
            Grant Permissions
          </Text>
        </Pressable>
      )}

      {/* Open Health Connect */}
      <Pressable
        onPress={() =>
          Linking.openURL(
            "https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata"
          )
        }
        style={{ marginTop: 18 }}
      >
        <Text style={{ color: colors.primary }}>Open Health Connect</Text>
      </Pressable>

      {/* About Permission link */}
      <Pressable
        onPress={() => router.push("/welcome/about-health-perms")}
        style={{ marginTop: 28 }}
      >
        <Text
          style={{
            color: colors.subtleText,
            textDecorationLine: "underline",
          }}
        >
          Why do we need these permissions?
        </Text>
      </Pressable>
    </View>
  );
}
