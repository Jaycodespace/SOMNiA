import { Alert } from "react-native";
import {
    getGrantedPermissions,
    readRecords,
    requestPermission,
} from "react-native-health-connect";
import { create } from "zustand";

type StepsData = {
  totalSteps: number;
};

type StepsState = {
  stepsData: StepsData | null;
  hasStepsPermission: () => Promise<boolean>;
  getStepsData: () => Promise<void>;
};

export const useStepsStore = create<StepsState>((set) => ({
  stepsData: null,

  // ✅ Check or request Health Connect permission
  hasStepsPermission: async () => {
    try {
      const granted = await getGrantedPermissions();
      const hasPermission = granted.some(
        (p) => p.recordType === "Steps" && p.accessType === "read"
      );

      if (!hasPermission) {
        const userChoice = await new Promise<boolean>((resolve) => {
          Alert.alert(
            "Permission Needed",
            "Steps permission is required to access your daily step count. Would you like to open Health Connect?",
            [
              { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
              {
                text: "Open Health Connect",
                onPress: async () => {
                  await requestPermission([
                    { accessType: "read", recordType: "Steps" },
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
      console.error("Error checking steps permission:", error);
      return false;
    }
  },

  // ✅ Fetch total steps for today
  getStepsData: async () => {
    try {
      const granted = await getGrantedPermissions();
      const hasPermission = granted.some(
        (p) => p.recordType === "Steps" && p.accessType === "read"
      );

      if (!hasPermission) {
        set({ stepsData: { totalSteps: 0 } });
        return;
      }

      const now = new Date();
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const stepsResult = await readRecords("Steps", {
        timeRangeFilter: {
          operator: "between",
          startTime: startOfDay.toISOString(),
          endTime: now.toISOString(),
        },
      });

      const totalSteps =
        stepsResult.records?.reduce(
          (sum, r) => sum + (r.count ?? 0),
          0
        ) ?? 0;

      set({ stepsData: { totalSteps } });
    } catch (err) {
      console.error("Failed to read steps data:", err);
      set({ stepsData: { totalSteps: 0 } });
    }
  },
}));
