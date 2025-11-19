import { SleepSession } from "./fetch";

export function classifySleep(session: SleepSession): { isNap: boolean } {
  const durationHours = (session.end.getTime() - session.start.getTime()) / 36e5;

  const startHour = session.start.getHours();

  const isNap =
    durationHours < 3 ||
    (startHour >= 10 && startHour <= 18);

  return { isNap };
}
