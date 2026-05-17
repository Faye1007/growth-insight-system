import { ChecklistClient } from "@/components/checklist/checklist-client";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getChecklistHabitsForUser,
  getChecklistIdeasForUser,
  getChecklistSchedulesForUser,
  getChecklistTasksForUser,
} from "@/lib/data/user-data";

type ChecklistPageProps = {
  searchParams?: Promise<{
    tab?: string;
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

  return (
    <ChecklistClient
      initialTab={initialTab as "tasks" | "schedules" | "habits" | "ideas"}
      tasks={tasks}
      schedules={schedules}
      habits={habits}
      ideas={ideas}
    />
  );
}
