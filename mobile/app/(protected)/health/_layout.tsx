import { Themes } from "@/constants/themes";
import { useThemeStore } from "@/store/themeStore";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { Pressable } from "react-native";

export default function HealthRecordsLayout() {
  const { theme } = useThemeStore();
  const router = useRouter();

  const colors = Themes[theme].colors;

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.card,   // dynamic
        },
        headerTintColor: colors.text,      // dynamic text color
        headerTitleStyle: {
          fontWeight: "600",
        },
        headerLeft: () => (
          <Pressable
            onPress={() => router.back()}
            style={{ paddingHorizontal: 10 }}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={colors.text}         // dynamic icon color
            />
          </Pressable>
        ),
      }}
    >
      <Stack.Screen
        name="sleep-records"
        options={{ title: "Sleep Records" }}
      />
      <Stack.Screen
        name="exercise-records"
        options={{ title: "Exercise Records" }}
      />
      <Stack.Screen
        name="heart-rate-records"
        options={{ title: "Heart Rate Records" }}
      />
      <Stack.Screen
        name="steps-records"
        options={{ title: "Steps Records" }}
      />
    </Stack>
  );
}
