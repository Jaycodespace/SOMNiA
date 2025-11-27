import { create } from "zustand";
import {
    getHeartRateSamples,
    getRestingHeartRateSamples,
} from "./fetch";
import { ensureHeartPermission } from "./permissions";

export type ProcessedHeartRate = {
  currentHR: number | null;
  restingHR: number | null;

  samples: { bpm: number; time: Date }[];
};

type HeartState = {
  daily: ProcessedHeartRate | null;
  weekly: ProcessedHeartRate | null;
  monthly: ProcessedHeartRate | null;
  loading: boolean;

  fetchDaily: () => Promise<void>;
  fetchWeekly: () => Promise<void>;
  fetchMonthly: () => Promise<void>;
};

export const useHeartStore = create<HeartState>((set) => ({
  daily: null,
  weekly: null,
  monthly: null,
  loading: false,

  fetchDaily: async () => {
    set({ loading: true });

    const allowed = await ensureHeartPermission();
    if (!allowed) return set({ loading: false });

    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 1);

    const samples = await getHeartRateSamples(start, end);
    const resting = await getRestingHeartRateSamples(start, end);

    const latestHR = samples.sort(
      (a, b) => b.time.getTime() - a.time.getTime()
    )[0]?.bpm ?? null;

    const restingHR =
      resting.length > 0
        ? // Use the latest resting HR (more stable than mean)
          resting.sort(
            (a, b) => b.time.getTime() - a.time.getTime()
          )[0].bpm
        : null;

    set({
      daily: {
        currentHR: latestHR,
        restingHR,
        samples,
      },
      loading: false,
    });
  },

  fetchWeekly: async () => {
    set({ loading: true });

    const allowed = await ensureHeartPermission();
    if (!allowed) return set({ loading: false });

    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);

    const samples = await getHeartRateSamples(start, end);
    const resting = await getRestingHeartRateSamples(start, end);

    const latestHR = samples.sort(
      (a, b) => b.time.getTime() - a.time.getTime()
    )[0]?.bpm ?? null;

    const restingHR =
      resting.length > 0
        ? resting.sort(
            (a, b) => b.time.getTime() - a.time.getTime()
          )[0].bpm
        : null;

    set({
      weekly: {
        currentHR: latestHR,
        restingHR,
        samples,
      },
      loading: false,
    });
  },

  fetchMonthly: async () => {
    set({ loading: true });

    const allowed = await ensureHeartPermission();
    if (!allowed) return set({ loading: false });

    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1);

    const samples = await getHeartRateSamples(start, end);
    const resting = await getRestingHeartRateSamples(start, end);

    const latestHR = samples.sort(
      (a, b) => b.time.getTime() - a.time.getTime()
    )[0]?.bpm ?? null;

    const restingHR =
      resting.length > 0
        ? resting.sort(
            (a, b) => b.time.getTime() - a.time.getTime()
          )[0].bpm
        : null;

    set({
      monthly: {
        currentHR: latestHR,
        restingHR,
        samples,
      },
      loading: false,
    });
  },
}));
