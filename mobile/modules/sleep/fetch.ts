import { readRecords } from "react-native-health-connect";

export type SleepSession = {
  start: Date;
  end: Date;
  title?: string;

  awakeSeconds?: number;
  awakenings?: number;
};

// Uncomment this for testing
// const now = new Date();

// const startOfYesterday = new Date();
// startOfYesterday.setDate(now.getDate() - 2);
// startOfYesterday.setHours(0, 0, 0, 0);

// const endOfYesterday = new Date();
// endOfYesterday.setDate(now.getDate() - 2);
// endOfYesterday.setHours(23, 59, 59, 999);

export async function getSleepSessions(start: Date, end: Date): Promise<SleepSession[]> {
  const result = await readRecords("SleepSession", {
    timeRangeFilter: {
      operator: "between",
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      
    // Uncomment for testing
    //   startTime: startOfYesterday.toISOString(),
    //   endTime: endOfYesterday.toISOString(),
    },
  });

  return result.records.map((rec) => ({
    start: new Date(rec.startTime),
    end: new Date(rec.endTime),
    title: rec.title,
  }));
}
