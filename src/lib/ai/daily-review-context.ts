import "server-only";

import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm";

import { db } from "@/db";
import {
  habitCheckins as habitCheckinTable,
  habits as habitTable,
  ideas as ideaTable,
  lifeEvents as lifeEventTable,
  scheduleItems as scheduleItemTable,
  tasks as taskTable,
} from "@/db/schema";
import { checkSensitiveContent, type SensitivityReason } from "@/lib/ai/sensitive-rules";
import type { GenerateReviewInput } from "@/lib/ai/types";
import { getTaskCategoryLabel, getTaskStatusLabel, type TaskCategory, type TaskStatus } from "@/lib/tasks/options";

const maxOriginalEvents = 5;
const originalEventContentLimit = 600;
const summaryTextLimit = 120;

type DateRange = {
  start: string;
  end: string;
};

export type DailyReviewOriginalCandidate = {
  eventId: string;
  content: string;
  sensitivityDecision: "allowed";
};

export type DailyReviewDowngradedEvent = {
  eventId: string;
  summary: string;
  reasons: SensitivityReason[];
  sensitivityDecision: "downgraded_to_summary";
};

export type DailyReviewContext = {
  reviewType: "daily";
  userId: string;
  dateRange: DateRange;
  stats: Record<string, unknown>;
  highlights: string[];
  originalCandidates: DailyReviewOriginalCandidate[];
  downgradedEvents: DailyReviewDowngradedEvent[];
  excludedEventIds: string[];
  aiInput: GenerateReviewInput;
};

export function buildDailyReviewInputWithSelectedOriginals(
  context: DailyReviewContext,
  selectedOriginalEventIds: string[],
): GenerateReviewInput {
  const selectedOriginalIds = new Set(selectedOriginalEventIds);
  const selectedOriginals = context.originalCandidates.filter((candidate) =>
    selectedOriginalIds.has(candidate.eventId),
  );

  return {
    ...context.aiInput,
    selectedOriginals,
    sensitiveMode: selectedOriginals.length ? "allow_selected_originals" : "summary_only",
  };
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

function getBeijingDateAfter(days: number, date = new Date()) {
  const targetDate = new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

  return getBeijingDateValue(targetDate);
}

function truncateText(content: string, limit: number) {
  const normalized = content.replace(/\s+/g, " ").trim();

  return normalized.length > limit ? `${normalized.slice(0, limit)}...` : normalized;
}

function incrementCount(map: Record<string, number>, key: string) {
  map[key] = (map[key] ?? 0) + 1;
}

function getRate(completed: number, total: number) {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

function getHabitStreakCount(checkedDates: Set<string>, today: string) {
  let streakCount = 0;

  if (!checkedDates.has(today)) {
    return streakCount;
  }

  let cursorDate = today;

  while (checkedDates.has(cursorDate)) {
    streakCount += 1;
    cursorDate = getBeijingDateAfter(-1, new Date(`${cursorDate}T00:00:00+08:00`));
  }

  return streakCount;
}

function getEventSummary(event: {
  content: string;
  summary: string | null;
  emotionTags: string[];
  tags: string[];
}) {
  const baseText = event.summary || event.content;
  const labels = [...event.emotionTags, ...event.tags];
  const suffix = labels.length ? `（标签：${labels.join("、")}）` : "";

  return `${truncateText(baseText, summaryTextLimit)}${suffix}`;
}

async function getDailyReviewRows(userId: string, date: string) {
  const tasksQuery = db
    .select({
      id: taskTable.id,
      title: taskTable.title,
      category: taskTable.category,
      status: taskTable.status,
      isPostponed: taskTable.isPostponed,
      reviewNote: taskTable.reviewNote,
      completedAt: taskTable.completedAt,
      createdAt: taskTable.createdAt,
    })
    .from(taskTable)
    .where(and(eq(taskTable.userId, userId), eq(taskTable.taskDate, date), isNull(taskTable.deletedAt)))
    .orderBy(asc(taskTable.createdAt));

  const habitsQuery = db
    .select({
      id: habitTable.id,
      name: habitTable.name,
      category: habitTable.category,
      createdAt: habitTable.createdAt,
    })
    .from(habitTable)
    .where(and(eq(habitTable.userId, userId), eq(habitTable.isActive, true), isNull(habitTable.deletedAt)))
    .orderBy(asc(habitTable.createdAt));

  const schedulesQuery = db
    .select({
      id: scheduleItemTable.id,
      title: scheduleItemTable.title,
      category: scheduleItemTable.category,
      startTime: scheduleItemTable.startTime,
      endTime: scheduleItemTable.endTime,
      description: scheduleItemTable.description,
      createdAt: scheduleItemTable.createdAt,
    })
    .from(scheduleItemTable)
    .where(
      and(
        eq(scheduleItemTable.userId, userId),
        eq(scheduleItemTable.scheduleDate, date),
        isNull(scheduleItemTable.deletedAt),
      ),
    )
    .orderBy(asc(scheduleItemTable.startTime), asc(scheduleItemTable.createdAt));

  const lifeEventsQuery = db
    .select({
      id: lifeEventTable.id,
      content: lifeEventTable.content,
      emotionTags: lifeEventTable.emotionTags,
      tags: lifeEventTable.tags,
      specificEvent: lifeEventTable.specificEvent,
      nextAction: lifeEventTable.nextAction,
      aiAnalysisPermission: lifeEventTable.aiAnalysisPermission,
      summary: lifeEventTable.summary,
      createdAt: lifeEventTable.createdAt,
    })
    .from(lifeEventTable)
    .where(and(eq(lifeEventTable.userId, userId), eq(lifeEventTable.eventDate, date), isNull(lifeEventTable.deletedAt)))
    .orderBy(desc(lifeEventTable.createdAt));

  const ideasQuery = db
    .select({
      id: ideaTable.id,
      content: ideaTable.content,
      status: ideaTable.status,
      solutionNote: ideaTable.solutionNote,
      createdAt: ideaTable.createdAt,
    })
    .from(ideaTable)
    .where(and(eq(ideaTable.userId, userId), eq(ideaTable.ideaDate, date), isNull(ideaTable.deletedAt)))
    .orderBy(desc(ideaTable.createdAt));

  const [tasks, habits, schedules, lifeEvents, ideas] = await Promise.all([
    tasksQuery,
    habitsQuery,
    schedulesQuery,
    lifeEventsQuery,
    ideasQuery,
  ]);

  const habitCheckins = habits.length
    ? await db
        .select({
          habitId: habitCheckinTable.habitId,
          checkinDate: habitCheckinTable.checkinDate,
          status: habitCheckinTable.status,
          note: habitCheckinTable.note,
        })
        .from(habitCheckinTable)
        .where(and(eq(habitCheckinTable.userId, userId), inArray(habitCheckinTable.habitId, habits.map((habit) => habit.id))))
        .orderBy(asc(habitCheckinTable.checkinDate))
    : [];

  return {
    tasks,
    habits,
    habitCheckins,
    schedules,
    lifeEvents,
    ideas,
  };
}

export async function buildDailyReviewContext(
  userId: string,
  date = getBeijingDateValue(),
): Promise<DailyReviewContext> {
  const rows = await getDailyReviewRows(userId, date);
  const dateRange = { start: date, end: date };
  const taskStatusCounts: Record<TaskStatus, number> = {
    todo: 0,
    in_progress: 0,
    completed: 0,
    postponed: 0,
  };
  const taskCategoryCounts: Partial<Record<TaskCategory, number>> = {};
  const scheduleCategoryCounts: Partial<Record<TaskCategory, number>> = {};
  const emotionCounts: Record<string, number> = {};
  const tagCounts: Record<string, number> = {};
  const highlights: string[] = [];
  const originalCandidates: DailyReviewOriginalCandidate[] = [];
  const downgradedEvents: DailyReviewDowngradedEvent[] = [];
  const excludedEventIds: string[] = [];

  for (const task of rows.tasks) {
    taskStatusCounts[task.status] += 1;
    taskCategoryCounts[task.category] = (taskCategoryCounts[task.category] ?? 0) + 1;
  }

  for (const schedule of rows.schedules) {
    scheduleCategoryCounts[schedule.category] = (scheduleCategoryCounts[schedule.category] ?? 0) + 1;
  }

  const completedTasks = rows.tasks.filter((task) => task.status === "completed");
  const checkedTodayHabitIds = new Set(
    rows.habitCheckins
      .filter((checkin) => checkin.checkinDate === date && checkin.status === "checked")
      .map((checkin) => checkin.habitId),
  );
  const skippedTodayHabitIds = new Set(
    rows.habitCheckins
      .filter((checkin) => checkin.checkinDate === date && checkin.status === "skipped")
      .map((checkin) => checkin.habitId),
  );
  const habitSummaries = rows.habits.map((habit) => {
    const habitCheckins = rows.habitCheckins.filter((checkin) => checkin.habitId === habit.id);
    const checkedDates = new Set(
      habitCheckins.filter((checkin) => checkin.status === "checked").map((checkin) => checkin.checkinDate),
    );

    return {
      id: habit.id,
      name: habit.name,
      category: habit.category,
      categoryLabel: getTaskCategoryLabel(habit.category),
      checkedToday: checkedTodayHabitIds.has(habit.id),
      skippedToday: skippedTodayHabitIds.has(habit.id),
      totalCheckedCount: checkedDates.size,
      streakCount: getHabitStreakCount(checkedDates, date),
      note: habitCheckins.find((checkin) => checkin.checkinDate === date)?.note ?? null,
    };
  });

  for (const event of rows.lifeEvents) {
    for (const emotion of event.emotionTags) {
      incrementCount(emotionCounts, emotion);
    }

    for (const tag of event.tags) {
      incrementCount(tagCounts, tag);
    }

    if (event.aiAnalysisPermission === "none") {
      excludedEventIds.push(event.id);
      continue;
    }

    const summary = getEventSummary(event);
    highlights.push(`事件：${summary}`);

    if (event.nextAction) {
      highlights.push(`事件后续行动：${truncateText(event.nextAction, summaryTextLimit)}`);
    }

    if (event.aiAnalysisPermission !== "allow_original") {
      continue;
    }

    const sensitivity = checkSensitiveContent(event.content);

    if (sensitivity.isSensitive) {
      downgradedEvents.push({
        eventId: event.id,
        summary,
        reasons: sensitivity.reasons,
        sensitivityDecision: "downgraded_to_summary",
      });
      continue;
    }

    if (originalCandidates.length < maxOriginalEvents) {
      originalCandidates.push({
        eventId: event.id,
        content: truncateText(event.content, originalEventContentLimit),
        sensitivityDecision: "allowed",
      });
    }
  }

  for (const idea of rows.ideas) {
    highlights.push(`灵感：${truncateText(idea.content, summaryTextLimit)}（状态：${idea.status}）`);
  }

  if (completedTasks.length) {
    highlights.push(`已完成任务：${completedTasks.map((task) => task.title).join("、")}`);
  }

  const stats = {
    date,
    tasks: {
      total: rows.tasks.length,
      completed: taskStatusCounts.completed,
      inProgress: taskStatusCounts.in_progress,
      todo: taskStatusCounts.todo,
      postponed: taskStatusCounts.postponed,
      completionRate: getRate(taskStatusCounts.completed, rows.tasks.length),
      byStatus: Object.fromEntries(
        Object.entries(taskStatusCounts).map(([status, count]) => [
          getTaskStatusLabel(status as TaskStatus),
          count,
        ]),
      ),
      byCategory: Object.fromEntries(
        Object.entries(taskCategoryCounts).map(([category, count]) => [
          getTaskCategoryLabel(category as TaskCategory),
          count,
        ]),
      ),
    },
    habits: {
      active: rows.habits.length,
      checkedToday: checkedTodayHabitIds.size,
      skippedToday: skippedTodayHabitIds.size,
      completionRate: getRate(checkedTodayHabitIds.size, rows.habits.length),
      items: habitSummaries,
    },
    schedules: {
      total: rows.schedules.length,
      byCategory: Object.fromEntries(
        Object.entries(scheduleCategoryCounts).map(([category, count]) => [
          getTaskCategoryLabel(category as TaskCategory),
          count,
        ]),
      ),
      items: rows.schedules.map((schedule) => ({
        id: schedule.id,
        title: schedule.title,
        category: schedule.category,
        categoryLabel: getTaskCategoryLabel(schedule.category),
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        description: schedule.description ? truncateText(schedule.description, summaryTextLimit) : null,
      })),
    },
    records: {
      events: rows.lifeEvents.length,
      aiSummaryEvents: rows.lifeEvents.filter((event) => event.aiAnalysisPermission !== "none").length,
      excludedEvents: excludedEventIds.length,
      ideas: rows.ideas.length,
      emotionCounts,
      tagCounts,
      originalCandidateCount: originalCandidates.length,
      downgradedOriginalCount: downgradedEvents.length,
    },
  };

  return {
    reviewType: "daily",
    userId,
    dateRange,
    stats,
    highlights,
    originalCandidates,
    downgradedEvents,
    excludedEventIds,
    aiInput: {
      userId,
      reviewType: "daily",
      dateRange,
      stats,
      highlights,
      selectedOriginals: originalCandidates,
      sensitiveMode: originalCandidates.length ? "allow_selected_originals" : "summary_only",
    },
  };
}
