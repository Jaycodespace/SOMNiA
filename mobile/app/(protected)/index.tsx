import ExerciseCard from "@/components/home/ExerciseCard";
import HeartRateCard from "@/components/home/HeartRateCard";
import SleepSummary from "@/components/home/SleepCard";
import SpO2Card from "@/components/home/Spo2Card";
import StepsCard from "@/components/home/StepsCard";
import OverlayWrapper from "@/components/theme/OverlayWrapper";

import { useExerciseStore } from "@/modules/exercise";
import { useHeartStore } from "@/modules/heartRate";
import { useSleepStore } from "@/modules/sleep";
import { useSpO2Store } from "@/modules/spo2";
import { useStepsStore } from "@/modules/steps";
import { useThemeStore } from "@/store/themeStore";

import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView } from "react-native";

export default function HomeScreen() {
  const { colors } = useThemeStore();
  const [refreshing, setRefreshing] = useState(false);

  /** Refresh All Stores */
  const refreshAll = async () => {
    setRefreshing(true);

    await Promise.all([
      useSleepStore.getState().fetchDaily(),
      useExerciseStore.getState().fetchDaily(),
      useStepsStore.getState().fetchDaily(),
      useSpO2Store.getState().fetchDaily(),
      useHeartStore.getState().fetchDaily(),
    ]);

    setRefreshing(false);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const sleep = useSleepStore((s) => s.daily);
  const exercises = useExerciseStore((s) => s.daily);
  const steps = useStepsStore((s) => s.daily);
  const spo2 = useSpO2Store((s) => s.daily);
  const heartRate = useHeartStore((s) => s.daily);

  return (
    <OverlayWrapper
      colors={[colors.gradientTop, colors.gradientBottom]}
      overlayImage={require("@/assets/images/crayon_overlay.png")}
      overlayOpacity={0.02}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 32,
          paddingHorizontal: 18,
          paddingTop: 18,
          gap: 20,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshAll}
            tintColor={colors.text}
          />
        }
      >
        {/* SLEEP */}
        {sleep && sleep.start && sleep.end ? (
          <SleepSummary
            title={sleep?.isNap ? "Nap" : "Last Night's Sleep"}
            date={new Date()}
            sleepStart={sleep.start}
            sleepEnd={sleep.end}
            quality={sleep?.quality ?? 0}
            isNap={sleep?.isNap ?? false}
            durationOverride={sleep?.durationH}
          />
        ) : (
          <SleepSummary
            title="No Sleep Data"
            date={new Date()}
            sleepStart={new Date(0)}
            sleepEnd={new Date(0)}
            quality={0}
            isNap={false}
            durationOverride={0}
          />
        )}

        {/* EXERCISES */}
        {exercises.length > 0 ? (
          exercises.map((ex, idx) => {
            const durationSeconds = ex.durationSeconds ?? 0;

            return (
              <ExerciseCard
                key={idx}
                exerciseType={ex.exerciseName}
                durationMinutes={ex.durationMinutes ?? 0}
                durationSeconds={durationSeconds}
                date={ex.start}
              />
            );
          })
        ) : (
          <ExerciseCard
            exerciseType="No Exercise"
            durationMinutes={0}
            durationSeconds={0}
            date={new Date()}
          />
        )}

        {/* HEART RATE */}
        <HeartRateCard
          currentHR={heartRate?.currentHR ?? 0}
          restingHR={heartRate?.restingHR ?? 0}
          maxHR={190}
          title="Heart Rate"
          date={new Date()}
        />

        {/* STEPS */}
        <StepsCard steps={steps?.steps ?? 0} date={steps?.date ?? new Date()} />

        {/* SPO2 */}
        <SpO2Card
          saturation={spo2?.percentage ?? 0}
          date={spo2?.timestamp ?? new Date()}
        />
      </ScrollView>
    </OverlayWrapper>
  );
}
