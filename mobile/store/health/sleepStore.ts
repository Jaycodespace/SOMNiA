import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  getGrantedPermissions,
  readRecords
} from "react-native-health-connect";

import { differenceInMinutes } from "date-fns";

interface SleepSummary {
  totalMinutes: number;
  qualityScore: number;
  lastUpdated: number | null;
}

interface SleepStore {
  summary: SleepSummary;
  loading: boolean;
  hasPermission: boolean | null;

  checkPermissions: () => Promise<void>;
  fetchTodaySleep: () => Promise<void>;
}

export const useSleepStore = create(
  persist<SleepStore>(
    (set, get) => ({
      summary: {
        totalMinutes: 0,
        qualityScore: 0,
        lastUpdated: null,
      },
      loading: false,
      hasPermission: null,

      /** Check if SleepSession permission is still granted */
      checkPermissions: async () => {
        const granted = await getGrantedPermissions();
        const has = granted.some((p) => p.recordType === "SleepSession");
        set({ hasPermission: has });
      },

      /** Fetch today's sleep data */
      fetchTodaySleep: async () => {
        await get().checkPermissions();

        if (!get().hasPermission) {
          console.log("❌ No permission: SleepSession");
          return;
        }

        try {
          set({ loading: true });

          const now = new Date();
          const startOfDay = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );

          // ✔ Correct generic
          // ✔ Correct timeRangeFilter format
          const response = await readRecords<"SleepSession">("SleepSession", {
            timeRangeFilter: {
              operator: "between",
              startTime: startOfDay.toISOString(),
              endTime: now.toISOString(),
            },
          });

          const totalMinutes = response.records.reduce((sum, rec) => {
            const mins = differenceInMinutes(
              new Date(rec.endTime),
              new Date(rec.startTime)
            );
            return sum + mins;
          }, 0);

          const qualityScore = totalMinutes
            ? Math.min(totalMinutes / 480, 1)
            : 0;

          set({
            summary: {
              totalMinutes,
              qualityScore,
              lastUpdated: Date.now(),
            },
          });

        } catch (error) {
          console.warn("Sleep fetch failed:", error);
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "sleep-store",
      storage: createJSONStorage(() => AsyncStorage), // ✔ Correct persist storage usage
    }
  )
);
