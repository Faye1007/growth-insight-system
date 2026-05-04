import Link from "next/link";
import { and, asc, eq, isNull } from "drizzle-orm";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Lightbulb,
  NotebookPen,
  Plus,
  Repeat2,
} from "lucide-react";

import { createTaskAction, updateTaskStatusAction } from "@/app/daily/actions";
import { db } from "@/db";
import { tasks as taskTable } from "@/db/schema";
import { buildLoginPath, loginRequiredMessage } from "@/lib/auth/paths";
import { getCurrentUser } from "@/lib/auth/session";
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

function buildOverviewCards(taskCount: number, completedTaskCount: number) {
  const completionRate = taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0;

  return [
  {
    label: "今日任务",
    value: `${completionRate}%`,
    note: taskCount > 0 ? `${completedTaskCount}/${taskCount} 项已完成。` : "暂无待办，可以先创建今天的第一项任务。",
    tone: "tone-lavender",
  },
  {
    label: "习惯打卡",
    value: "0/0",
    note: "暂无启用习惯，后续从习惯列表读取。",
    tone: "tone-sage",
  },
  {
    label: "今日日程",
    value: "0",
    note: "暂无固定事项，后续支持手动记录。",
    tone: "tone-mist",
  },
  {
    label: "随手记录",
    value: "0",
    note: "暂无事件或灵感，后续支持快速记录。",
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
    emptyDescription: "后续会先创建习惯，再在这里完成每日打卡。",
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
    emptyDescription: "后续会按开始时间排序，没有时间的事项排在后面。",
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
    emptyDescription: "事件和灵感会分开保存；情绪作为事件的手动标签。",
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

type TodayTask = Awaited<ReturnType<typeof getTodayTasks>>[number];

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
  const completedTaskCount = todayTasks.filter((task) => task.status === "completed").length;
  const overviewCards = buildOverviewCards(todayTasks.length, completedTaskCount);
  const taskCreated = params?.taskCreated === "1";
  const taskUpdated = params?.taskUpdated ? taskUpdatedText[params.taskUpdated] ?? "任务状态已更新。" : "";
  const taskError = params?.taskError ? taskErrorText[params.taskError] ?? "任务保存失败，请稍后重试。" : "";
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
          <span className="status-pill w-fit">待接入真实统计</span>
        </div>
        <div className="daily-summary-grid mt-5">
          {overviewCards.map((card) => (
            <article key={card.label} className={`daily-summary-card ${card.tone}`}>
              <p className="metric-label">{card.label}</p>
              <p className="metric-value">{card.value}</p>
              <p className="body-copy mt-2">{card.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-label="每日工作台分区" className="workspace-grid">
        {dailySections.map((section) => {
          const Icon = section.Icon;
          const EmptyIcon = section.EmptyIcon;
          const isTaskSection = section.id === "tasks";

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
              {isTaskSection && isLoggedIn ? null : (
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
