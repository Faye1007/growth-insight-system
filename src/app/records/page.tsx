import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Lightbulb,
  NotebookPen,
  Repeat2,
} from "lucide-react";

import { buildLoginPath, loginRequiredMessage } from "@/lib/auth/paths";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getRecentHabitCheckinsForUser,
  getRecentIdeasForUser,
  getRecentLifeEventsForUser,
  getRecentScheduleItemsForUser,
  getRecentTasksForUser,
} from "@/lib/data/user-data";
import { getTaskCategoryLabel, getTaskStatusLabel } from "@/lib/tasks/options";

const recentLimitPerType = 12;
const timelineLimit = 40;

const recordTypeOptions = [
  { value: "all", label: "全部" },
  { value: "task", label: "任务" },
  { value: "habit", label: "习惯" },
  { value: "schedule", label: "日程" },
  { value: "event", label: "事件" },
  { value: "idea", label: "灵感" },
] as const;

const dateRangeOptions = [
  { value: "recent", label: "全部近期" },
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
};

type RecordTypeFilter = (typeof recordTypeOptions)[number]["value"];
type DateRangeFilter = (typeof dateRangeOptions)[number]["value"];
type RecordsPageProps = {
  searchParams?: Promise<{
    type?: string;
    range?: string;
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

const habitCheckinStatusLabels: Record<string, string> = {
  checked: "已打卡",
  skipped: "已取消",
};

function formatDateTime(value: Date) {
  return dateTimeFormatter.format(value);
}

function formatDateValue(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00+08:00`));
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

  if (range !== "recent") {
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

async function getRecentTasks(userId: string): Promise<TimelineRecord[]> {
  const rows = await getRecentTasksForUser(userId, recentLimitPerType);

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
      getTaskStatusLabel(task.status),
      task.isPostponed ? "延期任务" : "",
    ].filter(Boolean),
    tone: "tone-lavender",
    Icon: ClipboardList,
  }));
}

async function getRecentHabitCheckins(userId: string): Promise<TimelineRecord[]> {
  const rows = await getRecentHabitCheckinsForUser(userId, recentLimitPerType);

  return rows.map((checkin) => ({
    id: `habit-${checkin.id}`,
    href: `/records/habit/${checkin.id}`,
    kind: "habit",
    label: "习惯打卡",
    title: checkin.habitName,
    description: `打卡日期：${formatDateValue(checkin.checkinDate)}`,
    occurredAt: checkin.createdAt,
    dateText: formatDateTime(checkin.createdAt),
    meta: [habitCheckinStatusLabels[checkin.status] ?? checkin.status],
    tone: "tone-sage",
    Icon: Repeat2,
  }));
}

async function getRecentScheduleItems(userId: string): Promise<TimelineRecord[]> {
  const rows = await getRecentScheduleItemsForUser(userId, recentLimitPerType);

  return rows.map((item) => ({
    id: `schedule-${item.id}`,
    href: `/records/schedule/${item.id}`,
    kind: "schedule",
    label: "日程记录",
    title: item.title,
    description: `${formatDateValue(item.scheduleDate)} · ${formatScheduleTimeRange(item.startTime, item.endTime)}`,
    occurredAt: item.createdAt,
    dateText: formatDateTime(item.createdAt),
    meta: [getTaskCategoryLabel(item.category)],
    tone: "tone-clay",
    Icon: CalendarDays,
  }));
}

async function getRecentLifeEvents(userId: string): Promise<TimelineRecord[]> {
  const rows = await getRecentLifeEventsForUser(userId, recentLimitPerType);

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

async function getRecentIdeas(userId: string): Promise<TimelineRecord[]> {
  const rows = await getRecentIdeasForUser(userId, recentLimitPerType);

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

async function getRecentTimelineRecords(userId: string) {
  const recordGroups = await Promise.all([
    getRecentTasks(userId),
    getRecentHabitCheckins(userId),
    getRecentScheduleItems(userId),
    getRecentLifeEvents(userId),
    getRecentIdeas(userId),
  ]);

  return recordGroups
    .flat()
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
    .slice(0, timelineLimit);
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

export default async function RecordsPage({ searchParams }: RecordsPageProps) {
  const params = await searchParams;
  const typeFilter = isRecordTypeFilter(params?.type) ? params.type : "all";
  const rangeFilter = isDateRangeFilter(params?.range) ? params.range : "recent";
  const user = await getCurrentUser();
  const isLoggedIn = Boolean(user);
  const currentPath = getFilterHref(typeFilter, rangeFilter);
  const loginPath = buildLoginPath({ next: currentPath, message: loginRequiredMessage });
  const allRecords = user ? await getRecentTimelineRecords(user.id) : [];
  const records = filterTimelineRecords(allRecords, typeFilter, rangeFilter);
  const typeCounts = buildTypeCounts(records);
  const typeFilterLabel =
    recordTypeOptions.find((option) => option.value === typeFilter)?.label ?? "全部";
  const rangeFilterLabel =
    dateRangeOptions.find((option) => option.value === rangeFilter)?.label ?? "全部近期";

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

      {!isLoggedIn ? (
        <section className="panel-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="section-heading">登录后查看真实记录</h2>
              <p className="body-copy mt-2">
                未登录时可以浏览页面结构；登录后会显示你在每日工作台创建的近期数据。
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
            <p className="page-kicker">近期概览</p>
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
            <p className="page-kicker">时间线</p>
            <h2 id="records-timeline" className="section-heading mt-1">
              近期记录
            </h2>
          </div>
          <span className="status-pill w-fit">按创建时间倒序</span>
        </div>

        {records.length > 0 ? (
          <div className="record-timeline mt-5">
            {records.map((record) => {
              const Icon = record.Icon;

              return (
                <Link key={record.id} className={`record-timeline-item ${record.tone}`} href={record.href}>
                  <div className="nav-icon">
                    <Icon aria-hidden="true" className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="record-item-heading">
                      <span className="status-pill">{record.label}</span>
                      <time className="body-copy" dateTime={record.occurredAt.toISOString()}>
                        {record.dateText}
                      </time>
                    </div>
                    <h3 className="list-label mt-3">{record.title}</h3>
                    <p className="body-copy mt-1">{record.description}</p>
                    {record.meta.length > 0 ? (
                      <div className="overview-detail-row mt-3">
                        {record.meta.map((item) => (
                          <span key={item} className="status-pill">
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="empty-state mt-5">
            <span className="empty-icon">
              <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <p className="list-label">暂无近期记录</p>
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
