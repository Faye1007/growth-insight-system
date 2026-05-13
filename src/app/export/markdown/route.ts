import {
  getRecentHabitCheckinsForUser,
  getRecentIdeasForUser,
  getRecentLifeEventsForUser,
  getRecentReviewReportsForUser,
  getRecentScheduleItemsForUser,
  getRecentTasksForUser,
  type ExportReviewReport,
} from "@/lib/data/user-data";
import { getCurrentUser } from "@/lib/auth/session";
import { getTaskCategoryLabel, getTaskStatusLabel } from "@/lib/tasks/options";

type ExportKind = "records" | "reports";

const exportLimit = 20;

const reportTypeLabels: Record<ExportReviewReport["reportType"], string> = {
  daily: "每日复盘",
  weekly: "周复盘",
  monthly: "月复盘",
};

const habitCheckinStatusLabels: Record<string, string> = {
  checked: "已打卡",
  skipped: "已取消",
};

const ideaStatusLabels: Record<string, string> = {
  to_review: "待处理",
  converted_to_task: "已转任务",
  shelved: "已搁置",
  abandoned: "已放弃",
};

function getBeijingDateTimeText(date = new Date()) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getBeijingDateValue(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(`${value}T00:00:00+08:00`));
}

function sanitizeMarkdown(value: string) {
  return value.replace(/\r\n/g, "\n").trim();
}

function listItems(items: string[]) {
  const filtered = items.map((item) => item.trim()).filter(Boolean);

  return filtered.length ? filtered.map((item) => `- ${sanitizeMarkdown(item)}`).join("\n") : "- 暂无";
}

function markdownResponse(markdown: string, filename: string) {
  return new Response(markdown, {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}

function invalidKindResponse() {
  return new Response("Unsupported export kind.", { status: 400 });
}

async function buildReportsMarkdown(userId: string) {
  const reports = await getRecentReviewReportsForUser(userId, exportLimit);
  const lines = [
    "# Growth Insight 复盘报告导出",
    "",
    `导出时间：${getBeijingDateTimeText()}`,
    `导出数量：${reports.length}`,
    "",
  ];

  if (!reports.length) {
    lines.push("暂无可导出的复盘报告。");
    return lines.join("\n");
  }

  for (const report of reports) {
    lines.push(`## ${report.title}`, "");
    lines.push(`- 类型：${reportTypeLabels[report.reportType]}`);
    lines.push(`- 周期：${getBeijingDateValue(report.periodStart)} - ${getBeijingDateValue(report.periodEnd)}`);
    lines.push(`- 模型：${report.modelProvider} / ${report.modelName}`);
    lines.push("");
    lines.push("### 摘要", "", sanitizeMarkdown(report.summary), "");
    lines.push("### 观察到的模式", "", listItems(report.patterns), "");
    lines.push("### 行动建议", "", listItems(report.suggestions), "");
    lines.push("### 下一步行动", "", listItems(report.nextActions), "");
  }

  return lines.join("\n");
}

async function buildRecordsMarkdown(userId: string) {
  const [tasks, habits, schedules, events, ideas] = await Promise.all([
    getRecentTasksForUser(userId, exportLimit),
    getRecentHabitCheckinsForUser(userId, exportLimit),
    getRecentScheduleItemsForUser(userId, exportLimit),
    getRecentLifeEventsForUser(userId, exportLimit),
    getRecentIdeasForUser(userId, exportLimit),
  ]);
  const lines = [
    "# Growth Insight 成长记录导出",
    "",
    `导出时间：${getBeijingDateTimeText()}`,
    "",
    "## 任务",
    "",
  ];

  lines.push(
    tasks.length
      ? tasks
          .map((task) =>
            [
              `### ${task.title}`,
              `- 日期：${getBeijingDateValue(task.taskDate)}`,
              `- 分类：${getTaskCategoryLabel(task.category)}`,
              `- 状态：${getTaskStatusLabel(task.status)}`,
              `- 延期：${task.isPostponed ? "是" : "否"}`,
            ].join("\n"),
          )
          .join("\n\n")
      : "暂无任务记录。",
  );

  lines.push("", "## 习惯打卡", "");
  lines.push(
    habits.length
      ? habits
          .map((habit) =>
            [
              `### ${habit.habitName}`,
              `- 日期：${getBeijingDateValue(habit.checkinDate)}`,
              `- 状态：${habitCheckinStatusLabels[habit.status] ?? habit.status}`,
            ].join("\n"),
          )
          .join("\n\n")
      : "暂无习惯打卡记录。",
  );

  lines.push("", "## 日程", "");
  lines.push(
    schedules.length
      ? schedules
          .map((schedule) =>
            [
              `### ${schedule.title}`,
              `- 日期：${getBeijingDateValue(schedule.scheduleDate)}`,
              `- 分类：${getTaskCategoryLabel(schedule.category)}`,
              `- 时间：${schedule.startTime?.slice(0, 5) ?? "未设置"}${schedule.endTime ? `-${schedule.endTime.slice(0, 5)}` : ""}`,
            ].join("\n"),
          )
          .join("\n\n")
      : "暂无日程记录。",
  );

  lines.push("", "## 事件", "");
  lines.push(
    events.length
      ? events
          .map((event) =>
            [
              `### ${getBeijingDateValue(event.eventDate)}`,
              sanitizeMarkdown(event.content),
              "",
              `- 情绪：${event.emotionTags.length ? event.emotionTags.join("、") : "无"}`,
              `- 标签：${event.tags.length ? event.tags.join("、") : "无"}`,
            ].join("\n"),
          )
          .join("\n\n")
      : "暂无事件记录。",
  );

  lines.push("", "## 灵感", "");
  lines.push(
    ideas.length
      ? ideas
          .map((idea) =>
            [
              `### ${getBeijingDateValue(idea.ideaDate)}`,
              sanitizeMarkdown(idea.content),
              "",
              `- 状态：${ideaStatusLabels[idea.status] ?? idea.status}`,
            ].join("\n"),
          )
          .join("\n\n")
      : "暂无灵感记录。",
  );

  return lines.join("\n");
}

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return new Response("Login required.", { status: 401 });
  }

  const url = new URL(request.url);
  const kind = url.searchParams.get("kind") as ExportKind | null;

  if (kind === "reports") {
    return markdownResponse(
      await buildReportsMarkdown(user.id),
      "growth-insight-reports.md",
    );
  }

  if (kind === "records") {
    return markdownResponse(
      await buildRecordsMarkdown(user.id),
      "growth-insight-records.md",
    );
  }

  return invalidKindResponse();
}
