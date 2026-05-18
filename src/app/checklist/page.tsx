import { ChecklistClient } from "@/components/checklist/checklist-client";
import { FeedbackMessage } from "@/components/feedback-message";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getChecklistHabitsForUser,
  getChecklistIdeasForUser,
  getChecklistSchedulesForUser,
  getChecklistTasksForUser,
} from "@/lib/data/user-data";
import type { FeedbackMessage as FeedbackMessageType } from "@/lib/feedback";

type ChecklistPageProps = {
  searchParams?: Promise<{
    tab?: string;
    taskCreated?: string;
    taskError?: string;
    scheduleCreated?: string;
    scheduleError?: string;
    habitCreated?: string;
    habitError?: string;
    ideaCreated?: string;
    ideaError?: string;
  }>;
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

function getWeekRange(referenceDate: Date) {
  const day = referenceDate.getDay();
  const monday = new Date(referenceDate);
  monday.setDate(referenceDate.getDate() - (day === 0 ? 6 : day - 1));

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: getBeijingDateValue(monday),
    end: getBeijingDateValue(sunday),
  };
}

export default async function ChecklistPage({ searchParams }: ChecklistPageProps) {
  const params = await searchParams;
  const user = await getCurrentUser();

  const { start: weekStart, end: weekEnd } = getWeekRange(new Date());

  const [tasks, schedules, habits, ideas] = user
    ? await Promise.all([
        getChecklistTasksForUser(user.id, weekStart, weekEnd),
        getChecklistSchedulesForUser(user.id, weekStart, weekEnd),
        getChecklistHabitsForUser(user.id, weekStart, weekEnd),
        getChecklistIdeasForUser(user.id, weekStart, weekEnd),
      ])
    : [[], [], [], []];

  const tab = params?.tab;
  const initialTab =
    tab === "tasks" || tab === "schedules" || tab === "habits" || tab === "ideas"
      ? tab
      : "tasks";

  const taskCreatedFeedback: FeedbackMessageType | null =
    params?.taskCreated === "1"
      ? { tone: "success", title: "任务已保存", detail: "这条任务已添加到列表中。" }
      : null;
  const taskErrorFeedback: FeedbackMessageType | null =
    params?.taskError === "missing_title"
      ? { tone: "error", title: "任务标题不能为空", detail: "请填写任务标题后重试。" }
      : params?.taskError === "save_failed"
        ? { tone: "error", title: "任务没有保存成功", detail: "请稍后重试。" }
        : null;
  const scheduleCreatedFeedback: FeedbackMessageType | null =
    params?.scheduleCreated === "1"
      ? { tone: "success", title: "日程已保存", detail: "这条日程已添加到列表中。" }
      : null;
  const scheduleErrorFeedback: FeedbackMessageType | null =
    params?.scheduleError === "missing_title"
      ? { tone: "error", title: "日程标题不能为空", detail: "请填写日程标题后重试。" }
      : params?.scheduleError === "missing_time"
        ? { tone: "error", title: "开始时间不能为空", detail: "请填写有效的开始时间（HH:MM 格式）。" }
        : params?.scheduleError === "invalid_date_range"
          ? { tone: "error", title: "日期范围无效", detail: "结束日期不能早于开始日期。" }
          : params?.scheduleError === "save_failed"
            ? { tone: "error", title: "日程没有保存成功", detail: "请稍后重试。" }
            : null;
  const habitCreatedFeedback: FeedbackMessageType | null =
    params?.habitCreated === "1"
      ? { tone: "success", title: "习惯已保存", detail: "这个习惯已添加到列表中。" }
      : null;
  const habitErrorFeedback: FeedbackMessageType | null =
    params?.habitError === "missing_name"
      ? { tone: "error", title: "习惯名称不能为空", detail: "请填写习惯名称后重试。" }
      : params?.habitError === "save_failed"
        ? { tone: "error", title: "习惯没有保存成功", detail: "请稍后重试。" }
        : null;
  const ideaCreatedFeedback: FeedbackMessageType | null =
    params?.ideaCreated === "1"
      ? { tone: "success", title: "灵感已保存", detail: "这条灵感已添加到列表中。" }
      : null;
  const ideaErrorFeedback: FeedbackMessageType | null =
    params?.ideaError === "missing_content"
      ? { tone: "error", title: "灵感内容不能为空", detail: "请填写灵感内容后重试。" }
      : params?.ideaError === "save_failed"
        ? { tone: "error", title: "灵感没有保存成功", detail: "请稍后重试。" }
        : null;

  return (
    <div className="page-stack">
      <FeedbackMessage feedback={taskCreatedFeedback} />
      <FeedbackMessage feedback={taskErrorFeedback} />
      <FeedbackMessage feedback={scheduleCreatedFeedback} />
      <FeedbackMessage feedback={scheduleErrorFeedback} />
      <FeedbackMessage feedback={habitCreatedFeedback} />
      <FeedbackMessage feedback={habitErrorFeedback} />
      <FeedbackMessage feedback={ideaCreatedFeedback} />
      <FeedbackMessage feedback={ideaErrorFeedback} />
      <ChecklistClient
        initialTab={initialTab as "tasks" | "schedules" | "habits" | "ideas"}
        tasks={tasks}
        schedules={schedules}
        habits={habits}
        ideas={ideas}
      />
    </div>
  );
}
