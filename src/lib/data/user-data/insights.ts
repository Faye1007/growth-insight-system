import { createClient } from "@/lib/supabase/server";
import { scheduleOccursOnDate } from "@/lib/schedules/options";
import { assertArray, toDate, normalizeStringArray } from "./helpers";
import type {
  TaskRow,
  HabitRow,
  HabitCheckinRow,
  ScheduleItemRow,
  LifeEventRow,
  IdeaRow,
  InsightReportRow,
  InsightHabitCheckin,
  DailyReviewRows,
  WeeklyReviewRows,
  MonthlyReviewRows,
} from "./types";

function mapHabitCheckin(row: HabitCheckinRow): InsightHabitCheckin {
  return {
    habitId: row.habit_id,
    checkinDate: row.checkin_date,
    status: row.status,
  };
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
      .select("start_date,recurrence,end_date")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .lte("start_date", today)
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
      scheduleDate: row.start_date,
    })),
    lifeEvents: assertArray(lifeEventsResult.data, lifeEventsResult.error).map((row) => ({
      eventDate: row.event_date,
      emotionTags: normalizeStringArray(row.emotion_tags),
    })),
    ideas: assertArray(ideasResult.data, ideasResult.error).map((row) => ({
      ideaDate: row.idea_date,
    })),
  };
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
      .select("start_date")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .lte("start_date", today)
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
      scheduleDate: row.start_date,
    })),
    lifeEvents: assertArray(lifeEventsResult.data, lifeEventsResult.error).map((row) => ({
      eventDate: row.event_date,
      emotionTags: normalizeStringArray(row.emotion_tags),
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
        .select("id,title,category,start_date,end_date,recurrence,start_time,end_time,description,created_at")
        .eq("user_id", userId)
        .lte("start_date", date)
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
    schedules: assertArray(schedulesResult.data, schedulesResult.error)
      .filter((row) => scheduleOccursOnDate(row.start_date, row.end_date, row.recurrence, date))
      .map((row) => ({
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
      emotionTags: normalizeStringArray(row.emotion_tags),
      tags: normalizeStringArray(row.tags),
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
        .select("id,title,category,start_date,start_time,end_time,description,created_at")
        .eq("user_id", userId)
        .lte("start_date", weekEnd)
        .is("deleted_at", null)
        .order("start_date", { ascending: true })
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
      startDate: row.start_date,
      startTime: row.start_time,
      endTime: row.end_time,
      description: row.description,
      createdAt: new Date(row.created_at),
    })),
    lifeEvents: assertArray(lifeEventsResult.data, lifeEventsResult.error).map((row) => ({
      id: row.id,
      content: row.content,
      emotionTags: normalizeStringArray(row.emotion_tags),
      tags: normalizeStringArray(row.tags),
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
