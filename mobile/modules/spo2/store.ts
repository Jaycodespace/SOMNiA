import { create } from "zustand";
import { getSpO2Records } from "./fetch";
import { ensureSpO2Permission } from "./permissions";

export type ProcessedSPO2 = {
  timestamp: Date;
  percentage: number; // 0–1 float
};

type SpO2State = {
  daily: ProcessedSPO2 | null;
  weekly: ProcessedSPO2[];
  monthly: ProcessedSPO2[];
  loading: boolean;

  fetchDaily: () => Promise<void>;
  fetchWeekly: () => Promise<void>;
  fetchMonthly: () => Promise<void>;
};

export const useSpO2Store = create<SpO2State>((set) => ({
  daily: null,
  weekly: [],
  monthly: [],
  loading: false,

  fetchDaily: async () => {
    set({ loading: true });

    const allowed = await ensureSpO2Permission();
    if (!allowed) return set({ loading: false });

    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    const records = await getSpO2Records(start, now);

    if (records.length === 0) {
      set({ daily: null, loading: false });
      return;
    }

    // Take the most recent saturation measurement
    const latest = records.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    )[0];

    set({ daily: latest, loading: false });
  },

  fetchWeekly: async () => {
    set({ loading: true });

    const allowed = await ensureSpO2Permission();
    if (!allowed) return set({ loading: false });

    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 7);

    const records = await getSpO2Records(start, now);

    // Already good raw data: each measurement has timestamp + percentage
    set({ weekly: records, loading: false });
  },

  fetchMonthly: async () => {
    set({ loading: true });

    const allowed = await ensureSpO2Permission();
    if (!allowed) return set({ loading: false });

    const now = new Date();
    const start = new Date(now);
    start.setMonth(now.getMonth() - 1);

    const records = await getSpO2Records(start, now);

    set({ monthly: records, loading: false });
  },
}));
