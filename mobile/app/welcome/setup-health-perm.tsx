import { useAppStore } from "@/store/appStore";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Linking, Pressable, Text, View } from "react-native";
import { getGrantedPermissions, requestPermission, type Permission } from "react-native-health-connect";

export default function SetupHealthPermissionsScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { setHasSeenWelcome } = useAppStore();

  const healthPermissions: Permission[] = [
    { accessType: "read", recordType: "ActiveCaloriesBurned" },
    { accessType: "read", recordType: "HeartRate" },
    { accessType: "read", recordType: "Steps" },
    { accessType: "read", recordType: "SleepSession" },
    { accessType: "read", recordType: "ExerciseSession" },
    { accessType: "read", recordType: "TotalCaloriesBurned"},
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

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 12 }}>
        Set Up Health Connect
      </Text>
      <Text style={{ color: "#555", textAlign: "center", marginBottom: 24 }}>
        We’ll need permission to access your health data like heart rate, sleep,
        and steps. You can review or change these anytime in Health Connect.
      </Text>

      {isLoading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <Pressable
          onPress={handleRequestPermissions}
          style={{
            backgroundColor: "#007BFF",
            paddingVertical: 12,
            paddingHorizontal: 28,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
            Grant Permissions
          </Text>
        </Pressable>
      )}

      <Pressable
        onPress={() =>
          Linking.openURL("https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata")
        }
        style={{ marginTop: 16 }}
      >
        <Text style={{ color: "#007BFF" }}>Open Health Connect</Text>
      </Pressable>
    </View>
  );
}
