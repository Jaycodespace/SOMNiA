import React, { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, ScrollView, Linking, Alert } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useHealthPermissions } from "../store/useHealthPermissions";
import { router } from "expo-router";
import {
  getGrantedPermissions,
  requestPermission,
  type Permission,
} from "react-native-health-connect";

export default function SetupHealthPermissionsScreen() {
    const setGrantedPermissions = useHealthPermissions(
  (state) => state.setGrantedPermissions
);
const setSetupComplete = useHealthPermissions(
  (state) => state.setSetupComplete
);
  const [isLoading, setIsLoading] = useState(false);

  const colors = {
    bgTop: "#1a1a2e",
    bgBottom: "#23234b",
    text: "white",
    subtle: "#b3b3c9",
    primary: "#6c63ff",
  };

  const healthPermissions: Permission[] = [
    { accessType: "read", recordType: "BloodPressure" },
    { accessType: "read", recordType: "ExerciseSession" },
    { accessType: "read", recordType: "HeartRate" },
    { accessType: "read", recordType: "OxygenSaturation" },
    { accessType: "read", recordType: "RestingHeartRate" },
    { accessType: "read", recordType: "SleepSession" },
    { accessType: "read", recordType: "Steps" },
  ];

  const handleRequestPermissions = async () => {
    try {
      setIsLoading(true);

      const granted = await getGrantedPermissions();
      const grantedTypes = granted.map((p) => p.recordType);

      const missing = healthPermissions.filter(
        (p) => !grantedTypes.includes(p.recordType)
      );

      if (missing.length > 0) {
        await requestPermission(missing);
      }

      const updated = await getGrantedPermissions();
      const updatedTypes = updated.map((p) => p.recordType);

      // save globally
      setGrantedPermissions(updatedTypes);

      const stillMissing = healthPermissions.filter(
        (p) => !updatedTypes.includes(p.recordType)
      );

      if (stillMissing.length === 0) {
        setGrantedPermissions(updatedTypes);
        setSetupComplete(true);
        Alert.alert("Success", "Health Connect permissions granted.");
        router.replace("/(auth)/login"); // ⬅ redirect to login
      } else {
        Alert.alert(
            "Permissions Required",
            "Please grant all required permissions in Health Connect."
        );
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Unable to request permissions.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[colors.bgTop, colors.bgBottom]}
      style={{ flex: 1, paddingHorizontal: 24, paddingTop: 80 }}
    >
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          paddingBottom: 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: colors.text,
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          Health Permissions
        </Text>

        <Text
          style={{
            fontSize: 16,
            color: colors.subtle,
            textAlign: "center",
            marginBottom: 30,
            paddingHorizontal: 10,
            lineHeight: 22,
          }}
        >
          To provide accurate insights, we need access to your sleep, steps, 
          heart rate, and related health data.
        </Text>

        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <Pressable
            onPress={handleRequestPermissions}
            style={({ pressed }) => ({
              backgroundColor: pressed ? "#5a54e6" : colors.primary,
              paddingVertical: 14,
              paddingHorizontal: 40,
              borderRadius: 12,
              marginBottom: 20,
            })}
          >
            <Text
              style={{
                color: "white",
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Grant Permissions
            </Text>
          </Pressable>
        )}

        <Pressable
          onPress={() =>
            Linking.openURL(
              "https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata"
            )
          }
        >
          <Text
            style={{
              color: colors.primary,
              fontSize: 15,
              marginBottom: 30,
              textDecorationLine: "underline",
            }}
          >
            Open Health Connect
          </Text>
        </Pressable>

        <Pressable onPress={() => router.push("/welcome/about-health-perms")}>
          <Text
            style={{
              color: colors.subtle,
              textDecorationLine: "underline",
              fontSize: 14,
            }}
          >
            Why do we need these permissions?
          </Text>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}
