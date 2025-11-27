export type SleepData = {
  duration: string;
  startTime?: string;
  endTime?: string;
  label?: string;
  quality?: string;
  qualityScore?: number;
};

export type ExerciseData = {
  type: string;
  duration: string;
  calories: number;
};
