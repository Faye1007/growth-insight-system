import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  HeartPulse,
  NotebookPen,
  Repeat2,
} from "lucide-react";

import { EmotionStatsChart } from "@/components/insights/emotion-stats-chart";
import { HabitCheckinChart } from "@/components/insights/habit-checkin-chart";
import { RecordTrendChart } from "@/components/insights/record-trend-chart";
import { TaskCompletionChart } from "@/components/insights/task-completion-chart";
import { buildLoginPath, loginRequiredMessage } from "@/lib/auth/paths";
import { getCurrentUser } from "@/lib/auth/session";
import { getAllHabitCheckinsForUser, getInsightRowsForUser } from "@/lib/data/user-data";
import { getTaskCategoryLabel } from "@/lib/tasks/options";

const weekDayCount = 7;
const maxHabitRows = 6;
const maxEmotionRows = 8;

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  month: "2-digit",
  day: "2-digit",
});

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

function formatDateValue(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00+08:00`));
}

function getRate(completed: number, total: number) {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

function getHabitStreakCount(checkedDates: Set<string>, today: string) {
  let streakCount = 0;

  if (!checkedDates.has(today)) {
    return streakCount;
  }

  let cursorDate = today;

  while (checkedDates.has(cursorDate)) {
    streakCount += 1;
    cursorDate = getBeijingDateAfter(-1, new Date(`${cursorDate}T00:00:00+08:00`));
  }

  return streakCount;
}

function getRecordCountByDate<T, K extends keyof T>(
  rows: T[],
  dateKey: K,
  dateValue: string,
) {
  return rows.filter((row) => row[dateKey] === dateValue).length;
}

async function getInsightData(userId: string) {
  const today = getBeijingDateValue();
  const weekStart = getBeijingDateAfter(-(weekDayCount - 1));
  const weekDates = Array.from({ length: weekDayCount }, (_, index) =>
    getBeijingDateAfter(index - (weekDayCount - 1)),
  );

  const {
    tasks,
    activeHabits,
    habitCheckins,
    schedules,
    lifeEvents,
    ideas,
  } = await getInsightRowsForUser(userId, weekStart, today);

  const activeHabitIds = new Set(activeHabits.map((habit) => habit.id));
  const allHabitCheckins = activeHabits.length
    ? await getAllHabitCheckinsForUser(
        userId,
        activeHabits.map((habit) => habit.id),
      )
    : [];
  const todayTasks = tasks.filter((task) => task.taskDate === today);
  const todayCompletedTasks = todayTasks.filter((task) => task.status === "completed");
  const todayCheckedHabitIds = new Set(
    habitCheckins
      .filter(
        (checkin) =>
          checkin.checkinDate === today &&
          checkin.status === "checked" &&
          activeHabitIds.has(checkin.habitId),
      )
      .map((checkin) => checkin.habitId),
  );
  const todayScheduleCount = getRecordCountByDate(schedules, "scheduleDate", today);
  const todayEventCount = getRecordCountByDate(lifeEvents, "eventDate", today);
  const todayIdeaCount = getRecordCountByDate(ideas, "ideaDate", today);

  const daySummaries = weekDates.map((dateValue) => {
    const dayTasks = tasks.filter((task) => task.taskDate === dateValue);
    const completedTaskCount = dayTasks.filter((task) => task.status === "completed").length;
    const checkedHabitCount = new Set(
      habitCheckins
        .filter(
          (checkin) =>
            checkin.checkinDate === dateValue &&
            checkin.status === "checked" &&
            activeHabitIds.has(checkin.habitId),
        )
        .map((checkin) => checkin.habitId),
    ).size;
    const recordCount =
      getRecordCountByDate(lifeEvents, "eventDate", dateValue) +
      getRecordCountByDate(ideas, "ideaDate", dateValue);
    const eventCount = getRecordCountByDate(lifeEvents, "eventDate", dateValue);
    const ideaCount = getRecordCountByDate(ideas, "ideaDate", dateValue);

    return {
      dateValue,
      label: formatDateValue(dateValue),
      taskCount: dayTasks.length,
      completedTaskCount,
      taskCompletionRate: getRate(completedTaskCount, dayTasks.length),
      checkedHabitCount,
      eventCount,
      ideaCount,
      recordCount,
    };
  });

  const habitRows = activeHabits.slice(0, maxHabitRows).map((habit) => {
    const checkedDates = new Set(
      allHabitCheckins
        .filter((checkin) => checkin.habitId === habit.id && checkin.status === "checked")
        .map((checkin) => checkin.checkinDate),
    );
    const recentCheckedCount = habitCheckins.filter(
      (checkin) => checkin.habitId === habit.id && checkin.status === "checked",
    ).length;

    return {
      checkins: weekDates.map((dateValue) => ({
        checked: checkedDates.has(dateValue),
        dateValue,
        label: formatDateValue(dateValue),
      })),
      id: habit.id,
      name: habit.name,
      categoryLabel: getTaskCategoryLabel(habit.category),
      checkedToday: todayCheckedHabitIds.has(habit.id),
      recentCheckedCount,
      streakCount: getHabitStreakCount(checkedDates, today),
    };
  });

  const emotionCounts = new Map<string, number>();

  for (const event of lifeEvents) {
    for (const emotion of event.emotionTags) {
      emotionCounts.set(emotion, (emotionCounts.get(emotion) ?? 0) + 1);
    }
  }

  const emotionRows = Array.from(emotionCounts.entries())
    .map(([emotion, count]) => ({ emotion, count }))
    .sort((a, b) => b.count - a.count || a.emotion.localeCompare(b.emotion, "zh-CN"))
    .slice(0, maxEmotionRows);

  return {
    activeHabitCount: activeHabits.length,
    daySummaries,
    emotionRows,
    habitRows,
    today,
    todayCompletedTaskCount: todayCompletedTasks.length,
    todayEventCount,
    todayHabitCheckedCount: todayCheckedHabitIds.size,
    todayIdeaCount,
    todayScheduleCount,
    todayTaskCount: todayTasks.length,
    weekStart,
  };
}

export default async function InsightsPage() {
  const user = await getCurrentUser();
  const isLoggedIn = Boolean(user);
  const loginPath = buildLoginPath({ next: "/insights", message: loginRequiredMessage });
  const insightData = user ? await getInsightData(user.id) : null;

  const todayTaskRate = insightData
    ? getRate(insightData.todayCompletedTaskCount, insightData.todayTaskCount)
    : 0;
  const todayHabitRate = insightData
    ? getRate(insightData.todayHabitCheckedCount, insightData.activeHabitCount)
    : 0;
  const todayRecordCount = insightData
    ? insightData.todayEventCount + insightData.todayIdeaCount
    : 0;
  const weekDatesText = insightData
    ? `${formatDateValue(insightData.weekStart)}-${formatDateValue(insightData.today)}`
    : "最近 7 天";
  const hasWeeklyTaskData = Boolean(
    insightData?.daySummaries.some((day) => day.taskCount > 0),
  );
  const hasWeeklyRecordData = Boolean(
    insightData?.daySummaries.some((day) => day.recordCount > 0),
  );
  const weeklyEventCount =
    insightData?.daySummaries.reduce((total, day) => total + day.eventCount, 0) ?? 0;
  const weeklyIdeaCount =
    insightData?.daySummaries.reduce((total, day) => total + day.ideaCount, 0) ?? 0;
  const weeklyRecordCount = weeklyEventCount + weeklyIdeaCount;
  const weeklyEmotionCount =
    insightData?.emotionRows.reduce((total, emotion) => total + emotion.count, 0) ?? 0;

  return (
    <div className="page-stack">
      <header className="page-header">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="page-kicker">洞察报告</p>
            <h1 className="page-title">程序统计与复盘报告</h1>
          </div>
          <span className="status-pill w-fit">程序统计，不调用 AI</span>
        </div>
        <p className="page-description">
          当前页面先展示今日概览、最近 7 天趋势、习惯状态和情绪记录。AI 复盘入口会在后续步骤接入。
        </p>
      </header>

      {!isLoggedIn ? (
        <section className="panel-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="section-heading">登录后查看真实洞察</h2>
              <p className="body-copy mt-2">
                未登录时可以浏览页面结构；登录后会根据每日工作台数据生成程序统计。
              </p>
            </div>
            <Link className="soft-button w-full sm:w-auto" href={loginPath}>
              登录 / 注册
            </Link>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="today-insights" className="panel-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="page-kicker">今日概览</p>
            <h2 id="today-insights" className="section-heading mt-1">
              今天的基础状态
            </h2>
          </div>
          <span className="status-pill w-fit">北京时间</span>
        </div>

        <div className="insight-kpi-grid mt-5">
          <article className="daily-summary-card tone-lavender">
            <div className="metric-label">任务完成率</div>
            <div className="metric-value">{todayTaskRate}%</div>
            <p className="body-copy mt-2">
              {insightData
                ? `${insightData.todayCompletedTaskCount}/${insightData.todayTaskCount} 项已完成`
                : "登录后显示今日任务数据"}
            </p>
            <div className="overview-progress mt-4">
              <span style={{ width: `${todayTaskRate}%` }} />
            </div>
          </article>

          <article className="daily-summary-card tone-sage">
            <div className="metric-label">习惯打卡</div>
            <div className="metric-value">
              {insightData
                ? `${insightData.todayHabitCheckedCount}/${insightData.activeHabitCount}`
                : "0/0"}
            </div>
            <p className="body-copy mt-2">今日已完成的启用习惯。</p>
            <div className="overview-progress mt-4">
              <span style={{ width: `${todayHabitRate}%` }} />
            </div>
          </article>

          <article className="daily-summary-card tone-clay">
            <div className="metric-label">今日日程</div>
            <div className="metric-value">{insightData?.todayScheduleCount ?? 0}</div>
            <p className="body-copy mt-2">今天已记录的固定事项数量。</p>
          </article>

          <article className="daily-summary-card tone-mist">
            <div className="metric-label">随手记录</div>
            <div className="metric-value">{todayRecordCount}</div>
            <div className="overview-detail-row mt-3">
              <span className="status-pill">事件 {insightData?.todayEventCount ?? 0}</span>
              <span className="status-pill">灵感 {insightData?.todayIdeaCount ?? 0}</span>
            </div>
          </article>
        </div>
      </section>

      <section aria-labelledby="week-trend" className="panel-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="page-kicker">本周趋势</p>
            <h2 id="week-trend" className="section-heading mt-1">
              {weekDatesText}
            </h2>
          </div>
          <span className="status-pill w-fit">最近 7 天</span>
        </div>

        {insightData ? (
          <>
            {hasWeeklyTaskData ? (
              <div className="insight-chart-card mt-5">
                <div className="record-item-heading">
                  <div>
                    <p className="list-label">任务完成率图表</p>
                    <p className="body-copy mt-1">按北京时间统计最近 7 天每日任务完成率。</p>
                  </div>
                  <span className="status-pill">来自任务表</span>
                </div>
                <TaskCompletionChart data={insightData.daySummaries} />
              </div>
            ) : (
              <div className="empty-state mt-5">
                <span className="empty-icon">
                  <BarChart3 aria-hidden="true" className="h-5 w-5" />
                </span>
                <div>
                  <p className="list-label">暂无任务图表数据</p>
                  <p className="body-copy mt-1">
                    最近 7 天没有任务记录。创建任务后，这里会显示每日完成率。
                  </p>
                </div>
              </div>
            )}

            <div className="insight-day-grid mt-5">
              {insightData.daySummaries.map((day) => (
                <article key={day.dateValue} className="insight-day-card">
                  <div className="record-item-heading">
                    <span className="list-label">{day.label}</span>
                    <span className="status-pill">{day.taskCompletionRate}%</span>
                  </div>
                  <div className="insight-bar-stack mt-4">
                    <div className="insight-bar-row">
                      <span>任务</span>
                      <div className="overview-progress">
                        <span style={{ width: `${day.taskCompletionRate}%` }} />
                      </div>
                    </div>
                    <div className="overview-detail-row">
                      <span className="status-pill">
                        {day.completedTaskCount}/{day.taskCount} 任务
                      </span>
                      <span className="status-pill">{day.checkedHabitCount} 习惯</span>
                      <span className="status-pill">{day.recordCount} 记录</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state mt-5">
            <span className="empty-icon">
              <BarChart3 aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <p className="list-label">暂无趋势数据</p>
              <p className="body-copy mt-1">登录后会显示最近 7 天的任务、习惯和记录变化。</p>
            </div>
          </div>
        )}
      </section>

      <section aria-labelledby="record-trend" className="panel-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="page-kicker">记录数量趋势</p>
            <h2 id="record-trend" className="section-heading mt-1">
              最近 7 天随手记录
            </h2>
          </div>
          <div className="overview-detail-row">
            <span className="status-pill">总数 {weeklyRecordCount}</span>
            <span className="status-pill">事件 {weeklyEventCount}</span>
            <span className="status-pill">灵感 {weeklyIdeaCount}</span>
          </div>
        </div>

        {insightData && hasWeeklyRecordData ? (
          <div className="insight-chart-card mt-5">
            <div className="record-item-heading">
              <div>
                <p className="list-label">随手记录趋势图表</p>
                <p className="body-copy mt-1">按北京时间统计最近 7 天事件和灵感数量。</p>
              </div>
              <span className="status-pill">不使用 AI 归纳</span>
            </div>
            <RecordTrendChart data={insightData.daySummaries} />
          </div>
        ) : (
          <div className="empty-state mt-5">
            <span className="empty-icon">
              <NotebookPen aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <p className="list-label">暂无记录趋势数据</p>
              <p className="body-copy mt-1">最近 7 天没有事件或灵感记录。保存随手记录后会显示趋势。</p>
            </div>
          </div>
        )}
      </section>

      <section className="insight-section-grid">
        <article aria-labelledby="habit-status" className="panel-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="page-kicker">习惯状态</p>
              <h2 id="habit-status" className="section-heading mt-1">
                今日打卡与最近 7 天
              </h2>
            </div>
            <Repeat2 aria-hidden="true" className="h-5 w-5 text-[var(--sage)]" />
          </div>

          {insightData?.habitRows.length ? (
            <>
              <div className="insight-chart-card mt-5">
                <div className="record-item-heading">
                  <div>
                    <p className="list-label">习惯打卡图表</p>
                    <p className="body-copy mt-1">显示每个启用习惯最近 7 天完成数和每日打卡状态。</p>
                  </div>
                  <span className="status-pill">来自习惯打卡表</span>
                </div>
                <HabitCheckinChart data={insightData.habitRows} />
              </div>

              <div className="insight-list mt-5">
                {insightData.habitRows.map((habit) => (
                  <div key={habit.id} className="insight-list-row">
                    <div>
                      <p className="list-label">{habit.name}</p>
                      <p className="body-copy mt-1">{habit.categoryLabel}</p>
                    </div>
                    <div className="overview-detail-row justify-start sm:justify-end">
                      <span className="status-pill">
                        {habit.checkedToday ? "今日已完成" : "今日未打卡"}
                      </span>
                      <span className="status-pill">7天 {habit.recentCheckedCount}</span>
                      <span className="status-pill">连续 {habit.streakCount} 天</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state mt-5">
              <span className="empty-icon">
                <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <p className="list-label">暂无启用习惯</p>
                <p className="body-copy mt-1">在每日工作台添加习惯后，会出现在这里。</p>
              </div>
            </div>
          )}
        </article>

        <article aria-labelledby="emotion-records" className="panel-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="page-kicker">情绪记录</p>
              <h2 id="emotion-records" className="section-heading mt-1">
                手动情绪标签统计
              </h2>
            </div>
            <HeartPulse aria-hidden="true" className="h-5 w-5 text-[var(--clay)]" />
          </div>

          {insightData?.emotionRows.length ? (
            <>
              <div className="insight-chart-card mt-5">
                <div className="record-item-heading">
                  <div>
                    <p className="list-label">情绪标签图表</p>
                    <p className="body-copy mt-1">只统计事件记录中手动选择的情绪标签。</p>
                  </div>
                  <span className="status-pill">总计 {weeklyEmotionCount} 次</span>
                </div>
                <EmotionStatsChart data={insightData.emotionRows} />
              </div>

              <div className="insight-emotion-grid mt-5">
                {insightData.emotionRows.map((emotion) => (
                  <div key={emotion.emotion} className="field-tile">
                    <span>{emotion.emotion}</span>
                    <strong>{emotion.count}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state mt-5">
              <span className="empty-icon">
                <NotebookPen aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <p className="list-label">暂无情绪标签</p>
                <p className="body-copy mt-1">保存带情绪标签的事件后，会在这里统计最近 7 天出现次数。</p>
              </div>
            </div>
          )}
        </article>
      </section>

      <section className="panel-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="page-kicker">后续复盘</p>
            <h2 className="section-heading mt-1">AI 复盘尚未接入</h2>
            <p className="body-copy mt-2">
              当前页面只做程序统计。每日 AI 复盘会在 Step 6 进入生成、预览和缓存流程。
            </p>
          </div>
          <CalendarDays aria-hidden="true" className="h-5 w-5 text-[var(--mist)]" />
        </div>
      </section>
    </div>
  );
}
