import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { TaskCategory, TaskStatus } from "@/lib/tasks/options";

type HabitCheckinStatus = "checked" | "skipped";
type AiAnalysisPermission = "none" | "summary_only" | "allow_original";
type IdeaStatus = "to_review" | "converted_to_task" | "shelved" | "abandoned";
type ReportType = "daily" | "weekly" | "monthly";
type GenerationStatus = "pending" | "completed" | "failed";

function toDate(value: string | null | undefined) {
  return value ? new Date(value) : null;
}

function assertArray<T>(data: T[] | null, error: unknown) {
  if (error) {
    throw error;
  }

  return data ?? [];
}

function assertRow<T>(data: T | null, error: unknown) {
  if (error) {
    throw error;
  }

  return data ?? null;
}

type TaskRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: TaskCategory;
  status: TaskStatus;
  task_date: string;
  is_postponed: boolean;
  postponed_from_date: string | null;
  postponed_to_date: string | null;
  review_note: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type HabitRow = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: TaskCategory;
  is_active: boolean;
  start_date: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type HabitCheckinRow = {
  id: string;
  user_id: string;
  habit_id: string;
  checkin_date: string;
  status: HabitCheckinStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
};

type ScheduleItemRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: TaskCategory;
  schedule_date: string;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type LifeEventRow = {
  id: string;
  user_id: string;
  event_date: string;
  content: string;
  emotion_tags: string[];
  tags: string[];
  specific_event: string | null;
  next_action: string | null;
  ai_analysis_permission: AiAnalysisPermission;
  summary: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type IdeaRow = {
  id: string;
  user_id: string;
  idea_date: string;
  content: string;
  status: IdeaStatus;
  solution_note: string | null;
  converted_task_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type InsightReportRow = {
  id: string;
  user_id: string;
  report_type: ReportType;
  period_start: string;
  period_end: string;
  title: string;
  summary: string;
  patterns: string[];
  suggestions: string[];
  next_actions: string[];
  source_stats: Record<string, unknown> | null;
  source_highlights: string[] | null;
  selected_original_event_ids: string[] | null;
  model_provider: string;
  model_name: string;
  generation_status: GenerationStatus;
  error_message: string | null;
  generated_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TodayTask = {
  id: string;
  title: string;
  category: TaskCategory;
  status: TaskStatus;
  taskDate: string;
  isPostponed: boolean;
  postponedFromDate: string | null;
  postponedToDate: string | null;
  createdAt: Date;
};

export type ActiveHabit = {
  id: string;
  name: string;
  category: TaskCategory;
  isActive: boolean;
  startDate: string | null;
  createdAt: Date;
};

export type HabitCheckin = {
  habitId: string;
  checkinDate: string;
  status: HabitCheckinStatus;
};

export type TodayScheduleItem = {
  id: string;
  title: string;
  category: TaskCategory;
  scheduleDate: string;
  startTime: string | null;
  endTime: string | null;
  createdAt: Date;
};

export type TodayLifeEvent = {
  id: string;
  content: string;
  eventDate: string;
  emotionTags: string[];
  tags: string[];
  aiAnalysisPermission: AiAnalysisPermission;
  createdAt: Date;
};

export type TodayIdea = {
  id: string;
  content: string;
  ideaDate: string;
  status: IdeaStatus;
  createdAt: Date;
};

export type DailyReviewReport = {
  id: string;
  title: string;
  summary: string;
  patterns: string[];
  suggestions: string[];
  nextActions: string[];
  modelProvider: string;
  modelName: string;
  generatedAt: Date | null;
};

export type RecentTaskRecord = {
  id: string;
  title: string;
  category: TaskCategory;
  status: TaskStatus;
  taskDate: string;
  isPostponed: boolean;
  createdAt: Date;
};

export type RecentHabitCheckinRecord = {
  id: string;
  habitName: string;
  checkinDate: string;
  status: HabitCheckinStatus;
  createdAt: Date;
};

export type RecentScheduleRecord = {
  id: string;
  title: string;
  category: TaskCategory;
  scheduleDate: string;
  startTime: string | null;
  endTime: string | null;
  createdAt: Date;
};

export type RecentLifeEventRecord = {
  id: string;
  content: string;
  eventDate: string;
  emotionTags: string[];
  tags: string[];
  createdAt: Date;
};

export type RecentIdeaRecord = {
  id: string;
  content: string;
  ideaDate: string;
  status: IdeaStatus;
  createdAt: Date;
};

export type TaskDetail = {
  title: string;
  description: string | null;
  category: TaskCategory;
  status: TaskStatus;
  taskDate: string;
  isPostponed: boolean;
  postponedFromDate: string | null;
  postponedToDate: string | null;
  reviewNote: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type HabitDetail = {
  habitName: string;
  habitCategory: TaskCategory;
  checkinDate: string;
  status: HabitCheckinStatus;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ScheduleDetail = {
  title: string;
  description: string | null;
  category: TaskCategory;
  scheduleDate: string;
  startTime: string | null;
  endTime: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type EventDetail = {
  content: string;
  eventDate: string;
  emotionTags: string[];
  tags: string[];
  specificEvent: string | null;
  nextAction: string | null;
  aiAnalysisPermission: AiAnalysisPermission;
  summary: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type IdeaDetail = {
  content: string;
  ideaDate: string;
  status: IdeaStatus;
  solutionNote: string | null;
  convertedTaskId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type InsightTask = {
  id: string;
  category: TaskCategory;
  status: TaskStatus;
  taskDate: string;
};

export type InsightHabit = {
  id: string;
  name: string;
  category: TaskCategory;
};

export type InsightHabitCheckin = HabitCheckin;

export type InsightSchedule = {
  scheduleDate: string;
};

export type InsightLifeEvent = {
  eventDate: string;
  emotionTags: string[];
};

export type InsightIdea = {
  ideaDate: string;
};

export type DailyReviewTask = {
  id: string;
  title: string;
  category: TaskCategory;
  status: TaskStatus;
  isPostponed: boolean;
  reviewNote: string | null;
  completedAt: Date | null;
  createdAt: Date;
};

export type DailyReviewHabit = {
  id: string;
  name: string;
  category: TaskCategory;
  createdAt: Date;
};

export type DailyReviewHabitCheckin = {
  habitId: string;
  checkinDate: string;
  status: HabitCheckinStatus;
  note: string | null;
};

export type DailyReviewSchedule = {
  id: string;
  title: string;
  category: TaskCategory;
  startTime: string | null;
  endTime: string | null;
  description: string | null;
  createdAt: Date;
};

export type DailyReviewLifeEvent = {
  id: string;
  content: string;
  emotionTags: string[];
  tags: string[];
  specificEvent: string | null;
  nextAction: string | null;
  aiAnalysisPermission: AiAnalysisPermission;
  summary: string | null;
  createdAt: Date;
};

export type DailyReviewIdea = {
  id: string;
  content: string;
  status: IdeaStatus;
  solutionNote: string | null;
  createdAt: Date;
};

export type DailyReviewRows = {
  tasks: DailyReviewTask[];
  habits: DailyReviewHabit[];
  habitCheckins: DailyReviewHabitCheckin[];
  schedules: DailyReviewSchedule[];
  lifeEvents: DailyReviewLifeEvent[];
  ideas: DailyReviewIdea[];
};

function mapTodayTask(row: TaskRow): TodayTask {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    status: row.status,
    taskDate: row.task_date,
    isPostponed: row.is_postponed,
    postponedFromDate: row.postponed_from_date,
    postponedToDate: row.postponed_to_date,
    createdAt: new Date(row.created_at),
  };
}

function mapActiveHabit(row: HabitRow): ActiveHabit {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    isActive: row.is_active,
    startDate: row.start_date,
    createdAt: new Date(row.created_at),
  };
}

function mapHabitCheckin(row: HabitCheckinRow): HabitCheckin {
  return {
    habitId: row.habit_id,
    checkinDate: row.checkin_date,
    status: row.status,
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
  const { error } = await supabase.from("tasks").insert({
    user_id: input.userId,
    title: input.title,
    category: input.category,
    status: input.status,
    task_date: input.taskDate,
    completed_at: input.completedAt?.toISOString() ?? null,
  });

  if (error) {
    throw error;
  }
}

export async function getTaskDateForUser(userId: string, taskId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("task_date")
    .eq("id", taskId)
    .eq("user_id", userId)
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
    .eq("user_id", input.userId);

  if (error) {
    throw error;
  }
}

export async function postponeTaskForUser(input: {
  userId: string;
  taskId: string;
  postponedFromDate: string;
  postponedToDate: string;
  updatedAt: Date;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({
      status: "postponed",
      task_date: input.postponedToDate,
      is_postponed: true,
      postponed_from_date: input.postponedFromDate,
      postponed_to_date: input.postponedToDate,
      completed_at: null,
      updated_at: input.updatedAt.toISOString(),
    })
    .eq("id", input.taskId)
    .eq("user_id", input.userId);

  if (error) {
    throw error;
  }
}

export async function createHabitForUser(input: {
  userId: string;
  name: string;
  category: TaskCategory;
  startDate: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("habits").insert({
    user_id: input.userId,
    name: input.name,
    category: input.category,
    is_active: true,
    start_date: input.startDate,
  });

  if (error) {
    throw error;
  }
}

export async function getActiveHabitIdForUser(userId: string, habitId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("habits")
    .select("id")
    .eq("id", habitId)
    .eq("user_id", userId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .returns<{ id: string }>()
    .maybeSingle();
  const row = assertRow(data as { id: string } | null, error);

  return row ? { id: row.id } : null;
}

export async function upsertHabitCheckinForUser(input: {
  userId: string;
  habitId: string;
  checkinDate: string;
  status: HabitCheckinStatus;
  updatedAt: Date;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("habit_checkins").upsert(
    {
      user_id: input.userId,
      habit_id: input.habitId,
      checkin_date: input.checkinDate,
      status: input.status,
      updated_at: input.updatedAt.toISOString(),
    },
    { onConflict: "habit_id,checkin_date" },
  );

  if (error) {
    throw error;
  }
}

export async function createScheduleItemForUser(input: {
  userId: string;
  title: string;
  category: TaskCategory;
  scheduleDate: string;
  startTime: string;
  endTime: string | null;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("schedule_items").insert({
    user_id: input.userId,
    title: input.title,
    category: input.category,
    schedule_date: input.scheduleDate,
    start_time: input.startTime,
    end_time: input.endTime,
  });

  if (error) {
    throw error;
  }
}

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

export async function getTodayTasksForUser(userId: string, todayDate: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("id,title,category,status,task_date,is_postponed,postponed_from_date,postponed_to_date,created_at")
    .eq("user_id", userId)
    .eq("task_date", todayDate)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .returns<TaskRow[]>();

  return assertArray(data, error).map(mapTodayTask);
}

export async function getActiveHabitsForUser(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("habits")
    .select("id,name,category,is_active,start_date,created_at")
    .eq("user_id", userId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .returns<HabitRow[]>();

  return assertArray(data, error).map(mapActiveHabit);
}

export async function getTodayScheduleItemsForUser(
  userId: string,
  todayDate: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schedule_items")
    .select("id,title,category,schedule_date,start_time,end_time,created_at")
    .eq("user_id", userId)
    .eq("schedule_date", todayDate)
    .is("deleted_at", null)
    .order("start_time", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true })
    .returns<ScheduleItemRow[]>();

  return assertArray(data, error).map((row) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    scheduleDate: row.schedule_date,
    startTime: row.start_time,
    endTime: row.end_time,
    createdAt: new Date(row.created_at),
  }));
}

export async function getTodayLifeEventsForUser(
  userId: string,
  todayDate: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("life_events")
    .select("id,content,event_date,emotion_tags,tags,ai_analysis_permission,created_at")
    .eq("user_id", userId)
    .eq("event_date", todayDate)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .returns<LifeEventRow[]>();

  return assertArray(data, error).map((row) => ({
    id: row.id,
    content: row.content,
    eventDate: row.event_date,
    emotionTags: row.emotion_tags,
    tags: row.tags,
    aiAnalysisPermission: row.ai_analysis_permission,
    createdAt: new Date(row.created_at),
  }));
}

export async function getTodayIdeasForUser(userId: string, todayDate: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ideas")
    .select("id,content,idea_date,status,created_at")
    .eq("user_id", userId)
    .eq("idea_date", todayDate)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .returns<IdeaRow[]>();

  return assertArray(data, error).map((row) => ({
    id: row.id,
    content: row.content,
    ideaDate: row.idea_date,
    status: row.status,
    createdAt: new Date(row.created_at),
  }));
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

export async function getHabitCheckinsForUser(
  userId: string,
  habitIds: string[],
) {
  if (habitIds.length === 0) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("habit_checkins")
    .select("habit_id,checkin_date,status")
    .eq("user_id", userId)
    .in("habit_id", habitIds)
    .order("checkin_date", { ascending: true })
    .returns<HabitCheckinRow[]>();

  return assertArray(data, error).map(mapHabitCheckin);
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

export async function getRecentHabitCheckinsForUser(
  userId: string,
  limit: number,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("habit_checkins")
    .select("id,checkin_date,status,created_at,habits!inner(name,user_id,deleted_at)")
    .eq("user_id", userId)
    .eq("habits.user_id", userId)
    .is("habits.deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<Array<HabitCheckinRow & { habits: { name: string } }>>();

  return assertArray(data, error).map((row) => ({
    id: row.id,
    habitName: row.habits.name,
    checkinDate: row.checkin_date,
    status: row.status,
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
    .select("id,title,category,schedule_date,start_time,end_time,created_at")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<ScheduleItemRow[]>();

  return assertArray(data, error).map((row) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    scheduleDate: row.schedule_date,
    startTime: row.start_time,
    endTime: row.end_time,
    createdAt: new Date(row.created_at),
  }));
}

export async function getRecentLifeEventsForUser(userId: string, limit: number) {
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
    emotionTags: row.emotion_tags,
    tags: row.tags,
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
        completedAt: toDate(row.completed_at),
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      }
    : null;
}

export async function getHabitDetailForUser(userId: string, id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("habit_checkins")
    .select("checkin_date,status,note,created_at,updated_at,habits!inner(name,category,user_id,deleted_at)")
    .eq("id", id)
    .eq("user_id", userId)
    .eq("habits.user_id", userId)
    .is("habits.deleted_at", null)
    .returns<HabitCheckinRow & { habits: { name: string; category: TaskCategory } }>()
    .maybeSingle();
  const row = assertRow(
    data as (HabitCheckinRow & { habits: { name: string; category: TaskCategory } }) | null,
    error,
  );

  return row
    ? {
        habitName: row.habits.name,
        habitCategory: row.habits.category,
        checkinDate: row.checkin_date,
        status: row.status,
        note: row.note,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      }
    : null;
}

export async function getScheduleDetailForUser(userId: string, id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schedule_items")
    .select("title,description,category,schedule_date,start_time,end_time,created_at,updated_at")
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
        scheduleDate: row.schedule_date,
        startTime: row.start_time,
        endTime: row.end_time,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      }
    : null;
}

export async function getEventDetailForUser(userId: string, id: string) {
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
        emotionTags: row.emotion_tags,
        tags: row.tags,
        specificEvent: row.specific_event,
        nextAction: row.next_action,
        aiAnalysisPermission: row.ai_analysis_permission,
        summary: row.summary,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      }
    : null;
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

export async function getInsightRowsForUser(
  userId: string,
  weekStart: string,
  today: string,
) {
  const supabase = await createClient();
  const [
    tasksResult,
    habitsResult,
    habitCheckinsResult,
    schedulesResult,
    lifeEventsResult,
    ideasResult,
  ] = await Promise.all([
    supabase
      .from("tasks")
      .select("id,category,status,task_date")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .gte("task_date", weekStart)
      .lte("task_date", today)
      .order("task_date", { ascending: true })
      .returns<TaskRow[]>(),
    supabase
      .from("habits")
      .select("id,name,category")
      .eq("user_id", userId)
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .returns<HabitRow[]>(),
    supabase
      .from("habit_checkins")
      .select("habit_id,checkin_date,status")
      .eq("user_id", userId)
      .gte("checkin_date", weekStart)
      .lte("checkin_date", today)
      .returns<HabitCheckinRow[]>(),
    supabase
      .from("schedule_items")
      .select("schedule_date")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .gte("schedule_date", weekStart)
      .lte("schedule_date", today)
      .returns<ScheduleItemRow[]>(),
    supabase
      .from("life_events")
      .select("event_date,emotion_tags")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .gte("event_date", weekStart)
      .lte("event_date", today)
      .returns<LifeEventRow[]>(),
    supabase
      .from("ideas")
      .select("idea_date")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .gte("idea_date", weekStart)
      .lte("idea_date", today)
      .returns<IdeaRow[]>(),
  ]);

  return {
    tasks: assertArray(tasksResult.data, tasksResult.error).map((row) => ({
      id: row.id,
      category: row.category,
      status: row.status,
      taskDate: row.task_date,
    })),
    activeHabits: assertArray(habitsResult.data, habitsResult.error).map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
    })),
    habitCheckins: assertArray(habitCheckinsResult.data, habitCheckinsResult.error).map(mapHabitCheckin),
    schedules: assertArray(schedulesResult.data, schedulesResult.error).map((row) => ({
      scheduleDate: row.schedule_date,
    })),
    lifeEvents: assertArray(lifeEventsResult.data, lifeEventsResult.error).map((row) => ({
      eventDate: row.event_date,
      emotionTags: row.emotion_tags,
    })),
    ideas: assertArray(ideasResult.data, ideasResult.error).map((row) => ({
      ideaDate: row.idea_date,
    })),
  };
}

export async function getAllHabitCheckinsForUser(
  userId: string,
  habitIds: string[],
) {
  return getHabitCheckinsForUser(userId, habitIds);
}

export async function getDailyReviewRowsForUser(
  userId: string,
  date: string,
): Promise<DailyReviewRows> {
  const supabase = await createClient();
  const [tasksResult, habitsResult, schedulesResult, lifeEventsResult, ideasResult] =
    await Promise.all([
      supabase
        .from("tasks")
        .select("id,title,category,status,is_postponed,review_note,completed_at,created_at")
        .eq("user_id", userId)
        .eq("task_date", date)
        .is("deleted_at", null)
        .order("created_at", { ascending: true })
        .returns<TaskRow[]>(),
      supabase
        .from("habits")
        .select("id,name,category,created_at")
        .eq("user_id", userId)
        .eq("is_active", true)
        .is("deleted_at", null)
        .order("created_at", { ascending: true })
        .returns<HabitRow[]>(),
      supabase
        .from("schedule_items")
        .select("id,title,category,start_time,end_time,description,created_at")
        .eq("user_id", userId)
        .eq("schedule_date", date)
        .is("deleted_at", null)
        .order("start_time", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true })
        .returns<ScheduleItemRow[]>(),
      supabase
        .from("life_events")
        .select("id,content,emotion_tags,tags,specific_event,next_action,ai_analysis_permission,summary,created_at")
        .eq("user_id", userId)
        .eq("event_date", date)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .returns<LifeEventRow[]>(),
      supabase
        .from("ideas")
        .select("id,content,status,solution_note,created_at")
        .eq("user_id", userId)
        .eq("idea_date", date)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .returns<IdeaRow[]>(),
    ]);
  const habits = assertArray(habitsResult.data, habitsResult.error);
  const habitCheckinsResult = habits.length
    ? await supabase
        .from("habit_checkins")
        .select("habit_id,checkin_date,status,note")
        .eq("user_id", userId)
        .in(
          "habit_id",
          habits.map((habit) => habit.id),
        )
        .order("checkin_date", { ascending: true })
        .returns<HabitCheckinRow[]>()
    : null;
  const habitCheckins = habitCheckinsResult
    ? assertArray(habitCheckinsResult.data, habitCheckinsResult.error)
    : [];

  return {
    tasks: assertArray(tasksResult.data, tasksResult.error).map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      status: row.status,
      isPostponed: row.is_postponed,
      reviewNote: row.review_note,
      completedAt: toDate(row.completed_at),
      createdAt: new Date(row.created_at),
    })),
    habits: habits.map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      createdAt: new Date(row.created_at),
    })),
    habitCheckins: habitCheckins.map((checkin) => ({
      habitId: checkin.habit_id,
      checkinDate: checkin.checkin_date,
      status: checkin.status,
      note: checkin.note,
    })),
    schedules: assertArray(schedulesResult.data, schedulesResult.error).map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      startTime: row.start_time,
      endTime: row.end_time,
      description: row.description,
      createdAt: new Date(row.created_at),
    })),
    lifeEvents: assertArray(lifeEventsResult.data, lifeEventsResult.error).map((row) => ({
      id: row.id,
      content: row.content,
      emotionTags: row.emotion_tags,
      tags: row.tags,
      specificEvent: row.specific_event,
      nextAction: row.next_action,
      aiAnalysisPermission: row.ai_analysis_permission,
      summary: row.summary,
      createdAt: new Date(row.created_at),
    })),
    ideas: assertArray(ideasResult.data, ideasResult.error).map((row) => ({
      id: row.id,
      content: row.content,
      status: row.status,
      solutionNote: row.solution_note,
      createdAt: new Date(row.created_at),
    })),
  };
}
