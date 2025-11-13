import { useSleepStore } from "@/store/health/sleepStore";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SleepCard() {
  const { hasSleepPermission, getSleepData, sleepData } = useSleepStore();
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [showLegend, setShowLegend] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const granted = await hasSleepPermission();
      setHasPermission(granted);

      if (granted) {
        await getSleepData();
      } else {
        Alert.alert(
          "Permission Needed",
          "Sleep permission is required to show your recent sleep data.",
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
  }, [getSleepData, hasSleepPermission]);

  const formatTime = (isoString?: string) => {
    if (!isoString) return "--:--";
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <View style={[styles.card, { alignItems: "center" }]}>
        <ActivityIndicator color="#007BFF" />
        <Text style={{ marginTop: 8, color: "#777" }}>Loading sleep data...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <Pressable style={[styles.card, { alignItems: "center" }]}>
        <Feather name="moon" size={22} color="#007BFF" />
        <Text style={styles.cardTitle}>Sleep</Text>
        <Text style={{ color: "#777", marginTop: 8 }}>
          Requires Health Connect permission
        </Text>
      </Pressable>
    );
  }

  const isNap = sleepData?.label === "Nap";
  const iconName = isNap ? "sun" : "moon";
  const iconColor = isNap ? "#FBBF24" : "#007BFF";

  const qualityColor =
    sleepData?.qualityScore && sleepData.qualityScore >= 8
      ? "#34D399" // good
      : sleepData?.qualityScore && sleepData.qualityScore >= 5
      ? "#FBBF24" // fair
      : "#EF4444"; // poor

  // Battery-style segmented bar
  const segments = 8;
  const filledSegments = Math.round(
    (sleepData?.qualityScore ?? 0) / (10 / segments)
  );

  return (
    <Pressable style={[styles.card]}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <Feather name={iconName} size={22} color={iconColor} />
        <Text style={[styles.cardTitle, { color: iconColor }]}>
          {sleepData?.label ?? "Sleep"}
        </Text>

        {/* Info icon */}
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => setShowLegend(true)}
        >
          <Feather name="info" size={30 } color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Main info */}
      <Text style={styles.mainValue}>{sleepData?.duration ?? "--"}</Text>
      <Text style={styles.subText}>
        {sleepData?.quality ?? "N/A"} ({formatTime(sleepData?.startTime)} -{" "}
        {formatTime(sleepData?.endTime)})
      </Text>

      {/* Battery-style segmented bar */}
      <View style={styles.barContainer}>
        {[...Array(segments)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.barSegment,
              {
                backgroundColor:
                  i < filledSegments ? qualityColor : "#E5E7EB",
              },
            ]}
          />
        ))}
      </View>

      <Text style={[styles.sleepQuality, { color: qualityColor }]}>
        {sleepData?.quality ?? "N/A"}
      </Text>

      {/* Tooltip / Legend Modal */}
      <Modal
        visible={showLegend}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLegend(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.legendTitle}>Sleep Quality Guide</Text>
            <Text style={styles.legendText}>
              <Text style={{ color: "#34D399", fontWeight: "600" }}>Green</Text>{" "}
              – Good sleep (7–9h night sleep, 10–30m nap)
            </Text>
            <Text style={styles.legendText}>
              <Text style={{ color: "#FBBF24", fontWeight: "600" }}>Yellow</Text>{" "}
              – Fair sleep (5–7h night sleep, 30–60m nap)
            </Text>
            <Text style={styles.legendText}>
              <Text style={{ color: "#EF4444", fontWeight: "600" }}>Red</Text>{" "}
              – Poor sleep (&lt;5h night sleep or &gt;90m nap)
            </Text>
            <Text style={[styles.legendText, { marginTop: 8 }]}>
              Night sleep between <Text style={{ fontWeight: "600" }}>10 PM – 12 AM</Text>{" "}
              improves recovery quality.
            </Text>

            <Pressable
              style={styles.closeButton}
              onPress={() => setShowLegend(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    borderWidth: 1,
    borderColor: "#007BFF",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  infoButton: {
    padding: 4,
  },
  mainValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#007BFF",
  },
  subText: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
  },
  barContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  barSegment: {
    flex: 1,
    height: 8,
    borderRadius: 2,
    marginHorizontal: 1,
  },
  sleepQuality: {
    textAlign: "right",
    fontWeight: "600",
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "85%",
    maxWidth: 400,
  },
  legendTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#111827",
    textAlign: "center",
  },
  legendText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
    lineHeight: 20,
  },
  closeButton: {
    marginTop: 14,
    backgroundColor: "#007BFF",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  closeText: {
    color: "#fff",
    fontWeight: "600",
  },
});
