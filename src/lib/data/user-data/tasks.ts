import { createClient } from "@/lib/supabase/server";
import type { TaskCategory, TaskStatus } from "@/lib/tasks/options";
import { assertRow, assertArray } from "./helpers";
import type { TaskRow, TodayTask } from "./types";

function mapTodayTask(row: TaskRow): TodayTask {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    status: row.status,
    taskDate: row.task_date,
    isPostponed: row.is_postponed,
    postponedFromDate: row.postponed_from_date,
    postponedToDate: row.postponed_to_date,
    reviewNote: row.review_note,
    isPinned: row.is_pinned,
    createdAt: new Date(row.created_at),
  };
}

export async function createTaskForUser(input: {
  userId: string;
  title: string;
  category: TaskCategory;
  status: TaskStatus;
  taskDate: string;
  completedAt: Date | null;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: input.userId,
      title: input.title,
      category: input.category,
      status: input.status,
      task_date: input.taskDate,
      completed_at: input.completedAt?.toISOString() ?? null,
    })
    .select("id")
    .returns<{ id: string }>()
    .single();

  const row = data as { id: string } | null;

  if (error || !row) {
    throw error ?? new Error("Task was not created.");
  }

  return { id: row.id };
}

export async function getTaskDateForUser(userId: string, taskId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("task_date")
    .eq("id", taskId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .returns<{ task_date: string }>()
    .maybeSingle();
  const row = assertRow(data as { task_date: string } | null, error);

  return row ? { taskDate: row.task_date } : null;
}

export async function updateTaskStatusForUser(input: {
  userId: string;
  taskId: string;
  status: TaskStatus;
  completedAt: Date | null;
  updatedAt: Date;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({
      status: input.status,
      completed_at: input.completedAt?.toISOString() ?? null,
      updated_at: input.updatedAt.toISOString(),
    })
    .eq("id", input.taskId)
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (error) {
    throw error;
  }
}

export async function postponeTaskForUser(input: {
  userId: string;
  taskId: string;
  postponedFromDate: string;
  postponedToDate: string | null;
  updatedAt: Date;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({
      status: "postponed",
      is_postponed: true,
      postponed_from_date: input.postponedFromDate,
      postponed_to_date: input.postponedToDate,
      updated_at: input.updatedAt.toISOString(),
    })
    .eq("id", input.taskId)
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (error) {
    throw error;
  }
}

export async function updateTaskForUser(input: {
  userId: string;
  taskId: string;
  title: string;
  description: string | null;
  category: TaskCategory;
  status: TaskStatus;
  taskDate: string;
  reviewNote: string | null;
  completedAt: Date | null;
  updatedAt: Date;
}) {
  const supabase = await createClient();
  const updatePayload: Partial<TaskRow> = {
    title: input.title,
    description: input.description,
    category: input.category,
    status: input.status,
    task_date: input.taskDate,
    review_note: input.reviewNote,
    completed_at: input.completedAt?.toISOString() ?? null,
    updated_at: input.updatedAt.toISOString(),
  };

  if (input.status === "postponed") {
    updatePayload.is_postponed = true;
    updatePayload.postponed_to_date = input.taskDate;
  }

  const { error } = await supabase
    .from("tasks")
    .update(updatePayload)
    .eq("id", input.taskId)
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (error) {
    throw error;
  }
}

export async function softDeleteTaskForUser(input: {
  userId: string;
  taskId: string;
  deletedAt: Date;
}) {
  const deletedAtIso = input.deletedAt.toISOString();
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({
      deleted_at: deletedAtIso,
      updated_at: deletedAtIso,
    })
    .eq("id", input.taskId)
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (error) {
    throw error;
  }
}

export async function updateTaskPinnedForUser(input: {
  userId: string;
  taskId: string;
  isPinned: boolean;
  updatedAt: Date;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({
      is_pinned: input.isPinned,
      updated_at: input.updatedAt.toISOString(),
    })
    .eq("id", input.taskId)
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (error) {
    throw error;
  }
}

export async function getTodayTasksForUser(userId: string, todayDate: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("id,title,description,category,status,task_date,is_postponed,postponed_from_date,postponed_to_date,review_note,is_pinned,created_at")
    .eq("user_id", userId)
    .eq("task_date", todayDate)
    .is("deleted_at", null)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: true })
    .returns<TaskRow[]>();

  return assertArray(data, error).map(mapTodayTask);
}

export async function getTasksForUser(userId: string, date?: string, status?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("tasks")
    .select("id,title,description,category,status,task_date,is_postponed,postponed_from_date,postponed_to_date,review_note,is_pinned,created_at")
    .eq("user_id", userId)
    .is("deleted_at", null);

  if (date) {
    query = query.eq("task_date", date);
  }
  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query
    .order("is_pinned", { ascending: false })
    .order("task_date", { ascending: false })
    .order("created_at", { ascending: true })
    .returns<TaskRow[]>();

  return assertArray(data, error).map(mapTodayTask);
}

export async function getRecentTasksForUser(userId: string, limit: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("id,title,category,status,task_date,is_postponed,created_at")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<TaskRow[]>();

  return assertArray(data, error).map((row) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    status: row.status,
    taskDate: row.task_date,
    isPostponed: row.is_postponed,
    createdAt: new Date(row.created_at),
  }));
}

export async function getTaskDetailForUser(userId: string, id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("title,description,category,status,task_date,is_postponed,postponed_from_date,postponed_to_date,review_note,completed_at,created_at,updated_at")
    .eq("id", id)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .returns<TaskRow>()
    .maybeSingle();
  const row = assertRow(data as TaskRow | null, error);

  return row
    ? {
        title: row.title,
        description: row.description,
        category: row.category,
        status: row.status,
        taskDate: row.task_date,
        isPostponed: row.is_postponed,
        postponedFromDate: row.postponed_from_date,
        postponedToDate: row.postponed_to_date,
        reviewNote: row.review_note,
        completedAt: row.completed_at ? new Date(row.completed_at) : null,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      }
    : null;
}

export async function getChecklistTasksForUser(
  userId: string,
  dateFrom: string,
  dateTo: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("id,title,category,status,task_date,is_postponed,postponed_to_date,is_pinned,created_at")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .gte("task_date", dateFrom)
    .lte("task_date", dateTo)
    .order("is_pinned", { ascending: false })
    .order("task_date", { ascending: true })
    .order("created_at", { ascending: true })
    .returns<TaskRow[]>();

  return assertArray(data, error).map((row) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    status: row.status,
    taskDate: row.task_date,
    isPostponed: row.is_postponed,
    postponedToDate: row.postponed_to_date,
    isPinned: row.is_pinned,
    createdAt: new Date(row.created_at),
  }));
}

export async function getPostponedTasksForUser(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("id,title,category,status,task_date,is_postponed,postponed_to_date,is_pinned,created_at")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .eq("is_postponed", true)
    .neq("status", "completed")
    .order("postponed_to_date", { ascending: true })
    .order("created_at", { ascending: true })
    .returns<TaskRow[]>();

  return assertArray(data, error).map((row) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    status: row.status,
    taskDate: row.task_date,
    isPostponed: row.is_postponed,
    postponedToDate: row.postponed_to_date ?? null,
    isPinned: row.is_pinned,
    createdAt: new Date(row.created_at),
  }));
}
