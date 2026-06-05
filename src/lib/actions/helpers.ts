import { getBeijingDateValue } from "@/lib/date";

export function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function getStringValues(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function getValidTaskDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : getBeijingDateValue();
}

export function isValidDateValue(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isDateAfter(value: string, baseline: string) {
  return new Date(`${value}T00:00:00+08:00`).getTime() > new Date(`${baseline}T00:00:00+08:00`).getTime();
}

export function isValidTimeValue(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value);
}

export function normalizeTimeValue(value: string): string {
  const match = value.match(/^([01]\d|2[0-3]):[0-5]\d/);
  return match ? match[0] : value;
}

export function getTagsValue(value: string) {
  return value
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export function isAiAnalysisPermission(
  value: string,
): value is "none" | "summary_only" | "allow_original" {
  return value === "none" || value === "summary_only" || value === "allow_original";
}

export function isIdeaStatus(
  value: string,
): value is "to_review" | "converted_to_task" | "shelved" | "abandoned" {
  return value === "to_review" || value === "converted_to_task" || value === "shelved" || value === "abandoned";
}

export function getPinnedValue(formData: FormData) {
  return getStringValue(formData, "isPinned") === "true";
}
