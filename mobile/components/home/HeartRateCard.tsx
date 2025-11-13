import { useHeartRateStore } from "@/store/health/heartRateStore";
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

export default function HeartRateCard() {
  const { hasPermission, getHeartRateData, heartRateData } =
    useHeartRateStore();
  const [loading, setLoading] = useState(true);
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    const load = async () => {
      const permission = await hasPermission();
      setGranted(permission);

      if (permission) {
        await getHeartRateData();
      } else {
        Alert.alert(
          "Permission Needed",
          "Heart rate permission is required to show your data.",
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

    load();
  }, [hasPermission, getHeartRateData]);

  if (loading) {
    return (
      <View style={[styles.card, { alignItems: "center" }]}>
        <ActivityIndicator color="#DC3545" />
        <Text style={{ marginTop: 8, color: "#777" }}>
          Loading heart rate...
        </Text>
      </View>
    );
  }

  if (!granted) {
    return (
      <Pressable style={[styles.card, { alignItems: "center" }]}>
        <Feather name="heart" size={20} color="#DC3545" />
        <Text style={styles.cardTitle}>Heart Rate</Text>
        <Text style={{ color: "#777", marginTop: 8 }}>
          Permission not granted
        </Text>
      </Pressable>
    );
  }

  const avgBpm = heartRateData?.averageBpm ?? "--";
  const samples = heartRateData?.samples ?? [];
  const context = heartRateData?.context ?? "resting";
  const source = heartRateData?.sourceApp ?? "Unknown";

  return (
    <Pressable style={styles.card}>
      <View style={styles.cardHeader}>
        <Feather name="heart" size={20} color="#DC3545" />
        <Text style={styles.cardTitle}>Heart Rate</Text>
      </View>

      <Text style={styles.value}>Avg {avgBpm} bpm</Text>
      <Text style={styles.subText}>
        {context.charAt(0).toUpperCase() + context.slice(1)} • {source}
      </Text>

      <View style={styles.graphContainer}>
        {samples.slice(-10).map((s, i) => {
          let color = "#DC3545"; // default
          if (s.bpm < 60) color = "#0d6efd"; // low (blue)
          else if (s.bpm > 90) color = "#FFC107"; // high (yellow)

          return (
            <View
              key={i}
              style={[
                styles.bar,
                { height: Math.min(s.bpm, 100), backgroundColor: color },
              ]}
            />
          );
        })}
      </View>

      <View style={styles.legendContainer}>
        <Text style={[styles.legend, { color: "#0d6efd" }]}>Low &lt;60</Text>
        <Text style={[styles.legend, { color: "#DC3545" }]}>Normal 60–90</Text>
        <Text style={[styles.legend, { color: "#FFC107" }]}>High &gt;90</Text>
      </View>
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
  graphContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 80,
    gap: 4,
    marginTop: 12,
  },
  bar: {
    width: 10,
    borderRadius: 4,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  legend: {
    fontSize: 12,
    fontWeight: "500",
  },
});
