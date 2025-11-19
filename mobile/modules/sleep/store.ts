import { create } from "zustand";
import { classifySleep } from "./classify";
import { getSleepSessions } from "./fetch";
import { ensureSleepPermission } from "./permissions";
import { computeSleepQuality } from "./quality";

export type ProcessedSleep = {
  start: Date;
  end: Date;
  durationH: number;
  isNap: boolean;
  quality: number;
};

type SleepState = {
  daily: ProcessedSleep | null;
  weekly: ProcessedSleep[];
  monthly: ProcessedSleep[];
  loading: boolean;

  fetchDaily: () => Promise<void>;
  fetchWeekly: () => Promise<void>;
  fetchMonthly: () => Promise<void>;
};

export const useSleepStore = create<SleepState>((set) => ({
  daily: null,
  weekly: [],
  monthly: [],
  loading: false,

  fetchDaily: async () => {
    set({ loading: true });

    const allowed = await ensureSleepPermission();
    if (!allowed) return set({ loading: false });

    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date();

    const sessions = await getSleepSessions(start, end);

    if (sessions.length === 0) {
      set({ daily: null, loading: false });
      return;
    }

    const main = sessions[0];
    const { isNap } = classifySleep(main);
    const quality = computeSleepQuality(main, isNap);

    set({
      daily: {
        ...main,
        durationH: (main.end.getTime() - main.start.getTime()) / 36e5,
        quality,
        isNap,
      },
      loading: false,
    });
  },

  fetchWeekly: async () => {
    set({ loading: true });

    const allowed = await ensureSleepPermission();
    if (!allowed) return set({ loading: false });

    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 7);

    const sessions = await getSleepSessions(start, today);

    const processed = sessions.map((s) => {
      const { isNap } = classifySleep(s);
      return {
        ...s,
        durationH: (s.end.getTime() - s.start.getTime()) / 36e5,
        isNap,
        quality: computeSleepQuality(s, isNap),
      };
    });

    set({ weekly: processed, loading: false });
  },

  fetchMonthly: async () => {
    set({ loading: true });

    const allowed = await ensureSleepPermission();
    if (!allowed) return set({ loading: false });

    const today = new Date();
    const start = new Date(today);
    start.setMonth(start.getMonth() - 1);

    const sessions = await getSleepSessions(start, today);

    const processed = sessions.map((s) => {
      const { isNap } = classifySleep(s);
      return {
        ...s,
        durationH: (s.end.getTime() - s.start.getTime()) / 36e5,
        isNap,
        quality: computeSleepQuality(s, isNap),
      };
    });

    set({ monthly: processed, loading: false });
  },
}));
