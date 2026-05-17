import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { ScheduleRecurrence } from "@/lib/schedules/options";
import type { TaskCategory, TaskStatus } from "@/lib/tasks/options";

type HabitCheckinStatus = "checked" | "skipped";
type AiAnalysisPermission = "none" | "summary_only" | "allow_original";
type IdeaStatus = "to_review" | "converted_to_task" | "shelved" | "abandoned";
type ReportType = "daily" | "weekly" | "monthly";
type GenerationStatus = "pending" | "completed" | "failed";
export type ToolType = "emotion_review" | "stress_sorting" | "tomorrow_plan";

function toDate(value: string | null | undefined) {
  return value ? new Date(value) : null;
}

function getDateTime(value: string) {
  return new Date(`${value}T00:00:00+08:00`).getTime();
}

function getDaysBetween(start: string, end: string) {
  return Math.floor((getDateTime(end) - getDateTime(start)) / (24 * 60 * 60 * 1000));
}

function scheduleOccursOnDate(row: ScheduleItemRow, date: string) {
  const startDate = row.start_date ?? row.schedule_date;
  const endDate = row.end_date;

  if (getDateTime(startDate) > getDateTime(date)) {
    return false;
  }

  if (endDate && getDateTime(endDate) < getDateTime(date)) {
    return false;
  }

  if (row.recurrence === "none") {
    return row.schedule_date === date || startDate === date;
  }

  if (row.recurrence === "daily") {
    return true;
  }

  const start = new Date(`${startDate}T00:00:00+08:00`);
  const target = new Date(`${date}T00:00:00+08:00`);

  if (row.recurrence === "weekly") {
    return getDaysBetween(startDate, date) % 7 === 0;
  }

  return start.getDate() === target.getDate();
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
  is_pinned: boolean;
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
  is_pinned: boolean;
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
  start_date: string | null;
  end_date: string | null;
  recurrence: ScheduleRecurrence;
  start_time: string | null;
  end_time: string | null;
  is_pinned: boolean;
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
  is_pinned: boolean;
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
  is_pinned: boolean;
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

type PersonalManualRow = {
  id: string;
  user_id: string;
  life_stage: string | null;
  current_goals: string[];
  ability_profile: string | null;
  emotion_patterns: string | null;
  energy_sources: string[];
  drain_sources: string[];
  recurring_problems: string[];
  preferred_action_style: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type AnniversaryRow = {
  id: string;
  user_id: string;
  title: string;
  person_name: string;
  anniversary_date: string;
  reminder_date: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type GiftRecordRow = {
  id: string;
  user_id: string;
  anniversary_id: string | null;
  gift_name: string;
  recipient_name: string;
  gift_date: string;
  purpose: string;
  note: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type ToolSessionRow = {
  id: string;
  user_id: string;
  tool_type: ToolType;
  title: string;
  input_content: string;
  output_content: string;
  ai_used: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type TodayTask = {
  id: string;
  title: string;
  description: string | null;
  category: TaskCategory;
  status: TaskStatus;
  taskDate: string;
  isPostponed: boolean;
  postponedFromDate: string | null;
  postponedToDate: string | null;
  reviewNote: string | null;
  isPinned: boolean;
  createdAt: Date;
};

export type ActiveHabit = {
  id: string;
  name: string;
  description: string | null;
  category: TaskCategory;
  isActive: boolean;
  startDate: string | null;
  isPinned: boolean;
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
  description: string | null;
  category: TaskCategory;
  scheduleDate: string;
  startDate: string | null;
  endDate: string | null;
  recurrence: ScheduleRecurrence;
  startTime: string | null;
  endTime: string | null;
  isPinned: boolean;
  createdAt: Date;
};

export type TodayLifeEvent = {
  id: string;
  content: string;
  eventDate: string;
  emotionTags: string[];
  tags: string[];
  specificEvent: string | null;
  nextAction: string | null;
  aiAnalysisPermission: AiAnalysisPermission;
  summary: string | null;
  isPinned: boolean;
  createdAt: Date;
};

export type TodayIdea = {
  id: string;
  content: string;
  ideaDate: string;
  status: IdeaStatus;
  solutionNote: string | null;
  isPinned: boolean;
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

export type ReviewReport = DailyReviewReport;

export type ExportReviewReport = ReviewReport & {
  reportType: ReportType;
  periodStart: string;
  periodEnd: string;
  createdAt: Date;
};

export type PersonalManual = {
  lifeStage: string | null;
  currentGoals: string[];
  abilityProfile: string | null;
  emotionPatterns: string | null;
  energySources: string[];
  drainSources: string[];
  recurringProblems: string[];
  preferredActionStyle: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AnniversaryRecord = {
  id: string;
  title: string;
  personName: string;
  anniversaryDate: string;
  reminderDate: string | null;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type GiftRecord = {
  id: string;
  anniversaryId: string | null;
  giftName: string;
  recipientName: string;
  giftDate: string;
  purpose: string;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ToolSessionRecord = {
  id: string;
  toolType: ToolType;
  title: string;
  inputContent: string;
  outputContent: string;
  aiUsed: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  habitId: string;
  habitName: string;
  habitDescription: string | null;
  habitCategory: TaskCategory;
  habitStartDate: string | null;
  habitIsActive: boolean;
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
  startDate: string | null;
  endDate: string | null;
  recurrence: ScheduleRecurrence;
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

export type MonthlyInsightWeeklyReport = {
  id: string;
  periodStart: string;
  periodEnd: string;
  title: string;
  summary: string;
  generatedAt: Date | null;
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

export type WeeklyReviewTask = DailyReviewTask & {
  taskDate: string;
};

export type WeeklyReviewHabit = DailyReviewHabit;

export type WeeklyReviewHabitCheckin = DailyReviewHabitCheckin;

export type WeeklyReviewSchedule = DailyReviewSchedule & {
  scheduleDate: string;
};

export type WeeklyReviewLifeEvent = DailyReviewLifeEvent & {
  eventDate: string;
};

export type WeeklyReviewIdea = DailyReviewIdea & {
  ideaDate: string;
};

export type WeeklyReviewRows = {
  tasks: WeeklyReviewTask[];
  habits: WeeklyReviewHabit[];
  habitCheckins: WeeklyReviewHabitCheckin[];
  schedules: WeeklyReviewSchedule[];
  lifeEvents: WeeklyReviewLifeEvent[];
  ideas: WeeklyReviewIdea[];
};

export type MonthlyReviewRows = WeeklyReviewRows & {
  weeklyReports: MonthlyInsightWeeklyReport[];
};

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

function mapActiveHabit(row: HabitRow): ActiveHabit {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    isActive: row.is_active,
    startDate: row.start_date,
    isPinned: row.is_pinned,
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

function mapAnniversary(row: AnniversaryRow): AnniversaryRecord {
  return {
    id: row.id,
    title: row.title,
    personName: row.person_name,
    anniversaryDate: row.anniversary_date,
    reminderDate: row.reminder_date,
    note: row.note,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapGiftRecord(row: GiftRecordRow): GiftRecord {
  return {
    id: row.id,
    anniversaryId: row.anniversary_id,
    giftName: row.gift_name,
    recipientName: row.recipient_name,
    giftDate: row.gift_date,
    purpose: row.purpose,
    note: row.note,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapToolSession(row: ToolSessionRow): ToolSessionRecord {
  return {
    id: row.id,
    toolType: row.tool_type,
    title: row.title,
    inputContent: row.input_content,
    outputContent: row.output_content,
    aiUsed: row.ai_used,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

async function assertAnniversaryBelongsToUser(
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

export async function updateHabitForUser(input: {
  userId: string;
  habitId: string;
  name: string;
  description: string | null;
  category: TaskCategory;
  startDate: string;
  updatedAt: Date;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("habits")
    .update({
      name: input.name,
      description: input.description,
      category: input.category,
      start_date: input.startDate,
      updated_at: input.updatedAt.toISOString(),
    })
    .eq("id", input.habitId)
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (error) {
    throw error;
  }
}

export async function deactivateHabitForUser(input: {
  userId: string;
  habitId: string;
  updatedAt: Date;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("habits")
    .update({
      is_active: false,
      updated_at: input.updatedAt.toISOString(),
    })
    .eq("id", input.habitId)
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (error) {
    throw error;
  }
}

export async function softDeleteHabitForUser(input: {
  userId: string;
  habitId: string;
  deletedAt: Date;
}) {
  const deletedAtIso = input.deletedAt.toISOString();
  const supabase = await createClient();
  const { error } = await supabase
    .from("habits")
    .update({
      is_active: false,
      deleted_at: deletedAtIso,
      updated_at: deletedAtIso,
    })
    .eq("id", input.habitId)
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (error) {
    throw error;
  }
}

export async function updateHabitPinnedForUser(input: {
  userId: string;
  habitId: string;
  isPinned: boolean;
  updatedAt: Date;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("habits")
    .update({
      is_pinned: input.isPinned,
      updated_at: input.updatedAt.toISOString(),
    })
    .eq("id", input.habitId)
    .eq("user_id", input.userId)
    .is("deleted_at", null);

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
  startDate: string;
  endDate: string | null;
  recurrence: ScheduleRecurrence;
  startTime: string;
  endTime: string | null;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("schedule_items").insert({
    user_id: input.userId,
    title: input.title,
    category: input.category,
    schedule_date: input.scheduleDate,
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
  category: TaskCategory;
  scheduleDate: string;
  startDate: string;
  endDate: string | null;
  recurrence: ScheduleRecurrence;
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
      schedule_date: input.scheduleDate,
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

export async function getPersonalManualForUser(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("personal_manuals")
    .select("life_stage,current_goals,ability_profile,emotion_patterns,energy_sources,drain_sources,recurring_problems,preferred_action_style,notes,created_at,updated_at")
    .eq("user_id", userId)
    .returns<PersonalManualRow>()
    .maybeSingle();
  const row = assertRow(data as PersonalManualRow | null, error);

  return row
    ? {
        lifeStage: row.life_stage,
        currentGoals: row.current_goals,
        abilityProfile: row.ability_profile,
        emotionPatterns: row.emotion_patterns,
        energySources: row.energy_sources,
        drainSources: row.drain_sources,
        recurringProblems: row.recurring_problems,
        preferredActionStyle: row.preferred_action_style,
        notes: row.notes,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      }
    : null;
}

export async function upsertPersonalManualForUser(input: {
  userId: string;
  lifeStage: string | null;
  currentGoals: string[];
  abilityProfile: string | null;
  emotionPatterns: string | null;
  energySources: string[];
  drainSources: string[];
  recurringProblems: string[];
  preferredActionStyle: string | null;
  updatedAt: Date;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("personal_manuals").upsert(
    {
      user_id: input.userId,
      life_stage: input.lifeStage,
      current_goals: input.currentGoals,
      ability_profile: input.abilityProfile,
      emotion_patterns: input.emotionPatterns,
      energy_sources: input.energySources,
      drain_sources: input.drainSources,
      recurring_problems: input.recurringProblems,
      preferred_action_style: input.preferredActionStyle,
      updated_at: input.updatedAt.toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    throw error;
  }
}

export async function createAnniversaryForUser(input: {
  userId: string;
  title: string;
  personName: string;
  anniversaryDate: string;
  reminderDate: string | null;
  note: string | null;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("anniversaries").insert({
    user_id: input.userId,
    title: input.title,
    person_name: input.personName,
    anniversary_date: input.anniversaryDate,
    reminder_date: input.reminderDate,
    note: input.note,
  });

  if (error) {
    throw error;
  }
}

export async function updateAnniversaryForUser(input: {
  userId: string;
  anniversaryId: string;
  title: string;
  personName: string;
  anniversaryDate: string;
  reminderDate: string | null;
  note: string | null;
  updatedAt: Date;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("anniversaries")
    .update({
      title: input.title,
      person_name: input.personName,
      anniversary_date: input.anniversaryDate,
      reminder_date: input.reminderDate,
      note: input.note,
      updated_at: input.updatedAt.toISOString(),
    })
    .eq("id", input.anniversaryId)
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (error) {
    throw error;
  }
}

export async function softDeleteAnniversaryForUser(input: {
  userId: string;
  anniversaryId: string;
  deletedAt: Date;
}) {
  const deletedAtIso = input.deletedAt.toISOString();
  const supabase = await createClient();
  const { error } = await supabase
    .from("anniversaries")
    .update({
      deleted_at: deletedAtIso,
      updated_at: deletedAtIso,
    })
    .eq("id", input.anniversaryId)
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (error) {
    throw error;
  }
}

export async function getAnniversariesForUser(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("anniversaries")
    .select("id,title,person_name,anniversary_date,reminder_date,note,created_at,updated_at")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("anniversary_date", { ascending: true })
    .order("created_at", { ascending: true })
    .returns<AnniversaryRow[]>();

  return assertArray(data, error).map(mapAnniversary);
}

export async function createGiftRecordForUser(input: {
  userId: string;
  anniversaryId: string | null;
  giftName: string;
  recipientName: string;
  giftDate: string;
  purpose: string;
  note: string | null;
}) {
  const supabase = await createClient();
  await assertAnniversaryBelongsToUser(supabase, input.userId, input.anniversaryId);

  const { error } = await supabase.from("gift_records").insert({
    user_id: input.userId,
    anniversary_id: input.anniversaryId,
    gift_name: input.giftName,
    recipient_name: input.recipientName,
    gift_date: input.giftDate,
    purpose: input.purpose,
    note: input.note,
  });

  if (error) {
    throw error;
  }
}

export async function updateGiftRecordForUser(input: {
  userId: string;
  giftRecordId: string;
  anniversaryId: string | null;
  giftName: string;
  recipientName: string;
  giftDate: string;
  purpose: string;
  note: string | null;
  updatedAt: Date;
}) {
  const supabase = await createClient();
  await assertAnniversaryBelongsToUser(supabase, input.userId, input.anniversaryId);

  const { error } = await supabase
    .from("gift_records")
    .update({
      anniversary_id: input.anniversaryId,
      gift_name: input.giftName,
      recipient_name: input.recipientName,
      gift_date: input.giftDate,
      purpose: input.purpose,
      note: input.note,
      updated_at: input.updatedAt.toISOString(),
    })
    .eq("id", input.giftRecordId)
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (error) {
    throw error;
  }
}

export async function softDeleteGiftRecordForUser(input: {
  userId: string;
  giftRecordId: string;
  deletedAt: Date;
}) {
  const deletedAtIso = input.deletedAt.toISOString();
  const supabase = await createClient();
  const { error } = await supabase
    .from("gift_records")
    .update({
      deleted_at: deletedAtIso,
      updated_at: deletedAtIso,
    })
    .eq("id", input.giftRecordId)
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (error) {
    throw error;
  }
}

export async function getGiftRecordsForUser(input: {
  userId: string;
  recipientName?: string;
  anniversaryId?: string;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("gift_records")
    .select("id,anniversary_id,gift_name,recipient_name,gift_date,purpose,note,created_at,updated_at")
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (input.recipientName) {
    query = query.eq("recipient_name", input.recipientName);
  }

  if (input.anniversaryId) {
    query = query.eq("anniversary_id", input.anniversaryId);
  }

  const { data, error } = await query
    .order("gift_date", { ascending: false })
    .order("created_at", { ascending: false })
    .returns<GiftRecordRow[]>();

  return assertArray(data, error).map(mapGiftRecord);
}

export async function createToolSessionForUser(input: {
  userId: string;
  toolType: ToolType;
  title: string;
  inputContent: string;
  outputContent: string;
  aiUsed: boolean;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("tool_sessions").insert({
    user_id: input.userId,
    tool_type: input.toolType,
    title: input.title,
    input_content: input.inputContent,
    output_content: input.outputContent,
    ai_used: input.aiUsed,
  });

  if (error) {
    throw error;
  }
}

export async function getToolSessionsForUser(input: {
  userId: string;
  toolType?: ToolType;
}) {
  const supabase = await createClient();
  let query = supabase
    .from("tool_sessions")
    .select("id,tool_type,title,input_content,output_content,ai_used,created_at,updated_at")
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (input.toolType) {
    query = query.eq("tool_type", input.toolType);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(20)
    .returns<ToolSessionRow[]>();

  return assertArray(data, error).map(mapToolSession);
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

export async function getActiveHabitsForUser(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("habits")
    .select("id,name,description,category,is_active,start_date,is_pinned,created_at")
    .eq("user_id", userId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("is_pinned", { ascending: false })
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
    .select("id,title,description,category,schedule_date,start_date,end_date,recurrence,start_time,end_time,is_pinned,created_at")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .or(`schedule_date.eq.${todayDate},start_date.lte.${todayDate}`)
    .order("is_pinned", { ascending: false })
    .order("start_time", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true })
    .returns<ScheduleItemRow[]>();

  return assertArray(data, error)
    .filter((row) => scheduleOccursOnDate(row, todayDate))
    .map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      scheduleDate: row.schedule_date,
      startDate: row.start_date,
      endDate: row.end_date,
      recurrence: row.recurrence,
      startTime: row.start_time,
      endTime: row.end_time,
      isPinned: row.is_pinned,
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
    emotionTags: row.emotion_tags,
    tags: row.tags,
    specificEvent: row.specific_event,
    nextAction: row.next_action,
    aiAnalysisPermission: row.ai_analysis_permission,
    summary: row.summary,
    isPinned: row.is_pinned,
    createdAt: new Date(row.created_at),
  }));
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
    .select("habit_id,checkin_date,status,note,created_at,updated_at,habits!inner(name,description,category,is_active,start_date,user_id,deleted_at)")
    .eq("id", id)
    .eq("user_id", userId)
    .eq("habits.user_id", userId)
    .is("habits.deleted_at", null)
    .returns<HabitCheckinRow & {
      habits: {
        name: string;
        description: string | null;
        category: TaskCategory;
        is_active: boolean;
        start_date: string | null;
      };
    }>()
    .maybeSingle();
  const row = assertRow(
    data as (HabitCheckinRow & {
      habits: {
        name: string;
        description: string | null;
        category: TaskCategory;
        is_active: boolean;
        start_date: string | null;
      };
    }) | null,
    error,
  );

  return row
    ? {
        habitId: row.habit_id,
        habitName: row.habits.name,
        habitDescription: row.habits.description,
        habitCategory: row.habits.category,
        habitStartDate: row.habits.start_date,
        habitIsActive: row.habits.is_active,
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
    .select("title,description,category,schedule_date,start_date,end_date,recurrence,start_time,end_time,created_at,updated_at")
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

export type ChecklistTask = {
  id: string;
  title: string;
  category: TaskCategory;
  status: TaskStatus;
  taskDate: string;
  isPostponed: boolean;
  isPinned: boolean;
  createdAt: Date;
};

export type ChecklistSchedule = {
  id: string;
  title: string;
  category: TaskCategory;
  scheduleDate: string;
  startDate: string | null;
  endDate: string | null;
  recurrence: ScheduleRecurrence;
  startTime: string | null;
  endTime: string | null;
  isPinned: boolean;
  createdAt: Date;
};

export type ChecklistHabit = {
  id: string;
  name: string;
  category: TaskCategory;
  startDate: string | null;
  isPinned: boolean;
  isCheckedOnDate: boolean;
  totalCount: number;
  streakCount: number;
  createdAt: Date;
};

export type ChecklistIdea = {
  id: string;
  content: string;
  ideaDate: string;
  status: IdeaStatus;
  isPinned: boolean;
  createdAt: Date;
};

export async function getChecklistTasksForUser(
  userId: string,
  dateFrom: string,
  dateTo: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("id,title,category,status,task_date,is_postponed,is_pinned,created_at")
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
    isPinned: row.is_pinned,
    createdAt: new Date(row.created_at),
  }));
}

export async function getChecklistSchedulesForUser(
  userId: string,
  dateFrom: string,
  dateTo: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schedule_items")
    .select("id,title,category,schedule_date,start_date,end_date,recurrence,start_time,end_time,is_pinned,created_at")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("is_pinned", { ascending: false })
    .order("schedule_date", { ascending: true })
    .order("start_time", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true })
    .returns<ScheduleItemRow[]>();

  return assertArray(data, error)
    .filter((row) => {
      const startDate = row.start_date ?? row.schedule_date;
      const endDate = row.end_date;
      if (getDateTime(startDate) > getDateTime(dateTo)) return false;
      if (endDate && getDateTime(endDate) < getDateTime(dateFrom)) return false;
      if (row.recurrence === "none") {
        return row.schedule_date >= dateFrom && row.schedule_date <= dateTo;
      }
      return true;
    })
    .map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      scheduleDate: row.schedule_date,
      startDate: row.start_date,
      endDate: row.end_date,
      recurrence: row.recurrence,
      startTime: row.start_time,
      endTime: row.end_time,
      isPinned: row.is_pinned,
      createdAt: new Date(row.created_at),
    }));
}

export async function getChecklistHabitsForUser(userId: string, dateFrom: string, dateTo: string) {
  const supabase = await createClient();
  const { data: habitsData, error: habitsError } = await supabase
    .from("habits")
    .select("id,name,category,start_date,is_pinned,created_at")
    .eq("user_id", userId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: true })
    .returns<HabitRow[]>();

  const habits = assertArray(habitsData, habitsError);
  if (habits.length === 0) return [];

  const { data: checkinsData, error: checkinsError } = await supabase
    .from("habit_checkins")
    .select("habit_id,checkin_date,status")
    .eq("user_id", userId)
    .in("habit_id", habits.map((h) => h.id))
    .gte("checkin_date", dateFrom)
    .lte("checkin_date", dateTo)
    .returns<HabitCheckinRow[]>();

  const checkins = assertArray(checkinsData, checkinsError);

  const checkedDatesByHabit = new Map<string, Set<string>>();
  for (const c of checkins) {
    if (c.status === "checked") {
      if (!checkedDatesByHabit.has(c.habit_id)) {
        checkedDatesByHabit.set(c.habit_id, new Set());
      }
      checkedDatesByHabit.get(c.habit_id)!.add(c.checkin_date);
    }
  }

  function getStreakCount(habitId: string, todayDate: string) {
    const dates = checkedDatesByHabit.get(habitId);
    if (!dates || !dates.has(todayDate)) return 0;
    let count = 0;
    let cursor = todayDate;
    while (dates.has(cursor)) {
      count += 1;
      cursor = getBeijingDateAfter(-1, cursor);
    }
    return count;
  }

  const todayDate = getBeijingDateValue(new Date());

  return habits.map((habit) => {
    const dates = checkedDatesByHabit.get(habit.id) ?? new Set();
    return {
      id: habit.id,
      name: habit.name,
      category: habit.category,
      startDate: habit.start_date,
      isPinned: habit.is_pinned,
      isCheckedOnDate: dates.has(todayDate),
      totalCount: dates.size,
      streakCount: getStreakCount(habit.id, todayDate),
      createdAt: new Date(habit.created_at),
    };
  });
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

function getBeijingDateValue(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

function getBeijingDateAfter(days: number, dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00+08:00`);
  d.setDate(d.getDate() + days);
  return getBeijingDateValue(d);
}

export type LifeEventRecord = {
  id: string;
  content: string;
  eventDate: string;
  emotionTags: string[];
  tags: string[];
  aiAnalysisPermission: AiAnalysisPermission;
  summary: string | null;
  isPinned: boolean;
  createdAt: Date;
};

export async function getLifeEventsForUser(
  userId: string,
  dateFrom: string,
  dateTo: string,
) {
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
    emotionTags: row.emotion_tags,
    tags: row.tags,
    aiAnalysisPermission: row.ai_analysis_permission,
    summary: row.summary,
    isPinned: row.is_pinned,
    createdAt: new Date(row.created_at),
  }));
}

export async function getMonthlyInsightRowsForUser(
  userId: string,
  monthStart: string,
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
    weeklyReportsResult,
  ] = await Promise.all([
    supabase
      .from("tasks")
      .select("id,category,status,task_date")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .gte("task_date", monthStart)
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
      .gte("checkin_date", monthStart)
      .lte("checkin_date", today)
      .returns<HabitCheckinRow[]>(),
    supabase
      .from("schedule_items")
      .select("schedule_date")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .gte("schedule_date", monthStart)
      .lte("schedule_date", today)
      .returns<ScheduleItemRow[]>(),
    supabase
      .from("life_events")
      .select("event_date,emotion_tags")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .gte("event_date", monthStart)
      .lte("event_date", today)
      .returns<LifeEventRow[]>(),
    supabase
      .from("ideas")
      .select("idea_date")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .gte("idea_date", monthStart)
      .lte("idea_date", today)
      .returns<IdeaRow[]>(),
    supabase
      .from("insight_reports")
      .select("id,period_start,period_end,title,summary,generated_at")
      .eq("user_id", userId)
      .eq("report_type", "weekly")
      .eq("generation_status", "completed")
      .lte("period_start", today)
      .gte("period_end", monthStart)
      .order("period_start", { ascending: true })
      .returns<InsightReportRow[]>(),
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
    weeklyReports: assertArray(weeklyReportsResult.data, weeklyReportsResult.error).map((row) => ({
      id: row.id,
      periodStart: row.period_start,
      periodEnd: row.period_end,
      title: row.title,
      summary: row.summary,
      generatedAt: toDate(row.generated_at),
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

export async function getWeeklyReviewRowsForUser(
  userId: string,
  weekStart: string,
  weekEnd: string,
): Promise<WeeklyReviewRows> {
  const supabase = await createClient();
  const [tasksResult, habitsResult, habitCheckinsResult, schedulesResult, lifeEventsResult, ideasResult] =
    await Promise.all([
      supabase
        .from("tasks")
        .select("id,title,category,status,is_postponed,review_note,completed_at,task_date,created_at")
        .eq("user_id", userId)
        .gte("task_date", weekStart)
        .lte("task_date", weekEnd)
        .is("deleted_at", null)
        .order("task_date", { ascending: true })
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
        .from("habit_checkins")
        .select("habit_id,checkin_date,status,note")
        .eq("user_id", userId)
        .gte("checkin_date", weekStart)
        .lte("checkin_date", weekEnd)
        .order("checkin_date", { ascending: true })
        .returns<HabitCheckinRow[]>(),
      supabase
        .from("schedule_items")
        .select("id,title,category,start_time,end_time,description,schedule_date,created_at")
        .eq("user_id", userId)
        .gte("schedule_date", weekStart)
        .lte("schedule_date", weekEnd)
        .is("deleted_at", null)
        .order("schedule_date", { ascending: true })
        .order("start_time", { ascending: true, nullsFirst: false })
        .returns<ScheduleItemRow[]>(),
      supabase
        .from("life_events")
        .select("id,content,emotion_tags,tags,specific_event,next_action,ai_analysis_permission,summary,event_date,created_at")
        .eq("user_id", userId)
        .gte("event_date", weekStart)
        .lte("event_date", weekEnd)
        .is("deleted_at", null)
        .order("event_date", { ascending: true })
        .order("created_at", { ascending: false })
        .returns<LifeEventRow[]>(),
      supabase
        .from("ideas")
        .select("id,content,status,solution_note,idea_date,created_at")
        .eq("user_id", userId)
        .gte("idea_date", weekStart)
        .lte("idea_date", weekEnd)
        .is("deleted_at", null)
        .order("idea_date", { ascending: true })
        .order("created_at", { ascending: false })
        .returns<IdeaRow[]>(),
    ]);

  return {
    tasks: assertArray(tasksResult.data, tasksResult.error).map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      status: row.status,
      isPostponed: row.is_postponed,
      reviewNote: row.review_note,
      completedAt: toDate(row.completed_at),
      taskDate: row.task_date,
      createdAt: new Date(row.created_at),
    })),
    habits: assertArray(habitsResult.data, habitsResult.error).map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      createdAt: new Date(row.created_at),
    })),
    habitCheckins: assertArray(habitCheckinsResult.data, habitCheckinsResult.error).map((checkin) => ({
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
      scheduleDate: row.schedule_date,
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
      eventDate: row.event_date,
      createdAt: new Date(row.created_at),
    })),
    ideas: assertArray(ideasResult.data, ideasResult.error).map((row) => ({
      id: row.id,
      content: row.content,
      status: row.status,
      solutionNote: row.solution_note,
      ideaDate: row.idea_date,
      createdAt: new Date(row.created_at),
    })),
  };
}

export async function getMonthlyReviewRowsForUser(
  userId: string,
  monthStart: string,
  monthEnd: string,
): Promise<MonthlyReviewRows> {
  const supabase = await createClient();
  const [reviewRows, weeklyReportsResult] = await Promise.all([
    getWeeklyReviewRowsForUser(userId, monthStart, monthEnd),
    supabase
      .from("insight_reports")
      .select("id,period_start,period_end,title,summary,generated_at")
      .eq("user_id", userId)
      .eq("report_type", "weekly")
      .eq("generation_status", "completed")
      .lte("period_start", monthEnd)
      .gte("period_end", monthStart)
      .order("period_start", { ascending: true })
      .returns<InsightReportRow[]>(),
  ]);

  return {
    ...reviewRows,
    weeklyReports: assertArray(weeklyReportsResult.data, weeklyReportsResult.error).map((row) => ({
      id: row.id,
      periodStart: row.period_start,
      periodEnd: row.period_end,
      title: row.title,
      summary: row.summary,
      generatedAt: toDate(row.generated_at),
    })),
  };
}
