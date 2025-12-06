import OverlayWrapper from "@/components/theme/OverlayWrapper";
import { useThemeStore } from "@/store/themeStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface StepsCardProps {
  steps: number;
  date?: Date;
}

export default function StepsCard({
  steps,
  date = new Date(),
}: StepsCardProps) {
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
      onPress={() => router.push("/steps-records")}
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
            <Text style={[styles.title, { color: colors.text }]}>
              Today&apos;s Steps
            </Text>

            <View style={{ flex: 1 }} />

            <Text style={[styles.date, { color: colors.text + "AA" }]}>
              {formattedDate}
            </Text>
          </View>

          {/* MAIN VALUE ROW */}
          <View style={styles.stepsRow}>
            <MaterialCommunityIcons
              name="walk"
              size={30}
              color={colors.text}
              style={{ marginRight: 8 }}
            />

            <View>
              <Text style={[styles.stepsNumber, { color: colors.text }]}>
                {steps.toLocaleString()}
              </Text>
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

  /* HEADER */
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  date: {
    fontSize: 13,
  },

  /* MAIN STEPS VALUE */
  stepsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  stepsNumber: {
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 34,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: -2,
  },

  /* GOAL */
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  goalText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
