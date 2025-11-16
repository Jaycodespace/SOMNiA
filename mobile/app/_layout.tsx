import ThemeProvider from "@/components/theme/ThemeProvider";
import { useAppStore } from "@/store/appStore";
import { useAuthSession, useStoreAuth } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import HealthGuard from "../components/main/HealthGuard";

export default function RootLayout() {
  const { isLoggedIn, shouldCreateAccount, forgotPassword, restoreSession, isRestoring } = useStoreAuth();
  const { hasSeenWelcome, loadAppState } = useAppStore();
  const { loadSavedTheme, colors } = useThemeStore();

  useAuthSession();

  useEffect(() => {
    restoreSession();
    loadAppState();
    loadSavedTheme();
  }, [restoreSession, loadAppState, loadSavedTheme]);

  // 🕓 Theme-aware loading screen
  if (isRestoring || hasSeenWelcome === null) {
    return (
      <ThemeProvider>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <HealthGuard>
        <Stack screenOptions={{ headerShown: false }}>
          {/* AUTH FLOW */}
          <Stack.Protected guard={!isLoggedIn}>
            <Stack.Protected guard={shouldCreateAccount}>
              <Stack.Screen name="create-account" />
            </Stack.Protected>

            <Stack.Protected guard={forgotPassword}>
              <Stack.Screen name="forgot-password/index" />
              <Stack.Screen name="forgot-password/enter-code" />
              <Stack.Screen name="forgot-password/new-password" />
            </Stack.Protected>


            <Stack.Screen name="sign-in" />
          </Stack.Protected>

          {/* APP FLOW */}
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
    </ThemeProvider>
  );
}
