import { createClient } from "@/lib/supabase/server";
import { assertRow, assertArray, toDate } from "./helpers";
import type { InsightReportRow, ReviewReport, ExportReviewReport } from "./types";

export async function getCompletedDailyReviewReportIdForUser(
  userId: string,
  date: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("insight_reports")
    .select("id")
    .eq("user_id", userId)
    .eq("report_type", "daily")
    .eq("period_start", date)
    .eq("period_end", date)
    .eq("generation_status", "completed")
    .returns<{ id: string }>()
    .maybeSingle();
  const row = assertRow(data as { id: string } | null, error);

  return row ? { id: row.id } : null;
}

export async function getCompletedWeeklyReviewReportIdForUser(
  userId: string,
  weekStart: string,
  weekEnd: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("insight_reports")
    .select("id")
    .eq("user_id", userId)
    .eq("report_type", "weekly")
    .eq("period_start", weekStart)
    .eq("period_end", weekEnd)
    .eq("generation_status", "completed")
    .returns<{ id: string }>()
    .maybeSingle();
  const row = assertRow(data as { id: string } | null, error);

  return row ? { id: row.id } : null;
}

export async function getCompletedMonthlyReviewReportIdForUser(
  userId: string,
  monthStart: string,
  monthEnd: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("insight_reports")
    .select("id")
    .eq("user_id", userId)
    .eq("report_type", "monthly")
    .eq("period_start", monthStart)
    .eq("period_end", monthEnd)
    .eq("generation_status", "completed")
    .returns<{ id: string }>()
    .maybeSingle();
  const row = assertRow(data as { id: string } | null, error);

  return row ? { id: row.id } : null;
}

export async function upsertDailyReviewReportForUser(input: {
  userId: string;
  date: string;
  title: string;
  summary: string;
  patterns: string[];
  suggestions: string[];
  nextActions: string[];
  sourceStats: Record<string, unknown>;
  sourceHighlights: string[];
  selectedOriginalEventIds: string[];
  modelProvider: string;
  modelName: string;
  generatedAt: Date;
}) {
  const supabase = await createClient();
  const nowIso = input.generatedAt.toISOString();
  const { error } = await supabase.from("insight_reports").upsert(
    {
      user_id: input.userId,
      report_type: "daily",
      period_start: input.date,
      period_end: input.date,
      title: input.title,
      summary: input.summary,
      patterns: input.patterns,
      suggestions: input.suggestions,
      next_actions: input.nextActions,
      source_stats: input.sourceStats,
      source_highlights: input.sourceHighlights,
      selected_original_event_ids: input.selectedOriginalEventIds,
      model_provider: input.modelProvider,
      model_name: input.modelName,
      generation_status: "completed",
      error_message: null,
      generated_at: nowIso,
      updated_at: nowIso,
    },
    { onConflict: "user_id,report_type,period_start,period_end" },
  );

  if (error) {
    throw error;
  }
}

export async function upsertWeeklyReviewReportForUser(input: {
  userId: string;
  weekStart: string;
  weekEnd: string;
  title: string;
  summary: string;
  patterns: string[];
  suggestions: string[];
  nextActions: string[];
  sourceStats: Record<string, unknown>;
  sourceHighlights: string[];
  selectedOriginalEventIds: string[];
  modelProvider: string;
  modelName: string;
  generatedAt: Date;
}) {
  const supabase = await createClient();
  const nowIso = input.generatedAt.toISOString();
  const { error } = await supabase.from("insight_reports").upsert(
    {
      user_id: input.userId,
      report_type: "weekly",
      period_start: input.weekStart,
      period_end: input.weekEnd,
      title: input.title,
      summary: input.summary,
      patterns: input.patterns,
      suggestions: input.suggestions,
      next_actions: input.nextActions,
      source_stats: input.sourceStats,
      source_highlights: input.sourceHighlights,
      selected_original_event_ids: input.selectedOriginalEventIds,
      model_provider: input.modelProvider,
      model_name: input.modelName,
      generation_status: "completed",
      error_message: null,
      generated_at: nowIso,
      updated_at: nowIso,
    },
    { onConflict: "user_id,report_type,period_start,period_end" },
  );

  if (error) {
    throw error;
  }
}

export async function upsertMonthlyReviewReportForUser(input: {
  userId: string;
  monthStart: string;
  monthEnd: string;
  title: string;
  summary: string;
  patterns: string[];
  suggestions: string[];
  nextActions: string[];
  sourceStats: Record<string, unknown>;
  sourceHighlights: string[];
  modelProvider: string;
  modelName: string;
  generatedAt: Date;
}) {
  const supabase = await createClient();
  const nowIso = input.generatedAt.toISOString();
  const { error } = await supabase.from("insight_reports").upsert(
    {
      user_id: input.userId,
      report_type: "monthly",
      period_start: input.monthStart,
      period_end: input.monthEnd,
      title: input.title,
      summary: input.summary,
      patterns: input.patterns,
      suggestions: input.suggestions,
      next_actions: input.nextActions,
      source_stats: input.sourceStats,
      source_highlights: input.sourceHighlights,
      selected_original_event_ids: [],
      model_provider: input.modelProvider,
      model_name: input.modelName,
      generation_status: "completed",
      error_message: null,
      generated_at: nowIso,
      updated_at: nowIso,
    },
    { onConflict: "user_id,report_type,period_start,period_end" },
  );

  if (error) {
    throw error;
  }
}

export async function getTodayDailyReviewReportForUser(
  userId: string,
  todayDate: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("insight_reports")
    .select("id,title,summary,patterns,suggestions,next_actions,model_provider,model_name,generated_at")
    .eq("user_id", userId)
    .eq("report_type", "daily")
    .eq("period_start", todayDate)
    .eq("period_end", todayDate)
    .eq("generation_status", "completed")
    .returns<InsightReportRow>()
    .maybeSingle();
  const row = assertRow(data as InsightReportRow | null, error);

  return row
    ? {
        id: row.id,
        title: row.title,
        summary: row.summary,
        patterns: row.patterns,
        suggestions: row.suggestions,
        nextActions: row.next_actions,
        modelProvider: row.model_provider,
        modelName: row.model_name,
        generatedAt: toDate(row.generated_at),
      }
    : null;
}

export async function getWeeklyReviewReportForUser(
  userId: string,
  weekStart: string,
  weekEnd: string,
): Promise<ReviewReport | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("insight_reports")
    .select("id,title,summary,patterns,suggestions,next_actions,model_provider,model_name,generated_at")
    .eq("user_id", userId)
    .eq("report_type", "weekly")
    .eq("period_start", weekStart)
    .eq("period_end", weekEnd)
    .eq("generation_status", "completed")
    .returns<InsightReportRow>()
    .maybeSingle();
  const row = assertRow(data as InsightReportRow | null, error);

  return row
    ? {
        id: row.id,
        title: row.title,
        summary: row.summary,
        patterns: row.patterns,
        suggestions: row.suggestions,
        nextActions: row.next_actions,
        modelProvider: row.model_provider,
        modelName: row.model_name,
        generatedAt: toDate(row.generated_at),
      }
    : null;
}

export async function getMonthlyReviewReportForUser(
  userId: string,
  monthStart: string,
  monthEnd: string,
): Promise<ReviewReport | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("insight_reports")
    .select("id,title,summary,patterns,suggestions,next_actions,model_provider,model_name,generated_at")
    .eq("user_id", userId)
    .eq("report_type", "monthly")
    .eq("period_start", monthStart)
    .eq("period_end", monthEnd)
    .eq("generation_status", "completed")
    .returns<InsightReportRow>()
    .maybeSingle();
  const row = assertRow(data as InsightReportRow | null, error);

  return row
    ? {
        id: row.id,
        title: row.title,
        summary: row.summary,
        patterns: row.patterns,
        suggestions: row.suggestions,
        nextActions: row.next_actions,
        modelProvider: row.model_provider,
        modelName: row.model_name,
        generatedAt: toDate(row.generated_at),
      }
    : null;
}

export async function getRecentReviewReportsForUser(userId: string, limit = 20) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("insight_reports")
    .select("id,report_type,period_start,period_end,title,summary,patterns,suggestions,next_actions,model_provider,model_name,generated_at,created_at")
    .eq("user_id", userId)
    .eq("generation_status", "completed")
    .order("period_end", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<InsightReportRow[]>();

  return assertArray(data, error).map<ExportReviewReport>((row) => ({
    id: row.id,
    reportType: row.report_type,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    title: row.title,
    summary: row.summary,
    patterns: row.patterns,
    suggestions: row.suggestions,
    nextActions: row.next_actions,
    modelProvider: row.model_provider,
    modelName: row.model_name,
    generatedAt: toDate(row.generated_at),
    createdAt: new Date(row.created_at),
  }));
}
