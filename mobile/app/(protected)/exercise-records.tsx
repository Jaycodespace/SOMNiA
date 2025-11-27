import { useThemeStore } from "@/store/themeStore";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";

export default function ExerciseRecordScreen() {
  const { colors } = useThemeStore();
  const [mode, setMode] = useState<"daily" | "weekly" | "monthly">("daily");

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* ───── Back Button ───── */}
        <View style={styles.headerArea}>
            <View style={styles.headerRow}>
                <Pressable
                    onPress={() => router.replace("/(protected)")}
                    style={styles.backButton}
                >
                    <Feather name="chevron-left" size={26} color={colors.text} />
                    <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
                </Pressable>

                <Text style={[styles.screenTitle, { color: colors.text }]}>
                    Exercise Records
                </Text>
            </View>
        </View>


      {/* Divider */}
      <View
        style={[
          styles.headerDivider,
          { backgroundColor: colors.border + "55" },
        ]}
      />

      {/* ───── Mode Switch ───── */}
      <View style={styles.switchRow}>
        <TabButton label="Daily" value="daily" current={mode} onPress={setMode} />
        <TabButton label="Weekly" value="weekly" current={mode} onPress={setMode} />
        <TabButton label="Monthly" value="monthly" current={mode} onPress={setMode} />
      </View>

      {/* ───── Under Development Card (from AI Screen) ───── */}
      <View style={styles.centerContainer}>
        <Animated.View
          entering={FadeInUp.springify().mass(0.4)}
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Animated.View entering={FadeIn.duration(600)}>
            <Image
              source={require("@/assets/images/bear_build.png")}
              style={styles.image}
              resizeMode="contain"
            />
          </Animated.View>

          <Text style={[styles.cardText, { color: colors.text }]}>
            🚧 Exercise Records Coming Soon
          </Text>

          <Text style={[styles.cardSubText, { color: colors.subtleText }]}>
            We’re building a full overview of your workouts, routines, and activity trends. Coming soon!
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

/* ─────────────── TAB BUTTON ─────────────── */

interface TabButtonProps {
  label: string;
  value: "daily" | "weekly" | "monthly";
  current: string;
  onPress: (val: "daily" | "weekly" | "monthly") => void;
}

function TabButton({ label, value, current, onPress }: TabButtonProps) {
  const { colors } = useThemeStore();
  const isActive = current === value;

  return (
    <TouchableOpacity
      onPress={() => onPress(value)}
      style={[
        styles.tabButton,
        {
          backgroundColor: isActive ? colors.cardDarker : colors.card,
          borderColor: isActive ? colors.borderStrong : colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.tabButtonText,
          { color: isActive ? colors.text : colors.subtleText },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* ─────────────── STYLES ─────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 20,
  },

  /* HEADER */
  headerArea: {
    marginBottom: 10,
    paddingBottom: 6,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 2,
  },
  headerDivider: {
    width: "100%",
    height: 1.4,
    marginBottom: 18,
    borderRadius: 20,
  },

  /* TABS */
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 26,
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },

  /* CONTENT */
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  card: {
    width: "90%",
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  image: {
    width: 190,
    height: 190,
    marginBottom: 10,
  },

  cardText: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },

  cardSubText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    },

    screenTitle: {
        fontSize: 20,
        fontWeight: "700",
    },
});
