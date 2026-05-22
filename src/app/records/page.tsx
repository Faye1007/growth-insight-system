import {
  CalendarDays,
  CalendarHeart,
  CheckCircle2,
  ClipboardList,
  Lightbulb,
  NotebookPen,
  Repeat2,
} from "lucide-react";

import Link from "next/link";

import { FeedbackMessage } from "@/components/feedback-message";
import { buildLoginPath, loginRequiredMessage } from "@/lib/auth/paths";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getRecentHabitCheckinsForUser,
  getRecentIdeasForUser,
  getRecentLifeEventsForUser,
  getRecentScheduleItemsForUser,
  getRecentTasksForUser,
  getUpcomingAnniversariesForUser,
} from "@/lib/data/user-data";
import type { UpcomingAnniversary } from "@/lib/data/user-data";
import { getTaskCategoryLabel } from "@/lib/tasks/options";
import { getBeijingDateValue, getBeijingDateAfter } from "@/lib/date";

const recentLimitPerType = 12;

const recordTypeOptions = [
  { value: "all", label: "全部" },
  { value: "task", label: "任务" },
  { value: "habit", label: "习惯" },
  { value: "schedule", label: "日程" },
  { value: "event", label: "事件" },
  { value: "idea", label: "灵感" },
] as const;

const dateRangeOptions = [
  { value: "all", label: "全部历史" },
  { value: "today", label: "今天" },
  { value: "7d", label: "最近 7 天" },
] as const;

const dateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

type TimelineRecord = {
  id: string;
  href: string;
  kind: "task" | "habit" | "schedule" | "event" | "idea";
  label: string;
  title: string;
  description: string;
  occurredAt: Date;
  dateText: string;
  meta: string[];
  tone: "tone-lavender" | "tone-sage" | "tone-mist" | "tone-clay";
  Icon: typeof ClipboardList;
  status?: string;
  isCompleted?: boolean;
};

type RecordTypeFilter = (typeof recordTypeOptions)[number]["value"];
type DateRangeFilter = (typeof dateRangeOptions)[number]["value"];
type RecordsPageProps = {
  searchParams?: Promise<{
    eventDeleted?: string;
    ideaDeleted?: string;
    type?: string;
    range?: string;
    scheduleDeleted?: string;
    taskDeleted?: string;
  }>;
};

const recordKindLabels: Record<TimelineRecord["kind"], string> = {
  task: "任务",
  habit: "习惯",
  schedule: "日程",
  event: "事件",
  idea: "灵感",
};

const ideaStatusLabels: Record<string, string> = {
  to_review: "待处理",
  converted_to_task: "已转任务",
  shelved: "已搁置",
  abandoned: "已放弃",
};

function formatDateTime(value: Date) {
  return dateTimeFormatter.format(value);
}

function formatDateValue(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00+08:00`));
}

function formatDateGroupLabel(value: Date) {
  const formatter = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return formatter.format(value);
}

function isRecordTypeFilter(value: string | undefined): value is RecordTypeFilter {
  return recordTypeOptions.some((option) => option.value === value);
}

function isDateRangeFilter(value: string | undefined): value is DateRangeFilter {
  return dateRangeOptions.some((option) => option.value === value);
}

function getFilterHref(type: RecordTypeFilter, range: DateRangeFilter) {
  const params = new URLSearchParams();

  if (type !== "all") {
    params.set("type", type);
  }

  if (range !== "all") {
    params.set("range", range);
  }

  const query = params.toString();

  return query ? `/records?${query}` : "/records";
}

function formatScheduleTimeRange(startTime: string | null, endTime: string | null) {
  const start = startTime ? startTime.slice(0, 5) : "未设置时间";

  return endTime ? `${start}-${endTime.slice(0, 5)}` : start;
}

function getPreview(content: string) {
  return content.length > 120 ? `${content.slice(0, 120)}...` : content;
}

async function getRecentTasks(userId: string, limit: number): Promise<TimelineRecord[]> {
  const rows = await getRecentTasksForUser(userId, limit);

  return rows.map((task) => ({
    id: `task-${task.id}`,
    href: `/records/task/${task.id}`,
    kind: "task",
    label: "任务记录",
    title: task.title,
    description: `任务日期：${formatDateValue(task.taskDate)}`,
    occurredAt: task.createdAt,
    dateText: formatDateTime(task.createdAt),
    meta: [
      getTaskCategoryLabel(task.category),
      task.isPostponed ? "延期任务" : "",
    ].filter(Boolean),
    tone: "tone-lavender",
    Icon: ClipboardList,
    status: task.status,
  }));
}

async function getRecentHabitCheckins(userId: string, limit: number): Promise<TimelineRecord[]> {
  const rows = await getRecentHabitCheckinsForUser(userId, limit);

  return rows.map((checkin) => ({
    id: `habit-${checkin.id}`,
    href: `/records/habit/${checkin.id}`,
    kind: "habit",
    label: "习惯打卡",
    title: checkin.habitName,
    description: `打卡日期：${formatDateValue(checkin.checkinDate)}`,
    occurredAt: checkin.createdAt,
    dateText: formatDateTime(checkin.createdAt),
    meta: [],
    tone: "tone-sage",
    Icon: Repeat2,
    status: checkin.status,
    isCompleted: checkin.status === "checked",
  }));
}

async function getRecentScheduleItems(userId: string, limit: number): Promise<TimelineRecord[]> {
  const rows = await getRecentScheduleItemsForUser(userId, limit);

  return rows.map((item) => ({
    id: `schedule-${item.id}`,
    href: `/records/schedule/${item.id}`,
    kind: "schedule",
    label: "日程记录",
    title: item.title,
    description: `${formatDateTime(item.createdAt)} · ${formatScheduleTimeRange(item.startTime, item.endTime)}`,
    occurredAt: item.createdAt,
    dateText: formatDateTime(item.createdAt),
    meta: [getTaskCategoryLabel(item.category)],
    tone: "tone-clay",
    Icon: CalendarDays,
    isCompleted: item.isCompleted,
  }));
}

async function getRecentLifeEvents(userId: string, limit: number): Promise<TimelineRecord[]> {
  const rows = await getRecentLifeEventsForUser(userId, limit);

  return rows.map((event) => ({
    id: `event-${event.id}`,
    href: `/records/event/${event.id}`,
    kind: "event",
    label: "事件记录",
    title: getPreview(event.content),
    description: `事件日期：${formatDateValue(event.eventDate)}`,
    occurredAt: event.createdAt,
    dateText: formatDateTime(event.createdAt),
    meta: [...event.emotionTags, ...event.tags].slice(0, 6),
    tone: "tone-mist",
    Icon: NotebookPen,
  }));
}

async function getRecentIdeas(userId: string, limit: number): Promise<TimelineRecord[]> {
  const rows = await getRecentIdeasForUser(userId, limit);

  return rows.map((idea) => ({
    id: `idea-${idea.id}`,
    href: `/records/idea/${idea.id}`,
    kind: "idea",
    label: "灵感记录",
    title: getPreview(idea.content),
    description: `记录日期：${formatDateValue(idea.ideaDate)}`,
    occurredAt: idea.createdAt,
    dateText: formatDateTime(idea.createdAt),
    meta: [ideaStatusLabels[idea.status] ?? idea.status],
    tone: "tone-lavender",
    Icon: Lightbulb,
  }));
}

async function getRecentTimelineRecords(userId: string, range: DateRangeFilter) {
  const limit = range === "all" ? 9999 : recentLimitPerType;

  const [tasks, habitCheckins, schedules, events, ideas] = await Promise.all([
    getRecentTasks(userId, limit),
    getRecentHabitCheckins(userId, limit),
    getRecentScheduleItems(userId, limit),
    getRecentLifeEvents(userId, limit),
    getRecentIdeas(userId, limit),
  ]);

  return [...tasks, ...habitCheckins, ...schedules, ...events, ...ideas]
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
}

function filterTimelineRecords(
  records: TimelineRecord[],
  typeFilter: RecordTypeFilter,
  rangeFilter: DateRangeFilter,
) {
  const todayDate = getBeijingDateValue();
  const sevenDayStartDate = getBeijingDateAfter(-6);

  return records.filter((record) => {
    if (typeFilter !== "all" && record.kind !== typeFilter) {
      return false;
    }

    if (rangeFilter === "today") {
      return getBeijingDateValue(record.occurredAt) === todayDate;
    }

    if (rangeFilter === "7d") {
      const recordDate = getBeijingDateValue(record.occurredAt);

      return recordDate >= sevenDayStartDate && recordDate <= todayDate;
    }

    return true;
  });
}

function buildTypeCounts(records: TimelineRecord[]) {
  return Object.entries(recordKindLabels).map(([kind, label]) => ({
    kind,
    label,
    count: records.filter((record) => record.kind === kind).length,
  }));
}

function groupRecordsByDate(records: TimelineRecord[]) {
  const groups = new Map<string, TimelineRecord[]>();

  for (const record of records) {
    const date = getBeijingDateValue(record.occurredAt);
    groups.set(date, [...(groups.get(date) ?? []), record]);
  }

  return Array.from(groups.entries()).map(([date, items]) => ({
    date,
    label: formatDateGroupLabel(items[0].occurredAt),
    records: items,
  }));
}

export default async function RecordsPage({ searchParams }: RecordsPageProps) {
  const params = await searchParams;
  const typeFilter = isRecordTypeFilter(params?.type) ? params.type : "all";
  const rangeFilter = isDateRangeFilter(params?.range) ? params.range : "all";
  const user = await getCurrentUser();
  const isLoggedIn = Boolean(user);
  const currentPath = getFilterHref(typeFilter, rangeFilter);
  const loginPath = buildLoginPath({ next: currentPath, message: loginRequiredMessage });
  const allRecords = user ? await getRecentTimelineRecords(user.id, rangeFilter) : [];
  const upcomingAnniversaries = user ? await getUpcomingAnniversariesForUser(user.id) : [];
  const records = filterTimelineRecords(allRecords, typeFilter, rangeFilter);
  const typeCounts = buildTypeCounts(records);
  const typeFilterLabel =
    recordTypeOptions.find((option) => option.value === typeFilter)?.label ?? "全部";
  const rangeFilterLabel =
    dateRangeOptions.find((option) => option.value === rangeFilter)?.label ?? "全部历史";
  const taskDeletedFeedback =
    params?.taskDeleted === "1"
      ? {
          tone: "success" as const,
          title: "任务已删除",
          detail: "这条任务已从成长记录和统计中移除。",
        }
      : null;
  const scheduleDeletedFeedback =
    params?.scheduleDeleted === "1"
      ? {
          tone: "success" as const,
          title: "日程已删除",
          detail: "这条日程已从成长记录和统计中移除。",
        }
      : null;
  const eventDeletedFeedback =
    params?.eventDeleted === "1"
      ? {
          tone: "success" as const,
          title: "事件已删除",
          detail: "这条事件已从成长记录、统计和复盘上下文中移除。",
        }
      : null;
  const ideaDeletedFeedback =
    params?.ideaDeleted === "1"
      ? {
          tone: "success" as const,
          title: "灵感已删除",
          detail: "这条灵感已从成长记录和统计中移除。",
        }
      : null;

  return (
    <div className="page-stack">
      <header className="page-header">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="page-kicker">成长记录</p>
            <h1 className="page-title">长期生活数据沉淀</h1>
          </div>
          <span className="status-pill w-fit">统一时间线</span>
        </div>
        <p className="page-description">
          按创建时间倒序汇总任务、习惯打卡、日程、事件和灵感。当前支持按记录类型和日期范围做基础筛选。
        </p>
      </header>

      {/* Upcoming anniversaries banner */}
      {upcomingAnniversaries.length > 0 && (
        <section className="panel-card anniversary-reminder-banner">
          <div className="flex items-center gap-2">
            <CalendarHeart className="h-4 w-4 flex-shrink-0" />
            <h2 className="section-heading">即将到来的纪念日</h2>
            <span className="status-pill">{upcomingAnniversaries.length} 条</span>
          </div>
          <div className="task-list mt-3">
            {upcomingAnniversaries.map((ann) => (
              <article key={ann.id} className="task-list-item compact-list-item">
                <div className="compact-main-row">
                  <span className="nav-icon">
                    <CalendarHeart aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <Link className="list-label list-title-link" href={`/life/anniversary/${ann.id}`}>
                      {ann.title}
                    </Link>
                    <p className="list-meta mt-1">
                      {ann.personName}
                      {ann.type === "birthday" ? " · 生日" : ""}
                    </p>
                  </div>
                  <span className={`anniversary-days ${ann.isToday ? "anniversary-today" : ""}`}>
                    {ann.isToday ? "今天" : `${ann.daysUntil} 天后`}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <FeedbackMessage feedback={taskDeletedFeedback} />
      <FeedbackMessage feedback={scheduleDeletedFeedback} />
      <FeedbackMessage feedback={eventDeletedFeedback} />
      <FeedbackMessage feedback={ideaDeletedFeedback} />

      {!isLoggedIn ? (
        <section className="panel-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="section-heading">登录后查看真实记录</h2>
              <p className="body-copy mt-2">
                未登录时可以浏览页面结构；登录后会显示你在每日工作台创建的全部历史数据。
              </p>
            </div>
            <Link className="soft-button w-full sm:w-auto" href={loginPath}>
              登录 / 注册
            </Link>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="records-overview" className="panel-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="page-kicker">历史概览</p>
            <h2 id="records-overview" className="section-heading mt-1">
              已载入 {records.length} 条记录
            </h2>
          </div>
          <span className="status-pill w-fit">程序查询，不调用 AI</span>
        </div>
        <div className="record-summary-grid mt-5">
          {typeCounts.map((item) => (
            <article key={item.kind} className="field-tile">
              <span>{item.label}</span>
              <strong>{item.count}</strong>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="records-filters" className="panel-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="page-kicker">筛选</p>
            <h2 id="records-filters" className="section-heading mt-1">
              当前：{typeFilterLabel} · {rangeFilterLabel}
            </h2>
          </div>
          <Link className="quiet-button w-fit" href="/records">
            重置筛选
          </Link>
        </div>

        <div className="record-filter-panel mt-5">
          <div className="record-filter-group">
            <p className="metric-label">记录类型</p>
            <div className="record-filter-row">
              {recordTypeOptions.map((option) => (
                <Link
                  key={option.value}
                  aria-current={typeFilter === option.value ? "page" : undefined}
                  className={typeFilter === option.value ? "soft-button" : "quiet-button"}
                  href={getFilterHref(option.value, rangeFilter)}
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="record-filter-group">
            <p className="metric-label">日期范围</p>
            <div className="record-filter-row">
              {dateRangeOptions.map((option) => (
                <Link
                  key={option.value}
                  aria-current={rangeFilter === option.value ? "page" : undefined}
                  className={rangeFilter === option.value ? "soft-button" : "quiet-button"}
                  href={getFilterHref(typeFilter, option.value)}
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="records-timeline" className="panel-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="page-kicker">按天记录</p>
            <h2 id="records-timeline" className="section-heading mt-1">
              历史记录
            </h2>
          </div>
          <span className="status-pill w-fit">按日期分组</span>
        </div>

        {records.length > 0 ? (
          <div className="task-list mt-5">
            {groupRecordsByDate(records).map((group) => (
              <div key={group.date}>
                <h3 className="date-group-header">{group.label}</h3>
                <div className="task-group-list">
                  {group.records.map((record) => {
                    const Icon = record.Icon;
                    const hasCheckbox = record.kind === "task" || record.kind === "habit" || record.kind === "schedule";
                    const isCompleted = record.isCompleted === true || record.status === "completed";

                    return (
                      <div
                        key={record.id}
                        className={`record-timeline-item compact-list-item ${record.tone} ${isCompleted ? "task-status-completed" : ""}`}
                      >
                        {hasCheckbox ? (
                          <div className="nav-icon">
                            <CheckCircle2 aria-hidden="true" className={`h-4 w-4 ${isCompleted ? "text-[var(--sage)]" : "text-[var(--border)]"}`} />
                          </div>
                        ) : (
                          <div className="nav-icon">
                            <Icon aria-hidden="true" className="h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="record-item-heading">
                            <span className="status-pill">{record.label}</span>
                            <time className="list-meta" dateTime={record.occurredAt.toISOString()}>
                              {record.dateText}
                            </time>
                          </div>
                          <Link
                            className={`list-label list-title-link mt-3 ${record.kind === "event" ? "two-line-preview" : ""} ${isCompleted ? "line-through" : ""}`}
                            href={record.href}
                          >
                            {record.title}
                          </Link>
                          <p className="body-copy mt-1">{record.description}</p>
                          {record.meta.length > 0 ? (
                            <div className="compact-tag-row mt-3">
                              {record.meta.map((item) => (
                                <span key={item} className="status-pill">
                                  {item}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state mt-5">
            <span className="empty-icon">
              <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <p className="list-label">暂无历史记录</p>
              <p className="body-copy mt-1">
                在每日工作台创建任务、打卡习惯、记录日程、事件或灵感后，会出现在这里。
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
