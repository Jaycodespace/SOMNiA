import OverlayWrapper from "@/components/theme/OverlayWrapper";
import { useThemeStore } from "@/store/themeStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface SpO2CardProps {
  date?: Date;
  saturation: number; // 0–1 OR 0–100
  statusTextOverride?: string;
}

export default function SpO2Card({
  date = new Date(),
  saturation,
  statusTextOverride,
}: SpO2CardProps) {
  const { colors } = useThemeStore();
  const router = useRouter();

  const saturationDecimal = saturation > 1 ? saturation / 100 : saturation;

  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const getStatusText = (v: number) => {
    if (v >= 0.95) return "Optimal";
    if (v >= 0.92) return "Acceptable";
    if (v >= 0.90) return "Low";
    return "Critical";
  };

  const statusText = statusTextOverride ?? getStatusText(saturationDecimal);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push("/spo2-records")}
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
            <Text style={[styles.title, { color: colors.text }]}>SpO₂ Level</Text>

            <View style={{ flex: 1 }} />

            <Text style={[styles.date, { color: colors.text + "AA" }]}>
              {formattedDate}
            </Text>
          </View>

          {/* MAIN VALUE ROW */}
          <View style={styles.mainRow}>
            <MaterialCommunityIcons
              name="water-percent"
              size={30}
              color={colors.text}
              style={{ marginRight: 8 }}
            />

            <View>
              <Text style={[styles.percentText, { color: colors.text }]}>
                {(saturationDecimal * 100).toFixed(0)}%
              </Text>

              <Text style={[styles.statusText, { color: colors.text + "BB" }]}>
                {statusText}
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

  /* HEADER ROW */
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

  /* MAIN VALUE */
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  percentText: {
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 34,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: -2,
  },
});
