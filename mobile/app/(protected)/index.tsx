import SleepSummary from "@/components/home/SleepRecord/SleepCard";
import OverlayWrapper from "@/components/theme/OverlayWrapper";
import { useSleepStore } from "@/modules/sleep";
import { useThemeStore } from "@/store/themeStore";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function HomeScreen() {
  const { colors } = useThemeStore();
  const sleepStart = new Date();
  sleepStart.setHours(23, 30);

  const sleepEnd = new Date();
  sleepEnd.setHours(7, 45);

  useEffect(() => {
    useSleepStore.getState().fetchDaily();
  }, []);
  const sleep = useSleepStore((s) => s.daily);
  return (
    <OverlayWrapper
      backgroundColor={colors.background}
      overlayImage={require("@/assets/images/grainy_overlay.png")}
      opacity={0.25}
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        <SleepSummary
          title={sleep?.isNap ? "Nap" : "Last Night's Sleep"}
          date={new Date()}
          sleepStart={sleep?.start ?? new Date(0)}
          sleepEnd={sleep?.end ?? new Date(0)}
          quality={sleep?.quality ?? 0}
          isNap={sleep?.isNap ?? false}
          durationOverride={sleep?.durationH}
        />
      </SafeAreaView>
    </OverlayWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
  },
});
