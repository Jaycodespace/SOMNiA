import { useExerciseStore } from "@/store/health/exerciseStore";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

export default function ExerciseCard() {
  const { exerciseData, getExerciseData, hasExercisePermission } =
    useExerciseStore();
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const granted = await hasExercisePermission();
      setHasPermission(granted);
      if (granted) await getExerciseData();
      setLoading(false);
    };
    loadData();
  }, [getExerciseData, hasExercisePermission]);

  if (loading) {
    return (
      <View style={[styles.card, { alignItems: "center" }]}>
        <ActivityIndicator color="#28A745" />
        <Text style={{ marginTop: 8, color: "#777" }}>
          Loading exercise data...
        </Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <Pressable style={[styles.card, { alignItems: "center" }]}>
        <Feather name="activity" size={22} color="#28A745" />
        <Text style={styles.cardTitle}>Exercise</Text>
        <Text style={{ color: "#777", marginTop: 8 }}>
          Requires Health Connect permission
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable style={styles.card} onPress={getExerciseData}>
      <View style={styles.cardHeader}>
        <Feather name="activity" size={20} color="#28A745" />
        <Text style={styles.cardTitle}>Exercise</Text>
      </View>

      {exerciseData ? (
        <>
          <Text style={styles.exerciseType}>{exerciseData.type}</Text>
          <Text style={styles.duration}>{exerciseData.duration}</Text>
          <Text style={styles.calories}>
            🔥 {exerciseData.calories} kcal burned
          </Text>
        </>
      ) : (
        <Text style={styles.subText}>No exercise data available</Text>
      )}
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
  exerciseType: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  duration: {
    fontSize: 16,
    fontWeight: "500",
    color: "#444",
    marginTop: 4,
  },
  calories: {
    fontSize: 14,
    color: "#28A745",
    marginTop: 6,
    fontWeight: "500",
  },
  subText: { fontSize: 14, color: "#777", marginTop: 4 },
});
