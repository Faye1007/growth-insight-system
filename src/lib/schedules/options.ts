export const scheduleRecurrences = [
  { value: "none", label: "不循环" },
  { value: "daily", label: "每天" },
  { value: "weekly", label: "每周" },
  { value: "monthly", label: "每月" },
] as const;

export type ScheduleRecurrence = (typeof scheduleRecurrences)[number]["value"];

export function getScheduleRecurrenceLabel(value: ScheduleRecurrence) {
  return scheduleRecurrences.find((item) => item.value === value)?.label ?? "不循环";
}

export function isScheduleRecurrence(value: string): value is ScheduleRecurrence {
  return scheduleRecurrences.some((item) => item.value === value);
}

function toBeijingMs(dateStr: string) {
  return new Date(`${dateStr}T00:00:00+08:00`).getTime();
}

function daysBetween(start: string, end: string) {
  return Math.floor((toBeijingMs(end) - toBeijingMs(start)) / (24 * 60 * 60 * 1000));
}

export function scheduleOccursOnDate(
  startDate: string,
  endDate: string | null,
  recurrence: ScheduleRecurrence,
  date: string,
) {
  if (toBeijingMs(startDate) > toBeijingMs(date)) return false;
  if (endDate && toBeijingMs(endDate) < toBeijingMs(date)) return false;

  if (recurrence === "none") return startDate === date;
  if (recurrence === "daily") return true;

  if (recurrence === "weekly") return daysBetween(startDate, date) % 7 === 0;

  const start = new Date(`${startDate}T00:00:00+08:00`);
  const target = new Date(`${date}T00:00:00+08:00`);
  return start.getDate() === target.getDate();
}
