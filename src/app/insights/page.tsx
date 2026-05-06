import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  HeartPulse,
  NotebookPen,
  Repeat2,
} from "lucide-react";

import { generateWeeklyReviewAction } from "@/app/insights/actions";
import { FeedbackMessage } from "@/components/feedback-message";
import { EmotionStatsChart } from "@/components/insights/emotion-stats-chart";
import { HabitCheckinChart } from "@/components/insights/habit-checkin-chart";
import { RecordTrendChart } from "@/components/insights/record-trend-chart";
import { TaskCompletionChart } from "@/components/insights/task-completion-chart";
import {
  buildWeeklyReviewContext,
  buildWeeklyReviewInputWithSelectedOriginals,
  type WeeklyReviewContext,
} from "@/lib/ai/weekly-review-context";
import { getAiConfigStatus } from "@/lib/ai/config";
import { buildLoginPath, loginRequiredMessage } from "@/lib/auth/paths";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getAllHabitCheckinsForUser,
  getInsightRowsForUser,
  getWeeklyReviewReportForUser,
  type ReviewReport,
} from "@/lib/data/user-data";
import {
  getFeedbackByCode,
  weeklyReviewErrorFeedback,
  weeklyReviewStatusFeedback,
} from "@/lib/feedback";
import { getTaskCategoryLabel } from "@/lib/tasks/options";

const weekDayCount = 7;
const maxHabitRows = 6;
const maxEmotionRows = 8;

type InsightsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  month: "2-digit",
  day: "2-digit",
});

const dateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

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

function formatDateValue(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00+08:00`));
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

function getRecordCountByDate<T, K extends keyof T>(
  rows: T[],
  dateKey: K,
  dateValue: string,
) {
  return rows.filter((row) => row[dateKey] === dateValue).length;
}

function getSearchParamValues(
  params: Awaited<NonNullable<InsightsPageProps["searchParams"]>> | undefined,
  key: "weeklyOriginalEventId",
) {
  const value = params?.[key];

  if (Array.isArray(value)) {
    return value;
  }

  return value ? [value] : [];
}

function getStatsSection(stats: Record<string, unknown>, key: string) {
  const value = stats[key];

  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function getNumberStat(stats: Record<string, unknown>, section: string, key: string) {
  const value = getStatsSection(stats, section)[key];

  return typeof value === "number" ? value : 0;
}

async function getInsightData(userId: string) {
  const today = getBeijingDateValue();
  const weekStart = getBeijingDateAfter(-(weekDayCount - 1));
  const weekDates = Array.from({ length: weekDayCount }, (_, index) =>
    getBeijingDateAfter(index - (weekDayCount - 1)),
  );

  const {
    tasks,
    activeHabits,
    habitCheckins,
    schedules,
    lifeEvents,
    ideas,
  } = await getInsightRowsForUser(userId, weekStart, today);

  const activeHabitIds = new Set(activeHabits.map((habit) => habit.id));
  const allHabitCheckins = activeHabits.length
    ? await getAllHabitCheckinsForUser(
        userId,
        activeHabits.map((habit) => habit.id),
      )
    : [];
  const todayTasks = tasks.filter((task) => task.taskDate === today);
  const todayCompletedTasks = todayTasks.filter((task) => task.status === "completed");
  const todayCheckedHabitIds = new Set(
    habitCheckins
      .filter(
        (checkin) =>
          checkin.checkinDate === today &&
          checkin.status === "checked" &&
          activeHabitIds.has(checkin.habitId),
      )
      .map((checkin) => checkin.habitId),
  );
  const todayScheduleCount = getRecordCountByDate(schedules, "scheduleDate", today);
  const todayEventCount = getRecordCountByDate(lifeEvents, "eventDate", today);
  const todayIdeaCount = getRecordCountByDate(ideas, "ideaDate", today);

  const daySummaries = weekDates.map((dateValue) => {
    const dayTasks = tasks.filter((task) => task.taskDate === dateValue);
    const completedTaskCount = dayTasks.filter((task) => task.status === "completed").length;
    const checkedHabitCount = new Set(
      habitCheckins
        .filter(
          (checkin) =>
            checkin.checkinDate === dateValue &&
            checkin.status === "checked" &&
            activeHabitIds.has(checkin.habitId),
        )
        .map((checkin) => checkin.habitId),
    ).size;
    const recordCount =
      getRecordCountByDate(lifeEvents, "eventDate", dateValue) +
      getRecordCountByDate(ideas, "ideaDate", dateValue);
    const eventCount = getRecordCountByDate(lifeEvents, "eventDate", dateValue);
    const ideaCount = getRecordCountByDate(ideas, "ideaDate", dateValue);

    return {
      dateValue,
      label: formatDateValue(dateValue),
      taskCount: dayTasks.length,
      completedTaskCount,
      taskCompletionRate: getRate(completedTaskCount, dayTasks.length),
      checkedHabitCount,
      eventCount,
      ideaCount,
      recordCount,
    };
  });

  const habitRows = activeHabits.slice(0, maxHabitRows).map((habit) => {
    const checkedDates = new Set(
      allHabitCheckins
        .filter((checkin) => checkin.habitId === habit.id && checkin.status === "checked")
        .map((checkin) => checkin.checkinDate),
    );
    const recentCheckedCount = habitCheckins.filter(
      (checkin) => checkin.habitId === habit.id && checkin.status === "checked",
    ).length;

    return {
      checkins: weekDates.map((dateValue) => ({
        checked: checkedDates.has(dateValue),
        dateValue,
        label: formatDateValue(dateValue),
      })),
      id: habit.id,
      name: habit.name,
      categoryLabel: getTaskCategoryLabel(habit.category),
      checkedToday: todayCheckedHabitIds.has(habit.id),
      recentCheckedCount,
      streakCount: getHabitStreakCount(checkedDates, today),
    };
  });
  const weeklyHabitRows = activeHabits.map((habit) => {
    const recentCheckedCount = habitCheckins.filter(
      (checkin) => checkin.habitId === habit.id && checkin.status === "checked",
    ).length;

    return {
      id: habit.id,
      name: habit.name,
      recentCheckedCount,
    };
  });

  const emotionCounts = new Map<string, number>();

  for (const event of lifeEvents) {
    for (const emotion of event.emotionTags) {
      emotionCounts.set(emotion, (emotionCounts.get(emotion) ?? 0) + 1);
    }
  }

  const emotionRows = Array.from(emotionCounts.entries())
    .map(([emotion, count]) => ({ emotion, count }))
    .sort((a, b) => b.count - a.count || a.emotion.localeCompare(b.emotion, "zh-CN"))
    .slice(0, maxEmotionRows);
  const weeklyCompletedTaskCount = daySummaries.reduce(
    (total, day) => total + day.completedTaskCount,
    0,
  );
  const weeklyTaskCount = daySummaries.reduce((total, day) => total + day.taskCount, 0);
  const weeklyScheduleCount = schedules.length;
  const weeklyCheckedHabitCount = daySummaries.reduce(
    (total, day) => total + day.checkedHabitCount,
    0,
  );
  const weeklyRecordCount = daySummaries.reduce((total, day) => total + day.recordCount, 0);
  const mostActiveDay = [...daySummaries].sort(
    (a, b) =>
      b.completedTaskCount +
      b.checkedHabitCount +
      b.recordCount -
      (a.completedTaskCount + a.checkedHabitCount + a.recordCount),
  )[0];
  const topHabit = [...weeklyHabitRows]
    .filter((habit) => habit.recentCheckedCount > 0)
    .sort((a, b) => b.recentCheckedCount - a.recentCheckedCount || a.name.localeCompare(b.name, "zh-CN"))[0];
  const topEmotion = emotionRows[0];
  const weeklyHasData =
    weeklyTaskCount > 0 ||
    weeklyCheckedHabitCount > 0 ||
    weeklyScheduleCount > 0 ||
    weeklyRecordCount > 0;
  const weeklyHighlights = weeklyHasData
    ? [
        `最近 7 天完成 ${weeklyCompletedTaskCount}/${weeklyTaskCount} 项任务，任务完成率为 ${getRate(
          weeklyCompletedTaskCount,
          weeklyTaskCount,
        )}%。`,
        activeHabits.length
          ? `启用习惯 ${activeHabits.length} 个，7 天内完成打卡 ${weeklyCheckedHabitCount} 次。`
          : "本周暂无启用习惯，习惯趋势暂时没有可统计对象。",
        `本周记录 ${weeklyRecordCount} 条随手记录，其中事件 ${daySummaries.reduce(
          (total, day) => total + day.eventCount,
          0,
        )} 条、灵感 ${daySummaries.reduce((total, day) => total + day.ideaCount, 0)} 条。`,
        topEmotion
          ? `出现最多的手动情绪标签是“${topEmotion.emotion}”，共 ${topEmotion.count} 次。`
          : "本周暂无情绪标签记录。",
        topHabit
          ? `打卡最稳定的习惯是“${topHabit.name}”，最近 7 天完成 ${topHabit.recentCheckedCount} 次。`
          : "本周暂无已完成的习惯打卡。",
        mostActiveDay
          ? `记录和行动最集中的日期是 ${mostActiveDay.label}。`
          : "本周暂无可识别的高活动日期。",
      ]
    : [];

  return {
    activeHabitCount: activeHabits.length,
    daySummaries,
    emotionRows,
    habitRows,
    today,
    todayCompletedTaskCount: todayCompletedTasks.length,
    todayEventCount,
    todayHabitCheckedCount: todayCheckedHabitIds.size,
    todayIdeaCount,
    todayScheduleCount,
    todayTaskCount: todayTasks.length,
    weekStart,
    weeklyCheckedHabitCount,
    weeklyCompletedTaskCount,
    weeklyHasData,
    weeklyHighlights,
    weeklyScheduleCount,
    weeklyTaskCount,
  };
}

function WeeklyReviewPreview({
  context,
  selectedOriginalEventIds,
  isAiReady,
  hasCachedReport,
}: {
  context: WeeklyReviewContext;
  selectedOriginalEventIds: string[];
  isAiReady: boolean;
  hasCachedReport: boolean;
}) {
  const previewInput = buildWeeklyReviewInputWithSelectedOriginals(context, selectedOriginalEventIds);
  const selectedOriginalIds = new Set(selectedOriginalEventIds);
  const previewMetrics = [
    {
      label: "任务完成率",
      value: `${getNumberStat(context.stats, "tasks", "completionRate")}%`,
      detail: `${getNumberStat(context.stats, "tasks", "completed")}/${getNumberStat(context.stats, "tasks", "total")} 项已完成`,
    },
    {
      label: "习惯打卡率",
      value: `${getNumberStat(context.stats, "habits", "completionRate")}%`,
      detail: `${getNumberStat(context.stats, "habits", "checkedCount")}/${getNumberStat(context.stats, "habits", "possibleCount")} 次可能打卡`,
    },
    {
      label: "日程记录",
      value: `${getNumberStat(context.stats, "schedules", "total")}`,
      detail: "最近 7 天固定事项数量",
    },
    {
      label: "随手记录",
      value: `${getNumberStat(context.stats, "records", "events") + getNumberStat(context.stats, "records", "ideas")}`,
      detail: `事件 ${getNumberStat(context.stats, "records", "events")} · 灵感 ${getNumberStat(context.stats, "records", "ideas")}`,
    },
  ];

  return (
    <section id="weekly-review-preview" aria-labelledby="weekly-review-preview-title" className="panel-card review-preview-panel">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="page-kicker">周复盘发送预览</p>
          <h2 id="weekly-review-preview-title" className="section-heading mt-1">
            将用于 AI 的周复盘上下文
          </h2>
          <p className="body-copy mt-2">
            打开预览只整理统计、摘要和候选原文，不调用 AI。生成入口会在用户确认后才进入后续流程。
          </p>
        </div>
        <div className="overview-detail-row">
          <span className="status-pill">预览模式</span>
          <span className="status-pill">{isAiReady ? "周复盘 AI 已配置" : "周复盘 AI 待配置"}</span>
          <span className="status-pill">
            原文 {previewInput.selectedOriginals?.length ?? 0}/{context.originalCandidates.length}
          </span>
        </div>
      </div>

      <div className="review-preview-grid mt-5">
        {previewMetrics.map((metric) => (
          <article key={metric.label} className="field-tile review-preview-metric">
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <p className="body-copy">{metric.detail}</p>
          </article>
        ))}
      </div>

      <div className="review-preview-section">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="list-label">统计与关键摘要</h3>
            <p className="body-copy mt-1">这些内容会作为周复盘 AI 输入的主体，不包含未授权原文。</p>
          </div>
          <span className="status-pill">{context.highlights.length} 条摘要</span>
        </div>
        {context.highlights.length ? (
          <div className="review-highlight-list mt-3">
            {context.highlights.slice(0, 14).map((highlight, index) => (
              <p key={`${highlight}-${index}`} className="review-highlight-item">
                {highlight}
              </p>
            ))}
          </div>
        ) : (
          <p className="body-copy mt-3">最近 7 天暂无可发送的关键摘要。</p>
        )}
      </div>

      <form action="/insights#weekly-review-preview" className="review-preview-section" method="get">
        <input type="hidden" name="weeklyPreview" value="1" />
        <input type="hidden" name="weeklyOriginalSelection" value="custom" />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="list-label">事件原文候选</h3>
            <p className="body-copy mt-1">
              只有允许原文参与、且未命中敏感规则的事件会出现在这里。取消勾选后不会进入后续 AI 输入。
            </p>
          </div>
          <button className="quiet-button w-full sm:w-auto" type="submit">
            更新预览
          </button>
        </div>

        {context.originalCandidates.length ? (
          <div className="review-original-list mt-3">
            {context.originalCandidates.map((candidate) => (
              <label key={candidate.eventId} className="review-original-item">
                <input
                  type="checkbox"
                  name="weeklyOriginalEventId"
                  value={candidate.eventId}
                  defaultChecked={selectedOriginalIds.has(candidate.eventId)}
                />
                <span>
                  {candidate.eventDate} · {candidate.content}
                </span>
              </label>
            ))}
          </div>
        ) : (
          <p className="body-copy mt-3">最近 7 天暂无可发送的事件原文候选。</p>
        )}
      </form>

      {context.downgradedEvents.length ? (
        <div className="review-preview-section">
          <h3 className="list-label">已降级为摘要的事件</h3>
          <div className="review-highlight-list mt-3">
            {context.downgradedEvents.map((event) => (
              <p key={event.eventId} className="review-highlight-item">
                {event.eventDate} · {event.summary}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      <div className="review-preview-section">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="list-label">个人说明书关联边界</h3>
            <p className="body-copy mt-1">
              当前只确认周复盘已能读取个人说明书状态，不会把个人说明书内容放入 AI 输入。
            </p>
          </div>
          <span className="status-pill">
            {context.personalManual.manual ? "已读取当前账号" : "暂无说明书"}
          </span>
        </div>
      </div>

      <div className="review-preview-actions">
        <Link href="/insights" className="quiet-button">
          取消预览
        </Link>
        {hasCachedReport ? (
          <Link href="#weekly-review-report" className="soft-button">
            查看已生成周复盘
          </Link>
        ) : isAiReady ? (
          <form action={generateWeeklyReviewAction}>
            <input type="hidden" name="weekStart" value={context.dateRange.start} />
            <input type="hidden" name="weekEnd" value={context.dateRange.end} />
            {selectedOriginalEventIds.map((eventId) => (
              <input key={eventId} type="hidden" name="weeklyOriginalEventId" value={eventId} />
            ))}
            <button className="soft-button" type="submit">
              确认生成 AI 周复盘
            </button>
          </form>
        ) : (
          <button className="soft-button" type="button" disabled>
            AI 周复盘待配置
          </button>
        )}
      </div>
    </section>
  );
}

function ReviewListSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="review-report-section">
      <h3 className="list-label">{title}</h3>
      {items.length ? (
        <ul className="review-report-list">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="body-copy mt-2">暂无记录</p>
      )}
    </div>
  );
}

function WeeklyReviewReportCard({
  report,
  weekDatesText,
}: {
  report: ReviewReport;
  weekDatesText: string;
}) {
  return (
    <section id="weekly-review-report" aria-labelledby="weekly-review-report-title" className="panel-card review-report-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="page-kicker">周复盘报告</p>
          <h2 id="weekly-review-report-title" className="section-heading mt-1">
            {report.title}
          </h2>
          <p className="body-copy mt-2">{report.summary}</p>
        </div>
        <div className="overview-detail-row">
          <span className="status-pill">{weekDatesText}</span>
          <span className="status-pill">{report.modelProvider}</span>
          <span className="status-pill">{report.modelName}</span>
          {report.generatedAt ? (
            <span className="status-pill">{dateTimeFormatter.format(report.generatedAt)}</span>
          ) : null}
        </div>
      </div>

      <div className="review-report-grid">
        <ReviewListSection title="观察到的模式" items={report.patterns} />
        <ReviewListSection title="行动建议" items={report.suggestions} />
        <ReviewListSection title="下一步行动" items={report.nextActions} />
      </div>
    </section>
  );
}

export default async function InsightsPage({ searchParams }: InsightsPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const user = await getCurrentUser();
  const aiStatus = getAiConfigStatus();
  const isLoggedIn = Boolean(user);
  const loginPath = buildLoginPath({ next: "/insights", message: loginRequiredMessage });
  const insightData = user ? await getInsightData(user.id) : null;

  const todayTaskRate = insightData
    ? getRate(insightData.todayCompletedTaskCount, insightData.todayTaskCount)
    : 0;
  const todayHabitRate = insightData
    ? getRate(insightData.todayHabitCheckedCount, insightData.activeHabitCount)
    : 0;
  const todayRecordCount = insightData
    ? insightData.todayEventCount + insightData.todayIdeaCount
    : 0;
  const weekDatesText = insightData
    ? `${formatDateValue(insightData.weekStart)}-${formatDateValue(insightData.today)}`
    : "最近 7 天";
  const hasWeeklyTaskData = Boolean(
    insightData?.daySummaries.some((day) => day.taskCount > 0),
  );
  const hasWeeklyRecordData = Boolean(
    insightData?.daySummaries.some((day) => day.recordCount > 0),
  );
  const weeklyEventCount =
    insightData?.daySummaries.reduce((total, day) => total + day.eventCount, 0) ?? 0;
  const weeklyIdeaCount =
    insightData?.daySummaries.reduce((total, day) => total + day.ideaCount, 0) ?? 0;
  const weeklyRecordCount = weeklyEventCount + weeklyIdeaCount;
  const weeklyEmotionCount =
    insightData?.emotionRows.reduce((total, emotion) => total + emotion.count, 0) ?? 0;
  const weeklyTaskRate = insightData
    ? getRate(insightData.weeklyCompletedTaskCount, insightData.weeklyTaskCount)
    : 0;
  const weeklyHabitPossibleCount = insightData
    ? insightData.activeHabitCount * weekDayCount
    : 0;
  const weeklyHabitRate = insightData
    ? getRate(insightData.weeklyCheckedHabitCount, weeklyHabitPossibleCount)
    : 0;
  const weeklyReviewReport =
    user && insightData
      ? await getWeeklyReviewReportForUser(user.id, insightData.weekStart, insightData.today)
      : null;
  const weeklyPreviewOpen = params?.weeklyPreview === "1";
  const weeklyReviewContext =
    user && insightData && weeklyPreviewOpen
      ? await buildWeeklyReviewContext(user.id, {
          start: insightData.weekStart,
          end: insightData.today,
        })
      : null;
  const selectedWeeklyOriginalEventIds = weeklyReviewContext
    ? params?.weeklyOriginalSelection === "custom"
      ? getSearchParamValues(params, "weeklyOriginalEventId").filter((eventId) =>
          weeklyReviewContext.originalCandidates.some((candidate) => candidate.eventId === eventId),
        )
      : weeklyReviewContext.originalCandidates.map((candidate) => candidate.eventId)
    : [];
  const isWeeklyAiReady =
    aiStatus.hasProvider && aiStatus.hasBaseUrl && aiStatus.hasApiKey && aiStatus.hasWeeklyModel;
  const weeklyReviewFeedback =
    getFeedbackByCode(params?.weeklyReviewError as string | undefined, weeklyReviewErrorFeedback) ??
    getFeedbackByCode(
      params?.weeklyReviewGenerated === "1"
        ? "generated"
        : params?.weeklyReviewCached === "1"
          ? "cached"
          : undefined,
      weeklyReviewStatusFeedback,
    );

  return (
    <div className="page-stack">
      <header className="page-header">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="page-kicker">洞察报告</p>
            <h1 className="page-title">程序统计与复盘报告</h1>
          </div>
          <span className="status-pill w-fit">程序统计，不调用 AI</span>
        </div>
        <p className="page-description">
          当前页面先展示今日概览、最近 7 天趋势、习惯状态和情绪记录。AI 复盘入口会在后续步骤接入。
        </p>
      </header>

      <FeedbackMessage feedback={weeklyReviewFeedback} />

      {!isLoggedIn ? (
        <section className="panel-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="section-heading">登录后查看真实洞察</h2>
              <p className="body-copy mt-2">
                未登录时可以浏览页面结构；登录后会根据每日工作台数据生成程序统计。
              </p>
            </div>
            <Link className="soft-button w-full sm:w-auto" href={loginPath}>
              登录 / 注册
            </Link>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="weekly-program-review" className="panel-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="page-kicker">周复盘</p>
            <h2 id="weekly-program-review" className="section-heading mt-1">
              最近 7 天程序统计
            </h2>
            <p className="body-copy mt-2">
              只根据任务、习惯、日程、事件和灵感生成，不调用 AI，也不读取个人说明书原文。
            </p>
          </div>
          <div className="overview-detail-row">
            <span className="status-pill">程序摘要</span>
            <span className="status-pill">{weekDatesText}</span>
          </div>
        </div>

        {insightData?.weeklyHasData ? (
          <>
            <div className="insight-kpi-grid mt-5">
              <article className="field-tile">
                <span>任务完成率</span>
                <strong>{weeklyTaskRate}%</strong>
                <p className="body-copy">
                  {insightData.weeklyCompletedTaskCount}/{insightData.weeklyTaskCount} 项已完成
                </p>
              </article>
              <article className="field-tile">
                <span>习惯打卡率</span>
                <strong>{weeklyHabitRate}%</strong>
                <p className="body-copy">
                  {insightData.weeklyCheckedHabitCount}/{weeklyHabitPossibleCount} 次可能打卡
                </p>
              </article>
              <article className="field-tile">
                <span>随手记录</span>
                <strong>{weeklyRecordCount}</strong>
                <p className="body-copy">事件 {weeklyEventCount} · 灵感 {weeklyIdeaCount}</p>
              </article>
              <article className="field-tile">
                <span>日程记录</span>
                <strong>{insightData.weeklyScheduleCount}</strong>
                <p className="body-copy">最近 7 天固定事项数量</p>
              </article>
            </div>

            <div className="review-preview-section">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="list-label">关键摘要</h3>
                  <p className="body-copy mt-1">这些句子来自确定性统计规则，后续 AI 周复盘会另走发送预览。</p>
                </div>
                <span className="status-pill">无 AI 调用</span>
              </div>
              <div className="review-highlight-list mt-3">
                {insightData.weeklyHighlights.map((highlight) => (
                  <p key={highlight} className="review-highlight-item">
                    {highlight}
                  </p>
                ))}
              </div>
            </div>

            <div className="review-preview-actions">
              {weeklyReviewReport ? (
                <Link className="soft-button" href="#weekly-review-report">
                  查看已生成周复盘
                </Link>
              ) : (
                <Link className="soft-button" href="/insights?weeklyPreview=1#weekly-review-preview">
                  打开周复盘发送预览
                </Link>
              )}
            </div>
          </>
        ) : (
          <div className="empty-state mt-5">
            <span className="empty-icon">
              <CalendarDays aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <p className="list-label">最近 7 天暂无可复盘数据</p>
              <p className="body-copy mt-1">创建任务、打卡习惯、记录日程或随手记录后，这里会生成周复盘程序摘要。</p>
            </div>
          </div>
        )}
      </section>

      {weeklyReviewContext ? (
        <WeeklyReviewPreview
          context={weeklyReviewContext}
          selectedOriginalEventIds={selectedWeeklyOriginalEventIds}
          isAiReady={isWeeklyAiReady}
          hasCachedReport={Boolean(weeklyReviewReport)}
        />
      ) : null}

      {weeklyReviewReport ? (
        <WeeklyReviewReportCard report={weeklyReviewReport} weekDatesText={weekDatesText} />
      ) : null}

      <section aria-labelledby="today-insights" className="panel-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="page-kicker">今日概览</p>
            <h2 id="today-insights" className="section-heading mt-1">
              今天的基础状态
            </h2>
          </div>
          <span className="status-pill w-fit">北京时间</span>
        </div>

        <div className="insight-kpi-grid mt-5">
          <article className="daily-summary-card tone-lavender">
            <div className="metric-label">任务完成率</div>
            <div className="metric-value">{todayTaskRate}%</div>
            <p className="body-copy mt-2">
              {insightData
                ? `${insightData.todayCompletedTaskCount}/${insightData.todayTaskCount} 项已完成`
                : "登录后显示今日任务数据"}
            </p>
            <div className="overview-progress mt-4">
              <span style={{ width: `${todayTaskRate}%` }} />
            </div>
          </article>

          <article className="daily-summary-card tone-sage">
            <div className="metric-label">习惯打卡</div>
            <div className="metric-value">
              {insightData
                ? `${insightData.todayHabitCheckedCount}/${insightData.activeHabitCount}`
                : "0/0"}
            </div>
            <p className="body-copy mt-2">今日已完成的启用习惯。</p>
            <div className="overview-progress mt-4">
              <span style={{ width: `${todayHabitRate}%` }} />
            </div>
          </article>

          <article className="daily-summary-card tone-clay">
            <div className="metric-label">今日日程</div>
            <div className="metric-value">{insightData?.todayScheduleCount ?? 0}</div>
            <p className="body-copy mt-2">今天已记录的固定事项数量。</p>
          </article>

          <article className="daily-summary-card tone-mist">
            <div className="metric-label">随手记录</div>
            <div className="metric-value">{todayRecordCount}</div>
            <div className="overview-detail-row mt-3">
              <span className="status-pill">事件 {insightData?.todayEventCount ?? 0}</span>
              <span className="status-pill">灵感 {insightData?.todayIdeaCount ?? 0}</span>
            </div>
          </article>
        </div>
      </section>

      <section aria-labelledby="week-trend" className="panel-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="page-kicker">本周趋势</p>
            <h2 id="week-trend" className="section-heading mt-1">
              {weekDatesText}
            </h2>
          </div>
          <span className="status-pill w-fit">最近 7 天</span>
        </div>

        {insightData ? (
          <>
            {hasWeeklyTaskData ? (
              <div className="insight-chart-card mt-5">
                <div className="record-item-heading">
                  <div>
                    <p className="list-label">任务完成率图表</p>
                    <p className="body-copy mt-1">按北京时间统计最近 7 天每日任务完成率。</p>
                  </div>
                  <span className="status-pill">来自任务表</span>
                </div>
                <TaskCompletionChart data={insightData.daySummaries} />
              </div>
            ) : (
              <div className="empty-state mt-5">
                <span className="empty-icon">
                  <BarChart3 aria-hidden="true" className="h-5 w-5" />
                </span>
                <div>
                  <p className="list-label">暂无任务图表数据</p>
                  <p className="body-copy mt-1">
                    最近 7 天没有任务记录。创建任务后，这里会显示每日完成率。
                  </p>
                </div>
              </div>
            )}

            <div className="insight-day-grid mt-5">
              {insightData.daySummaries.map((day) => (
                <article key={day.dateValue} className="insight-day-card">
                  <div className="record-item-heading">
                    <span className="list-label">{day.label}</span>
                    <span className="status-pill">{day.taskCompletionRate}%</span>
                  </div>
                  <div className="insight-bar-stack mt-4">
                    <div className="insight-bar-row">
                      <span>任务</span>
                      <div className="overview-progress">
                        <span style={{ width: `${day.taskCompletionRate}%` }} />
                      </div>
                    </div>
                    <div className="overview-detail-row">
                      <span className="status-pill">
                        {day.completedTaskCount}/{day.taskCount} 任务
                      </span>
                      <span className="status-pill">{day.checkedHabitCount} 习惯</span>
                      <span className="status-pill">{day.recordCount} 记录</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state mt-5">
            <span className="empty-icon">
              <BarChart3 aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <p className="list-label">暂无趋势数据</p>
              <p className="body-copy mt-1">登录后会显示最近 7 天的任务、习惯和记录变化。</p>
            </div>
          </div>
        )}
      </section>

      <section aria-labelledby="record-trend" className="panel-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="page-kicker">记录数量趋势</p>
            <h2 id="record-trend" className="section-heading mt-1">
              最近 7 天随手记录
            </h2>
          </div>
          <div className="overview-detail-row">
            <span className="status-pill">总数 {weeklyRecordCount}</span>
            <span className="status-pill">事件 {weeklyEventCount}</span>
            <span className="status-pill">灵感 {weeklyIdeaCount}</span>
          </div>
        </div>

        {insightData && hasWeeklyRecordData ? (
          <div className="insight-chart-card mt-5">
            <div className="record-item-heading">
              <div>
                <p className="list-label">随手记录趋势图表</p>
                <p className="body-copy mt-1">按北京时间统计最近 7 天事件和灵感数量。</p>
              </div>
              <span className="status-pill">不使用 AI 归纳</span>
            </div>
            <RecordTrendChart data={insightData.daySummaries} />
          </div>
        ) : (
          <div className="empty-state mt-5">
            <span className="empty-icon">
              <NotebookPen aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <p className="list-label">暂无记录趋势数据</p>
              <p className="body-copy mt-1">最近 7 天没有事件或灵感记录。保存随手记录后会显示趋势。</p>
            </div>
          </div>
        )}
      </section>

      <section className="insight-section-grid">
        <article aria-labelledby="habit-status" className="panel-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="page-kicker">习惯状态</p>
              <h2 id="habit-status" className="section-heading mt-1">
                今日打卡与最近 7 天
              </h2>
            </div>
            <Repeat2 aria-hidden="true" className="h-5 w-5 text-[var(--sage)]" />
          </div>

          {insightData?.habitRows.length ? (
            <>
              <div className="insight-chart-card mt-5">
                <div className="record-item-heading">
                  <div>
                    <p className="list-label">习惯打卡图表</p>
                    <p className="body-copy mt-1">显示每个启用习惯最近 7 天完成数和每日打卡状态。</p>
                  </div>
                  <span className="status-pill">来自习惯打卡表</span>
                </div>
                <HabitCheckinChart data={insightData.habitRows} />
              </div>

              <div className="insight-list mt-5">
                {insightData.habitRows.map((habit) => (
                  <div key={habit.id} className="insight-list-row">
                    <div>
                      <p className="list-label">{habit.name}</p>
                      <p className="body-copy mt-1">{habit.categoryLabel}</p>
                    </div>
                    <div className="overview-detail-row justify-start sm:justify-end">
                      <span className="status-pill">
                        {habit.checkedToday ? "今日已完成" : "今日未打卡"}
                      </span>
                      <span className="status-pill">7天 {habit.recentCheckedCount}</span>
                      <span className="status-pill">连续 {habit.streakCount} 天</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state mt-5">
              <span className="empty-icon">
                <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <p className="list-label">暂无启用习惯</p>
                <p className="body-copy mt-1">在每日工作台添加习惯后，会出现在这里。</p>
              </div>
            </div>
          )}
        </article>

        <article aria-labelledby="emotion-records" className="panel-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="page-kicker">情绪记录</p>
              <h2 id="emotion-records" className="section-heading mt-1">
                手动情绪标签统计
              </h2>
            </div>
            <HeartPulse aria-hidden="true" className="h-5 w-5 text-[var(--clay)]" />
          </div>

          {insightData?.emotionRows.length ? (
            <>
              <div className="insight-chart-card mt-5">
                <div className="record-item-heading">
                  <div>
                    <p className="list-label">情绪标签图表</p>
                    <p className="body-copy mt-1">只统计事件记录中手动选择的情绪标签。</p>
                  </div>
                  <span className="status-pill">总计 {weeklyEmotionCount} 次</span>
                </div>
                <EmotionStatsChart data={insightData.emotionRows} />
              </div>

              <div className="insight-emotion-grid mt-5">
                {insightData.emotionRows.map((emotion) => (
                  <div key={emotion.emotion} className="field-tile">
                    <span>{emotion.emotion}</span>
                    <strong>{emotion.count}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state mt-5">
              <span className="empty-icon">
                <NotebookPen aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <p className="list-label">暂无情绪标签</p>
                <p className="body-copy mt-1">保存带情绪标签的事件后，会在这里统计最近 7 天出现次数。</p>
              </div>
            </div>
          )}
        </article>
      </section>

      <section className="panel-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="page-kicker">后续复盘</p>
            <h2 className="section-heading mt-1">AI 复盘尚未接入</h2>
            <p className="body-copy mt-2">
              当前页面只做程序统计。每日 AI 复盘会在 Step 6 进入生成、预览和缓存流程。
            </p>
          </div>
          <CalendarDays aria-hidden="true" className="h-5 w-5 text-[var(--mist)]" />
        </div>
      </section>
    </div>
  );
}
