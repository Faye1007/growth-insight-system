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
