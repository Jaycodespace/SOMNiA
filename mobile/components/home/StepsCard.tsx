import { useStepsStore } from "@/store/health/stepsStore";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function StepsCard() {
  const { stepsData, getStepsData, hasStepsPermission } = useStepsStore();
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const granted = await hasStepsPermission();
      setHasPermission(granted);

      if (granted) {
        await getStepsData();
      } else {
        Alert.alert(
          "Permission Needed",
          "Steps permission is required to show your daily step count.",
          [
            {
              text: "Open Health Connect",
              onPress: () =>
                Linking.openURL(
                  "https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata"
                ),
            },
            { text: "Cancel", style: "cancel" },
          ]
        );
      }

      setLoading(false);
    };

    loadData();
  }, [getStepsData, hasStepsPermission]);

  if (loading) {
    return (
      <View style={[styles.card, { alignItems: "center" }]}>
        <ActivityIndicator color="#FF8800" />
        <Text style={{ marginTop: 8, color: "#777" }}>
          Loading step data...
        </Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <Pressable style={[styles.card, { alignItems: "center" }]}>
        <Feather name="trending-up" size={22} color="#FF8800" />
        <Text style={styles.cardTitle}>Steps</Text>
        <Text style={{ color: "#777", marginTop: 8 }}>
          Requires Health Connect permission
        </Text>
      </Pressable>
    );
  }

  const steps = stepsData?.totalSteps ?? 0;

  return (
    <Pressable style={styles.card} onPress={getStepsData}>
      <View style={styles.cardHeader}>
        <Feather name="trending-up" size={20} color="#FF8800" />
        <Text style={styles.cardTitle}>Steps</Text>
      </View>
      <Text style={styles.value}>
        {steps.toLocaleString()} steps
      </Text>
      <Text style={styles.subText}>Today’s total</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
  value: { fontSize: 22, fontWeight: "700", color: "#111" },
  subText: { fontSize: 14, color: "#777", marginTop: 4 },
});
