import OverlayWrapper from "@/components/theme/OverlayWrapper";
import { useThemeStore } from "@/store/themeStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

interface ExerciseCardProps {
  exerciseType: string;
  durationMinutes: number;
  durationSeconds: number;
  date: Date;
}

export default function ExerciseCard({
  exerciseType,
  durationMinutes,
  durationSeconds,
  date,
}: ExerciseCardProps) {
  const { colors } = useThemeStore();
  const router = useRouter();

  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push("/exercise-records")}
      style={[styles.wrapper, { backgroundColor: colors.cardDarker }]}
    >
      <OverlayWrapper
        colors={[colors.gradientTop, colors.gradientBottom]}
        overlayImage={require("@/assets/images/crayon_overlay.png")}
        overlayOpacity={0.02}
      >
        <View style={styles.container}>
          {/* HEADER ROW */}
          <View style={styles.headerRow}>

            <View>
              <Text style={[styles.exerciseType, { color: colors.text }]}>
                {exerciseType}
              </Text>
              <Text style={[styles.subType, { color: colors.text + "AA" }]}>Workout Type</Text>
            </View>

            <View style={{ flex: 1 }} />

            <Text style={[styles.date, { color: colors.text + "AA" }]}>{formattedDate}</Text>
          </View>

          {/* COMPACT STATS */}
          <View style={styles.compactStats}>
            <View style={styles.statRow}>
              <MaterialCommunityIcons name="timer" size={22} color={colors.text} />
              <Text style={[styles.statText, { color: colors.text }]}>
                {durationMinutes} min {durationSeconds}s
              </Text>
            </View>

            <View style={styles.statRow}>
              <MaterialCommunityIcons name="fire" size={22} color={colors.text} />
            </View>
          </View>
        </View>
      </OverlayWrapper>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.2)",
  },
  container: {
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  exerciseType: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  subType: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: -2,
  },
  date: {
    fontSize: 13,
  },
  compactStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 16,
    fontWeight: "600",
  },
});