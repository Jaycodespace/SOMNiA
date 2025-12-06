import { create } from "zustand";
import { getExerciseSessions } from "./fetch";
import { ensureExercisePermission } from "./permissions";

export type ProcessedExercise = {
  start: Date;
  end: Date;

  durationMinutes: number;
  durationSeconds: number;

  exerciseType: number;
  exerciseName: string;
  calories?: number;
};

type ExerciseState = {
  daily: ProcessedExercise[];
  weekly: ProcessedExercise[];
  monthly: ProcessedExercise[];
  loading: boolean;

  fetchDaily: () => Promise<void>;
  fetchWeekly: () => Promise<void>;
  fetchMonthly: () => Promise<void>;
};

export const useExerciseStore = create<ExerciseState>((set) => ({
  daily: [],
  weekly: [],
  monthly: [],
  loading: false,

  fetchDaily: async () => {
    set({ loading: true });

    const allowed = await ensureExercisePermission();
    if (!allowed) return set({ loading: false });

    const now = new Date();

    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    const records = await getExerciseSessions(start, now);

    // Ensure durationSeconds always exists
    const processed: ProcessedExercise[] = records.map((r) => ({
      ...r,
      durationSeconds: r.durationSeconds ?? 0,
    }));

    set({
      daily: processed,
      loading: false,
    });
  },

  fetchWeekly: async () => {
    set({ loading: true });

    const allowed = await ensureExercisePermission();
    if (!allowed) return set({ loading: false });

    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 7);

    const records = await getExerciseSessions(start, today);

    const processed: ProcessedExercise[] = records.map((r) => ({
      ...r,
      durationSeconds: r.durationSeconds ?? 0,
    }));

    set({
      weekly: processed,
      loading: false,
    });
  },

  fetchMonthly: async () => {
    set({ loading: true });

    const allowed = await ensureExercisePermission();
    if (!allowed) return set({ loading: false });

    const today = new Date();
    const start = new Date(today);
    start.setMonth(today.getMonth() - 1);

    const records = await getExerciseSessions(start, today);

    const processed: ProcessedExercise[] = records.map((r) => ({
      ...r,
      durationSeconds: r.durationSeconds ?? 0,
    }));

    set({
      monthly: processed,
      loading: false,
    });
  },
}));
