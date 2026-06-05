import "server-only";

import { checkSensitiveContent, type SensitivityReason } from "@/lib/ai/sensitive-rules";
import type { GenerateReviewInput } from "@/lib/ai/types";
import {
  buildPersonalManualContextForReview,
  type ReviewPersonalManualContext,
} from "@/lib/ai/personal-manual-context";
import { getMonthlyReviewRowsForUser } from "@/lib/data/user-data/index";
import { getTaskCategoryLabel, getTaskStatusLabel, type TaskCategory, type TaskStatus } from "@/lib/tasks/options";

const summaryTextLimit = 120;
const maxRecordHighlights = 18;
const maxWeeklyReportHighlights = 6;

type DateRange = {
  start: string;
  end: string;
};

export type MonthlyReviewDowngradedEvent = {
  eventId: string;
  eventDate: string;
  summary: string;
  reasons: SensitivityReason[];
  sensitivityDecision: "downgraded_to_summary";
};

export type MonthlyReviewWeeklyReportSummary = {
  id: string;
  periodStart: string;
  periodEnd: string;
  title: string;
  summary: string;
  generatedAt: Date | null;
};

export type MonthlyReviewContext = {
  reviewType: "monthly";
  userId: string;
  dateRange: DateRange;
  stats: Record<string, unknown>;
  highlights: string[];
  weeklyReportSummaries: MonthlyReviewWeeklyReportSummary[];
  downgradedEvents: MonthlyReviewDowngradedEvent[];
  excludedEventIds: string[];
  personalManual: ReviewPersonalManualContext;
  aiInput: GenerateReviewInput;
};

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

function getDateRangeDayCount(dateRange: DateRange) {
  const start = new Date(`${dateRange.start}T00:00:00+08:00`);
  const end = new Date(`${dateRange.end}T00:00:00+08:00`);
  const diff = end.getTime() - start.getTime();

  return Math.max(Math.floor(diff / (24 * 60 * 60 * 1000)) + 1, 1);
}

function getSafeEventSummary(event: {
  content: string;
  summary: string | null;
  emotionTags: string[];
  tags: string[];
}) {
  const labels = [...event.emotionTags, ...event.tags];
  const suffix = labels.length ? `（标签：${labels.join("、")}）` : "";
  const sensitivity = checkSensitiveContent(event.content);

  if (sensitivity.isSensitive) {
    return {
      text: `一条已降级的敏感事件摘要${suffix}`,
      sensitivity,
    };
  }

  return {
    text: `${truncateText(event.summary || event.content, summaryTextLimit)}${suffix}`,
    sensitivity,
  };
}

export async function buildMonthlyReviewContext(
  userId: string,
  dateRange: DateRange,
): Promise<MonthlyReviewContext> {
  const [rows, personalManual] = await Promise.all([
    getMonthlyReviewRowsForUser(userId, dateRange.start, dateRange.end),
    buildPersonalManualContextForReview(userId, "monthly"),
  ]);
  const dayCount = getDateRangeDayCount(dateRange);
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
  const downgradedEvents: MonthlyReviewDowngradedEvent[] = [];
  const excludedEventIds: string[] = [];

  for (const task of rows.tasks) {
    taskStatusCounts[task.status] += 1;
    taskCategoryCounts[task.category] = (taskCategoryCounts[task.category] ?? 0) + 1;
  }

  for (const schedule of rows.schedules) {
    scheduleCategoryCounts[schedule.category] = (scheduleCategoryCounts[schedule.category] ?? 0) + 1;
  }

  const checkedHabitCount = rows.habitCheckins.filter((checkin) => checkin.status === "checked").length;
  const topCompletedTasks = rows.tasks.filter((task) => task.status === "completed").slice(0, 10);

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

    const { text, sensitivity } = getSafeEventSummary(event);
    highlights.push(`${event.eventDate} 事件摘要：${text}`);

    if (event.nextAction && !sensitivity.isSensitive) {
      highlights.push(`${event.eventDate} 事件后续行动：${truncateText(event.nextAction, summaryTextLimit)}`);
    }

    if (sensitivity.isSensitive) {
      downgradedEvents.push({
        eventId: event.id,
        eventDate: event.eventDate,
        summary: text,
        reasons: sensitivity.reasons,
        sensitivityDecision: "downgraded_to_summary",
      });
    }
  }

  for (const idea of rows.ideas) {
    highlights.push(`${idea.ideaDate} 灵感摘要：${truncateText(eventSafeIdeaText(idea.content), summaryTextLimit)}（状态：${idea.status}）`);
  }

  if (topCompletedTasks.length) {
    highlights.push(`本月已完成任务代表：${topCompletedTasks.map((task) => task.title).join("、")}`);
  }

  const weeklyReportSummaries = rows.weeklyReports.slice(0, maxWeeklyReportHighlights);

  for (const report of weeklyReportSummaries) {
    highlights.push(
      `${report.periodStart}-${report.periodEnd} 周复盘摘要：${truncateText(report.summary, summaryTextLimit)}`,
    );
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
      possibleCount: rows.habits.length * dayCount,
      completionRate: getRate(checkedHabitCount, rows.habits.length * dayCount),
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
      downgradedOriginalCount: downgradedEvents.length,
      recordDensity: Number(
        ((rows.tasks.length + checkedHabitCount + rows.schedules.length + rows.lifeEvents.length + rows.ideas.length) / dayCount).toFixed(1),
      ),
    },
    weeklyReports: {
      total: rows.weeklyReports.length,
      summaries: weeklyReportSummaries.map((report) => ({
        periodStart: report.periodStart,
        periodEnd: report.periodEnd,
        title: report.title,
        summary: report.summary,
      })),
    },
  };
  const previewHighlights = highlights.slice(0, maxRecordHighlights + maxWeeklyReportHighlights);

  return {
    reviewType: "monthly",
    userId,
    dateRange,
    stats,
    highlights: previewHighlights,
    weeklyReportSummaries,
    downgradedEvents,
    excludedEventIds,
    personalManual,
    aiInput: {
      userId,
      reviewType: "monthly",
      dateRange,
      stats,
      highlights: previewHighlights,
      selectedOriginals: [],
      sensitiveMode: "summary_only",
    },
  };
}

function eventSafeIdeaText(content: string) {
  const sensitivity = checkSensitiveContent(content);

  return sensitivity.isSensitive ? "一条已降级的敏感灵感摘要" : content;
}
