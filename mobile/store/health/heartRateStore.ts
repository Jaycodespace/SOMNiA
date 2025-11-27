import {
    getGrantedPermissions,
    initialize,
    readRecords,
    requestPermission,
} from "react-native-health-connect";
import { create } from "zustand";

interface HeartRateSample {
  bpm: number;
  time: string;
  fromExercise?: string; // e.g., "running", "resting"
}

interface HeartRateData {
  averageBpm: number | null;
  samples: HeartRateSample[];
  sourceApp?: string;
  context?: string;
}

interface HeartRateStore {
  heartRateData: HeartRateData | null;
  hasPermission: () => Promise<boolean>;
  getHeartRateData: () => Promise<void>;
}

export const useHeartRateStore = create<HeartRateStore>((set) => ({
  heartRateData: null,

  hasPermission: async () => {
    try {
      await initialize();

      const granted = await getGrantedPermissions();
      const hasAccess = granted.some(
        (p) => p.recordType === "HeartRate" && p.accessType === "read"
      );

      if (hasAccess) return true;

      // Ask for permission if not granted
      const result = await requestPermission([
        { accessType: "read", recordType: "HeartRate" },
        { accessType: "read", recordType: "ExerciseSession" },
      ]);

      return result.length > 0;
    } catch (error) {
      console.error("Permission check failed:", error);
      return false;
    }
  },

  getHeartRateData: async () => {
    try {
      await initialize();

      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000); // last 24 hours

      const response = await readRecords("HeartRate", {
        timeRangeFilter: {
          operator: "between",
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        },
      });

      const records = response.records ?? [];
      if (records.length === 0) {
        set({ heartRateData: { averageBpm: null, samples: [] } });
        return;
      }

      // Flatten and enrich heart rate samples
      const samples: HeartRateSample[] = records.flatMap((r: any) => {
        const exerciseType =
          r.metadata?.exerciseType ??
          (r.exerciseSessionId ? "exercise" : "resting");

        return (r.samples ?? []).map((s: any) => ({
          bpm: s.beatsPerMinute ?? 0,
          time: s.time ?? r.startTime,
          fromExercise: exerciseType,
        }));
      });

      const validSamples = samples.filter((s) => s.bpm > 0);
      if (validSamples.length === 0) {
        set({ heartRateData: { averageBpm: null, samples: [] } });
        return;
      }

      const avg =
        validSamples.reduce((sum, s) => sum + s.bpm, 0) /
        validSamples.length;

      // Guess the primary context (most frequent type)
      const contextCount: Record<string, number> = {};
      validSamples.forEach((s) => {
        if (s.fromExercise) {
          contextCount[s.fromExercise] = (contextCount[s.fromExercise] || 0) + 1;
        }
      });

      const primaryContext =
        Object.entries(contextCount).sort((a, b) => b[1] - a[1])[0]?.[0] ??
        "resting";

      const sourceApp =
        records[0]?.metadata?.dataOrigin ??
        (records[0]?.metadata as any)?.dataSource ??
        "Unknown";

      set({
        heartRateData: {
          averageBpm: Math.round(avg),
          samples: validSamples,
          sourceApp,
          context: primaryContext,
        },
      });
    } catch (error) {
      console.error("Error fetching heart rate:", error);
      set({ heartRateData: { averageBpm: null, samples: [] } });
    }
  },
}));
