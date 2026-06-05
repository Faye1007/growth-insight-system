import { createClient } from "@/lib/supabase/server";
import type { TaskCategory } from "@/lib/tasks/options";
import { getBeijingDateValue, getBeijingDateAfter } from "@/lib/date";
import { assertRow, assertArray } from "./helpers";
import type {
  HabitRow,
  HabitCheckinRow,
  ActiveHabit,
  HabitRecord,
  HabitCheckin,
} from "./types";

function mapActiveHabit(row: HabitRow): ActiveHabit {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    isActive: row.is_active,
    startDate: row.start_date,
    isPinned: row.is_pinned,
    createdAt: new Date(row.created_at),
  };
}

function mapHabitCheckin(row: HabitCheckinRow): HabitCheckin {
  return {
    habitId: row.habit_id,
    checkinDate: row.checkin_date,
    status: row.status,
  };
}

export async function createHabitForUser(input: {
  userId: string;
  name: string;
  category: TaskCategory;
  startDate: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("habits").insert({
    user_id: input.userId,
    name: input.name,
    category: input.category,
    is_active: true,
    start_date: input.startDate,
  });

  if (error) {
    throw error;
  }
}

export async function updateHabitForUser(input: {
  userId: string;
  habitId: string;
  name: string;
  description: string | null;
  category: TaskCategory;
  startDate: string;
  updatedAt: Date;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("habits")
    .update({
      name: input.name,
      description: input.description,
      category: input.category,
      start_date: input.startDate,
      updated_at: input.updatedAt.toISOString(),
    })
    .eq("id", input.habitId)
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (error) {
    throw error;
  }
}

export async function deactivateHabitForUser(input: {
  userId: string;
  habitId: string;
  updatedAt: Date;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("habits")
    .update({
      is_active: false,
      updated_at: input.updatedAt.toISOString(),
    })
    .eq("id", input.habitId)
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (error) {
    throw error;
  }
}

export async function softDeleteHabitForUser(input: {
  userId: string;
  habitId: string;
  deletedAt: Date;
}) {
  const deletedAtIso = input.deletedAt.toISOString();
  const supabase = await createClient();
  const { error } = await supabase
    .from("habits")
    .update({
      is_active: false,
      deleted_at: deletedAtIso,
      updated_at: deletedAtIso,
    })
    .eq("id", input.habitId)
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (error) {
    throw error;
  }
}

export async function updateHabitPinnedForUser(input: {
  userId: string;
  habitId: string;
  isPinned: boolean;
  updatedAt: Date;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("habits")
    .update({
      is_pinned: input.isPinned,
      updated_at: input.updatedAt.toISOString(),
    })
    .eq("id", input.habitId)
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (error) {
    throw error;
  }
}

export async function getActiveHabitIdForUser(userId: string, habitId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("habits")
    .select("id")
    .eq("id", habitId)
    .eq("user_id", userId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .returns<{ id: string }>()
    .maybeSingle();
  const row = assertRow(data as { id: string } | null, error);

  return row ? { id: row.id } : null;
}

export async function upsertHabitCheckinForUser(input: {
  userId: string;
  habitId: string;
  checkinDate: string;
  status: "checked" | "skipped";
  updatedAt: Date;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("habit_checkins").upsert(
    {
      user_id: input.userId,
      habit_id: input.habitId,
      checkin_date: input.checkinDate,
      status: input.status,
      updated_at: input.updatedAt.toISOString(),
    },
    { onConflict: "habit_id,checkin_date" },
  );

  if (error) {
    throw error;
  }
}

export async function getActiveHabitsForUser(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("habits")
    .select("id,name,description,category,is_active,start_date,is_pinned,created_at")
    .eq("user_id", userId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: true })
    .returns<HabitRow[]>();

  return assertArray(data, error).map(mapActiveHabit);
}

export async function getHabitByIdForUser(userId: string, habitId: string): Promise<HabitRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("habits")
    .select("id,name,description,category,is_active,start_date,is_pinned,created_at")
    .eq("id", habitId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .returns<HabitRow[]>()
    .maybeSingle();

  const row = assertRow(data as HabitRow | null, error);
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    isActive: row.is_active,
    startDate: row.start_date,
    isPinned: row.is_pinned,
    createdAt: new Date(row.created_at),
  };
}

export async function getHabitCheckinsForDateRange(
  userId: string,
  habitId: string,
  startDate: string,
  endDate: string,
): Promise<Array<{ checkinDate: string; status: string }>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("habit_checkins")
    .select("checkin_date,status")
    .eq("user_id", userId)
    .eq("habit_id", habitId)
    .gte("checkin_date", startDate)
    .lte("checkin_date", endDate)
    .order("checkin_date", { ascending: true })
    .returns<Array<{ checkin_date: string; status: string }>>();

  return assertArray(data, error).map((row) => ({
    checkinDate: row.checkin_date,
    status: row.status,
  }));
}

export async function getHabitCheckinsForUser(
  userId: string,
  habitIds: string[],
) {
  if (habitIds.length === 0) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("habit_checkins")
    .select("habit_id,checkin_date,status")
    .eq("user_id", userId)
    .in("habit_id", habitIds)
    .order("checkin_date", { ascending: true })
    .returns<HabitCheckinRow[]>();

  return assertArray(data, error).map(mapHabitCheckin);
}

export async function getRecentHabitCheckinsForUser(
  userId: string,
  limit: number,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("habit_checkins")
    .select("id,checkin_date,status,created_at,habits!inner(name,user_id,deleted_at)")
    .eq("user_id", userId)
    .eq("habits.user_id", userId)
    .is("habits.deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<Array<HabitCheckinRow & { habits: { name: string } }>>();

  return assertArray(data, error).map((row) => ({
    id: row.id,
    habitName: row.habits.name,
    checkinDate: row.checkin_date,
    status: row.status,
    createdAt: new Date(row.created_at),
  }));
}

export async function getHabitDetailForUser(userId: string, id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("habit_checkins")
    .select("habit_id,checkin_date,status,note,created_at,updated_at,habits!inner(name,description,category,is_active,start_date,user_id,deleted_at)")
    .eq("id", id)
    .eq("user_id", userId)
    .eq("habits.user_id", userId)
    .is("habits.deleted_at", null)
    .returns<HabitCheckinRow & {
      habits: {
        name: string;
        description: string | null;
        category: TaskCategory;
        is_active: boolean;
        start_date: string | null;
      };
    }>()
    .maybeSingle();
  const row = assertRow(
    data as (HabitCheckinRow & {
      habits: {
        name: string;
        description: string | null;
        category: TaskCategory;
        is_active: boolean;
        start_date: string | null;
      };
    }) | null,
    error,
  );

  return row
    ? {
        habitId: row.habit_id,
        habitName: row.habits.name,
        habitDescription: row.habits.description,
        habitCategory: row.habits.category,
        habitStartDate: row.habits.start_date,
        habitIsActive: row.habits.is_active,
        checkinDate: row.checkin_date,
        status: row.status,
        note: row.note,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      }
    : null;
}

export async function getChecklistHabitsForUser(userId: string) {
  const supabase = await createClient();
  const { data: habitsData, error: habitsError } = await supabase
    .from("habits")
    .select("id,name,category,start_date,is_pinned,created_at")
    .eq("user_id", userId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: true })
    .returns<HabitRow[]>();

  const habits = assertArray(habitsData, habitsError);
  if (habits.length === 0) return [];

  const { data: checkinsData, error: checkinsError } = await supabase
    .from("habit_checkins")
    .select("habit_id,checkin_date,status")
    .eq("user_id", userId)
    .in("habit_id", habits.map((h) => h.id))
    .returns<HabitCheckinRow[]>();

  const checkins = assertArray(checkinsData, checkinsError);

  const checkedDatesByHabit = new Map<string, Set<string>>();
  for (const c of checkins) {
    if (c.status === "checked") {
      if (!checkedDatesByHabit.has(c.habit_id)) {
        checkedDatesByHabit.set(c.habit_id, new Set());
      }
      checkedDatesByHabit.get(c.habit_id)!.add(c.checkin_date);
    }
  }

  function getStreakCount(habitId: string, todayDate: string) {
    const dates = checkedDatesByHabit.get(habitId);
    if (!dates || !dates.has(todayDate)) return 0;
    let count = 0;
    let cursor = todayDate;
    while (dates.has(cursor)) {
      count += 1;
      cursor = getBeijingDateAfter(-1, cursor);
    }
    return count;
  }

  const todayDate = getBeijingDateValue(new Date());

  return habits.map((habit) => {
    const dates = checkedDatesByHabit.get(habit.id) ?? new Set();
    return {
      id: habit.id,
      name: habit.name,
      category: habit.category,
      startDate: habit.start_date,
      isPinned: habit.is_pinned,
      isCheckedOnDate: dates.has(todayDate),
      totalCount: dates.size,
      streakCount: getStreakCount(habit.id, todayDate),
      checkedDates: [...dates],
      createdAt: new Date(habit.created_at),
    };
  });
}

export async function getAllHabitCheckinsForUser(
  userId: string,
  habitIds: string[],
) {
  return getHabitCheckinsForUser(userId, habitIds);
}
