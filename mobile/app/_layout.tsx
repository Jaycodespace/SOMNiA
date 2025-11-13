import { useAppStore } from "@/store/appStore";
import { useAuthSession, useStoreAuth } from "@/store/authStore";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import HealthGuard from "../components/main/HealthGuard";

export default function RootLayout() {
  const { isLoggedIn, shouldCreateAccount, forgotPassword, restoreSession, isRestoring } = useStoreAuth();
  const { hasSeenWelcome, loadAppState } = useAppStore();

  useAuthSession();

  useEffect(() => {
    restoreSession();
    loadAppState();
  }, [restoreSession, loadAppState]);

  if (isRestoring || hasSeenWelcome === null) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <HealthGuard>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Protected guard={shouldCreateAccount}>
            <Stack.Screen name="create-account" />
          </Stack.Protected>

          <Stack.Protected guard={forgotPassword}>
            <Stack.Screen name="forgot-password" />
          </Stack.Protected>

          <Stack.Screen name="sign-in" />
        </Stack.Protected>

        <Stack.Protected guard={isLoggedIn && !shouldCreateAccount && !forgotPassword}>
          <Stack.Protected guard={!hasSeenWelcome}>
            <Stack.Screen name="welcome" />
          </Stack.Protected>

          <Stack.Protected guard={hasSeenWelcome}>
            <Stack.Screen name="(protected)" />
          </Stack.Protected>
        </Stack.Protected>

      </Stack>
    </HealthGuard>
  );
}
