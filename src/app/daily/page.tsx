import Link from "next/link";
import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Lightbulb,
  NotebookPen,
  Plus,
  Repeat2,
  Sparkles,
} from "lucide-react";

import {
  createHabitAction,
  createQuickRecordAction,
  createScheduleItemAction,
  createTaskAction,
  updateHabitCheckinAction,
  updateTaskStatusAction,
} from "@/app/daily/actions";
import { db } from "@/db";
import {
  habitCheckins as habitCheckinTable,
  habits as habitTable,
  ideas as ideaTable,
  lifeEvents as lifeEventTable,
  scheduleItems as scheduleItemTable,
  tasks as taskTable,
} from "@/db/schema";
import { buildLoginPath, loginRequiredMessage } from "@/lib/auth/paths";
import { getCurrentUser } from "@/lib/auth/session";
import {
  buildDailyReviewInputWithSelectedOriginals,
  buildDailyReviewContext,
  type DailyReviewContext,
} from "@/lib/ai/daily-review-context";
import {
  getTaskCategoryLabel,
  getTaskStatusLabel,
  taskStatusOrder,
  taskCategories,
  taskStatuses,
} from "@/lib/tasks/options";

type DailyPageProps = {
  searchParams?: Promise<{
    taskCreated?: string;
    taskError?: string;
    taskUpdated?: string;
    habitCreated?: string;
    habitError?: string;
    habitUpdated?: string;
    scheduleCreated?: string;
    scheduleError?: string;
    recordCreated?: string;
    recordError?: string;
    reviewPreview?: string;
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

const taskErrorText: Record<string, string> = {
  missing_title: "请先填写任务标题，再保存。",
  invalid_status: "任务状态无效，请刷新页面后重试。",
  missing_postponed_date: "延期任务需要选择新的日期。",
  missing_task: "没有找到这条任务，请刷新页面后重试。",
};

const taskUpdatedText: Record<string, string> = {
  in_progress: "任务已标记为进行中。",
  completed: "任务已标记为已完成。",
  postponed: "任务已延期，并同步更新到新的任务日期。",
};

const habitErrorText: Record<string, string> = {
  missing_name: "请先填写习惯名称，再保存。",
  invalid_checkin: "习惯打卡操作无效，请刷新页面后重试。",
  missing_habit: "没有找到这个启用习惯，请刷新页面后重试。",
};

const habitUpdatedText: Record<string, string> = {
  checked: "今日习惯已打卡。",
  skipped: "今日打卡已取消。",
};

const scheduleErrorText: Record<string, string> = {
  missing_title: "请先填写日程标题，再保存。",
  missing_time: "请先选择日程时间，再保存。",
  invalid_time: "日程时间格式无效，请重新选择时间。",
};

const recordErrorText: Record<string, string> = {
  missing_content: "请先填写记录内容，再保存。",
  invalid_type: "记录类型无效，请刷新页面后重试。",
};

const recordCreatedText: Record<string, string> = {
  event: "事件已保存，不会自动触发 AI 分析。",
  idea: "灵感已保存为待处理状态。",
};

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

function buildOverviewCards(
  taskCount: number,
  completedTaskCount: number,
  inProgressTaskCount: number,
  postponedTaskCount: number,
  activeHabitCount: number,
  checkedHabitCount: number,
  scheduleCount: number,
  eventCount: number,
  ideaCount: number,
) {
  const completionRate = taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0;
  const recordCount = eventCount + ideaCount;

  return [
    {
      label: "今日任务",
      value: `${completionRate}%`,
      progress: completionRate,
      note:
        taskCount > 0
          ? `${completedTaskCount}/${taskCount} 项已完成。`
          : "暂无待办，可以先创建今天的第一项任务。",
      details:
        taskCount > 0
          ? [
              `总数 ${taskCount}`,
              `进行中 ${inProgressTaskCount}`,
              `延期 ${postponedTaskCount}`,
            ]
          : ["总数 0", "完成率 0%"],
      tone: "tone-lavender",
    },
    {
      label: "习惯打卡",
      value: `${checkedHabitCount}/${activeHabitCount}`,
      progress: activeHabitCount > 0 ? Math.round((checkedHabitCount / activeHabitCount) * 100) : 0,
      note: activeHabitCount > 0 ? "今日已完成的习惯打卡数。" : "暂无启用习惯，可以先添加一个长期习惯。",
      details:
        activeHabitCount > 0
          ? [`启用 ${activeHabitCount}`, `已打卡 ${checkedHabitCount}`]
          : ["启用 0", "已打卡 0"],
      tone: "tone-sage",
    },
    {
      label: "今日日程",
      value: `${scheduleCount}`,
      progress: scheduleCount > 0 ? 100 : 0,
      note: scheduleCount > 0 ? "今日已记录的固定事项数量。" : "暂无固定事项，可以先记录今天的第一个日程。",
      details: [`日程 ${scheduleCount}`],
      tone: "tone-mist",
    },
    {
      label: "随手记录",
      value: `${recordCount}`,
      progress: recordCount > 0 ? 100 : 0,
      note: recordCount > 0 ? "今日已保存的事件和灵感数量。" : "暂无事件或灵感，可以先写一条记录。",
      details: [`事件 ${eventCount}`, `灵感 ${ideaCount}`],
      tone: "tone-clay",
    },
  ];
}

const dailySections = [
  {
    id: "tasks",
    title: "今日任务",
    eyebrow: "行动",
    description: "用于安排今天要推进的学习、工作、生活、健康和关系任务。",
    emptyTitle: "暂无今日任务",
    emptyDescription: "创建任务功能会在 Step 3.2 接入，默认日期会落在今天。",
    actionLabel: "新建任务",
    Icon: ClipboardList,
    EmptyIcon: Plus,
    tone: "tone-lavender",
    previewItems: ["未开始", "进行中", "已完成", "延期"],
  },
  {
    id: "habits",
    title: "习惯打卡",
    eyebrow: "稳定性",
    description: "用于记录今天是否完成长期习惯，并为连续天数和累计次数提供数据。",
    emptyTitle: "暂无启用习惯",
    emptyDescription: "添加习惯后，会先出现在今日习惯列表；打卡功能在 Step 3.5 接入。",
    actionLabel: "添加习惯",
    Icon: Repeat2,
    EmptyIcon: CheckCircle2,
    tone: "tone-sage",
    previewItems: ["今日完成", "今日跳过", "连续天数", "复盘原因"],
  },
  {
    id: "schedule",
    title: "今日日程",
    eyebrow: "时间",
    description: "用于记录今天的固定事项、开始时间和分类，先做单日记录。",
    emptyTitle: "暂无今日日程",
    emptyDescription: "记录日程后，会按开始时间从早到晚显示。",
    actionLabel: "记录日程",
    Icon: CalendarDays,
    EmptyIcon: CalendarDays,
    tone: "tone-clay",
    previewItems: ["开始时间", "结束时间", "分类", "说明"],
  },
  {
    id: "notes",
    title: "随手记录",
    eyebrow: "沉淀",
    description: "用于记录已经发生的事件、灵感、情绪标签和下次行动。",
    emptyTitle: "暂无随手记录",
    emptyDescription: "事件会保存到人生笔记，灵感会保存为未来行动候选。",
    actionLabel: "写一条记录",
    Icon: NotebookPen,
    EmptyIcon: Lightbulb,
    tone: "tone-mist",
    previewItems: ["事件", "灵感", "情绪标签", "下次行动"],
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

async function getTodayTasks(userId: string, todayDate: string) {
  return db
    .select({
      id: taskTable.id,
      title: taskTable.title,
      category: taskTable.category,
      status: taskTable.status,
      taskDate: taskTable.taskDate,
      isPostponed: taskTable.isPostponed,
      postponedFromDate: taskTable.postponedFromDate,
      postponedToDate: taskTable.postponedToDate,
      createdAt: taskTable.createdAt,
    })
    .from(taskTable)
    .where(
      and(
        eq(taskTable.userId, userId),
        eq(taskTable.taskDate, todayDate),
        isNull(taskTable.deletedAt),
      ),
    )
    .orderBy(asc(taskTable.createdAt));
}

async function getActiveHabits(userId: string) {
  return db
    .select({
      id: habitTable.id,
      name: habitTable.name,
      category: habitTable.category,
      isActive: habitTable.isActive,
      startDate: habitTable.startDate,
      createdAt: habitTable.createdAt,
    })
    .from(habitTable)
    .where(
      and(
        eq(habitTable.userId, userId),
        eq(habitTable.isActive, true),
        isNull(habitTable.deletedAt),
      ),
    )
    .orderBy(asc(habitTable.createdAt));
}

type TodayTask = Awaited<ReturnType<typeof getTodayTasks>>[number];
type ActiveHabit = Awaited<ReturnType<typeof getActiveHabits>>[number];

async function getTodayScheduleItems(userId: string, todayDate: string) {
  return db
    .select({
      id: scheduleItemTable.id,
      title: scheduleItemTable.title,
      category: scheduleItemTable.category,
      scheduleDate: scheduleItemTable.scheduleDate,
      startTime: scheduleItemTable.startTime,
      endTime: scheduleItemTable.endTime,
      createdAt: scheduleItemTable.createdAt,
    })
    .from(scheduleItemTable)
    .where(
      and(
        eq(scheduleItemTable.userId, userId),
        eq(scheduleItemTable.scheduleDate, todayDate),
        isNull(scheduleItemTable.deletedAt),
      ),
    )
    .orderBy(asc(scheduleItemTable.startTime), asc(scheduleItemTable.createdAt));
}

async function getTodayLifeEvents(userId: string, todayDate: string) {
  return db
    .select({
      id: lifeEventTable.id,
      content: lifeEventTable.content,
      eventDate: lifeEventTable.eventDate,
      emotionTags: lifeEventTable.emotionTags,
      tags: lifeEventTable.tags,
      aiAnalysisPermission: lifeEventTable.aiAnalysisPermission,
      createdAt: lifeEventTable.createdAt,
    })
    .from(lifeEventTable)
    .where(
      and(
        eq(lifeEventTable.userId, userId),
        eq(lifeEventTable.eventDate, todayDate),
        isNull(lifeEventTable.deletedAt),
      ),
    )
    .orderBy(desc(lifeEventTable.createdAt));
}

async function getTodayIdeas(userId: string, todayDate: string) {
  return db
    .select({
      id: ideaTable.id,
      content: ideaTable.content,
      ideaDate: ideaTable.ideaDate,
      status: ideaTable.status,
      createdAt: ideaTable.createdAt,
    })
    .from(ideaTable)
    .where(
      and(
        eq(ideaTable.userId, userId),
        eq(ideaTable.ideaDate, todayDate),
        isNull(ideaTable.deletedAt),
      ),
    )
    .orderBy(desc(ideaTable.createdAt));
}

async function getHabitCheckins(userId: string, habitIds: string[]) {
  if (habitIds.length === 0) {
    return [];
  }

  return db
    .select({
      habitId: habitCheckinTable.habitId,
      checkinDate: habitCheckinTable.checkinDate,
      status: habitCheckinTable.status,
    })
    .from(habitCheckinTable)
    .where(
      and(
        eq(habitCheckinTable.userId, userId),
        inArray(habitCheckinTable.habitId, habitIds),
      ),
    )
    .orderBy(asc(habitCheckinTable.checkinDate));
}

type HabitCheckin = Awaited<ReturnType<typeof getHabitCheckins>>[number];

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

function TaskStatusAction({
  task,
  status,
  label,
}: {
  task: TodayTask;
  status: "in_progress" | "completed";
  label: string;
}) {
  if (task.status === status) {
    return null;
  }

  return (
    <form action={updateTaskStatusAction}>
      <input type="hidden" name="taskId" value={task.id} />
      <input type="hidden" name="status" value={status} />
      <button className="quiet-button" type="submit">
        {label}
      </button>
    </form>
  );
}

function PostponeTaskAction({
  task,
  defaultPostponedDate,
}: {
  task: TodayTask;
  defaultPostponedDate: string;
}) {
  return (
    <form action={updateTaskStatusAction} className="postpone-form">
      <input type="hidden" name="taskId" value={task.id} />
      <input type="hidden" name="status" value="postponed" />
      <input
        aria-label={`${task.title} 的延期日期`}
        className="compact-date-input"
        name="postponedToDate"
        type="date"
        defaultValue={defaultPostponedDate}
        required
      />
      <button className="quiet-button" type="submit">
        延期
      </button>
    </form>
  );
}

function HabitCheckinAction({
  habit,
  isCheckedToday,
}: {
  habit: ActiveHabit;
  isCheckedToday: boolean;
}) {
  return (
    <form action={updateHabitCheckinAction}>
      <input type="hidden" name="habitId" value={habit.id} />
      <input type="hidden" name="intent" value={isCheckedToday ? "cancel" : "check"} />
      <button className={isCheckedToday ? "quiet-button" : "soft-button"} type="submit">
        {isCheckedToday ? "取消打卡" : "今日打卡"}
      </button>
    </form>
  );
}

function formatScheduleTimeRange(startTime: string | null, endTime: string | null) {
  const start = startTime ? startTime.slice(0, 5) : "未设置时间";

  return endTime ? `${start}-${endTime.slice(0, 5)}` : start;
}

function getAiAnalysisPermissionLabel(value: string) {
  return aiAnalysisPermissions.find((item) => item.value === value)?.label ?? "仅摘要参与";
}

function getRecordPreview(content: string) {
  return content.length > 96 ? `${content.slice(0, 96)}...` : content;
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
}: {
  context: DailyReviewContext;
  selectedOriginalEventIds: string[];
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

  return (
    <section aria-labelledby="daily-review-preview" className="panel-card review-preview-panel">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="page-kicker">晚间总结</p>
          <h2 id="daily-review-preview" className="section-heading mt-1">
            今日复盘发送预览
          </h2>
          <p className="body-copy mt-2">
            当前只展示将发送给 AI 的内容，不会调用 AI。确认生成会在下一步接入。
          </p>
        </div>
        <div className="overview-detail-row">
          <span className="status-pill">不调用 AI</span>
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

      <div className="review-preview-actions">
        <Link href="/daily" className="quiet-button">
          取消预览
        </Link>
        <button className="soft-button" type="button" disabled>
          确认生成待接入
        </button>
      </div>
    </section>
  );
}

export default async function DailyPage({ searchParams }: DailyPageProps) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const isLoggedIn = Boolean(user);
  const loginPath = buildLoginPath({ next: "/daily", message: loginRequiredMessage });
  const now = new Date();
  const beijingDate = beijingDateFormatter.format(now);
  const shortDate = beijingShortDateFormatter.format(now);
  const todayDate = getBeijingDateValue(now);
  const defaultPostponedDate = getBeijingDateAfter(1, now);
  const todayTasks = user ? await getTodayTasks(user.id, todayDate) : [];
  const activeHabits = user ? await getActiveHabits(user.id) : [];
  const todayScheduleItems = user ? await getTodayScheduleItems(user.id, todayDate) : [];
  const todayLifeEvents = user ? await getTodayLifeEvents(user.id, todayDate) : [];
  const todayIdeas = user ? await getTodayIdeas(user.id, todayDate) : [];
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
    ? await getHabitCheckins(
        user.id,
        activeHabits.map((habit) => habit.id),
      )
    : [];
  const habitStatsById = new Map(
    activeHabits.map((habit) => [habit.id, getHabitStats(habit, habitCheckins, todayDate)]),
  );
  const completedTaskCount = todayTasks.filter((task) => task.status === "completed").length;
  const inProgressTaskCount = todayTasks.filter((task) => task.status === "in_progress").length;
  const postponedTaskCount = todayTasks.filter((task) => task.status === "postponed").length;
  const checkedHabitCount = activeHabits.filter(
    (habit) => habitStatsById.get(habit.id)?.isCheckedToday,
  ).length;
  const overviewCards = buildOverviewCards(
    todayTasks.length,
    completedTaskCount,
    inProgressTaskCount,
    postponedTaskCount,
    activeHabits.length,
    checkedHabitCount,
    todayScheduleItems.length,
    todayLifeEvents.length,
    todayIdeas.length,
  );
  const taskCreated = params?.taskCreated === "1";
  const taskUpdated = params?.taskUpdated ? taskUpdatedText[params.taskUpdated] ?? "任务状态已更新。" : "";
  const taskError = params?.taskError ? taskErrorText[params.taskError] ?? "任务保存失败，请稍后重试。" : "";
  const habitCreated = params?.habitCreated === "1";
  const habitError = params?.habitError ? habitErrorText[params.habitError] ?? "习惯保存失败，请稍后重试。" : "";
  const habitUpdated = params?.habitUpdated
    ? habitUpdatedText[params.habitUpdated] ?? "习惯打卡已更新。"
    : "";
  const scheduleCreated = params?.scheduleCreated === "1";
  const scheduleError = params?.scheduleError
    ? scheduleErrorText[params.scheduleError] ?? "日程保存失败，请稍后重试。"
    : "";
  const recordCreated = params?.recordCreated
    ? recordCreatedText[params.recordCreated] ?? "记录已保存。"
    : "";
  const recordError = params?.recordError
    ? recordErrorText[params.recordError] ?? "记录保存失败，请稍后重试。"
    : "";
  const tasksByStatus = taskStatusOrder.map((status) => ({
    status,
    tasks: todayTasks.filter((task) => task.status === status),
  }));

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
      ) : (
        <section className="panel-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="section-heading">已登录</h2>
              <p className="body-copy mt-2">
                页面结构已准备好；后续接入的保存动作会关联到当前账号。
              </p>
            </div>
            <span className="status-pill w-fit">可写入账号</span>
          </div>
        </section>
      )}

      <section aria-labelledby="daily-overview" className="panel-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="page-kicker">今日概览</p>
            <h2 id="daily-overview" className="section-heading mt-1">
              今日基础状态
            </h2>
          </div>
          <span className="status-pill w-fit">程序统计，不调用 AI</span>
        </div>
        <div className="daily-summary-grid mt-5">
          {overviewCards.map((card) => (
            <article key={card.label} className={`daily-summary-card ${card.tone}`}>
              <p className="metric-label">{card.label}</p>
              <p className="metric-value">{card.value}</p>
              <p className="body-copy mt-2">{card.note}</p>
              <div aria-hidden="true" className="overview-progress mt-4">
                <span style={{ width: `${card.progress}%` }} />
              </div>
              <div className="overview-detail-row mt-3">
                {card.details.map((detail) => (
                  <span key={detail} className="status-pill">
                    {detail}
                  </span>
                ))}
              </div>
            </article>
          ))}
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
              先预览将发送给 AI 的统计摘要、关键记录和少量事件原文；确认前不会调用 AI。
            </p>
          </div>
          {isLoggedIn ? (
            <Link className="soft-button w-full sm:w-auto" href="/daily?reviewPreview=1#daily-review-preview">
              <Sparkles aria-hidden="true" className="h-4 w-4" />
              预览今日复盘
            </Link>
          ) : (
            <Link className="soft-button w-full sm:w-auto" href={loginPath}>
              <Sparkles aria-hidden="true" className="h-4 w-4" />
              登录后生成复盘
            </Link>
          )}
        </div>
      </section>

      {dailyReviewContext ? (
        <DailyReviewPreview
          context={dailyReviewContext}
          selectedOriginalEventIds={selectedOriginalEventIds}
        />
      ) : null}

      <section aria-label="每日工作台分区" className="workspace-grid">
        {dailySections.map((section) => {
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
                  <p className="page-kicker">{section.eyebrow}</p>
                  <h2 className="section-heading mt-1">{section.title}</h2>
                  <p className="body-copy mt-2">{section.description}</p>
                </div>
              </div>
              {(isTaskSection || isHabitSection || isScheduleSection || isNotesSection) && isLoggedIn ? null : (
                <WriteAction isLoggedIn={isLoggedIn} label={section.actionLabel} loginPath={loginPath} />
              )}
            </div>

            {isTaskSection && isLoggedIn ? (
              <div className="mt-5 grid gap-5">
                {taskError ? (
                  <p className="auth-message auth-message-error task-message">{taskError}</p>
                ) : null}
                {taskCreated ? (
                  <p className="auth-message task-message">任务已保存，并已关联到当前账号。</p>
                ) : null}
                {taskUpdated ? (
                  <p className="auth-message task-message">{taskUpdated}</p>
                ) : null}

                <form action={createTaskAction} className="task-form">
                  <label className="form-field">
                    <span>任务标题</span>
                    <input
                      name="title"
                      type="text"
                      maxLength={120}
                      placeholder="例如：整理 AI 产品学习笔记"
                      required
                    />
                  </label>

                  <div className="task-form-grid">
                    <label className="form-field">
                      <span>分类</span>
                      <select name="category" defaultValue="study">
                        {taskCategories.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="form-field">
                      <span>日期</span>
                      <input name="taskDate" type="date" defaultValue={todayDate} required />
                    </label>

                    <label className="form-field">
                      <span>状态</span>
                      <select name="status" defaultValue="todo">
                        {taskStatuses.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <button className="soft-button w-full sm:w-fit" type="submit">
                    <Plus aria-hidden="true" className="h-4 w-4" />
                    保存任务
                  </button>
                </form>

                {todayTasks.length > 0 ? (
                  <div className="task-list">
                    {tasksByStatus.map((group) =>
                      group.tasks.length > 0 ? (
                        <section key={group.status} className="task-status-group">
                          <div className="task-status-heading">
                            <span className="status-pill">{getTaskStatusLabel(group.status)}</span>
                            <span className="body-copy">{group.tasks.length} 项</span>
                          </div>
                          <div className="task-group-list">
                            {group.tasks.map((task) => (
                              <article key={task.id} className="task-list-item">
                                <div className="min-w-0">
                                  <p className="list-label">{task.title}</p>
                                  <p className="body-copy mt-1">
                                    {getTaskCategoryLabel(task.category)} · {task.taskDate}
                                  </p>
                                  {task.isPostponed ? (
                                    <p className="body-copy mt-1">
                                      延期记录：{task.postponedFromDate ?? "未记录"} → {task.postponedToDate ?? "未记录"}
                                    </p>
                                  ) : null}
                                </div>
                                <div className="task-actions">
                                  <TaskStatusAction task={task} status="in_progress" label="进行中" />
                                  <TaskStatusAction task={task} status="completed" label="完成" />
                                  <PostponeTaskAction task={task} defaultPostponedDate={defaultPostponedDate} />
                                </div>
                              </article>
                            ))}
                          </div>
                        </section>
                      ) : null,
                    )}
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
              <div className="mt-5 grid gap-5">
                {habitError ? (
                  <p className="auth-message auth-message-error task-message">{habitError}</p>
                ) : null}
                {habitCreated ? (
                  <p className="auth-message task-message">习惯已保存，并已关联到当前账号。</p>
                ) : null}
                {habitUpdated ? (
                  <p className="auth-message task-message">{habitUpdated}</p>
                ) : null}

                <form action={createHabitAction} className="task-form">
                  <label className="form-field">
                    <span>习惯名称</span>
                    <input
                      name="name"
                      type="text"
                      maxLength={120}
                      placeholder="例如：多邻国 15 分钟"
                      required
                    />
                  </label>

                  <div className="task-form-grid">
                    <label className="form-field">
                      <span>分类</span>
                      <select name="category" defaultValue="health">
                        {taskCategories.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="form-field">
                      <span>开始日期</span>
                      <input name="startDate" type="date" defaultValue={todayDate} required />
                    </label>

                    <label className="form-field">
                      <span>启用状态</span>
                      <input type="text" value="默认启用" disabled readOnly />
                    </label>
                  </div>

                  <button className="soft-button w-full sm:w-fit" type="submit">
                    <Plus aria-hidden="true" className="h-4 w-4" />
                    保存习惯
                  </button>
                </form>

                {activeHabits.length > 0 ? (
                  <div className="task-list">
                    {activeHabits.map((habit) => {
                      const stats = habitStatsById.get(habit.id) ?? {
                        isCheckedToday: false,
                        totalCount: 0,
                        streakCount: 0,
                      };

                      return (
                        <article key={habit.id} className="task-list-item">
                          <div className="min-w-0">
                            <p className="list-label">{habit.name}</p>
                            <p className="body-copy mt-1">
                              {getTaskCategoryLabel(habit.category)} · {habit.startDate ?? "未设置开始日期"}
                            </p>
                            <div className="habit-stat-row mt-3">
                              <span className="status-pill">
                                {stats.isCheckedToday ? "今日已完成" : "今日未完成"}
                              </span>
                              <span className="status-pill">累计 {stats.totalCount} 次</span>
                              <span className="status-pill">连续 {stats.streakCount} 天</span>
                            </div>
                          </div>
                          <div className="task-actions">
                            <HabitCheckinAction habit={habit} isCheckedToday={stats.isCheckedToday} />
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
              <div className="mt-5 grid gap-5">
                {scheduleError ? (
                  <p className="auth-message auth-message-error task-message">{scheduleError}</p>
                ) : null}
                {scheduleCreated ? (
                  <p className="auth-message task-message">日程已保存，并已关联到当前账号。</p>
                ) : null}

                <form action={createScheduleItemAction} className="task-form">
                  <label className="form-field">
                    <span>日程标题</span>
                    <input
                      name="title"
                      type="text"
                      maxLength={120}
                      placeholder="例如：英语课 / 咨询 / 项目复盘"
                      required
                    />
                  </label>

                  <div className="task-form-grid">
                    <label className="form-field">
                      <span>分类</span>
                      <select name="category" defaultValue="work">
                        {taskCategories.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="form-field">
                      <span>日期</span>
                      <input name="scheduleDate" type="date" defaultValue={todayDate} required />
                    </label>

                    <label className="form-field">
                      <span>开始时间</span>
                      <input name="startTime" type="time" required />
                    </label>

                    <label className="form-field">
                      <span>结束时间</span>
                      <input name="endTime" type="time" />
                    </label>
                  </div>

                  <button className="soft-button w-full sm:w-fit" type="submit">
                    <Plus aria-hidden="true" className="h-4 w-4" />
                    保存日程
                  </button>
                </form>

                {todayScheduleItems.length > 0 ? (
                  <div className="task-list">
                    {todayScheduleItems.map((item) => (
                      <article key={item.id} className="task-list-item">
                        <div className="min-w-0">
                          <p className="list-label">{item.title}</p>
                          <p className="body-copy mt-1">
                            {formatScheduleTimeRange(item.startTime, item.endTime)} · {getTaskCategoryLabel(item.category)}
                          </p>
                        </div>
                        <span className="status-pill">{item.scheduleDate}</span>
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
              <div className="mt-5 grid gap-5">
                {recordError ? (
                  <p className="auth-message auth-message-error task-message">{recordError}</p>
                ) : null}
                {recordCreated ? (
                  <p className="auth-message task-message">{recordCreated}</p>
                ) : null}

                <form action={createQuickRecordAction} className="task-form">
                  <div className="task-form-grid">
                    <label className="form-field">
                      <span>记录类型</span>
                      <select name="recordType" defaultValue="event">
                        <option value="event">事件</option>
                        <option value="idea">灵感</option>
                      </select>
                    </label>

                    <label className="form-field">
                      <span>日期</span>
                      <input name="recordDate" type="date" defaultValue={todayDate} required />
                    </label>

                    <label className="form-field">
                      <span>AI 分析权限</span>
                      <select name="aiAnalysisPermission" defaultValue="summary_only">
                        {aiAnalysisPermissions.map((permission) => (
                          <option key={permission.value} value={permission.value}>
                            {permission.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="form-field">
                    <span>内容</span>
                    <textarea
                      name="content"
                      maxLength={1200}
                      placeholder="记录今天发生的一件事，或一个未来想尝试的灵感。"
                      required
                      rows={5}
                    />
                  </label>

                  <div className="task-form-grid">
                    <label className="form-field">
                      <span>事件情绪标签</span>
                      <select name="emotionTags" multiple size={5}>
                        {emotionOptions.map((emotion) => (
                          <option key={emotion} value={emotion}>
                            {emotion}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="form-field">
                      <span>事件标签</span>
                      <input name="tags" type="text" placeholder="用逗号分隔，例如：学习, 人际" />
                    </label>

                    <div className="form-field">
                      <span>保存规则</span>
                      <p className="form-hint">
                        选择事件时保存情绪和 AI 权限；选择灵感时保存为待处理状态，不触发 AI。
                      </p>
                    </div>
                  </div>

                  <button className="soft-button w-full sm:w-fit" type="submit">
                    <Plus aria-hidden="true" className="h-4 w-4" />
                    保存记录
                  </button>
                </form>

                {todayLifeEvents.length > 0 || todayIdeas.length > 0 ? (
                  <div className="task-list">
                    {todayLifeEvents.map((event) => (
                      <article key={event.id} className="task-list-item">
                        <div className="min-w-0">
                          <p className="list-label">事件 · {event.eventDate}</p>
                          <p className="body-copy mt-1">{getRecordPreview(event.content)}</p>
                          <div className="habit-stat-row mt-3">
                            <span className="status-pill">
                              {getAiAnalysisPermissionLabel(event.aiAnalysisPermission)}
                            </span>
                            {event.emotionTags.map((emotion) => (
                              <span key={emotion} className="status-pill">
                                {emotion}
                              </span>
                            ))}
                            {event.tags.map((tag) => (
                              <span key={tag} className="status-pill">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </article>
                    ))}
                    {todayIdeas.map((idea) => (
                      <article key={idea.id} className="task-list-item">
                        <div className="min-w-0">
                          <p className="list-label">灵感 · {idea.ideaDate}</p>
                          <p className="body-copy mt-1">{getRecordPreview(idea.content)}</p>
                        </div>
                        <span className="status-pill">
                          {idea.status === "to_review" ? "待处理" : idea.status}
                        </span>
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
            ) : (
              <div className="empty-state mt-5">
                <span className="empty-icon">
                  <EmptyIcon aria-hidden="true" className="h-5 w-5" />
                </span>
                <div>
                  <p className="list-label">{section.emptyTitle}</p>
                  <p className="body-copy mt-1">{section.emptyDescription}</p>
                </div>
              </div>
            )}

            <div className="preview-row mt-4">
              {section.previewItems.map((item) => (
                <span key={item} className="status-pill">
                  {item}
                </span>
              ))}
            </div>
          </article>
          );
        })}
      </section>
    </div>
  );
}
