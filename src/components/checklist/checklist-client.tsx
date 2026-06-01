"use client";

import { useState, useActionState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Lightbulb,
  List,
  Plus,
  Repeat2,
  Trash2,
} from "lucide-react";

import {
  batchSoftDeleteAction,
  convertIdeaToTaskAction,
  createChecklistHabitAction,
  createChecklistIdeaAction,
  createChecklistScheduleAction,
  createChecklistTaskAction,
  postponeTaskAction,
} from "@/app/checklist/actions";

import { getBeijingDateAfter, getBeijingDateValue } from "@/lib/date";
import { TaskCompletionToggle } from "@/components/task-completion-toggle";
import { HabitCheckinToggle } from "@/components/habit-checkin-toggle";
import { ScheduleCompletionToggle } from "@/components/schedule-completion-toggle";
import { useToast } from "@/components/toast-provider";
import { scheduleOccursOnDate, scheduleRecurrences } from "@/lib/schedules/options";
import { getTaskCategoryLabel, taskCategories, taskStatuses } from "@/lib/tasks/options";
import type { TaskCategory, TaskStatus } from "@/lib/tasks/options";

type ChecklistTab = "tasks" | "schedules" | "habits" | "ideas";
type ChecklistView = "list" | "week";

const tabs: Array<{ id: ChecklistTab; label: string; Icon: typeof ClipboardList }> = [
  { id: "tasks", label: "任务", Icon: ClipboardList },
  { id: "schedules", label: "日程", Icon: CalendarDays },
  { id: "habits", label: "习惯", Icon: Repeat2 },
  { id: "ideas", label: "灵感", Icon: Lightbulb },
];

type ChecklistTask = {
  id: string;
  title: string;
  category: TaskCategory;
  status: TaskStatus;
  taskDate: string;
  isPostponed: boolean;
  postponedToDate: string | null;
  isPinned: boolean;
};

type PostponedTask = {
  id: string;
  title: string;
  category: TaskCategory;
  status: TaskStatus;
  taskDate: string;
  isPostponed: boolean;
  postponedToDate: string | null;
  isPinned: boolean;
};

type ChecklistSchedule = {
  id: string;
  title: string;
  category: TaskCategory;
  startDate: string;
  endDate: string | null;
  recurrence: string;
  startTime: string | null;
  endTime: string | null;
  isPinned: boolean;
};

type ChecklistHabit = {
  id: string;
  name: string;
  category: TaskCategory;
  startDate: string | null;
  isPinned: boolean;
  isCheckedOnDate: boolean;
  checkedDates: string[];
  totalCount: number;
  streakCount: number;
};

type ChecklistIdea = {
  id: string;
  content: string;
  ideaDate: string;
  status: string;
  isPinned: boolean;
};

type WeekDay = {
  date: string;
  label: string;
  dayNum: number;
  isToday: boolean;
};

function getWeekDays(referenceDate: Date): WeekDay[] {
  const today = new Date();
  const todayStr = getBeijingDateValue(today);
  const day = referenceDate.getDay();
  const monday = new Date(referenceDate);
  monday.setDate(referenceDate.getDate() - (day === 0 ? 6 : day - 1));

  const shortFormatter = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    weekday: "short",
  });
  const numFormatter = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    day: "numeric",
  });

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = getBeijingDateValue(d);
    return {
      date: dateStr,
      label: shortFormatter.format(d),
      dayNum: parseInt(numFormatter.format(d), 10),
      isToday: dateStr === todayStr,
    };
  });
}

function formatShortDate(dateStr: string): string {
  return dateStr.slice(5);
}

function getTaskStatusTone(status: string) {
  return `task-status-${status}`;
}

function getIdeaStatusLabel(value: string) {
  const map: Record<string, string> = {
    to_review: "待处理",
    converted_to_task: "已转任务",
    shelved: "已搁置",
    abandoned: "已放弃",
  };
  return map[value] ?? value;
}

function formatScheduleTimeRange(startTime: string | null, endTime: string | null) {
  if (!startTime) return null;
  const start = startTime.slice(0, 5);
  return endTime ? `${start} - ${endTime.slice(0, 5)}` : start;
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00+08:00`);
  const today = new Date();
  const todayStr = getBeijingDateValue(today);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = getBeijingDateValue(yesterday);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = getBeijingDateValue(tomorrow);

  if (dateStr === todayStr) return "今天";
  if (dateStr === yesterdayStr) return "昨天";
  if (dateStr === tomorrowStr) return "明天";

  const weekdayFormatter = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    weekday: "short",
  });
  const monthDayFormatter = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "numeric",
    day: "numeric",
  });
  return `${monthDayFormatter.format(d)} ${weekdayFormatter.format(d)}`;
}

function groupByDate<T extends { taskDate?: string; startDate?: string; ideaDate?: string }>(
  items: T[],
  dateKey: "taskDate" | "startDate" | "ideaDate",
): [string, T[]][] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const date = item[dateKey] ?? "";
    if (!groups.has(date)) groups.set(date, []);
    groups.get(date)!.push(item);
  }
  return [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}

export function ChecklistClient({
  initialTab = "tasks",
  tasks,
  schedules,
  habits,
  ideas,
  postponedTasks = [],
  scheduleCompletionMap = new Map<string, Set<string>>(),
}: {
  initialTab?: ChecklistTab;
  tasks: ChecklistTask[];
  schedules: ChecklistSchedule[];
  habits: ChecklistHabit[];
  ideas: ChecklistIdea[];
  postponedTasks?: PostponedTask[];
  scheduleCompletionMap?: Map<string, Set<string>>;
}) {
  const [activeTab, setActiveTab] = useState<ChecklistTab>(initialTab);
  const [view, setView] = useState<ChecklistView>("list");
  const [weekOffset, setWeekOffset] = useState(0);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [_postponeState, postponeAction] = useActionState(postponeTaskAction, null);
  const [_batchState, batchAction] = useActionState(batchSoftDeleteAction, null);
  const { addToast } = useToast();

  useEffect(() => {
    if (!_batchState) return;
    if (_batchState.success) {
      addToast("已删除选中的项目", "success");
      exitSelectionMode();
    } else {
      addToast("删除失败，请稍后重试", "error");
    }
  }, [_batchState, addToast]);

  useEffect(() => {
    if (!_postponeState) return;
    if (_postponeState.success) {
      addToast("任务已延期", "success");
    } else {
      const msg =
        _postponeState.error === "missing_task" ? "任务不存在" : "延期失败，请稍后重试";
      addToast(msg, "error");
    }
  }, [_postponeState, addToast]);

  const today = new Date();
  const todayStr = getBeijingDateValue(today);
  const weekRefDate = new Date(today);
  weekRefDate.setDate(today.getDate() + weekOffset * 7);
  const weekDays = getWeekDays(weekRefDate);
  const weekStart = weekDays[0].date;
  const weekEnd = weekDays[6].date;

  const filteredTasks = tasks.filter(
    (t) => t.taskDate >= weekStart && t.taskDate <= weekEnd,
  );
  const filteredSchedules = schedules.filter((s) => {
    const start = s.startDate;
    const end = s.endDate;
    if (start > todayStr) return false;
    if (end && end < weekStart) return false;
    if (s.recurrence === "none") {
      return start >= weekStart && start <= todayStr;
    }
    return true;
  });
  const filteredHabits = habits;
  const filteredIdeas = ideas.filter(
    (i) => i.ideaDate >= weekStart && i.ideaDate <= weekEnd,
  );

  const todayTasks = filteredTasks.filter((t) => t.taskDate === todayStr);
  const todaySchedules = filteredSchedules.filter((s) => {
    if (s.recurrence === "none") return s.startDate === todayStr;
    const start = s.startDate;
    const end = s.endDate;
    if (start > todayStr) return false;
    if (end && end < todayStr) return false;
    return true;
  });
  const todayHabits = filteredHabits;
  const todayIdeas = filteredIdeas.filter((i) => i.ideaDate === todayStr);

  const currentItems = (() => {
    if (activeTab === "tasks") return filteredTasks;
    if (activeTab === "schedules") return filteredSchedules;
    if (activeTab === "habits") return filteredHabits;
    return filteredIdeas;
  })();

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === currentItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(currentItems.map((item) => item.id)));
    }
  }

  function exitSelectionMode() {
    setIsSelecting(false);
    setSelectedIds(new Set());
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="page-kicker">清单</p>
            <h1 className="page-title">任务、日程、习惯和灵感</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link className="quiet-button" href="/records">
              成长记录 →
            </Link>
            <button
              className={`quiet-button ${view === "list" ? "bg-[var(--mist-soft)] border-[var(--mist)]" : ""}`}
              type="button"
              onClick={() => setView("list")}
            >
              <List aria-hidden="true" className="h-4 w-4" />
              列表
            </button>
            <button
              className={`quiet-button ${view === "week" ? "bg-[var(--mist-soft)] border-[var(--mist)]" : ""}`}
              type="button"
              onClick={() => setView("week")}
            >
              <CalendarDays aria-hidden="true" className="h-4 w-4" />
              周历
            </button>
          </div>
        </div>
      </header>

      {/* Tab switcher */}
      <div className="daily-tab-list" role="tablist">
        {tabs.map((tab) => {
          const Icon = tab.Icon;
          const isActive = tab.id === activeTab;
          const weekCounts: Record<ChecklistTab, number> = {
            tasks: filteredTasks.length,
            schedules: filteredSchedules.length,
            habits: filteredHabits.length,
            ideas: filteredIdeas.length,
          };
          const todayCounts: Record<ChecklistTab, number> = {
            tasks: todayTasks.length,
            schedules: todaySchedules.length,
            habits: todayHabits.length,
            ideas: todayIdeas.length,
          };
          const counts = view === "week" ? weekCounts : todayCounts;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              className={`daily-tab ${isActive ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="nav-icon">
                <Icon aria-hidden="true" className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="daily-tab-title">{tab.label}</span>
                <span className="daily-tab-meta">
                  {counts[tab.id]} 条{view === "list" ? " · 今日" : ""}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Week navigation (only in week view) */}
      {view === "week" && (
        <div className="flex items-center justify-between gap-3">
          <button
            className="quiet-button"
            type="button"
            onClick={() => setWeekOffset((o) => o - 1)}
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            上一周
          </button>
          <span className="status-pill">
            {formatShortDate(weekDays[0].date)} ~ {formatShortDate(weekDays[6].date)}
          </span>
          <button
            className="quiet-button"
            type="button"
            onClick={() => setWeekOffset((o) => o + 1)}
          >
            下一周
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tasks */}
      {activeTab === "tasks" && (
        <section className="workspace-panel tone-lavender">
          <div className="flex items-center justify-between">
            <h2 className="section-heading">任务</h2>
            <div className="flex items-center gap-2">
              {!isSelecting ? (
                <button type="button" className="quiet-button text-sm" onClick={() => setIsSelecting(true)}>
                  选择
                </button>
              ) : (
                <button type="button" className="quiet-button text-sm" onClick={exitSelectionMode}>
                  取消
                </button>
              )}
              <details className="create-disclosure">
              <summary className="create-summary soft-button text-sm">
                <Plus aria-hidden="true" className="h-3 w-3" />
                新增
              </summary>
              <form action={createChecklistTaskAction} className="task-form mt-3">
                <label className="form-field">
                  <span>任务标题</span>
                  <input name="title" type="text" maxLength={120} placeholder="例如：整理 AI 产品学习笔记" required />
                </label>
                <div className="task-form-grid">
                  <label className="form-field">
                    <span>分类</span>
                    <select name="category" defaultValue="study">
                      {taskCategories.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="form-field">
                    <span>日期</span>
                    <input name="taskDate" type="date" defaultValue={todayStr} required />
                  </label>
                  <label className="form-field">
                    <span>状态</span>
                    <select name="status" defaultValue="todo">
                      {taskStatuses.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <button className="soft-button w-fit text-sm" type="submit">保存任务</button>
              </form>
            </details>
          </div>
          </div>
          {/* Postponed tasks zone */}
          {postponedTasks.length > 0 && (
            <div className="mt-4">
              <h3 className="section-heading text-sm text-[var(--clay)]">延期任务</h3>
              <div className="task-list mt-2">
                {postponedTasks.map((task) => (
                  <article
                    key={task.id}
                    className={`task-list-item compact-list-item ${getTaskStatusTone(task.status)}`}
                  >
                    <div className="compact-main-row">
                      {isSelecting ? (
                        <label className="batch-checkbox-label">
                          <input
                            type="checkbox"
                            className="batch-checkbox"
                            checked={selectedIds.has(task.id)}
                            onChange={() => toggleSelect(task.id)}
                          />
                        </label>
                      ) : (
                        <TaskCompletionToggle taskId={task.id} isCompleted={task.status === "completed"} />
                      )}
                      <div className="min-w-0">
                        <Link
                          className={`list-label list-title-link ${task.status === "completed" ? "line-through" : ""}`}
                          href={`/records/task/${task.id}`}
                        >
                          {task.title}
                        </Link>
                        <p className="list-meta mt-1">
                          {getTaskCategoryLabel(task.category)} · 延期至 {task.postponedToDate ? formatDateLabel(task.postponedToDate) : "待定"}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
          {view === "list" ? (
            filteredTasks.length > 0 ? (
              <div className="task-list mt-4">
                {groupByDate(filteredTasks, "taskDate").map(([date, items]) => (
                  <div key={date} className="mb-4">
                    <h3 className="date-group-header">{formatDateLabel(date)}</h3>
                      {items.map((task) => (
                      <article
                        key={task.id}
                        className={`task-list-item compact-list-item ${getTaskStatusTone(task.status)}`}
                      >
                        <div className="compact-main-row">
                          {isSelecting ? (
                            <label className="batch-checkbox-label">
                              <input
                                type="checkbox"
                                className="batch-checkbox"
                                checked={selectedIds.has(task.id)}
                                onChange={() => toggleSelect(task.id)}
                              />
                            </label>
                          ) : (
                            <TaskCompletionToggle taskId={task.id} isCompleted={task.status === "completed"} />
                          )}
                          <div className="min-w-0">
                            <Link
                              className={`list-label list-title-link ${task.status === "completed" ? "line-through" : ""}`}
                              href={`/records/task/${task.id}`}
                            >
                              {task.title}
                            </Link>
                            <p className="list-meta mt-1">
                              {getTaskCategoryLabel(task.category)}
                              {task.isPostponed
                                ? ` · 已延期 ${task.postponedToDate ? "→ " + formatDateLabel(task.postponedToDate) : "· 待定"}`
                                : ""}
                            </p>
                          </div>
                          {!isSelecting && task.status !== "completed" && (
                            <details className="postpone-menu">
                              <summary className="postpone-trigger" aria-label="延期">
                                <Clock className="h-3.5 w-3.5" />
                              </summary>
                              <div className="postpone-dropdown">
                                {[
                                  { label: "推迟 1 天", offset: 1 },
                                  { label: "推迟 3 天", offset: 3 },
                                  { label: "推迟 1 周", offset: 7 },
                                ].map(({ label, offset }) => {
                                  const dateStr = getBeijingDateAfter(offset);
                                  return (
                                    <form key={offset} action={postponeAction}>
                                      <input type="hidden" name="taskId" value={task.id} />
                                      <input type="hidden" name="postponedToDate" value={dateStr} />
                                      <button type="submit" className="postpone-option">{label}</button>
                                    </form>
                                  );
                                })}
                                <form action={postponeAction}>
                                  <input type="hidden" name="taskId" value={task.id} />
                                  <button type="submit" className="postpone-option">以后再说</button>
                                </form>
                              </div>
                            </details>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state mt-4">
                <span className="empty-icon">
                  <ClipboardList aria-hidden="true" className="h-5 w-5" />
                </span>
                <div>
                  <p className="list-label">本周暂无任务</p>
                  <p className="body-copy mt-1">点击上方&quot;新增&quot;创建任务。</p>
                </div>
              </div>
            )
          ) : (
            <div className="mt-4 overflow-x-auto">
              <div className="habit-checkin-matrix">
                <div className="habit-checkin-header">
                  <span className="habit-checkin-name">任务</span>
                  {weekDays.map((d) => (
                    <span
                      key={d.date}
                      className={`text-center ${d.isToday ? "text-[var(--lavender)] font-bold" : ""}`}
                    >
                      {d.label}
                      <br />
                      {d.dayNum}
                    </span>
                  ))}
                </div>
                {filteredTasks.map((task) => (
                  <div key={task.id} className="habit-checkin-row">
                    <span className="habit-checkin-name">{task.title}</span>
                    {weekDays.map((d) => {
                      const isOnDay = task.taskDate === d.date;
                      return (
                        <span
                          key={d.date}
                          className={`habit-checkin-dot ${isOnDay ? "checked" : ""}`}
                        />
                      );
                    })}
                  </div>
                ))}
                {filteredTasks.length === 0 && (
                  <p className="body-copy px-2 py-4">本周暂无任务。</p>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Schedules */}
      {activeTab === "schedules" && (
        <section className="workspace-panel tone-clay">
          <div className="flex items-center justify-between">
            <h2 className="section-heading">日程</h2>
            <div className="flex items-center gap-2">
              {!isSelecting ? (
                <button type="button" className="quiet-button text-sm" onClick={() => setIsSelecting(true)}>
                  选择
                </button>
              ) : (
                <button type="button" className="quiet-button text-sm" onClick={exitSelectionMode}>
                  取消
                </button>
              )}
              <details className="create-disclosure">
              <summary className="create-summary soft-button text-sm">
                <Plus aria-hidden="true" className="h-3 w-3" />
                新增
              </summary>
              <form action={createChecklistScheduleAction} className="task-form mt-3">
                <label className="form-field">
                  <span>日程标题</span>
                  <input name="title" type="text" maxLength={120} placeholder="例如：英语课 / 咨询 / 项目复盘" required />
                </label>
                <div className="task-form-grid">
                  <label className="form-field">
                    <span>分类</span>
                    <select name="category" defaultValue="work">
                      {taskCategories.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="form-field">
                    <span>开始日期</span>
                    <input name="startDate" type="date" defaultValue={todayStr} required />
                  </label>
                  <label className="form-field">
                    <span>结束日期</span>
                    <input name="endDate" type="date" />
                  </label>
                  <label className="form-field">
                    <span>循环周期</span>
                    <select name="recurrence" defaultValue="none">
                      {scheduleRecurrences.map((recurrence) => (
                        <option key={recurrence.value} value={recurrence.value}>
                          {recurrence.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="form-field">
                    <span>开始时间</span>
                    <input name="startTime" type="time" defaultValue="09:00" required />
                  </label>
                  <label className="form-field">
                    <span>结束时间</span>
                    <input name="endTime" type="time" />
                  </label>
                </div>
                <button className="soft-button w-fit text-sm" type="submit">保存日程</button>
              </form>
            </details>
          </div>
          </div>
          {view === "list" ? (
            filteredSchedules.length > 0 ? (
              <div className="task-list mt-4">
                {groupByDate(filteredSchedules, "startDate").map(([date, items]) => (
                  <div key={date} className="mb-4">
                    <h3 className="date-group-header">{formatDateLabel(date)}</h3>
                    {items.map((item) => {
                      const isCompleted = scheduleCompletionMap.get(item.id)?.has(date) ?? false;

                      return (
                        <article
                          key={item.id}
                          className={`task-list-item compact-list-item ${isCompleted ? "task-status-completed" : "task-status-todo"}`}
                        >
                          <div className="compact-main-row">
                            {isSelecting ? (
                              <label className="batch-checkbox-label">
                                <input
                                  type="checkbox"
                                  className="batch-checkbox"
                                  checked={selectedIds.has(item.id)}
                                  onChange={() => toggleSelect(item.id)}
                                />
                              </label>
                            ) : (
                              <ScheduleCompletionToggle
                                scheduleId={item.id}
                                completionDate={date}
                                isCompleted={isCompleted}
                                label={isCompleted ? `取消完成 ${item.title}` : `完成 ${item.title}`}
                              />
                            )}
                            <div className="min-w-0">
                              <Link
                                className={`list-label list-title-link ${isCompleted ? "line-through" : ""}`}
                                href={`/records/schedule/${item.id}`}
                              >
                                {item.title}
                              </Link>
                              {item.startTime && (
                                <p className="list-meta mt-1 font-bold text-[var(--clay)]">
                                  {formatScheduleTimeRange(item.startTime, item.endTime)}
                                </p>
                              )}
                              <p className="list-meta mt-1">
                                {getTaskCategoryLabel(item.category)}
                              </p>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state mt-4">
                <span className="empty-icon">
                  <CalendarDays aria-hidden="true" className="h-5 w-5" />
                </span>
                <div>
                  <p className="list-label">本周暂无日程</p>
                  <p className="body-copy mt-1">点击上方&quot;新增&quot;记录日程。</p>
                </div>
              </div>
            )
          ) : (
            <div className="mt-4 overflow-x-auto">
              <div className="habit-checkin-matrix">
                <div className="habit-checkin-header">
                  <span className="habit-checkin-name">日程</span>
                  {weekDays.map((d) => (
                    <span
                      key={d.date}
                      className={`text-center ${d.isToday ? "text-[var(--clay)] font-bold" : ""}`}
                    >
                      {d.label}
                      <br />
                      {d.dayNum}
                    </span>
                  ))}
                </div>
                {filteredSchedules.map((item) => (
                  <div key={item.id} className="habit-checkin-row">
                    <span className="habit-checkin-name">{item.title}</span>
                    {weekDays.map((d) => {
                      const isOnDay = scheduleOccursOnDate(item.startDate, item.endDate ?? null, item.recurrence as "none" | "daily" | "weekly" | "monthly", d.date);
                      const isCompleted = isOnDay && (scheduleCompletionMap.get(item.id)?.has(d.date) ?? false);
                      return (
                        <span
                          key={d.date}
                          className={`habit-checkin-dot ${isCompleted ? "checked" : ""}`}
                          style={isCompleted ? { borderColor: "var(--clay)", background: "var(--clay)" } : {}}
                        />
                      );
                    })}
                  </div>
                ))}
                {filteredSchedules.length === 0 && (
                  <p className="body-copy px-2 py-4">本周暂无日程。</p>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Habits */}
      {activeTab === "habits" && (
        <section className="workspace-panel tone-sage">
          <div className="flex items-center justify-between">
            <h2 className="section-heading">习惯</h2>
            <div className="flex items-center gap-2">
              {!isSelecting ? (
                <button type="button" className="quiet-button text-sm" onClick={() => setIsSelecting(true)}>
                  选择
                </button>
              ) : (
                <button type="button" className="quiet-button text-sm" onClick={exitSelectionMode}>
                  取消
                </button>
              )}
              <details className="create-disclosure">
              <summary className="create-summary soft-button text-sm">
                <Plus aria-hidden="true" className="h-3 w-3" />
                新增
              </summary>
              <form action={createChecklistHabitAction} className="task-form mt-3">
                <label className="form-field">
                  <span>习惯名称</span>
                  <input name="name" type="text" maxLength={120} placeholder="例如：多邻国 15 分钟" required />
                </label>
                <div className="task-form-grid">
                  <label className="form-field">
                    <span>分类</span>
                    <select name="category" defaultValue="health">
                      {taskCategories.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="form-field">
                    <span>开始日期</span>
                    <input name="startDate" type="date" defaultValue={todayStr} required />
                  </label>
                </div>
                <button className="soft-button w-fit text-sm" type="submit">保存习惯</button>
              </form>
            </details>
          </div>
          </div>
          {view === "list" ? (
            filteredHabits.length > 0 ? (
              <div className="task-list mt-4">
                {filteredHabits.map((habit) => (
                  <article
                    key={habit.id}
                    className={`task-list-item compact-list-item ${habit.isCheckedOnDate ? "task-status-completed" : "task-status-todo"}`}
                  >
                    <div className="compact-main-row">
                      {isSelecting ? (
                        <label className="batch-checkbox-label">
                          <input
                            type="checkbox"
                            className="batch-checkbox"
                            checked={selectedIds.has(habit.id)}
                            onChange={() => toggleSelect(habit.id)}
                          />
                        </label>
                      ) : (
                        <HabitCheckinToggle habitId={habit.id} isCheckedToday={habit.isCheckedOnDate} />
                      )}
                      <div className="min-w-0">
                        <Link className="list-label list-title-link" href={`/checklist/habits/${habit.id}`}>
                          {habit.name}
                        </Link>
                        <p className="list-meta mt-1">
                          {getTaskCategoryLabel(habit.category)} · 累计 {habit.totalCount} 次 · 连续 {habit.streakCount} 天
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state mt-4">
                <span className="empty-icon">
                  <Repeat2 aria-hidden="true" className="h-5 w-5" />
                </span>
                <div>
                  <p className="list-label">暂无启用习惯</p>
                  <p className="body-copy mt-1">点击上方&quot;新增&quot;添加习惯。</p>
                </div>
              </div>
            )
          ) : (
            <div className="mt-4 overflow-x-auto">
              <div className="habit-checkin-matrix">
                <div className="habit-checkin-header">
                  <span className="habit-checkin-name">习惯</span>
                  {weekDays.map((d) => (
                    <span
                      key={d.date}
                      className={`text-center ${d.isToday ? "text-[var(--sage)] font-bold" : ""}`}
                    >
                      {d.label}
                      <br />
                      {d.dayNum}
                    </span>
                  ))}
                </div>
                {filteredHabits.map((habit) => (
                  <div key={habit.id} className="habit-checkin-row">
                    <span className="habit-checkin-name">{habit.name}</span>
                    {weekDays.map((d) => {
                      const isChecked = habit.checkedDates.includes(d.date);
                      return (
                        <span
                          key={d.date}
                          className={`habit-checkin-dot ${isChecked ? "checked" : ""}`}
                        />
                      );
                    })}
                  </div>
                ))}
                {filteredHabits.length === 0 && (
                  <p className="body-copy px-2 py-4">暂无启用习惯。</p>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Ideas */}
      {activeTab === "ideas" && (
        <section className="workspace-panel tone-mist">
          <div className="flex items-center justify-between">
            <h2 className="section-heading">灵感</h2>
            <div className="flex items-center gap-2">
              {!isSelecting ? (
                <button type="button" className="quiet-button text-sm" onClick={() => setIsSelecting(true)}>
                  选择
                </button>
              ) : (
                <button type="button" className="quiet-button text-sm" onClick={exitSelectionMode}>
                  取消
                </button>
              )}
              <details className="create-disclosure">
              <summary className="create-summary soft-button text-sm">
                <Plus aria-hidden="true" className="h-3 w-3" />
                新增
              </summary>
              <form action={createChecklistIdeaAction} className="task-form mt-3">
                <label className="form-field">
                  <span>内容</span>
                  <textarea name="content" rows={3} maxLength={500} placeholder="记录你的想法..." required />
                </label>
                <div className="task-form-grid">
                  <label className="form-field">
                    <span>日期</span>
                    <input name="ideaDate" type="date" defaultValue={todayStr} required />
                  </label>
                </div>
                <button className="soft-button w-fit text-sm" type="submit">保存灵感</button>
              </form>
            </details>
          </div>
          </div>
          {filteredIdeas.length > 0 ? (
            <div className="task-list mt-4">
              {groupByDate(filteredIdeas, "ideaDate").map(([date, items]) => (
                <div key={date} className="mb-4">
                  <h3 className="date-group-header">{formatDateLabel(date)}</h3>
                  {items.map((idea) => (
                    <article
                      key={idea.id}
                      className="task-list-item compact-list-item task-status-todo"
                    >
                      <div className="compact-main-row">
                        {isSelecting ? (
                          <label className="batch-checkbox-label">
                            <input
                              type="checkbox"
                              className="batch-checkbox"
                              checked={selectedIds.has(idea.id)}
                              onChange={() => toggleSelect(idea.id)}
                            />
                          </label>
                        ) : idea.status === "to_review" ? (
                          <form action={convertIdeaToTaskAction}>
                            <input type="hidden" name="ideaId" value={idea.id} />
                            <label className="batch-checkbox-label" title="转化为任务">
                              <input
                                type="checkbox"
                                className="batch-checkbox"
                                aria-label="将此灵感转化为新任务"
                                onChange={(event) => {
                                  if (!event.currentTarget.checked) return;
                                  const shouldConvert = window.confirm("将此灵感转化为新任务？");
                                  if (shouldConvert) {
                                    event.currentTarget.form?.requestSubmit();
                                    return;
                                  }
                                  event.currentTarget.checked = false;
                                }}
                              />
                            </label>
                          </form>
                        ) : null}
                        <div className="min-w-0">
                          <Link
                            className="list-label list-title-link"
                            href={`/records/idea/${idea.id}`}
                          >
                            {idea.content.length > 96
                              ? `${idea.content.slice(0, 96)}...`
                              : idea.content}
                          </Link>
                        </div>
                      </div>
                      <div className="compact-actions">
                        <span className="status-pill">{getIdeaStatusLabel(idea.status)}</span>
                      </div>
                    </article>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state mt-4">
              <span className="empty-icon">
                <Lightbulb aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <p className="list-label">本周暂无灵感</p>
                <p className="body-copy mt-1">点击上方&quot;新增&quot;记录灵感。</p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Batch delete bar */}
      {isSelecting && (
        <div className="batch-action-bar">
          <label className="batch-checkbox-label">
            <input
              type="checkbox"
              className="batch-checkbox"
              checked={selectedIds.size === currentItems.length && currentItems.length > 0}
              onChange={toggleSelectAll}
            />
          </label>
          <span className="text-sm text-[var(--muted-foreground)]">
            {selectedIds.size > 0 ? `已选 ${selectedIds.size} 项` : "全选"}
          </span>
          <span className="flex-1" />
          <details className="batch-confirm-disclosure">
            <summary className="soft-button text-sm batch-delete-trigger">
              <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
              {selectedIds.size > 0 ? `删除 ${selectedIds.size} 项` : "删除"}
            </summary>
            <div className="batch-confirm-card">
              <p className="text-sm">确定删除选中的 {selectedIds.size} 项？此操作可恢复。</p>
              <form action={batchAction}>
                <input type="hidden" name="kind" value={activeTab} />
                <input type="hidden" name="ids" value={JSON.stringify(Array.from(selectedIds))} />
                <div className="flex gap-2 mt-3">
                  <button type="submit" className="soft-button text-sm">
                    确认删除
                  </button>
                </div>
              </form>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
