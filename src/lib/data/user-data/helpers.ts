import { createClient } from "@/lib/supabase/server";

export function toDate(value: string | null | undefined) {
  return value ? new Date(value) : null;
}

export function getDateTime(value: string) {
  return new Date(`${value}T00:00:00+08:00`).getTime();
}

export function getDaysBetween(start: string, end: string) {
  return Math.floor((getDateTime(end) - getDateTime(start)) / (24 * 60 * 60 * 1000));
}

export function assertArray<T>(data: T[] | null, error: unknown) {
  if (error) {
    throw error;
  }

  return data ?? [];
}

export function assertRow<T>(data: T | null, error: unknown) {
  if (error) {
    throw error;
  }

  return data ?? null;
}

export function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }

  if (typeof value !== "string") {
    return [];
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    }
  } catch {
    // Older imports may store a plain string instead of a JSON array.
  }

  return [trimmed];
}

export async function assertAnniversaryBelongsToUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  anniversaryId: string | null,
) {
  if (!anniversaryId) {
    return;
  }

  const { data, error } = await supabase
    .from("anniversaries")
    .select("id")
    .eq("id", anniversaryId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) {
    throw error ?? new Error("Anniversary does not belong to the current user.");
  }
}
