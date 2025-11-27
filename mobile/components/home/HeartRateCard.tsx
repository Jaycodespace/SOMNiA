import OverlayWrapper from "@/components/theme/OverlayWrapper";
import { useThemeStore } from "@/store/themeStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HeartRateCardProps {
  currentHR: number;
  restingHR?: number;
  maxHR?: number;
  type?: "resting" | "exercise";
  title?: string;
  date?: Date;
}

export default function HeartRateCard({
  currentHR,
  restingHR = 65,
  maxHR = 190,
  type = "resting",
  title = "Heart Rate",
  date = new Date(),
}: HeartRateCardProps) {
  const { colors } = useThemeStore();
  const router = useRouter();

  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const statusText =
    currentHR < 60
      ? "Below Normal"
      : currentHR < 90
      ? "Healthy"
      : currentHR < 120
      ? "Elevated"
      : currentHR < 150
      ? "High"
      : "Very High";

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push("/heart-rate-records")}
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
              <Text style={[styles.title, { color: colors.text }]}>
                {type === "resting" ? "Resting Heart Rate" : "Exercise Heart Rate"}
              </Text>
            </View>

            <View style={{ flex: 1 }} />

            <Text style={[styles.date, { color: colors.text + "AA" }]}>{formattedDate}</Text>
          </View>

          {/* MAIN HEART RATE VALUE */}
            <View style={styles.mainRow}>
              {/* LEFT SIDE — HEART + CURRENT + STATUS */}
              <View style={styles.leftColumn}>
                <View style={styles.mainValueRow}>
                  <MaterialCommunityIcons
                    name="heart"
                    size={28}
                    color={colors.text}
                    style={{ marginRight: 6 }}
                  />

                  <View>
                    <Text style={[styles.currentValue, { color: colors.text }]}>
                      {currentHR} bpm
                    </Text>

                    <Text style={[styles.statusText, { color: colors.text + "AA" }]}>
                      {statusText}
                    </Text>
                  </View>
                </View>
              </View>

              {/* RIGHT SIDE — RESTING + MAX */}
              <View style={styles.rightColumn}>
                <View style={styles.statRowSide}>
                  <MaterialCommunityIcons
                    name="heart-outline"
                    size={16}
                    color={colors.text}
                  />
                  <Text style={[styles.statText, { color: colors.text }]}>
                    {restingHR}
                  </Text>
                </View>

                <View style={styles.statRowSide}>
                  <MaterialCommunityIcons
                    name="heart-flash"
                    size={16}
                    color={colors.text}
                  />
                  <Text style={[styles.statText, { color: colors.text }]}>
                    {maxHR}
                  </Text>
                </View>
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
  title: {
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
  mainValueRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  currentValue: {
    fontSize: 30,
    fontWeight: "700",
    lineHeight: 32,
  },

  statusText: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: -2,
    opacity: 0.9,
  },

  compactStats: {
    marginTop: 4,
    gap: 2,
  },

  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  statText: {
    fontSize: 14,
    fontWeight: "600",
  },
  mainRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
},

leftColumn: {
  flexDirection: "column",
  flex: 1,
},

rightColumn: {
  justifyContent: "center",
  alignItems: "flex-end",
  gap: 4,
  paddingLeft: 10,
},

statRowSide: {
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
},

});