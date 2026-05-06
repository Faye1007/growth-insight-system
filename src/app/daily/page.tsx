import Link from "next/link";
import {
  Ban,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Lightbulb,
  NotebookPen,
  Pencil,
  Plus,
  Repeat2,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  createHabitAction,
  createQuickRecordAction,
  createScheduleItemAction,
  createTaskAction,
  deactivateHabitAction,
  generateDailyReviewAction,
  softDeleteIdeaAction,
  softDeleteLifeEventAction,
  softDeleteScheduleItemAction,
  softDeleteTaskAction,
  updateIdeaAction,
  updateHabitAction,
  updateLifeEventAction,
  updateScheduleItemAction,
  updateTaskAction,
  updateHabitCheckinAction,
  updateTaskStatusAction,
} from "@/app/daily/actions";
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
  type TodayIdea,
  type TodayLifeEvent,
  type TodayScheduleItem,
  type TodayTask,
} from "@/lib/data/user-data";
import {
  getTaskCategoryLabel,
  getTaskStatusLabel,
  taskStatusOrder,
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
      sectionId: "tasks",
      createKey: "task",
      actionLabel: "新建",
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
      sectionId: "habits",
      createKey: "habit",
      actionLabel: "添加",
    },
    {
      label: "今日日程",
      value: `${scheduleCount}`,
      progress: scheduleCount > 0 ? 100 : 0,
      note: scheduleCount > 0 ? "今日已记录的固定事项数量。" : "暂无固定事项，可以先记录今天的第一个日程。",
      details: [`日程 ${scheduleCount}`],
      tone: "tone-mist",
      sectionId: "schedule",
      createKey: "schedule",
      actionLabel: "记录",
    },
    {
      label: "随手记录",
      value: `${recordCount}`,
      progress: recordCount > 0 ? 100 : 0,
      note: recordCount > 0 ? "今日已保存的事件和灵感数量。" : "暂无事件或灵感，可以先写一条记录。",
      details: [`事件 ${eventCount}`, `灵感 ${ideaCount}`],
      tone: "tone-clay",
      sectionId: "notes",
      createKey: "record",
      actionLabel: "写入",
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

function TaskEditDisclosure({ task }: { task: TodayTask }) {
  return (
    <details className="task-edit-disclosure">
      <summary className="quiet-button">
        <Pencil aria-hidden="true" className="h-4 w-4" />
        编辑
      </summary>
      <form action={updateTaskAction} className="task-edit-form">
        <input type="hidden" name="taskId" value={task.id} />
        <input type="hidden" name="source" value="daily" />

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
          <textarea
            name="description"
            rows={3}
            defaultValue={task.description ?? ""}
            placeholder="补充背景、范围或执行标准"
          />
        </label>

        <label className="form-field">
          <span>复盘 / 备注</span>
          <textarea
            name="reviewNote"
            rows={3}
            defaultValue={task.reviewNote ?? ""}
            placeholder="记录完成情况、延期原因或复盘想法"
          />
        </label>

        <div className="task-edit-actions">
          <button className="soft-button" type="submit">
            保存修改
          </button>
        </div>
      </form>
    </details>
  );
}

function DeleteTaskAction({
  taskId,
  source = "daily",
}: {
  taskId: string;
  source?: "daily" | "detail";
}) {
  return (
    <form action={softDeleteTaskAction}>
      <input type="hidden" name="taskId" value={taskId} />
      <input type="hidden" name="source" value={source} />
      <button className="quiet-button danger-button" type="submit">
        <Trash2 aria-hidden="true" className="h-4 w-4" />
        删除
      </button>
    </form>
  );
}

function ScheduleEditDisclosure({ item }: { item: TodayScheduleItem }) {
  return (
    <details className="task-edit-disclosure">
      <summary className="quiet-button">
        <Pencil aria-hidden="true" className="h-4 w-4" />
        编辑
      </summary>
      <form action={updateScheduleItemAction} className="task-edit-form">
        <input type="hidden" name="scheduleId" value={item.id} />
        <input type="hidden" name="source" value="daily" />

        <label className="form-field">
          <span>日程标题</span>
          <input name="title" type="text" maxLength={120} defaultValue={item.title} required />
        </label>

        <div className="task-form-grid">
          <label className="form-field">
            <span>分类</span>
            <select name="category" defaultValue={item.category}>
              {taskCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>日期</span>
            <input name="scheduleDate" type="date" defaultValue={item.scheduleDate} required />
          </label>

          <label className="form-field">
            <span>开始时间</span>
            <input name="startTime" type="time" defaultValue={item.startTime?.slice(0, 5) ?? ""} required />
          </label>

          <label className="form-field">
            <span>结束时间</span>
            <input name="endTime" type="time" defaultValue={item.endTime?.slice(0, 5) ?? ""} />
          </label>
        </div>

        <label className="form-field">
          <span>日程说明</span>
          <textarea
            name="description"
            rows={3}
            defaultValue={item.description ?? ""}
            placeholder="补充这个日程的地点、背景或准备事项"
          />
        </label>

        <div className="task-edit-actions">
          <button className="soft-button" type="submit">
            保存修改
          </button>
        </div>
      </form>
    </details>
  );
}

function DeleteScheduleAction({
  scheduleId,
  source = "daily",
}: {
  scheduleId: string;
  source?: "daily" | "detail";
}) {
  return (
    <form action={softDeleteScheduleItemAction}>
      <input type="hidden" name="scheduleId" value={scheduleId} />
      <input type="hidden" name="source" value={source} />
      <button className="quiet-button danger-button" type="submit">
        <Trash2 aria-hidden="true" className="h-4 w-4" />
        删除
      </button>
    </form>
  );
}

function LifeEventEditDisclosure({ event }: { event: TodayLifeEvent }) {
  return (
    <details className="task-edit-disclosure">
      <summary className="quiet-button">
        <Pencil aria-hidden="true" className="h-4 w-4" />
        编辑
      </summary>
      <form action={updateLifeEventAction} className="task-edit-form">
        <input type="hidden" name="eventId" value={event.id} />
        <input type="hidden" name="source" value="daily" />

        <div className="task-form-grid">
          <label className="form-field">
            <span>日期</span>
            <input name="recordDate" type="date" defaultValue={event.eventDate} required />
          </label>

          <label className="form-field">
            <span>AI 分析权限</span>
            <select name="aiAnalysisPermission" defaultValue={event.aiAnalysisPermission}>
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
          <textarea name="content" maxLength={1200} defaultValue={event.content} required rows={5} />
        </label>

        <div className="task-form-grid">
          <label className="form-field">
            <span>情绪标签</span>
            <select name="emotionTags" multiple size={5} defaultValue={event.emotionTags}>
              {emotionOptions.map((emotion) => (
                <option key={emotion} value={emotion}>
                  {emotion}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>普通标签</span>
            <input name="tags" type="text" defaultValue={event.tags.join(", ")} />
          </label>

          <label className="form-field">
            <span>摘要</span>
            <textarea name="summary" rows={5} defaultValue={event.summary ?? ""} />
          </label>
        </div>

        <div className="task-form-grid">
          <label className="form-field">
            <span>具体事件</span>
            <input name="specificEvent" type="text" defaultValue={event.specificEvent ?? ""} />
          </label>

          <label className="form-field">
            <span>下次行动</span>
            <input name="nextAction" type="text" defaultValue={event.nextAction ?? ""} />
          </label>
        </div>

        <div className="task-edit-actions">
          <button className="soft-button" type="submit">
            保存修改
          </button>
        </div>
      </form>
    </details>
  );
}

function DeleteLifeEventAction({
  eventId,
  source = "daily",
}: {
  eventId: string;
  source?: "daily" | "detail";
}) {
  return (
    <form action={softDeleteLifeEventAction}>
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="source" value={source} />
      <button className="quiet-button danger-button" type="submit">
        <Trash2 aria-hidden="true" className="h-4 w-4" />
        删除
      </button>
    </form>
  );
}

function IdeaEditDisclosure({ idea }: { idea: TodayIdea }) {
  return (
    <details className="task-edit-disclosure">
      <summary className="quiet-button">
        <Pencil aria-hidden="true" className="h-4 w-4" />
        编辑
      </summary>
      <form action={updateIdeaAction} className="task-edit-form">
        <input type="hidden" name="ideaId" value={idea.id} />
        <input type="hidden" name="source" value="daily" />

        <div className="task-form-grid">
          <label className="form-field">
            <span>日期</span>
            <input name="ideaDate" type="date" defaultValue={idea.ideaDate} required />
          </label>

          <label className="form-field">
            <span>状态</span>
            <select name="status" defaultValue={idea.status}>
              {ideaStatusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="form-field">
          <span>内容</span>
          <textarea name="content" maxLength={1200} defaultValue={idea.content} required rows={5} />
        </label>

        <label className="form-field">
          <span>处理说明</span>
          <textarea name="solutionNote" rows={4} defaultValue={idea.solutionNote ?? ""} />
        </label>

        <div className="task-edit-actions">
          <button className="soft-button" type="submit">
            保存修改
          </button>
        </div>
      </form>
    </details>
  );
}

function DeleteIdeaAction({
  ideaId,
  source = "daily",
}: {
  ideaId: string;
  source?: "daily" | "detail";
}) {
  return (
    <form action={softDeleteIdeaAction}>
      <input type="hidden" name="ideaId" value={ideaId} />
      <input type="hidden" name="source" value={source} />
      <button className="quiet-button danger-button" type="submit">
        <Trash2 aria-hidden="true" className="h-4 w-4" />
        删除
      </button>
    </form>
  );
}

function HabitEditDisclosure({ habit }: { habit: ActiveHabit }) {
  return (
    <details className="task-edit-disclosure">
      <summary className="quiet-button">
        <Pencil aria-hidden="true" className="h-4 w-4" />
        编辑
      </summary>
      <form action={updateHabitAction} className="task-edit-form">
        <input type="hidden" name="habitId" value={habit.id} />
        <input type="hidden" name="source" value="daily" />

        <label className="form-field">
          <span>习惯名称</span>
          <input name="name" type="text" maxLength={120} defaultValue={habit.name} required />
        </label>

        <div className="task-form-grid">
          <label className="form-field">
            <span>分类</span>
            <select name="category" defaultValue={habit.category}>
              {taskCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>开始日期</span>
            <input name="startDate" type="date" defaultValue={habit.startDate ?? ""} required />
          </label>
        </div>

        <label className="form-field">
          <span>习惯说明</span>
          <textarea
            name="description"
            rows={3}
            defaultValue={habit.description ?? ""}
            placeholder="记录这个习惯的目标、边界或执行方式"
          />
        </label>

        <div className="task-edit-actions">
          <button className="soft-button" type="submit">
            保存习惯
          </button>
        </div>
      </form>
    </details>
  );
}

function DeactivateHabitAction({ habitId }: { habitId: string }) {
  return (
    <form action={deactivateHabitAction}>
      <input type="hidden" name="habitId" value={habitId} />
      <input type="hidden" name="source" value="daily" />
      <button className="quiet-button danger-button" type="submit">
        <Ban aria-hidden="true" className="h-4 w-4" />
        停用
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

function getIdeaStatusLabel(value: string) {
  return ideaStatusOptions.find((item) => item.value === value)?.label ?? value;
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
  const defaultPostponedDate = getBeijingDateAfter(1, now);
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
  const tasksByStatus = taskStatusOrder.map((status) => ({
    status,
    tasks: todayTasks.filter((task) => task.status === status),
  }));
  const taskCreateFormOpen =
    params?.create === "task" || params?.taskError === "missing_title" || params?.taskError === "save_failed";
  const habitCreateFormOpen =
    params?.create === "habit" || params?.habitError === "missing_name" || params?.habitError === "save_failed";
  const scheduleCreateFormOpen =
    params?.create === "schedule" ||
    params?.scheduleError === "missing_title" ||
    params?.scheduleError === "missing_time" ||
    params?.scheduleError === "invalid_time" ||
    params?.scheduleError === "save_failed";
  const recordCreateFormOpen =
    params?.create === "record" ||
    params?.recordError === "missing_content" ||
    params?.recordError === "invalid_type" ||
    params?.recordError === "save_failed";

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
          {overviewCards.map((card) => {
            const createHref = `/daily?create=${card.createKey}#${card.sectionId}`;
            const actionHref = isLoggedIn
              ? createHref
              : buildLoginPath({ next: createHref, message: loginRequiredMessage });

            return (
              <article key={card.label} className={`daily-summary-card ${card.tone}`}>
                <div className="overview-card-header">
                  <p className="metric-label">{card.label}</p>
                  <Link
                    aria-label={`${card.actionLabel}${card.label}`}
                    className="overview-card-action"
                    href={actionHref}
                  >
                    <Plus aria-hidden="true" className="h-3.5 w-3.5" />
                    <span>{card.actionLabel}</span>
                  </Link>
                </div>
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
            );
          })}
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
            <Link className="soft-button w-full sm:w-auto" href="/daily?reviewPreview=1#daily-review-preview">
              <Sparkles aria-hidden="true" className="h-4 w-4" />
              查看今日复盘
            </Link>
          ) : (
            <Link className="soft-button w-full sm:w-auto" href={loginPath}>
              <Sparkles aria-hidden="true" className="h-4 w-4" />
              登录后生成复盘
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
                <FeedbackMessage feedback={taskErrorFeedback} />
                <FeedbackMessage feedback={taskCreatedFeedback} />
                <FeedbackMessage feedback={taskUpdatedFeedback} />

                <details className="create-disclosure" open={taskCreateFormOpen}>
                  <summary className="create-summary soft-button w-full sm:w-fit">
                    <Plus aria-hidden="true" className="h-4 w-4" />
                    新建任务
                  </summary>
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
                </details>

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
                                  <Link className="quiet-button" href={`/records/task/${task.id}`}>
                                    详情
                                  </Link>
                                  <TaskStatusAction task={task} status="in_progress" label="进行中" />
                                  <TaskStatusAction task={task} status="completed" label="完成" />
                                  <PostponeTaskAction task={task} defaultPostponedDate={defaultPostponedDate} />
                                  <DeleteTaskAction taskId={task.id} />
                                </div>
                                <TaskEditDisclosure task={task} />
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
                <FeedbackMessage feedback={habitErrorFeedback} />
                <FeedbackMessage feedback={habitCreatedFeedback} />
                <FeedbackMessage feedback={habitUpdatedFeedback} />

                <details className="create-disclosure" open={habitCreateFormOpen}>
                  <summary className="create-summary soft-button w-full sm:w-fit">
                    <Plus aria-hidden="true" className="h-4 w-4" />
                    添加习惯
                  </summary>
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
                </details>

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
                            {habit.description ? (
                              <p className="body-copy mt-2">{getRecordPreview(habit.description)}</p>
                            ) : null}
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
                            <HabitEditDisclosure habit={habit} />
                            <DeactivateHabitAction habitId={habit.id} />
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
                <FeedbackMessage feedback={scheduleErrorFeedback} />
                <FeedbackMessage feedback={scheduleCreatedFeedback} />
                <FeedbackMessage feedback={scheduleUpdatedFeedback} />

                <details className="create-disclosure" open={scheduleCreateFormOpen}>
                  <summary className="create-summary soft-button w-full sm:w-fit">
                    <Plus aria-hidden="true" className="h-4 w-4" />
                    记录日程
                  </summary>
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
                </details>

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
                        <div className="task-actions">
                          <span className="status-pill">{item.scheduleDate}</span>
                          <Link className="quiet-button" href={`/records/schedule/${item.id}`}>
                            详情
                          </Link>
                          <DeleteScheduleAction scheduleId={item.id} />
                        </div>
                        <ScheduleEditDisclosure item={item} />
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
                <FeedbackMessage feedback={recordErrorFeedback} />
                <FeedbackMessage feedback={recordCreatedFeedback} />
                <FeedbackMessage feedback={recordUpdatedFeedback} />

                <details className="create-disclosure" open={recordCreateFormOpen}>
                  <summary className="create-summary soft-button w-full sm:w-fit">
                    <Plus aria-hidden="true" className="h-4 w-4" />
                    写一条记录
                  </summary>
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
                </details>

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
                        <div className="task-actions">
                          <Link className="quiet-button" href={`/records/event/${event.id}`}>
                            详情
                          </Link>
                          <DeleteLifeEventAction eventId={event.id} />
                        </div>
                        <LifeEventEditDisclosure event={event} />
                      </article>
                    ))}
                    {todayIdeas.map((idea) => (
                      <article key={idea.id} className="task-list-item">
                        <div className="min-w-0">
                          <p className="list-label">灵感 · {idea.ideaDate}</p>
                          <p className="body-copy mt-1">{getRecordPreview(idea.content)}</p>
                          {idea.solutionNote ? (
                            <p className="body-copy mt-1">处理说明：{getRecordPreview(idea.solutionNote)}</p>
                          ) : null}
                        </div>
                        <div className="task-actions">
                          <span className="status-pill">{getIdeaStatusLabel(idea.status)}</span>
                          <Link className="quiet-button" href={`/records/idea/${idea.id}`}>
                            详情
                          </Link>
                          <DeleteIdeaAction ideaId={idea.id} />
                        </div>
                        <IdeaEditDisclosure idea={idea} />
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
