import { ExerciseType, readRecords } from "react-native-health-connect";

export type ExerciseSession = {
  start: Date;
  end: Date;
  exerciseType: number;
  exerciseName: string;

  durationMinutes: number;
  durationSeconds: number;

  calories?: number;
};

// Convert ExerciseType to readable names
const exerciseTypeMap: Record<number, string> =
  Object.fromEntries(
    Object.entries(ExerciseType).map(([k, v]) => [v, k])
  );

function formatExerciseName(name: string): string {
  return name.replace(/_/g, " "); // "Biking_Stationary" → "Biking Stationary"
}

export async function getExerciseSessions(start: Date, end: Date): Promise<ExerciseSession[]> {
  const result = await readRecords("ExerciseSession", {
    timeRangeFilter: {
      operator: "between",
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    },
  });

  return result.records.map((rec) => {
    const startTime = new Date(rec.startTime);
    const endTime = new Date(rec.endTime);

    // Raw duration in milliseconds
    const diffMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = Math.floor(diffMs / 60000);
    const durationSeconds = Math.floor((diffMs % 60000) / 1000);

    const exerciseType = rec.exerciseType;
    const rawName = exerciseTypeMap[exerciseType] ?? "OTHER_WORKOUT";
    const exerciseName = formatExerciseName(rawName);

    // calories burned (if available)
    const calories = undefined;

    return {
      start: startTime,
      end: endTime,
      durationMinutes,
      durationSeconds,
      exerciseType,
      exerciseName,
      calories,
    };
  });
}
