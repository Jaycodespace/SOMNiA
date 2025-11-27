import { readRecords } from "react-native-health-connect";

export type SpO2Record = {
  timestamp: Date;
  percentage: number;
};

export async function getSpO2Records(start: Date, end: Date): Promise<SpO2Record[]> {
  const result = await readRecords("OxygenSaturation", {
    timeRangeFilter: {
      operator: "between",
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    },
  });

  return result.records.map((rec) => ({
    timestamp: new Date(rec.time),
    percentage: rec.percentage, // Already 0–1 float
  }));
}
