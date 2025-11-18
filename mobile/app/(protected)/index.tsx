import SleepSummary from "@/components/home/SleepCard";
import BackgroundWrapper from "@/components/theme/BackgroundWrapper";
import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {

  const sleepStart = new Date();
  sleepStart.setHours(23, 30);

  const sleepEnd = new Date();
  sleepEnd.setHours(7, 45);

  return (
    <BackgroundWrapper showLogo={false}>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <SleepSummary
          title="Last Night's Sleep"
          date={new Date()}
          sleepStart={sleepStart}
          sleepEnd={sleepEnd}
          quality={0.82}
          isNap={false}
          qualityTextOverride="Very Good"
          durationOverride={7.8}
        />
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
  },
});
