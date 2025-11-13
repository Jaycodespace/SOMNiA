import { Alert } from "react-native";
import {
  ExerciseType,
  getGrantedPermissions,
  readRecords,
  requestPermission,
} from "react-native-health-connect";
import { create } from "zustand";
import { ExerciseData } from "./types";

// ✅ Helper: convert numeric exerciseType → readable name
const getExerciseTypeName = (value: number | string | undefined): string => {
  if (!value) return "Unknown";
  const entry = Object.entries(ExerciseType).find(([, val]) => val === value);
  if (!entry) return "Unknown";
  const rawName = entry[0].replace("EXERCISE_TYPE_", "");
  return rawName
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

type ExerciseState = {
  exerciseData: ExerciseData | null;
  hasExercisePermission: () => Promise<boolean>;
  getExerciseData: () => Promise<void>;
};

export const useExerciseStore = create<ExerciseState>((set) => ({
  exerciseData: null,

  // ✅ Check or request permission
  hasExercisePermission: async () => {
    try {
      const granted = await getGrantedPermissions();
      const hasPermission = granted.some(
        (p) =>
          (p.recordType === "ExerciseSession" ||
            p.recordType === "ActiveCaloriesBurned" ||
            p.recordType === "TotalCaloriesBurned") &&
          p.accessType === "read"
      );

      if (!hasPermission) {
        const userChoice = await new Promise<boolean>((resolve) => {
          Alert.alert(
            "Permission Needed",
            "Exercise and calorie permissions are required to access your activity data. Would you like to open Health Connect?",
            [
              { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
              {
                text: "Open Health Connect",
                onPress: async () => {
                  await requestPermission([
                    { accessType: "read", recordType: "ExerciseSession" },
                    { accessType: "read", recordType: "ActiveCaloriesBurned" },
                    { accessType: "read", recordType: "TotalCaloriesBurned" },
                  ]);
                  resolve(true);
                },
              },
            ]
          );
        });

        return userChoice;
      }

      return true;
    } catch (error) {
      console.error("Error checking exercise permissions:", error);
      return false;
    }
  },

  // ✅ Get exercise data
  getExerciseData: async () => {
    try {
      const granted = await getGrantedPermissions();
      const hasPermission = granted.some(
        (p) => p.recordType === "ExerciseSession" && p.accessType === "read"
      );

      if (!hasPermission) {
        set({
          exerciseData: {
            type: "Permission not granted",
            duration: "0h 0m 0s",
            calories: 0,
          },
        });
        return;
      }

      // --- Fetch the latest ExerciseSession ---
      const exerciseResult = await readRecords("ExerciseSession", {
        timeRangeFilter: {
          operator: "between",
          startTime: new Date(Date.now() - 24 * 3600000).toISOString(),
          endTime: new Date().toISOString(),
        },
        ascendingOrder: false,
        pageSize: 1,
      });

      const record = exerciseResult.records?.[0];
      if (!record) {
        set({
          exerciseData: {
            type: "No data",
            duration: "0h 0m 0s",
            calories: 0,
          },
        });
        return;
      }

      // --- Duration formatting ---
      const start = new Date(record.startTime);
      const end = new Date(record.endTime);
      const durationMs = end.getTime() - start.getTime();
      const hours = Math.floor(durationMs / 3600000);
      const minutes = Math.floor((durationMs % 3600000) / 60000);
      const seconds = Math.floor((durationMs % 60000) / 1000);
      const displayDuration = `${hours}h ${minutes}m ${seconds}s`;

      // --- Try ActiveCaloriesBurned first ---
      const activeCaloriesResult = await readRecords("ActiveCaloriesBurned", {
        timeRangeFilter: {
          operator: "between",
          startTime: record.startTime,
          endTime: record.endTime,
        },
      });

      let totalCalories =
        activeCaloriesResult?.records?.reduce(
          (sum, r) => sum + (r?.energy?.inKilocalories ?? 0),
          0
        ) ?? 0;

      // --- Fallback to TotalCaloriesBurned if active = 0 ---
      if (totalCalories === 0) {
        const totalCaloriesResult = await readRecords("TotalCaloriesBurned", {
          timeRangeFilter: {
            operator: "between",
            startTime: record.startTime,
            endTime: record.endTime,
          },
        });
        totalCalories =
          totalCaloriesResult?.records?.reduce(
            (sum, r) => sum + (r?.energy?.inKilocalories ?? 0),
            0
          ) ?? 0;
      }

      const exerciseType = getExerciseTypeName(record.exerciseType);

      set({
        exerciseData: {
          type: exerciseType,
          duration: displayDuration,
          calories: Math.round(totalCalories),
        },
      });
    } catch (err) {
      console.error("Failed to read exercise data:", err);
      set({
        exerciseData: {
          type: "Error",
          duration: "0h 0m 0s",
          calories: 0,
        },
      });
    }
  },
}));
