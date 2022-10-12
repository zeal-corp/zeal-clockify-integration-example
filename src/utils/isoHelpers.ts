import { TimeEntryException } from "./exceptions";

export function parseHourlyShift(duration: string) {
  if (duration.slice(0, 2) !== "PT")
    throw new TimeEntryException(
      "Time Entry duration should not be longer than 24hrs."
    );
  let hourlyShift = 0.0;

  let sliceStart = 2;
  for (let i = 2; i < duration.length; i++) {
    const char = duration[i];

    if (char === "H") {
      const hours = parseFloat(duration.slice(sliceStart, i));
      hourlyShift += hours;
      sliceStart = i + 1;
    } else if (char === "M") {
      const minutes = parseFloat(duration.slice(sliceStart, i));
      const hours = minutes / 60;
      hourlyShift += hours;
      sliceStart = i + 1;
    } else if (char === "S") {
      const seconds = parseFloat(duration.slice(sliceStart, i));
      const hours = seconds / 3600;
      hourlyShift += hours;
    }
  }

  const hours = parseFloat(hourlyShift.toFixed(2));

  if (!hours)
    throw new TimeEntryException(
      "Time Entry duration must be at least 18 seconds."
    );

  return hours;
}

export function adjustDateBy(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function stripTimestamp(date: string): string {
  if (date[10] !== "T")
    throw new Error(
      "ISO duration is improperly formatted. Please format as YYYY-MM-DD'T'HH:MM:SS"
    );
  return date.slice(0, 10);
}
