import { createClient } from "@/lib/supabase/server";
import { scheduleOccursOnDate } from "@/lib/schedules/options";
import type { ScheduleItemRow, DailyOverviewStats } from "./types";

export async function getDailyOverviewStatsForUser(
  userId: string,
  todayDate: string,
): Promise<DailyOverviewStats> {
  const supabase = await createClient();

  const [tasksRes, habitsRes, checkinsRes, schedulesRes, eventsRes, ideasRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("status")
      .eq("user_id", userId)
      .eq("task_date", todayDate)
      .is("deleted_at", null),
    supabase
      .from("habits")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_active", true)
      .is("deleted_at", null),
    supabase
      .from("habit_checkins")
      .select("habit_id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("checkin_date", todayDate)
      .eq("status", "checked"),
    supabase
      .from("schedule_items")
      .select("start_date,end_date,recurrence")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .lte("start_date", todayDate)
      .returns<Pick<ScheduleItemRow, "start_date" | "end_date" | "recurrence">[]>(),
    supabase
      .from("life_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("event_date", todayDate)
      .is("deleted_at", null),
    supabase
      .from("ideas")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("idea_date", todayDate)
      .is("deleted_at", null)
      .gte("created_at", `${todayDate}T00:00:00+08:00`)
      .lt("created_at", `${todayDate}T23:59:59+08:00`),
  ]);

  const totalTasks = tasksRes.data?.length ?? 0;
  const completedTasks = tasksRes.data?.filter((t) => t.status === "completed").length ?? 0;
  const totalHabits = habitsRes.count ?? 0;
  const checkedHabits = checkinsRes.count ?? 0;
  const totalSchedules = (schedulesRes.data ?? []).filter((row) =>
    scheduleOccursOnDate(row.start_date, row.end_date, row.recurrence, todayDate),
  ).length;
  const totalEvents = eventsRes.count ?? 0;
  const totalIdeas = ideasRes.count ?? 0;

  return { totalTasks, completedTasks, totalHabits, checkedHabits, totalSchedules, totalEvents, totalIdeas };
}
