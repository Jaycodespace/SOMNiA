import { useThemeStore } from "@/store/themeStore";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ExerciseRecordScreen() {
const { colors } = useThemeStore();
  const [mode, setMode] = useState<"daily" | "weekly" | "monthly">("daily");
  return (
     <View style={[styles.container, { backgroundColor: colors.background }]}>
          
          {/* Mode Switch */}
          <View style={styles.switchRow}>
            <TabButton label="Daily" value="daily" current={mode} onPress={setMode} />
            <TabButton label="Weekly" value="weekly" current={mode} onPress={setMode} />
            <TabButton label="Monthly" value="monthly" current={mode} onPress={setMode} />
          </View>
    
          {/* Dynamic Content */}
          <View style={styles.content}>
            {mode === "daily" && (
              <Placeholder text="Daily Sleep Records Component" />
            )}
    
            {mode === "weekly" && (
              <Placeholder text="Weekly Sleep Records Component" />
            )}
    
            {mode === "monthly" && (
              <Placeholder text="Monthly Sleep Records Component" />
            )}
          </View>
        </View>
  );
}

/* ──────────────── COMPONENT: TAB BUTTON ──────────────── */

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

/* ──────────────── COMPONENT: PLACEHOLDER ──────────────── */

function Placeholder({ text }: { text: string }) {
  const { colors } = useThemeStore();

  return (
    <View style={[styles.placeholder, { backgroundColor: colors.card }]}>
      <Text style={[styles.placeholderText, { color: colors.text }]}>
        {text}
      </Text>
    </View>
  );
}

/* ──────────────── STYLES ──────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 20,
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  tabButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
  },

  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },

  content: {
    flex: 1,
  },

  placeholder: {
    flex: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
  },

  placeholderText: {
    fontSize: 18,
    fontWeight: "700",
    opacity: 0.9,
  },
});
