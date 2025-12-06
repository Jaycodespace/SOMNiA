import { readRecords } from "react-native-health-connect";

export type StepEntry = {
  date: Date;
  steps: number;
};

export async function getSteps(start: Date, end: Date): Promise<StepEntry[]> {
  const result = await readRecords("Steps", {
    timeRangeFilter: {
      operator: "between",
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    },
  });

  // Aggregate steps per day
  const map = new Map<string, number>();

  result.records.forEach((rec) => {
    const d = new Date(rec.startTime);
    const key = d.toISOString().split("T")[0]; // YYYY-MM-DD

    const steps = rec.count ?? 0;

    if (!map.has(key)) map.set(key, steps);
    else map.set(key, (map.get(key) ?? 0) + steps);
  });

  // Convert to array
  return Array.from(map.entries()).map(([day, steps]) => ({
    date: new Date(day),
    steps,
  }));
}
