import "server-only";

import { createClient } from "@/lib/supabase/server";
import { assertRow, assertArray } from "./helpers";
import type { IdeaRow, IdeaStatus } from "./types";

export async function createIdeaForUser(input: {
  userId: string;
  ideaDate: string;
  content: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("ideas").insert({
    user_id: input.userId,
    idea_date: input.ideaDate,
    content: input.content,
    status: "to_review",
  });

  if (error) {
    throw error;
  }
}

export async function updateIdeaForUser(input: {
  userId: string;
  ideaId: string;
  ideaDate: string;
  content: string;
  status: IdeaStatus;
  solutionNote: string | null;
  updatedAt: Date;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("ideas")
    .update({
      idea_date: input.ideaDate,
      content: input.content,
      status: input.status,
      solution_note: input.solutionNote,
      updated_at: input.updatedAt.toISOString(),
    })
    .eq("id", input.ideaId)
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (error) {
    throw error;
  }
}

export async function getIdeaForConversionForUser(userId: string, ideaId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ideas")
    .select("id,content,status")
    .eq("id", ideaId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .returns<Pick<IdeaRow, "id" | "content" | "status">>()
    .maybeSingle();
  const row = assertRow(data as Pick<IdeaRow, "id" | "content" | "status"> | null, error);

  return row
    ? {
        id: row.id,
        content: row.content,
        status: row.status,
      }
    : null;
}

export async function markIdeaConvertedToTaskForUser(input: {
  userId: string;
  ideaId: string;
  taskId: string;
  updatedAt: Date;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ideas")
    .update({
      status: "converted_to_task",
      converted_task_id: input.taskId,
      converted_to_type: "task",
      converted_to_id: input.taskId,
      updated_at: input.updatedAt.toISOString(),
    })
    .eq("id", input.ideaId)
    .eq("user_id", input.userId)
    .eq("status", "to_review")
    .is("deleted_at", null)
    .select("id")
    .returns<{ id: string }>()
    .maybeSingle();
  const row = assertRow(data as { id: string } | null, error);

  if (!row) {
    throw new Error("Idea is not available for conversion.");
  }
}

export async function softDeleteIdeaForUser(input: {
  userId: string;
  ideaId: string;
  deletedAt: Date;
}) {
  const deletedAtIso = input.deletedAt.toISOString();
  const supabase = await createClient();
  const { error } = await supabase
    .from("ideas")
    .update({
      deleted_at: deletedAtIso,
      updated_at: deletedAtIso,
    })
    .eq("id", input.ideaId)
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (error) {
    throw error;
  }
}

export async function updateIdeaPinnedForUser(input: {
  userId: string;
  ideaId: string;
  isPinned: boolean;
  updatedAt: Date;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("ideas")
    .update({
      is_pinned: input.isPinned,
      updated_at: input.updatedAt.toISOString(),
    })
    .eq("id", input.ideaId)
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (error) {
    throw error;
  }
}

export async function getTodayIdeasForUser(userId: string, todayDate: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ideas")
    .select("id,content,idea_date,status,solution_note,is_pinned,created_at")
    .eq("user_id", userId)
    .eq("idea_date", todayDate)
    .is("deleted_at", null)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .returns<IdeaRow[]>();

  return assertArray(data, error).map((row) => ({
    id: row.id,
    content: row.content,
    ideaDate: row.idea_date,
    status: row.status,
    solutionNote: row.solution_note,
    isPinned: row.is_pinned,
    createdAt: new Date(row.created_at),
  }));
}

export async function getRecentIdeasForUser(userId: string, limit: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ideas")
    .select("id,content,idea_date,status,created_at")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<IdeaRow[]>();

  return assertArray(data, error).map((row) => ({
    id: row.id,
    content: row.content,
    ideaDate: row.idea_date,
    status: row.status,
    createdAt: new Date(row.created_at),
  }));
}

export async function getIdeaDetailForUser(userId: string, id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ideas")
    .select("content,idea_date,status,solution_note,converted_task_id,created_at,updated_at")
    .eq("id", id)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .returns<IdeaRow>()
    .maybeSingle();
  const row = assertRow(data as IdeaRow | null, error);

  return row
    ? {
        content: row.content,
        ideaDate: row.idea_date,
        status: row.status,
        solutionNote: row.solution_note,
        convertedTaskId: row.converted_task_id,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      }
    : null;
}

export async function getChecklistIdeasForUser(
  userId: string,
  dateFrom: string,
  dateTo: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ideas")
    .select("id,content,idea_date,status,is_pinned,created_at")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .gte("idea_date", dateFrom)
    .lte("idea_date", dateTo)
    .order("is_pinned", { ascending: false })
    .order("idea_date", { ascending: false })
    .order("created_at", { ascending: false })
    .returns<IdeaRow[]>();

  return assertArray(data, error).map((row) => ({
    id: row.id,
    content: row.content,
    ideaDate: row.idea_date,
    status: row.status,
    isPinned: row.is_pinned,
    createdAt: new Date(row.created_at),
  }));
}
