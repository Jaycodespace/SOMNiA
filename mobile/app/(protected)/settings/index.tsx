import OverlayWrapper from "@/components/theme/OverlayWrapper";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useStoreAuth } from "@/store/authStore";
import { useThemeStore } from '@/store/themeStore';
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function SettingsScreen() {
  const { colors } = useThemeStore();
  const { logout } = useStoreAuth();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("authToken");

      if (!token) {
        await logout();
        router.replace("/sign-in");
        return;
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/logout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        await logout();
        router.replace("/sign-in");
        Alert.alert("Signed out", "You’ve been logged out successfully.");
      } else {
        console.warn("Logout failed on server:", data.message);
        await logout();
        router.replace("/sign-in");
        Alert.alert("Notice", "You’ve been signed out locally.");
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong during logout.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <OverlayWrapper
          backgroundColor={colors.background}
          overlayImage={require("@/assets/images/grainy_overlay.png")}
          opacity={0.25}
        >
      <SafeAreaView style={styles.container}>
        <ThemeToggle />
        <View style={{ padding: 20, gap: 16 }}>
          {/* ✅ Sign Out Button */}
          <Button
            title={loading ? "Signing Out..." : "Sign Out"}
            onPress={handleSignOut}
            disabled={loading}
          />

          {loading && <ActivityIndicator style={{ marginTop: 10 }} />}
        </View>
      </SafeAreaView>
    </OverlayWrapper>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 22,
    fontWeight: "600",
  }
});
