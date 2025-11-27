import { Stack } from "expo-router";

export default function WelcomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="setup-health-perm" />
      <Stack.Screen name="about-health-perms" />
    </Stack>
  );
}
