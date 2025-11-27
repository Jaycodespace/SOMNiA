import { readRecords } from "react-native-health-connect";

export type HeartRateSample = {
  bpm: number;
  time: Date;
};

export type RestingHeartRateSample = {
  bpm: number;
  time: Date;
};

/** Fetch Heart Rate Samples between time window */
export async function getHeartRateSamples(
  start: Date,
  end: Date
): Promise<HeartRateSample[]> {
  const result = await readRecords("HeartRate", {
    timeRangeFilter: {
      operator: "between",
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    },
  });

  const samples: HeartRateSample[] = [];

  for (const rec of result.records as any[]) {
    // rec.samples likely looks like: [{ count: number, time: string }]
    if (!rec.samples) continue;

    for (const s of rec.samples) {
      samples.push({
        bpm: s.count, // <-- correct for your library version
        time: new Date(s.time),
      });
    }
  }

  return samples.sort((a, b) => b.time.getTime() - a.time.getTime());
}

/** Fetch Resting Heart Rate Samples */
export async function getRestingHeartRateSamples(
  start: Date,
  end: Date
): Promise<RestingHeartRateSample[]> {
  const result = await readRecords("RestingHeartRate", {
    timeRangeFilter: {
      operator: "between",
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    },
  });

  return (result.records as any[]).map((r) => ({
    bpm: r.count,            // <-- correct field name for your version
    time: new Date(r.startTime), // <-- correct field name
  }));
}
