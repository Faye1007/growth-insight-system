import Link from "next/link";
import type { ReactNode } from "react";

import { softDeleteTaskAction, updateTaskAction } from "@/app/daily/actions";
import { FeedbackMessage } from "@/components/feedback-message";
import { buildLoginPath, loginRequiredMessage } from "@/lib/auth/paths";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getEventDetailForUser,
  getHabitDetailForUser,
  getIdeaDetailForUser,
  getScheduleDetailForUser,
  getTaskDetailForUser,
} from "@/lib/data/user-data";
import {
  getTaskCategoryLabel,
  getTaskStatusLabel,
  taskCategories,
  taskStatuses,
} from "@/lib/tasks/options";
import {
  dailyTaskErrorFeedback,
  dailyTaskUpdatedFeedback,
  defaultTaskErrorFeedback,
  getFeedbackByCode,
} from "@/lib/feedback";

type RecordKind = "task" | "habit" | "schedule" | "event" | "idea";
type DetailPageProps = {
  params: Promise<{
    kind?: string;
    id?: string;
  }>;
  searchParams?: Promise<{
    taskError?: string;
    taskUpdated?: string;
  }>;
};

const kindLabels: Record<RecordKind, string> = {
  task: "任务详情",
  habit: "习惯打卡详情",
  schedule: "日程详情",
  event: "事件详情",
  idea: "灵感详情",
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

const aiAnalysisPermissionLabels: Record<string, string> = {
  none: "不参与 AI 分析",
  summary_only: "仅摘要参与",
  allow_original: "允许原文参与",
};

const dateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
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

function isRecordKind(value: string | undefined): value is RecordKind {
  return value === "task" || value === "habit" || value === "schedule" || value === "event" || value === "idea";
}

function formatDateValue(value: string | null | undefined) {
  return value ? dateFormatter.format(new Date(`${value}T00:00:00+08:00`)) : "未记录";
}

function formatDateTimeValue(value: Date | null | undefined) {
  return value ? dateTimeFormatter.format(value) : "未记录";
}

function formatScheduleTimeRange(startTime: string | null, endTime: string | null) {
  const start = startTime ? startTime.slice(0, 5) : "未设置时间";

  return endTime ? `${start}-${endTime.slice(0, 5)}` : start;
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-field">
      <span>{label}</span>
      <strong>{value || "未记录"}</strong>
    </div>
  );
}

function TagRow({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="body-copy">未记录</p>;
  }

  return (
    <div className="overview-detail-row">
      {items.map((item) => (
        <span key={item} className="status-pill">
          {item}
        </span>
      ))}
    </div>
  );
}

function NotFoundState() {
  return (
    <section className="panel-card">
      <h2 className="section-heading">没有找到这条记录</h2>
      <p className="body-copy mt-2">
        这条记录可能不存在、已被删除，或不属于当前登录账号。
      </p>
      <Link className="soft-button mt-4 w-fit" href="/records">
        返回成长记录
      </Link>
    </section>
  );
}

export default async function RecordDetailPage({ params, searchParams }: DetailPageProps) {
  const { kind, id } = await params;
  const resolvedSearchParams = await searchParams;
  const user = await getCurrentUser();
  const detailPath = isRecordKind(kind) && id ? `/records/${kind}/${id}` : "/records";
  const loginPath = buildLoginPath({ next: detailPath, message: loginRequiredMessage });

  if (!isRecordKind(kind) || !id) {
    return (
      <div className="page-stack">
        <header className="page-header">
          <p className="page-kicker">成长记录</p>
          <h1 className="page-title">记录详情</h1>
        </header>
        <NotFoundState />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-stack">
        <header className="page-header">
          <p className="page-kicker">成长记录</p>
          <h1 className="page-title">{kindLabels[kind]}</h1>
          <p className="page-description">登录后才能查看个人记录详情。</p>
        </header>
        <section className="panel-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="section-heading">需要登录</h2>
              <p className="body-copy mt-2">这条详情属于个人数据，登录后会回到当前详情页。</p>
            </div>
            <Link className="soft-button w-full sm:w-auto" href={loginPath}>
              登录 / 注册
            </Link>
          </div>
        </section>
      </div>
    );
  }

  if (kind === "task") {
    const task = await getTaskDetailForUser(user.id, id);
    const taskErrorFeedback = getFeedbackByCode(
      resolvedSearchParams?.taskError,
      dailyTaskErrorFeedback,
      defaultTaskErrorFeedback,
    );
    const taskUpdatedFeedback = getFeedbackByCode(
      resolvedSearchParams?.taskUpdated,
      dailyTaskUpdatedFeedback,
    );

    if (!task) {
      return <NotFoundDetail kindLabel={kindLabels[kind]} />;
    }

    return (
      <DetailLayout kindLabel={kindLabels[kind]} title={task.title}>
        <FeedbackMessage feedback={taskErrorFeedback} />
        <FeedbackMessage feedback={taskUpdatedFeedback} />
        <section className="panel-card">
          <div className="detail-grid">
            <DetailField label="分类" value={getTaskCategoryLabel(task.category)} />
            <DetailField label="状态" value={getTaskStatusLabel(task.status)} />
            <DetailField label="任务日期" value={formatDateValue(task.taskDate)} />
            <DetailField label="完成时间" value={formatDateTimeValue(task.completedAt)} />
            <DetailField label="创建时间" value={formatDateTimeValue(task.createdAt)} />
            <DetailField label="更新时间" value={formatDateTimeValue(task.updatedAt)} />
          </div>
        </section>
        <section className="panel-card">
          <h2 className="section-heading">任务说明</h2>
          <p className="detail-copy mt-3">{task.description || "未记录"}</p>
        </section>
        <section className="panel-card">
          <h2 className="section-heading">延期信息</h2>
          <div className="detail-grid mt-4">
            <DetailField label="是否延期" value={task.isPostponed ? "是" : "否"} />
            <DetailField label="延期来源日期" value={formatDateValue(task.postponedFromDate)} />
            <DetailField label="延期目标日期" value={formatDateValue(task.postponedToDate)} />
          </div>
        </section>
        <section className="panel-card">
          <h2 className="section-heading">复盘 / 备注</h2>
          <p className="detail-copy mt-3">{task.reviewNote || "未记录"}</p>
        </section>
        <TaskDetailEditSection taskId={id} task={task} />
      </DetailLayout>
    );
  }

  if (kind === "habit") {
    const checkin = await getHabitDetailForUser(user.id, id);

    if (!checkin) {
      return <NotFoundDetail kindLabel={kindLabels[kind]} />;
    }

    return (
      <DetailLayout kindLabel={kindLabels[kind]} title={checkin.habitName}>
        <section className="panel-card">
          <div className="detail-grid">
            <DetailField label="习惯分类" value={getTaskCategoryLabel(checkin.habitCategory)} />
            <DetailField label="打卡日期" value={formatDateValue(checkin.checkinDate)} />
            <DetailField label="打卡状态" value={habitCheckinStatusLabels[checkin.status] ?? checkin.status} />
            <DetailField label="创建时间" value={formatDateTimeValue(checkin.createdAt)} />
            <DetailField label="更新时间" value={formatDateTimeValue(checkin.updatedAt)} />
          </div>
        </section>
        <section className="panel-card">
          <h2 className="section-heading">复盘 / 备注</h2>
          <p className="detail-copy mt-3">{checkin.note || "未记录"}</p>
        </section>
      </DetailLayout>
    );
  }

  if (kind === "schedule") {
    const item = await getScheduleDetailForUser(user.id, id);

    if (!item) {
      return <NotFoundDetail kindLabel={kindLabels[kind]} />;
    }

    return (
      <DetailLayout kindLabel={kindLabels[kind]} title={item.title}>
        <section className="panel-card">
          <div className="detail-grid">
            <DetailField label="分类" value={getTaskCategoryLabel(item.category)} />
            <DetailField label="日程日期" value={formatDateValue(item.scheduleDate)} />
            <DetailField label="时间" value={formatScheduleTimeRange(item.startTime, item.endTime)} />
            <DetailField label="创建时间" value={formatDateTimeValue(item.createdAt)} />
            <DetailField label="更新时间" value={formatDateTimeValue(item.updatedAt)} />
          </div>
        </section>
        <section className="panel-card">
          <h2 className="section-heading">日程说明</h2>
          <p className="detail-copy mt-3">{item.description || "未记录"}</p>
        </section>
      </DetailLayout>
    );
  }

  if (kind === "event") {
    const event = await getEventDetailForUser(user.id, id);

    if (!event) {
      return <NotFoundDetail kindLabel={kindLabels[kind]} />;
    }

    return (
      <DetailLayout kindLabel={kindLabels[kind]} title="事件记录">
        <section className="panel-card">
          <div className="detail-grid">
            <DetailField label="事件日期" value={formatDateValue(event.eventDate)} />
            <DetailField label="AI 分析权限" value={aiAnalysisPermissionLabels[event.aiAnalysisPermission] ?? event.aiAnalysisPermission} />
            <DetailField label="创建时间" value={formatDateTimeValue(event.createdAt)} />
            <DetailField label="更新时间" value={formatDateTimeValue(event.updatedAt)} />
          </div>
        </section>
        <section className="panel-card">
          <h2 className="section-heading">内容</h2>
          <p className="detail-copy mt-3">{event.content}</p>
        </section>
        <section className="panel-card">
          <h2 className="section-heading">情绪标签</h2>
          <div className="mt-3">
            <TagRow items={event.emotionTags} />
          </div>
        </section>
        <section className="panel-card">
          <h2 className="section-heading">普通标签</h2>
          <div className="mt-3">
            <TagRow items={event.tags} />
          </div>
        </section>
        <section className="panel-card">
          <h2 className="section-heading">补充信息</h2>
          <div className="detail-grid mt-4">
            <DetailField label="具体事件" value={event.specificEvent ?? "未记录"} />
            <DetailField label="下次行动" value={event.nextAction ?? "未记录"} />
            <DetailField label="摘要" value={event.summary ?? "未记录"} />
          </div>
        </section>
      </DetailLayout>
    );
  }

  const idea = await getIdeaDetailForUser(user.id, id);

  if (!idea) {
    return <NotFoundDetail kindLabel={kindLabels[kind]} />;
  }

  return (
    <DetailLayout kindLabel={kindLabels[kind]} title="灵感记录">
      <section className="panel-card">
        <div className="detail-grid">
          <DetailField label="记录日期" value={formatDateValue(idea.ideaDate)} />
          <DetailField label="状态" value={ideaStatusLabels[idea.status] ?? idea.status} />
          <DetailField label="转化任务 ID" value={idea.convertedTaskId ?? "未记录"} />
          <DetailField label="创建时间" value={formatDateTimeValue(idea.createdAt)} />
          <DetailField label="更新时间" value={formatDateTimeValue(idea.updatedAt)} />
        </div>
      </section>
      <section className="panel-card">
        <h2 className="section-heading">内容</h2>
        <p className="detail-copy mt-3">{idea.content}</p>
      </section>
      <section className="panel-card">
        <h2 className="section-heading">处理说明</h2>
        <p className="detail-copy mt-3">{idea.solutionNote || "未记录"}</p>
      </section>
    </DetailLayout>
  );
}

function TaskDetailEditSection({
  taskId,
  task,
}: {
  taskId: string;
  task: {
    title: string;
    description: string | null;
    category: (typeof taskCategories)[number]["value"];
    status: (typeof taskStatuses)[number]["value"];
    taskDate: string;
    reviewNote: string | null;
  };
}) {
  return (
    <section className="panel-card">
      <h2 className="section-heading">编辑任务</h2>
      <form action={updateTaskAction} className="task-form mt-4">
        <input type="hidden" name="taskId" value={taskId} />
        <input type="hidden" name="source" value="detail" />

        <label className="form-field">
          <span>任务标题</span>
          <input name="title" type="text" maxLength={120} defaultValue={task.title} required />
        </label>

        <div className="task-form-grid">
          <label className="form-field">
            <span>分类</span>
            <select name="category" defaultValue={task.category}>
              {taskCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>日期</span>
            <input name="taskDate" type="date" defaultValue={task.taskDate} required />
          </label>

          <label className="form-field">
            <span>状态</span>
            <select name="status" defaultValue={task.status}>
              {taskStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="form-field">
          <span>任务说明</span>
          <textarea name="description" rows={4} defaultValue={task.description ?? ""} />
        </label>

        <label className="form-field">
          <span>复盘 / 备注</span>
          <textarea name="reviewNote" rows={4} defaultValue={task.reviewNote ?? ""} />
        </label>

        <div className="task-edit-actions">
          <button className="soft-button" type="submit">
            保存任务
          </button>
        </div>
      </form>

      <form action={softDeleteTaskAction} className="danger-zone mt-4">
        <input type="hidden" name="taskId" value={taskId} />
        <input type="hidden" name="source" value="detail" />
        <div>
          <h3 className="list-label">删除任务</h3>
          <p className="body-copy mt-1">删除后，这条任务不会再出现在工作台、成长记录和统计里。</p>
        </div>
        <button className="quiet-button danger-button" type="submit">
          删除任务
        </button>
      </form>
    </section>
  );
}

function DetailLayout({
  kindLabel,
  title,
  children,
}: {
  kindLabel: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="page-stack">
      <header className="page-header">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="page-kicker">成长记录</p>
            <h1 className="page-title">{title}</h1>
          </div>
          <span className="status-pill w-fit">{kindLabel}</span>
        </div>
        <p className="page-description">这里展示单条记录的当前只读详情。</p>
        <Link className="quiet-button mt-4 w-fit" href="/records">
          返回成长记录
        </Link>
      </header>
      {children}
    </div>
  );
}

function NotFoundDetail({ kindLabel }: { kindLabel: string }) {
  return (
    <div className="page-stack">
      <header className="page-header">
        <p className="page-kicker">成长记录</p>
        <h1 className="page-title">{kindLabel}</h1>
      </header>
      <NotFoundState />
    </div>
  );
}
