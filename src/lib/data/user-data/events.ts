import { createClient } from "@/lib/supabase/server";
import { assertRow, assertArray, normalizeStringArray } from "./helpers";
import type { AiAnalysisPermission, LifeEventRow, TodayLifeEvent, RecentLifeEventRecord, EventDetail, LifeEventRecord } from "./types";

export async function createLifeEventForUser(input: {
  userId: string;
  eventDate: string;
  content: string;
  emotionTags: string[];
  tags: string[];
  aiAnalysisPermission: AiAnalysisPermission;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("life_events").insert({
    user_id: input.userId,
    event_date: input.eventDate,
    content: input.content,
    emotion_tags: input.emotionTags,
    tags: input.tags,
    ai_analysis_permission: input.aiAnalysisPermission,
  });

  if (error) {
    throw error;
  }
}

export async function updateLifeEventForUser(input: {
  userId: string;
  eventId: string;
  eventDate: string;
  content: string;
  emotionTags: string[];
  tags: string[];
  specificEvent: string | null;
  nextAction: string | null;
  aiAnalysisPermission: AiAnalysisPermission;
  summary: string | null;
  updatedAt: Date;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("life_events")
    .update({
      event_date: input.eventDate,
      content: input.content,
      emotion_tags: input.emotionTags,
      tags: input.tags,
      specific_event: input.specificEvent,
      next_action: input.nextAction,
      ai_analysis_permission: input.aiAnalysisPermission,
      summary: input.summary,
      updated_at: input.updatedAt.toISOString(),
    })
    .eq("id", input.eventId)
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (error) {
    throw error;
  }
}

export async function softDeleteLifeEventForUser(input: {
  userId: string;
  eventId: string;
  deletedAt: Date;
}) {
  const deletedAtIso = input.deletedAt.toISOString();
  const supabase = await createClient();
  const { error } = await supabase
    .from("life_events")
    .update({
      deleted_at: deletedAtIso,
      updated_at: deletedAtIso,
    })
    .eq("id", input.eventId)
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (error) {
    throw error;
  }
}

export async function updateLifeEventPinnedForUser(input: {
  userId: string;
  eventId: string;
  isPinned: boolean;
  updatedAt: Date;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("life_events")
    .update({
      is_pinned: input.isPinned,
      updated_at: input.updatedAt.toISOString(),
    })
    .eq("id", input.eventId)
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (error) {
    throw error;
  }
}

export async function getTodayLifeEventsForUser(
  userId: string,
  todayDate: string,
): Promise<TodayLifeEvent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("life_events")
    .select("id,content,event_date,emotion_tags,tags,specific_event,next_action,ai_analysis_permission,summary,is_pinned,created_at")
    .eq("user_id", userId)
    .eq("event_date", todayDate)
    .is("deleted_at", null)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .returns<LifeEventRow[]>();

  return assertArray(data, error).map((row) => ({
    id: row.id,
    content: row.content,
    eventDate: row.event_date,
    emotionTags: normalizeStringArray(row.emotion_tags),
    tags: normalizeStringArray(row.tags),
    specificEvent: row.specific_event,
    nextAction: row.next_action,
    aiAnalysisPermission: row.ai_analysis_permission,
    summary: row.summary,
    isPinned: row.is_pinned,
    createdAt: new Date(row.created_at),
  }));
}

export async function getRecentLifeEventsForUser(
  userId: string,
  limit: number,
): Promise<RecentLifeEventRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("life_events")
    .select("id,content,event_date,emotion_tags,tags,created_at")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<LifeEventRow[]>();

  return assertArray(data, error).map((row) => ({
    id: row.id,
    content: row.content,
    eventDate: row.event_date,
    emotionTags: normalizeStringArray(row.emotion_tags),
    tags: normalizeStringArray(row.tags),
    createdAt: new Date(row.created_at),
  }));
}

export async function getEventDetailForUser(
  userId: string,
  id: string,
): Promise<EventDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("life_events")
    .select("content,event_date,emotion_tags,tags,specific_event,next_action,ai_analysis_permission,summary,created_at,updated_at")
    .eq("id", id)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .returns<LifeEventRow>()
    .maybeSingle();
  const row = assertRow(data as LifeEventRow | null, error);

  return row
    ? {
        content: row.content,
        eventDate: row.event_date,
        emotionTags: normalizeStringArray(row.emotion_tags),
        tags: normalizeStringArray(row.tags),
        specificEvent: row.specific_event,
        nextAction: row.next_action,
        aiAnalysisPermission: row.ai_analysis_permission,
        summary: row.summary,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      }
    : null;
}

export async function getLifeEventsForUser(
  userId: string,
  dateFrom: string,
  dateTo: string,
): Promise<LifeEventRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("life_events")
    .select("id,content,event_date,emotion_tags,tags,ai_analysis_permission,summary,is_pinned,created_at")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .gte("event_date", dateFrom)
    .lte("event_date", dateTo)
    .order("is_pinned", { ascending: false })
    .order("event_date", { ascending: false })
    .order("created_at", { ascending: false })
    .returns<LifeEventRow[]>();

  return assertArray(data, error).map((row) => ({
    id: row.id,
    content: row.content,
    eventDate: row.event_date,
    emotionTags: normalizeStringArray(row.emotion_tags),
    tags: normalizeStringArray(row.tags),
    aiAnalysisPermission: row.ai_analysis_permission,
    summary: row.summary,
    isPinned: row.is_pinned,
    createdAt: new Date(row.created_at),
  }));
}
