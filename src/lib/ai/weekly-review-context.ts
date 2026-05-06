import "server-only";

import { checkSensitiveContent, type SensitivityReason } from "@/lib/ai/sensitive-rules";
import type { GenerateReviewInput } from "@/lib/ai/types";
import {
  buildPersonalManualContextForReview,
  type ReviewPersonalManualContext,
} from "@/lib/ai/personal-manual-context";
import { getWeeklyReviewRowsForUser } from "@/lib/data/user-data";
import { getTaskCategoryLabel, getTaskStatusLabel, type TaskCategory, type TaskStatus } from "@/lib/tasks/options";

const maxOriginalEvents = 5;
const originalEventContentLimit = 600;
const summaryTextLimit = 120;

type DateRange = {
  start: string;
  end: string;
};

export type WeeklyReviewOriginalCandidate = {
  eventId: string;
  content: string;
  eventDate: string;
  sensitivityDecision: "allowed";
};

export type WeeklyReviewDowngradedEvent = {
  eventId: string;
  eventDate: string;
  summary: string;
  reasons: SensitivityReason[];
  sensitivityDecision: "downgraded_to_summary";
};

export type WeeklyReviewContext = {
  reviewType: "weekly";
  userId: string;
  dateRange: DateRange;
  stats: Record<string, unknown>;
  highlights: string[];
  originalCandidates: WeeklyReviewOriginalCandidate[];
  downgradedEvents: WeeklyReviewDowngradedEvent[];
  excludedEventIds: string[];
  personalManual: ReviewPersonalManualContext;
  aiInput: GenerateReviewInput;
};

export function buildWeeklyReviewInputWithSelectedOriginals(
  context: WeeklyReviewContext,
  selectedOriginalEventIds: string[],
): GenerateReviewInput {
  const selectedOriginalIds = new Set(selectedOriginalEventIds);
  const selectedOriginals = context.originalCandidates
    .filter((candidate) => selectedOriginalIds.has(candidate.eventId))
    .map((candidate) => ({
      eventId: candidate.eventId,
      content: candidate.content,
      sensitivityDecision: candidate.sensitivityDecision,
    }));

  return {
    ...context.aiInput,
    selectedOriginals,
    sensitiveMode: selectedOriginals.length ? "allow_selected_originals" : "summary_only",
  };
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

export async function buildWeeklyReviewContext(
  userId: string,
  dateRange: DateRange,
): Promise<WeeklyReviewContext> {
  const [rows, personalManual] = await Promise.all([
    getWeeklyReviewRowsForUser(userId, dateRange.start, dateRange.end),
    buildPersonalManualContextForReview(userId, "weekly"),
  ]);
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
  const originalCandidates: WeeklyReviewOriginalCandidate[] = [];
  const downgradedEvents: WeeklyReviewDowngradedEvent[] = [];
  const excludedEventIds: string[] = [];

  for (const task of rows.tasks) {
    taskStatusCounts[task.status] += 1;
    taskCategoryCounts[task.category] = (taskCategoryCounts[task.category] ?? 0) + 1;
  }

  for (const schedule of rows.schedules) {
    scheduleCategoryCounts[schedule.category] = (scheduleCategoryCounts[schedule.category] ?? 0) + 1;
  }

  const checkedHabitCount = rows.habitCheckins.filter((checkin) => checkin.status === "checked").length;
  const topCompletedTasks = rows.tasks.filter((task) => task.status === "completed").slice(0, 8);

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
    highlights.push(`${event.eventDate} 事件：${summary}`);

    if (event.nextAction) {
      highlights.push(`${event.eventDate} 事件后续行动：${truncateText(event.nextAction, summaryTextLimit)}`);
    }

    if (event.aiAnalysisPermission !== "allow_original") {
      continue;
    }

    const sensitivity = checkSensitiveContent(event.content);

    if (sensitivity.isSensitive) {
      downgradedEvents.push({
        eventId: event.id,
        eventDate: event.eventDate,
        summary,
        reasons: sensitivity.reasons,
        sensitivityDecision: "downgraded_to_summary",
      });
      continue;
    }

    if (originalCandidates.length < maxOriginalEvents) {
      originalCandidates.push({
        eventId: event.id,
        eventDate: event.eventDate,
        content: truncateText(event.content, originalEventContentLimit),
        sensitivityDecision: "allowed",
      });
    }
  }

  for (const idea of rows.ideas) {
    highlights.push(`${idea.ideaDate} 灵感：${truncateText(idea.content, summaryTextLimit)}（状态：${idea.status}）`);
  }

  if (topCompletedTasks.length) {
    highlights.push(`已完成任务：${topCompletedTasks.map((task) => task.title).join("、")}`);
  }

  const stats = {
    dateRange,
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
      checkedCount: checkedHabitCount,
      possibleCount: rows.habits.length * 7,
      completionRate: getRate(checkedHabitCount, rows.habits.length * 7),
    },
    schedules: {
      total: rows.schedules.length,
      byCategory: Object.fromEntries(
        Object.entries(scheduleCategoryCounts).map(([category, count]) => [
          getTaskCategoryLabel(category as TaskCategory),
          count,
        ]),
      ),
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
    reviewType: "weekly",
    userId,
    dateRange,
    stats,
    highlights,
    originalCandidates,
    downgradedEvents,
    excludedEventIds,
    personalManual,
    aiInput: {
      userId,
      reviewType: "weekly",
      dateRange,
      stats,
      highlights,
      selectedOriginals: originalCandidates,
      sensitiveMode: originalCandidates.length ? "allow_selected_originals" : "summary_only",
    },
  };
}
