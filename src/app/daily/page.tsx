import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Lightbulb,
  NotebookPen,
  Plus,
  Repeat2,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  generateDailyReviewAction,
} from "@/app/daily/actions";
import { TaskCompletionToggle } from "@/components/task-completion-toggle";
import { HabitCheckinToggle } from "@/components/habit-checkin-toggle";
import { DeleteButton } from "@/components/delete-button";
import { PinToggle } from "@/components/pin-toggle";
import { getBeijingDateValue, getBeijingDateAfter } from "@/lib/date";
import { normalizeStringList } from "@/lib/utils";
import { FeedbackMessage } from "@/components/feedback-message";
import { buildLoginPath, loginRequiredMessage } from "@/lib/auth/paths";
import { getCurrentUser } from "@/lib/auth/session";
import {
  buildDailyReviewInputWithSelectedOriginals,
  buildDailyReviewContext,
  type DailyReviewContext,
} from "@/lib/ai/daily-review-context";
import { getAiConfigStatus } from "@/lib/ai/config";
import {
  getActiveHabitsForUser,
  getHabitCheckinsForUser,
  getTodayDailyReviewReportForUser,
  getTodayIdeasForUser,
  getTodayLifeEventsForUser,
  getTodayScheduleItemsForUser,
  getTodayTasksForUser,
  type ActiveHabit,
  type HabitCheckin,
  type TodayTask,
} from "@/lib/data/user-data";
import {
  getScheduleRecurrenceLabel,
  type ScheduleRecurrence,
  scheduleRecurrences,
} from "@/lib/schedules/options";
import {
  getTaskCategoryLabel,
  getTaskStatusLabel,
  taskCategories,
  taskStatuses,
} from "@/lib/tasks/options";
import {
  dailyHabitErrorFeedback,
  dailyHabitUpdatedFeedback,
  dailyRecordCreatedFeedback,
  dailyRecordErrorFeedback,
  dailyRecordUpdatedFeedback,
  dailyReviewErrorFeedback,
  dailyScheduleErrorFeedback,
  dailyScheduleUpdatedFeedback,
  dailyTaskErrorFeedback,
  dailyTaskUpdatedFeedback,
  defaultHabitErrorFeedback,
  defaultRecordErrorFeedback,
  defaultReviewErrorFeedback,
  defaultScheduleErrorFeedback,
  defaultTaskErrorFeedback,
  getFeedbackByCode,
  type FeedbackMessage as FeedbackMessageData,
} from "@/lib/feedback";

type DailyPageProps = {
  searchParams?: Promise<{
    create?: string;
    view?: string;
    taskCreated?: string;
    taskError?: string;
    taskUpdated?: string;
    habitCreated?: string;
    habitError?: string;
    habitUpdated?: string;
    scheduleCreated?: string;
    scheduleError?: string;
    scheduleUpdated?: string;
    recordCreated?: string;
    recordError?: string;
    recordUpdated?: string;
    reviewPreview?: string;
    reviewGenerated?: string;
    reviewCached?: string;
    reviewError?: string;
    originalSelection?: string;
    originalEventId?: string | string[];
  }>;
};

const beijingDateFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "long",
});

const beijingShortDateFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  month: "2-digit",
  day: "2-digit",
});

const beijingDateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const emotionOptions = [
  "平静",
  "开心",
  "满足",
  "期待",
  "兴奋",
  "焦虑",
  "疲惫",
  "低落",
  "委屈",
  "生气",
  "压力",
  "混乱",
  "孤独",
  "感激",
] as const;

const aiAnalysisPermissions = [
  { value: "none", label: "不参与 AI 分析" },
  { value: "summary_only", label: "仅摘要参与" },
  { value: "allow_original", label: "允许原文参与" },
] as const;

const ideaStatusOptions = [
  { value: "to_review", label: "待处理" },
  { value: "converted_to_task", label: "已转任务" },
  { value: "shelved", label: "已搁置" },
  { value: "abandoned", label: "已放弃" },
] as const;

type DailySectionId = "tasks" | "habits" | "schedule" | "notes";

const dailySections: Array<{
  id: DailySectionId;
  title: string;
  emptyTitle: string;
  emptyDescription: string;
  actionLabel: string;
  Icon: typeof ClipboardList;
  EmptyIcon: typeof Plus;
  tone: string;
  href: string;
}> = [
  {
    id: "tasks",
    title: "今日任务",
    emptyTitle: "暂无今日任务",
    emptyDescription: "可以先创建今天要推进的第一项任务。",
    actionLabel: "新建任务",
    Icon: ClipboardList,
    EmptyIcon: Plus,
    tone: "tone-lavender",
    href: "/checklist?tab=tasks",
  },
  {
    id: "habits",
    title: "习惯打卡",
    emptyTitle: "暂无启用习惯",
    emptyDescription: "添加习惯后，会出现在今日习惯列表。",
    actionLabel: "添加习惯",
    Icon: Repeat2,
    EmptyIcon: CheckCircle2,
    tone: "tone-sage",
    href: "/checklist?tab=habits",
  },
  {
    id: "schedule",
    title: "今日日程",
    emptyTitle: "暂无今日日程",
    emptyDescription: "记录日程后，会按开始时间从早到晚显示。",
    actionLabel: "记录日程",
    Icon: CalendarDays,
    EmptyIcon: CalendarDays,
    tone: "tone-clay",
    href: "/checklist?tab=schedules",
  },
  {
    id: "notes",
    title: "随手记录",
    emptyTitle: "暂无随手记录",
    emptyDescription: "事件会保存到人生笔记，灵感会保存为未来行动候选。",
    actionLabel: "写一条记录",
    Icon: NotebookPen,
    EmptyIcon: Lightbulb,
    tone: "tone-mist",
    href: "/life?tab=events",
  },
];

function WriteAction({
  isLoggedIn,
  label,
  loginPath,
}: {
  isLoggedIn: boolean;
  label: string;
  loginPath: string;
}) {
  if (!isLoggedIn) {
    return (
      <Link className="soft-button w-full sm:w-auto" href={loginPath}>
        <Plus aria-hidden="true" className="h-4 w-4" />
        登录后{label}
      </Link>
    );
  }

  return (
    <button className="soft-button w-full sm:w-auto" type="button" disabled>
      <Plus aria-hidden="true" className="h-4 w-4" />
      {label}待接入
    </button>
  );
}

function getHabitStats(habit: ActiveHabit, checkins: HabitCheckin[], todayDate: string) {
  const habitCheckins = checkins.filter((checkin) => checkin.habitId === habit.id);
  const checkedDates = new Set(
    habitCheckins
      .filter((checkin) => checkin.status === "checked")
      .map((checkin) => checkin.checkinDate),
  );
  const todayCheckin = habitCheckins.find((checkin) => checkin.checkinDate === todayDate);
  let streakCount = 0;

  if (checkedDates.has(todayDate)) {
    let cursorDate = todayDate;

    while (checkedDates.has(cursorDate)) {
      streakCount += 1;
      cursorDate = getBeijingDateAfter(-1, new Date(`${cursorDate}T00:00:00+08:00`));
    }
  }

  return {
    isCheckedToday: todayCheckin?.status === "checked",
    totalCount: checkedDates.size,
    streakCount,
  };
}





function formatScheduleTimeRange(startTime: string | null, endTime: string | null) {
  const start = startTime ? startTime.slice(0, 5) : "未设置时间";

  return endTime ? `${start}-${endTime.slice(0, 5)}` : start;
}

function formatScheduleDateMeta(item: {
  startDate: string;
  endDate: string | null;
  recurrence: ScheduleRecurrence;
}) {
  if (item.recurrence === "none") {
    return item.startDate;
  }

  const end = item.endDate ? ` 至 ${item.endDate}` : "";

  return `${getScheduleRecurrenceLabel(item.recurrence)} · ${item.startDate}${end}`;
}

function getAiAnalysisPermissionLabel(value: string) {
  return aiAnalysisPermissions.find((item) => item.value === value)?.label ?? "仅摘要参与";
}

function getIdeaStatusLabel(value: string) {
  return ideaStatusOptions.find((item) => item.value === value)?.label ?? value;
}

function getTaskStatusTone(status: TodayTask["status"]) {
  return `task-status-${status}`;
}

function getRecordPreview(content: string) {
  return content.length > 96 ? `${content.slice(0, 96)}...` : content;
}

function getDailySectionId(value: string | undefined): DailySectionId | null {
  return dailySections.some((section) => section.id === value)
    ? (value as DailySectionId)
    : null;
}

function getCreateSectionId(value: string | undefined): DailySectionId | null {
  if (value === "task") {
    return "tasks";
  }

  if (value === "habit") {
    return "habits";
  }

  if (value === "schedule") {
    return "schedule";
  }

  if (value === "record") {
    return "notes";
  }

  return null;
}

function getCreateHref(sectionId: DailySectionId) {
  const createValue: Record<DailySectionId, string> = {
    tasks: "task",
    habits: "habit",
    schedule: "schedule",
    notes: "record",
  };

  return `/daily?view=${sectionId}&create=${createValue[sectionId]}#${sectionId}`;
}

function getSearchParamValues(
  params: Awaited<DailyPageProps["searchParams"]>,
  key: "originalEventId",
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

function DailyReviewPreview({
  context,
  selectedOriginalEventIds,
  isAiReady,
}: {
  context: DailyReviewContext;
  selectedOriginalEventIds: string[];
  isAiReady: boolean;
}) {
  const previewInput = buildDailyReviewInputWithSelectedOriginals(context, selectedOriginalEventIds);
  const selectedOriginalIds = new Set(selectedOriginalEventIds);
  const previewMetrics = [
    {
      label: "任务完成率",
      value: `${getNumberStat(context.stats, "tasks", "completionRate")}%`,
      detail: `${getNumberStat(context.stats, "tasks", "completed")}/${getNumberStat(context.stats, "tasks", "total")} 项已完成`,
    },
    {
      label: "习惯打卡",
      value: `${getNumberStat(context.stats, "habits", "checkedToday")}/${getNumberStat(context.stats, "habits", "active")}`,
      detail: "今日启用习惯完成数",
    },
    {
      label: "今日日程",
      value: `${getNumberStat(context.stats, "schedules", "total")}`,
      detail: "今日固定事项数量",
    },
    {
      label: "随手记录",
      value: `${getNumberStat(context.stats, "records", "events") + getNumberStat(context.stats, "records", "ideas")}`,
      detail: `事件 ${getNumberStat(context.stats, "records", "events")} · 灵感 ${getNumberStat(context.stats, "records", "ideas")}`,
    },
  ];
  const programSummary = [
    `${previewMetrics[0].detail}，今日任务完成率为 ${previewMetrics[0].value}。`,
    `${previewMetrics[1].detail}：${previewMetrics[1].value}。`,
    `今天记录了 ${previewMetrics[2].value} 个日程、${previewMetrics[3].value} 条事件或灵感。`,
  ];

  return (
    <section aria-labelledby="daily-review-preview" className="panel-card review-preview-panel">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="page-kicker">晚间总结</p>
          <h2 id="daily-review-preview" className="section-heading mt-1">
            今日程序复盘
          </h2>
          <p className="body-copy mt-2">
            这里先用程序统计生成今日摘要，不调用 AI；配置 AI 后才会开放确认生成。
          </p>
        </div>
        <div className="overview-detail-row">
          <span className="status-pill">程序统计</span>
          <span className="status-pill">{isAiReady ? "AI 可生成" : "AI 待配置"}</span>
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
            <h3 className="list-label">程序摘要</h3>
            <p className="body-copy mt-1">这些结论只来自已记录的数据和确定性规则，不需要 AI 环境变量。</p>
          </div>
          <span className="status-pill">无 AI 调用</span>
        </div>
        <div className="review-highlight-list mt-3">
          {programSummary.map((summary) => (
            <p key={summary} className="review-highlight-item">
              {summary}
            </p>
          ))}
        </div>
      </div>

      <div className="review-preview-section">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="list-label">关键摘要</h3>
            <p className="body-copy mt-1">这些内容来自程序整理，不包含未授权原文。</p>
          </div>
          <span className="status-pill">{context.highlights.length} 条</span>
        </div>
        {context.highlights.length ? (
          <div className="review-highlight-list mt-3">
            {context.highlights.slice(0, 10).map((highlight, index) => (
              <p key={`${highlight}-${index}`} className="review-highlight-item">
                {highlight}
              </p>
            ))}
          </div>
        ) : (
          <p className="body-copy mt-3">今天暂无可发送的关键摘要。</p>
        )}
      </div>

      <form action="/daily#daily-review-preview" className="review-preview-section" method="get">
        <input type="hidden" name="reviewPreview" value="1" />
        <input type="hidden" name="originalSelection" value="custom" />
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
                  name="originalEventId"
                  value={candidate.eventId}
                  defaultChecked={selectedOriginalIds.has(candidate.eventId)}
                />
                <span>{candidate.content}</span>
              </label>
            ))}
          </div>
        ) : (
          <p className="body-copy mt-3">今天暂无可发送的事件原文候选。</p>
        )}
      </form>

      {context.downgradedEvents.length ? (
        <div className="review-preview-section">
          <h3 className="list-label">已降级为摘要的事件</h3>
          <div className="review-highlight-list mt-3">
            {context.downgradedEvents.map((event) => (
              <p key={event.eventId} className="review-highlight-item">
                {event.summary}
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
              已为每日、周、月复盘预留当前账号个人说明书读取接口；当前不会把个人说明书放入 AI 输入。
            </p>
          </div>
          <span className="status-pill">
            {context.personalManual.manual ? "已读取当前账号" : "暂无说明书"}
          </span>
        </div>
        <div className="review-highlight-list mt-3">
          <p className="review-highlight-item">
            后续如果让个人说明书参与 AI 复盘，必须先在发送预览中明示具体内容，并由用户确认。
          </p>
          <p className="review-highlight-item">
            当前已填写字段：{context.personalManual.filledSectionLabels.length
              ? context.personalManual.filledSectionLabels.join("、")
              : "暂无"}
          </p>
        </div>
      </div>

      <div className="review-preview-actions">
        <Link href="/daily" className="quiet-button">
          取消预览
        </Link>
        {isAiReady ? (
          <form action={generateDailyReviewAction}>
            {selectedOriginalEventIds.map((eventId) => (
              <input key={eventId} type="hidden" name="originalEventId" value={eventId} />
            ))}
            <button className="soft-button" type="submit">
              确认生成 AI 复盘
            </button>
          </form>
        ) : (
          <button className="soft-button" type="button" disabled>
            AI 复盘待配置
          </button>
        )}
      </div>
    </section>
  );
}

type DailyReviewReport = NonNullable<Awaited<ReturnType<typeof getTodayDailyReviewReportForUser>>>;

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

function DailyReviewReportCard({ report }: { report: DailyReviewReport }) {
  return (
    <section id="daily-review-report" aria-labelledby="daily-review-report-title" className="panel-card review-report-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="page-kicker">今日复盘报告</p>
          <h2 id="daily-review-report-title" className="section-heading mt-1">
            {report.title}
          </h2>
          <p className="body-copy mt-2">{report.summary}</p>
        </div>
        <div className="overview-detail-row">
          <span className="status-pill">{report.modelProvider}</span>
          <span className="status-pill">{report.modelName}</span>
          {report.generatedAt ? (
            <span className="status-pill">{beijingDateTimeFormatter.format(report.generatedAt)}</span>
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

export default async function DailyPage({ searchParams }: DailyPageProps) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const aiStatus = getAiConfigStatus();
  const isLoggedIn = Boolean(user);
  const loginPath = buildLoginPath({ next: "/daily", message: loginRequiredMessage });
  const now = new Date();
  const beijingDate = beijingDateFormatter.format(now);
  const shortDate = beijingShortDateFormatter.format(now);
  const todayDate = getBeijingDateValue(now);
  const todayTasks = user ? await getTodayTasksForUser(user.id, todayDate) : [];
  const activeHabits = user ? await getActiveHabitsForUser(user.id) : [];
  const todayScheduleItems = user ? await getTodayScheduleItemsForUser(user.id, todayDate) : [];
  const todayLifeEvents = user ? await getTodayLifeEventsForUser(user.id, todayDate) : [];
  const todayIdeas = user ? await getTodayIdeasForUser(user.id, todayDate) : [];
  const todayDailyReviewReport = user ? await getTodayDailyReviewReportForUser(user.id, todayDate) : null;
  const reviewPreviewOpen = params?.reviewPreview === "1";
  const dailyReviewContext = user && reviewPreviewOpen
    ? await buildDailyReviewContext(user.id, todayDate)
    : null;
  const selectedOriginalEventIds = dailyReviewContext
    ? params?.originalSelection === "custom"
      ? getSearchParamValues(params, "originalEventId").filter((eventId) =>
          dailyReviewContext.originalCandidates.some((candidate) => candidate.eventId === eventId),
        )
      : dailyReviewContext.originalCandidates.map((candidate) => candidate.eventId)
    : [];
  const habitCheckins = user
      ? await getHabitCheckinsForUser(
        user.id,
        activeHabits.map((habit) => habit.id),
      )
    : [];
  const habitStatsById = new Map(
    activeHabits.map((habit) => [habit.id, getHabitStats(habit, habitCheckins, todayDate)]),
  );
  const taskCreated = params?.taskCreated === "1";
  const taskCreatedFeedback: FeedbackMessageData | null = taskCreated
    ? {
        tone: "success",
        title: "任务已保存",
        detail: "这条任务已关联到当前账号。",
      }
    : null;
  const taskUpdatedFeedback = getFeedbackByCode(params?.taskUpdated, dailyTaskUpdatedFeedback, {
    tone: "success",
    title: "任务已更新",
    detail: "任务状态已保存。",
  });
  const taskErrorFeedback = getFeedbackByCode(
    params?.taskError,
    dailyTaskErrorFeedback,
    defaultTaskErrorFeedback,
  );
  const habitCreated = params?.habitCreated === "1";
  const habitCreatedFeedback: FeedbackMessageData | null = habitCreated
    ? {
        tone: "success",
        title: "习惯已保存",
        detail: "这个习惯已关联到当前账号，默认处于启用状态。",
      }
    : null;
  const habitErrorFeedback = getFeedbackByCode(
    params?.habitError,
    dailyHabitErrorFeedback,
    defaultHabitErrorFeedback,
  );
  const habitUpdatedFeedback = getFeedbackByCode(params?.habitUpdated, dailyHabitUpdatedFeedback, {
    tone: "success",
    title: "习惯已更新",
    detail: "习惯打卡状态已保存。",
  });
  const scheduleCreated = params?.scheduleCreated === "1";
  const scheduleCreatedFeedback: FeedbackMessageData | null = scheduleCreated
    ? {
        tone: "success",
        title: "日程已保存",
        detail: "这条日程已关联到当前账号。",
      }
    : null;
  const scheduleUpdatedFeedback = getFeedbackByCode(
    params?.scheduleUpdated,
    dailyScheduleUpdatedFeedback,
  );
  const scheduleErrorFeedback = getFeedbackByCode(
    params?.scheduleError,
    dailyScheduleErrorFeedback,
    defaultScheduleErrorFeedback,
  );
  const recordCreatedFeedback = getFeedbackByCode(params?.recordCreated, dailyRecordCreatedFeedback, {
    tone: "success",
    title: "记录已保存",
    detail: "这条记录已关联到当前账号。",
  });
  const recordUpdatedFeedback = getFeedbackByCode(
    params?.recordUpdated,
    dailyRecordUpdatedFeedback,
  );
  const recordErrorFeedback = getFeedbackByCode(
    params?.recordError,
    dailyRecordErrorFeedback,
    defaultRecordErrorFeedback,
  );
  const reviewGenerated = params?.reviewGenerated === "1";
  const reviewCached = params?.reviewCached === "1";
  const reviewGeneratedFeedback: FeedbackMessageData | null = reviewGenerated
    ? {
        tone: "success",
        title: "今日复盘已生成",
        detail: "复盘报告已保存，后续再次打开会优先展示缓存结果。",
      }
    : null;
  const reviewCachedFeedback: FeedbackMessageData | null = reviewCached
    ? {
        tone: "info",
        title: "已展示缓存复盘",
        detail: "今天已有复盘报告，本次没有重复调用 AI。",
      }
    : null;
  const reviewErrorFeedback = getFeedbackByCode(
    params?.reviewError,
    dailyReviewErrorFeedback,
    defaultReviewErrorFeedback,
  );
  const taskCreateFormOpen =
    params?.create === "task" || params?.taskError === "missing_title" || params?.taskError === "save_failed";
  const habitCreateFormOpen =
    params?.create === "habit" || params?.habitError === "missing_name" || params?.habitError === "save_failed";
  const scheduleCreateFormOpen =
    params?.create === "schedule" ||
    params?.scheduleError === "missing_title" ||
    params?.scheduleError === "missing_time" ||
    params?.scheduleError === "invalid_time" ||
    params?.scheduleError === "invalid_date_range" ||
    params?.scheduleError === "save_failed";
  const recordCreateFormOpen =
    params?.create === "record" ||
    params?.recordError === "missing_content" ||
    params?.recordError === "invalid_type" ||
    params?.recordError === "save_failed";
  const activeSectionId: DailySectionId | null =
    getDailySectionId(params?.view) ??
    getCreateSectionId(params?.create) ??
    (params?.taskCreated || params?.taskError || params?.taskUpdated ? "tasks" : null) ??
    (params?.habitCreated || params?.habitError || params?.habitUpdated ? "habits" : null) ??
    (params?.scheduleCreated || params?.scheduleError || params?.scheduleUpdated ? "schedule" : null) ??
    (params?.recordCreated || params?.recordError || params?.recordUpdated ? "notes" : null);
  const activeSections = activeSectionId
    ? dailySections.filter((section) => section.id === activeSectionId)
    : [];
  const todayCompletedTaskCount = todayTasks.filter((task) => task.status === "completed").length;
  const todayHabitCheckedCount = activeHabits.filter((habit) =>
    habitStatsById.get(habit.id)?.isCheckedToday,
  ).length;
  const todayTaskRate = todayTasks.length
    ? Math.round((todayCompletedTaskCount / todayTasks.length) * 100)
    : 0;
  const todayHabitRate = activeHabits.length
    ? Math.round((todayHabitCheckedCount / activeHabits.length) * 100)
    : 0;
  const todayRecordCount = todayLifeEvents.length + todayIdeas.length;

  return (
    <div className="page-stack">
      <header className="page-header">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="page-kicker">每日工作台</p>
            <h1 className="page-title">今天的记录与行动</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="status-pill w-fit">北京时间</span>
            <span className="status-pill w-fit">{shortDate}</span>
          </div>
        </div>
        <p className="page-description">
          {beijingDate}。这里用于快速查看今天的任务、习惯、日程和随手记录。
        </p>
      </header>

      {!isLoggedIn ? (
        <section className="panel-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="section-heading">保存个人数据前需要登录</h2>
              <p className="body-copy mt-2">
                你仍然可以浏览每日工作台；创建任务、打卡、记录事件或生成复盘时需要注册或登录。
              </p>
            </div>
            <Link className="soft-button w-full sm:w-auto" href={loginPath}>
              登录 / 注册
            </Link>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="daily-overview" className="panel-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="page-kicker">今日概览</p>
            <h2 id="daily-overview" className="section-heading mt-1">
              完成情况与列表入口
            </h2>
          </div>
          <span className="status-pill w-fit">点击卡片进入列表</span>
        </div>

        <div className="insight-kpi-grid mt-5">
          <Link className="daily-summary-card daily-summary-card-link tone-lavender" href="/checklist?tab=tasks">
            <div className="metric-label">任务完成率</div>
            <div className="metric-value">{todayTaskRate}%</div>
            <p className="body-copy mt-2">
              {todayCompletedTaskCount}/{todayTasks.length} 项已完成
            </p>
            <div className="overview-progress mt-4">
              <span style={{ width: `${todayTaskRate}%` }} />
            </div>
          </Link>

          <Link className="daily-summary-card daily-summary-card-link tone-sage" href="/checklist?tab=habits">
            <div className="metric-label">习惯打卡</div>
            <div className="metric-value">
              {todayHabitCheckedCount}/{activeHabits.length}
            </div>
            <p className="body-copy mt-2">今日已完成的启用习惯。</p>
            <div className="overview-progress mt-4">
              <span style={{ width: `${todayHabitRate}%` }} />
            </div>
          </Link>

          <Link className="daily-summary-card daily-summary-card-link tone-clay" href="/checklist?tab=schedules">
            <div className="metric-label">今日日程</div>
            <div className="metric-value">{todayScheduleItems.length}</div>
            <p className="body-copy mt-2">今天已记录的固定事项数量。</p>
          </Link>

          <Link className="daily-summary-card daily-summary-card-link tone-mist" href="/life?tab=events">
            <div className="metric-label">随手记录</div>
            <div className="metric-value">{todayRecordCount}</div>
            <div className="overview-detail-row mt-3">
              <span className="status-pill">事件 {todayLifeEvents.length}</span>
              <span className="status-pill">灵感 {todayIdeas.length}</span>
            </div>
          </Link>
        </div>
      </section>

      <section aria-labelledby="daily-review-entry" className="panel-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="page-kicker">晚间总结</p>
            <h2 id="daily-review-entry" className="section-heading mt-1">
              每日复盘
            </h2>
            <p className="body-copy mt-2">
              先查看程序统计摘要。AI 未配置时仍可使用基础分析，配置后再生成 AI 复盘。
            </p>
          </div>
          {isLoggedIn ? (
            <Link className="soft-button w-full sm:w-auto" href="/insights">
              <Sparkles aria-hidden="true" className="h-4 w-4" />
              进入复盘
            </Link>
          ) : (
            <Link className="soft-button w-full sm:w-auto" href="/insights">
              <Sparkles aria-hidden="true" className="h-4 w-4" />
              进入复盘
            </Link>
          )}
        </div>
        <FeedbackMessage feedback={reviewErrorFeedback} className="mt-4" />
        <FeedbackMessage feedback={reviewGeneratedFeedback} className="mt-4" />
        <FeedbackMessage feedback={reviewCachedFeedback} className="mt-4" />
      </section>

      {todayDailyReviewReport ? (
        <DailyReviewReportCard report={todayDailyReviewReport} />
      ) : null}

      {dailyReviewContext ? (
        <DailyReviewPreview
          context={dailyReviewContext}
          isAiReady={aiStatus.isDailyReviewReady}
          selectedOriginalEventIds={selectedOriginalEventIds}
        />
      ) : null}

      {activeSections.length ? (
        <section
          id="daily-list-section"
          aria-label="每日工作台当前列表"
          className="workspace-grid active-workspace-grid"
        >
        {activeSections.map((section) => {
          const Icon = section.Icon;
          const EmptyIcon = section.EmptyIcon;
          const isTaskSection = section.id === "tasks";
          const isHabitSection = section.id === "habits";
          const isScheduleSection = section.id === "schedule";
          const isNotesSection = section.id === "notes";

          return (
          <article
            key={section.id}
            id={section.id}
            className={`workspace-panel ${section.tone}`}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-3">
                <span className="nav-icon">
                  <Icon aria-hidden="true" className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="section-heading mt-1">{section.title}</h2>
                </div>
              </div>
              <Link className="soft-button w-full sm:w-auto text-sm" href={section.href}>
                去{section.actionLabel} →
              </Link>
            </div>

            {isTaskSection && isLoggedIn ? (
              <div className="mt-5">
                <FeedbackMessage feedback={taskErrorFeedback} />
                <FeedbackMessage feedback={taskCreatedFeedback} />
                <FeedbackMessage feedback={taskUpdatedFeedback} />

                {todayTasks.length > 0 ? (
                  <div className="task-list">
                    {todayTasks.map((task) => (
                      <article key={task.id} className={`task-list-item compact-list-item ${getTaskStatusTone(task.status)}`}>
                        <div className="compact-main-row">
                          <TaskCompletionToggle taskId={task.id} isCompleted={task.status === "completed"} />
                          <div className="min-w-0">
                            <Link className="list-label list-title-link" href={`/records/task/${task.id}`}>
                              {task.title}
                            </Link>
                            <p className="list-meta mt-1">
                              {getTaskCategoryLabel(task.category)} · {task.taskDate}
                              {task.isPostponed
                                ? ` · 延期 ${task.postponedFromDate ?? "未记录"} -> ${task.postponedToDate ?? "未记录"}`
                                : ""}
                            </p>
                          </div>
                        </div>
                        <div className="compact-actions">
                          <PinToggle id={task.id} isPinned={task.isPinned} kind="task" />
                          <span className={`status-pill ${getTaskStatusTone(task.status)}`}>
                            {getTaskStatusLabel(task.status)}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <span className="empty-icon">
                      <EmptyIcon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="list-label">{section.emptyTitle}</p>
                      <p className="body-copy mt-1">{section.emptyDescription}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : isHabitSection && isLoggedIn ? (
              <div className="mt-5">
                <FeedbackMessage feedback={habitErrorFeedback} />
                <FeedbackMessage feedback={habitCreatedFeedback} />
                <FeedbackMessage feedback={habitUpdatedFeedback} />

                {activeHabits.length > 0 ? (
                  <div className="task-list">
                    {activeHabits.map((habit) => {
                      const stats = habitStatsById.get(habit.id) ?? {
                        isCheckedToday: false,
                        totalCount: 0,
                        streakCount: 0,
                      };

                      return (
                        <article key={habit.id} className={`task-list-item compact-list-item ${stats.isCheckedToday ? "task-status-completed" : "task-status-todo"}`}>
                          <div className="compact-main-row">
                            <HabitCheckinToggle habitId={habit.id} isCheckedToday={stats.isCheckedToday} />
                            <div className="min-w-0">
                              <p className="list-label">{habit.name}</p>
                              <p className="list-meta mt-1">
                                {getTaskCategoryLabel(habit.category)} · {habit.startDate ?? "未设置开始日期"} ·
                                累计 {stats.totalCount} 次 · 连续 {stats.streakCount} 天
                              </p>
                              {habit.description ? (
                                <p className="list-meta mt-1">{getRecordPreview(habit.description)}</p>
                              ) : null}
                            </div>
                          </div>
                          <div className="compact-actions">
                            <PinToggle id={habit.id} isPinned={habit.isPinned} kind="habit" />

                            <DeleteButton id={habit.id} kind="habit" />
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-state">
                    <span className="empty-icon">
                      <EmptyIcon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="list-label">{section.emptyTitle}</p>
                      <p className="body-copy mt-1">{section.emptyDescription}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : isScheduleSection && isLoggedIn ? (
              <div className="mt-5">
                <FeedbackMessage feedback={scheduleErrorFeedback} />
                <FeedbackMessage feedback={scheduleCreatedFeedback} />
                <FeedbackMessage feedback={scheduleUpdatedFeedback} />

                {todayScheduleItems.length > 0 ? (
                  <div className="task-list">
                    {todayScheduleItems.map((item) => (
                      <article key={item.id} className="task-list-item compact-list-item task-status-todo">
                        <div className="compact-main-row">
                          <div className="schedule-time-chip">
                            {item.startTime ? item.startTime.slice(0, 5) : "--:--"}
                          </div>
                          <div className="min-w-0">
                            <Link className="list-label list-title-link" href={`/records/schedule/${item.id}`}>
                              {item.title}
                            </Link>
                            <p className="list-meta mt-1">
                              {getTaskCategoryLabel(item.category)} · {formatScheduleDateMeta(item)}
                            </p>
                          </div>
                        </div>
                        <div className="compact-actions">
                          <PinToggle id={item.id} isPinned={item.isPinned} kind="schedule" />
                          <DeleteButton id={item.id} kind="schedule" />
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <span className="empty-icon">
                      <EmptyIcon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="list-label">{section.emptyTitle}</p>
                      <p className="body-copy mt-1">{section.emptyDescription}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : isNotesSection && isLoggedIn ? (
              <div className="mt-5">
                <FeedbackMessage feedback={recordErrorFeedback} />
                <FeedbackMessage feedback={recordCreatedFeedback} />
                <FeedbackMessage feedback={recordUpdatedFeedback} />

                {(todayLifeEvents.length > 0 || todayIdeas.length > 0) ? (
                  <div className="task-list">
                    {todayLifeEvents.map((event) => (
                      <article key={event.id} className="task-list-item compact-list-item task-status-todo">
                        <div className="compact-main-row">
                          <div className="min-w-0">
                            <Link className="list-label list-title-link two-line-preview" href={`/records/event/${event.id}`}>
                              {getRecordPreview(event.content)}
                            </Link>
                          </div>
                        </div>
                        <div className="compact-actions">
                          <PinToggle id={event.id} isPinned={event.isPinned} kind="event" />
                          <DeleteButton id={event.id} kind="event" />
                        </div>
                      </article>
                    ))}
                    {todayIdeas.map((idea) => (
                      <article key={idea.id} className="task-list-item compact-list-item task-status-todo">
                        <div className="compact-main-row">
                          <div className="min-w-0">
                            <Link className="list-label list-title-link" href={`/records/idea/${idea.id}`}>
                              {getRecordPreview(idea.content)}
                            </Link>
                          </div>
                        </div>
                        <div className="compact-actions">
                          <PinToggle id={idea.id} isPinned={idea.isPinned} kind="idea" />
                          <DeleteButton id={idea.id} kind="idea" />
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <span className="empty-icon">
                      <EmptyIcon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="list-label">{section.emptyTitle}</p>
                      <p className="body-copy mt-1">{section.emptyDescription}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </article>
          );
        })}
        </section>
      ) : null}
    </div>
  );
}
