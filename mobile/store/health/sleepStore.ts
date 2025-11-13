import {
    getGrantedPermissions,
    readRecords,
    requestPermission,
} from "react-native-health-connect";
import { create } from "zustand";
import { SleepData } from "./types";

type SleepState = {
  sleepData: SleepData | null;
  hasSleepPermission: () => Promise<boolean>;
  getSleepData: () => Promise<void>;
};

export const useSleepStore = create<SleepState>((set) => ({
  sleepData: null,

  hasSleepPermission: async () => {
    try {
      const granted = await getGrantedPermissions();
      const hasPermission = granted.some(
        (p) => p.recordType === "SleepSession" && p.accessType === "read"
      );

      // If not granted, ask the user
      if (!hasPermission) {
        const result = await requestPermission([
          { accessType: "read", recordType: "SleepSession" },
        ]);

        return result.length > 0; // true if permission was granted
      }

      return true;
    } catch (error) {
      console.error("Error checking sleep permission:", error);
      return false;
    }
  },

  getSleepData: async () => {
    try {
      const result = await readRecords("SleepSession", {
        timeRangeFilter: {
          operator: "between",
          startTime: new Date(Date.now() - 48 * 3600000).toISOString(),
          endTime: new Date().toISOString(),
        },
        ascendingOrder: false,
        pageSize: 1,
      });

      const record = result.records?.[0];
      if (!record) {
        set({
          sleepData: {
            duration: "0h 0m",
            label: "No data",
            quality: "No data",
            qualityScore: 0,
          },
        });
        return;
      }

      const start = new Date(record.startTime);
      const end = new Date(record.endTime);
      const durationMs = end.getTime() - start.getTime();
      const durationHours = durationMs / 3600000;
      const hours = Math.floor(durationHours);
      const minutes = Math.floor((durationMs % 3600000) / 60000);
      const startHour = start.getHours();

      const isNap = startHour >= 9 && startHour <= 18;
      let label = isNap ? "Nap" : "Last Night";
      let quality = "Average";
      let qualityScore = 5;

      if (!isNap) {
        if (durationHours < 5) {
          quality = "Very Poor";
          qualityScore = 2;
        } else if (durationHours < 6) {
          quality = "Poor";
          qualityScore = 3;
        } else if (durationHours < 7) {
          quality = "Fair";
          qualityScore = 5;
        } else if (durationHours <= 9) {
          quality = "Good";
          qualityScore = 8;
        } else if (durationHours <= 10) {
          quality = "Fair";
          qualityScore = 6;
        } else {
          quality = "Poor";
          qualityScore = 3;
        }
      }

      set({
        sleepData: {
          duration: `${hours}h ${minutes}m`,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          label,
          quality,
          qualityScore,
        },
      });
    } catch (err) {
      console.error("Failed to read sleep data:", err);
      set({
        sleepData: {
          duration: "0h 0m",
          label: "No data",
          quality: "No data",
          qualityScore: 0,
        },
      });
    }
  },
}));
