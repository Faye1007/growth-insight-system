import { createClient } from "@/lib/supabase/server";
import { getBeijingDateValue } from "@/lib/date";
import { getDaysBetween, assertRow, assertArray } from "./helpers";
import type { AnniversaryRow, AnniversaryRecord, UpcomingAnniversary } from "./types";

function mapAnniversary(row: AnniversaryRow): AnniversaryRecord {
  return {
    id: row.id,
    title: row.title,
    personName: row.person_name,
    type: row.type,
    anniversaryDate: row.anniversary_date,
    isLunar: row.is_lunar,
    reminderDate: row.reminder_date,
    reminderMode: row.reminder_mode,
    note: row.note,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export async function createAnniversaryForUser(input: {
  userId: string;
  title: string;
  personName: string;
  type: "anniversary" | "birthday";
  anniversaryDate: string;
  isLunar: boolean;
  reminderDate: string | null;
  reminderMode: "once" | "yearly";
  note: string | null;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("anniversaries").insert({
    user_id: input.userId,
    title: input.title,
    person_name: input.personName,
    type: input.type,
    anniversary_date: input.anniversaryDate,
    is_lunar: input.isLunar,
    reminder_date: input.reminderDate,
    reminder_mode: input.reminderMode,
    note: input.note,
  });

  if (error) {
    throw error;
  }
}

export async function updateAnniversaryForUser(input: {
  userId: string;
  anniversaryId: string;
  title: string;
  personName: string;
  type: "anniversary" | "birthday";
  anniversaryDate: string;
  isLunar: boolean;
  reminderDate: string | null;
  reminderMode: "once" | "yearly";
  note: string | null;
  updatedAt: Date;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("anniversaries")
    .update({
      title: input.title,
      person_name: input.personName,
      type: input.type,
      anniversary_date: input.anniversaryDate,
      is_lunar: input.isLunar,
      reminder_date: input.reminderDate,
      reminder_mode: input.reminderMode,
      note: input.note,
      updated_at: input.updatedAt.toISOString(),
    })
    .eq("id", input.anniversaryId)
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (error) {
    throw error;
  }
}

export async function softDeleteAnniversaryForUser(input: {
  userId: string;
  anniversaryId: string;
  deletedAt: Date;
}) {
  const deletedAtIso = input.deletedAt.toISOString();
  const supabase = await createClient();
  const { error } = await supabase
    .from("anniversaries")
    .update({
      deleted_at: deletedAtIso,
      updated_at: deletedAtIso,
    })
    .eq("id", input.anniversaryId)
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (error) {
    throw error;
  }
}

export async function getAnniversariesForUser(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("anniversaries")
    .select("id,title,person_name,type,anniversary_date,is_lunar,reminder_date,reminder_mode,note,created_at,updated_at")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("anniversary_date", { ascending: true })
    .order("created_at", { ascending: true })
    .returns<AnniversaryRow[]>();

  return assertArray(data, error).map(mapAnniversary);
}

export async function getAnniversaryDetailForUser(userId: string, anniversaryId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("anniversaries")
    .select("id,title,person_name,type,anniversary_date,is_lunar,reminder_date,reminder_mode,note,created_at,updated_at")
    .eq("id", anniversaryId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .maybeSingle<AnniversaryRow>();

  const row = assertRow(data, error);

  return row ? mapAnniversary(row) : null;
}

export async function getUpcomingAnniversariesForUser(userId: string): Promise<UpcomingAnniversary[]> {
  const anniversaries = await getAnniversariesForUser(userId);
  const today = getBeijingDateValue(new Date());
  const todayDate = new Date(`${today}T00:00:00+08:00`);
  const sevenDaysLater = new Date(todayDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  const sevenDaysLaterStr = getBeijingDateValue(sevenDaysLater);

  const upcoming: UpcomingAnniversary[] = [];

  for (const ann of anniversaries) {
    let upcomingDate: string | null = null;

    if (ann.reminderMode === "yearly") {
      const annMonthDay = ann.anniversaryDate.slice(5);
      const currentYear = todayDate.getFullYear();
      let candidate = `${currentYear}-${annMonthDay}`;

      if (candidate < today) {
        candidate = `${currentYear + 1}-${annMonthDay}`;
      }

      upcomingDate = candidate;
    } else if (ann.reminderDate) {
      if (ann.reminderDate >= today && ann.reminderDate <= sevenDaysLaterStr) {
        upcomingDate = ann.reminderDate;
      }
    }

    if (upcomingDate && upcomingDate >= today && upcomingDate <= sevenDaysLaterStr) {
      const daysUntil = getDaysBetween(today, upcomingDate);
      upcoming.push({
        ...ann,
        upcomingDate,
        daysUntil,
        isToday: daysUntil === 0,
      });
    }
  }

  return upcoming.sort((a, b) => a.upcomingDate.localeCompare(b.upcomingDate));
}
