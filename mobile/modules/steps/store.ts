import { create } from "zustand";
import { getSteps } from "./fetch";
import { ensureStepsPermission } from "./permissions";

export type ProcessedSteps = {
  date: Date;
  steps: number;
};

type StepsState = {
  daily: ProcessedSteps | null;
  weekly: ProcessedSteps[];
  monthly: ProcessedSteps[];
  loading: boolean;

  fetchDaily: () => Promise<void>;
  fetchWeekly: () => Promise<void>;
  fetchMonthly: () => Promise<void>;
};

export const useStepsStore = create<StepsState>((set) => ({
  daily: null,
  weekly: [],
  monthly: [],
  loading: false,

  // ➤ DAILY
  fetchDaily: async () => {
    set({ loading: true });

    const allowed = await ensureStepsPermission();
    if (!allowed) return set({ loading: false });

    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    const records = await getSteps(start, now);

    set({
      daily: records[0] ?? { date: now, steps: 0 },
      loading: false,
    });
  },

  // ➤ WEEKLY
  fetchWeekly: async () => {
    set({ loading: true });

    const allowed = await ensureStepsPermission();
    if (!allowed) return set({ loading: false });

    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 7);

    const records = await getSteps(start, now);

    set({
      weekly: records,
      loading: false,
    });
  },

  // ➤ MONTHLY
  fetchMonthly: async () => {
    set({ loading: true });

    const allowed = await ensureStepsPermission();
    if (!allowed) return set({ loading: false });

    const now = new Date();
    const start = new Date(now);
    start.setMonth(start.getMonth() - 1);

    const records = await getSteps(start, now);

    set({
      monthly: records,
      loading: false,
    });
  },
}));
