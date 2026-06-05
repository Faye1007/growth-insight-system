import { createClient } from "@/lib/supabase/server";
import { scheduleOccursOnDate } from "@/lib/schedules/options";
import { assertRow, assertArray, getDateTime } from "./helpers";
import type {
  ScheduleItemRow,
} from "./types";

export async function createScheduleItemForUser(input: {
  userId: string;
  title: string;
  category: string;
  startDate: string;
  endDate: string | null;
  recurrence: string;
  startTime: string;
  endTime: string | null;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("schedule_items").insert({
    user_id: input.userId,
    title: input.title,
    category: input.category,
    start_date: input.startDate,
    end_date: input.endDate,
    recurrence: input.recurrence,
    start_time: input.startTime,
    end_time: input.endTime,
  });

  if (error) {
    throw error;
  }
}

export async function updateScheduleItemForUser(input: {
  userId: string;
  scheduleId: string;
  title: string;
  description: string | null;
  category: string;
  startDate: string;
  endDate: string | null;
  recurrence: string;
  startTime: string;
  endTime: string | null;
  updatedAt: Date;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("schedule_items")
    .update({
      title: input.title,
      description: input.description,
      category: input.category,
      start_date: input.startDate,
      end_date: input.endDate,
      recurrence: input.recurrence,
      start_time: input.startTime,
      end_time: input.endTime,
      updated_at: input.updatedAt.toISOString(),
    })
    .eq("id", input.scheduleId)
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (error) {
    throw error;
  }
}

export async function softDeleteScheduleItemForUser(input: {
  userId: string;
  scheduleId: string;
  deletedAt: Date;
}) {
  const deletedAtIso = input.deletedAt.toISOString();
  const supabase = await createClient();
  const { error } = await supabase
    .from("schedule_items")
    .update({
      deleted_at: deletedAtIso,
      updated_at: deletedAtIso,
    })
    .eq("id", input.scheduleId)
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (error) {
    throw error;
  }
}

export async function updateSchedulePinnedForUser(input: {
  userId: string;
  scheduleId: string;
  isPinned: boolean;
  updatedAt: Date;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("schedule_items")
    .update({
      is_pinned: input.isPinned,
      updated_at: input.updatedAt.toISOString(),
    })
    .eq("id", input.scheduleId)
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (error) {
    throw error;
  }
}

export async function upsertScheduleCompletionForUser(input: {
  userId: string;
  scheduleId: string;
  completionDate: string;
  updatedAt: Date;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("schedule_completions")
    .upsert(
      {
        schedule_id: input.scheduleId,
        user_id: input.userId,
        completion_date: input.completionDate,
        updated_at: input.updatedAt.toISOString(),
      },
      { onConflict: "schedule_id,completion_date" },
    )
    .eq("user_id", input.userId);

  if (error) {
    throw error;
  }
}

export async function deleteScheduleCompletionForUser(input: {
  userId: string;
  scheduleId: string;
  completionDate: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("schedule_completions")
    .delete()
    .eq("schedule_id", input.scheduleId)
    .eq("user_id", input.userId)
    .eq("completion_date", input.completionDate);

  if (error) {
    throw error;
  }
}

export async function getScheduleCompletionsForUser(
  userId: string,
  scheduleIds: string[],
  dateFrom: string,
  dateTo: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schedule_completions")
    .select("schedule_id,completion_date")
    .eq("user_id", userId)
    .in("schedule_id", scheduleIds)
    .gte("completion_date", dateFrom)
    .lte("completion_date", dateTo)
    .returns<{ schedule_id: string; completion_date: string }[]>();

  const result = new Map<string, Set<string>>();
  for (const row of assertArray(data, error)) {
    if (!result.has(row.schedule_id)) {
      result.set(row.schedule_id, new Set());
    }
    result.get(row.schedule_id)!.add(row.completion_date);
  }
  return result;
}

export async function getTodayScheduleItemsForUser(
  userId: string,
  todayDate: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schedule_items")
    .select("id,title,description,category,start_date,end_date,recurrence,start_time,end_time,is_pinned,created_at")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .lte("start_date", todayDate)
    .order("is_pinned", { ascending: false })
    .order("start_time", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true })
    .returns<ScheduleItemRow[]>();

  return assertArray(data, error)
    .filter((row) => scheduleOccursOnDate(row.start_date, row.end_date, row.recurrence, todayDate))
    .map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      startDate: row.start_date,
      endDate: row.end_date,
      recurrence: row.recurrence,
      startTime: row.start_time,
      endTime: row.end_time,
      isPinned: row.is_pinned,
      createdAt: new Date(row.created_at),
    }));
}

export async function getRecentScheduleItemsForUser(
  userId: string,
  limit: number,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schedule_items")
    .select("id,title,category,start_date,start_time,end_time,is_completed,created_at")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<ScheduleItemRow[]>();

  return assertArray(data, error).map((row) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    startDate: row.start_date,
    startTime: row.start_time,
    endTime: row.end_time,
    isCompleted: row.is_completed,
    createdAt: new Date(row.created_at),
  }));
}

export async function getScheduleDetailForUser(userId: string, id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schedule_items")
    .select("title,description,category,start_date,end_date,recurrence,start_time,end_time,created_at,updated_at")
    .eq("id", id)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .returns<ScheduleItemRow>()
    .maybeSingle();
  const row = assertRow(data as ScheduleItemRow | null, error);

  return row
    ? {
        title: row.title,
        description: row.description,
        category: row.category,
        startDate: row.start_date,
        endDate: row.end_date,
        recurrence: row.recurrence,
        startTime: row.start_time,
        endTime: row.end_time,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      }
    : null;
}

export async function getChecklistSchedulesForUser(
  userId: string,
  dateFrom: string,
  dateTo: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schedule_items")
    .select("id,title,category,start_date,end_date,recurrence,start_time,end_time,is_pinned,created_at")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .lte("start_date", dateTo)
    .order("is_pinned", { ascending: false })
    .order("start_date", { ascending: true })
    .order("start_time", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true })
    .returns<ScheduleItemRow[]>();

  return assertArray(data, error)
    .filter((row) => {
      const startDate = row.start_date;
      const endDate = row.end_date;
      if (getDateTime(startDate) > getDateTime(dateTo)) return false;
      if (endDate && getDateTime(endDate) < getDateTime(dateFrom)) return false;
      if (row.recurrence === "none") {
        return startDate >= dateFrom && startDate <= dateTo;
      }
      return true;
    })
    .map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      startDate: row.start_date,
      endDate: row.end_date,
      recurrence: row.recurrence,
      startTime: row.start_time,
      endTime: row.end_time,
      isPinned: row.is_pinned,
      createdAt: new Date(row.created_at),
    }));
}
