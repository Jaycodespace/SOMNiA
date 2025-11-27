import { SleepSession } from "./fetch";

// Helper: linear range mapping
function mapRange(value: number, min: number, max: number) {
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

export function computeSleepQuality(session: SleepSession, isNap: boolean): number {
  const durationH = (session.end.getTime() - session.start.getTime()) / 36e5;


  // NAP SCORING (Research-based)

  if (isNap) {
    let durationScore = 0;

    if (durationH < 0.17) {
      // < 10 minutes
      durationScore = 0.4;
    } else if (durationH >= 0.33 && durationH <= 0.5) {
      // 20–30 min: optimal nap duration
      durationScore = 1.0;
    } else if (durationH >= 0.9 && durationH <= 1.6) {
      // Full sleep cycle (~90 min)
      durationScore = 0.9;
    } else if (durationH >= 0.5 && durationH <= 1) {
      // Sleep inertia zone
      durationScore = mapRange(durationH, 0.5, 1) * 0.7;
    } else if (durationH > 2) {
      // Too long
      durationScore = 0.3;
    } else {
      durationScore = mapRange(durationH, 0.17, 1.5);
    }

    // Sleep inertia penalties
    let penalty = 0;
    if (durationH >= 0.5 && durationH < 1) penalty = 0.2;
    else if (durationH >= 1 && durationH < 1.5) penalty = 0.3;
    else if (durationH >= 1.5) penalty = 0.4;

    const finalScore = Math.max(0, Math.min(1, durationScore - penalty));
    return finalScore;
  }

  // NIGHT SLEEP SCORING

  // 1. Duration Score (40%)
  const recommendedMin = 7;
  const recommendedMax = 9;

  let durationScore = 1;
  if (durationH < recommendedMin) durationScore = durationH / recommendedMin;
  else if (durationH > recommendedMax) durationScore = recommendedMax / durationH;

  // 2. Efficiency Score (40%)
  // If Health Connect provides stages:
  const awakeSeconds = session.awakeSeconds ?? 0;
  const totalSeconds = (session.end.getTime() - session.start.getTime()) / 1000;
  const efficiency = 1 - awakeSeconds / totalSeconds;

  const efficiencyScore =
    efficiency >= 0.95 ? 1 :
    efficiency >= 0.9  ? 0.9 :
    efficiency >= 0.85 ? 0.8 :
    efficiency >= 0.8  ? 0.7 :
    0.6;

  // 3. Fragmentation Score (20%)
  const awakenings = session.awakenings ?? 0;

  const fragmentationScore =
    awakenings <= 2 ? 1 :
    awakenings <= 4 ? 0.8 :
    awakenings <= 6 ? 0.6 :
    0.4;

  // Weighted model
  return (
    durationScore * 0.4 +
    efficiencyScore * 0.4 +
    fragmentationScore * 0.2
  );
}
