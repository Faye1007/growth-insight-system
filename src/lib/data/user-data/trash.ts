import { createClient } from "@/lib/supabase/server";
import type { TrashedItem, SearchResultItem } from "./types";

const batchDeleteTableMap: Record<string, string> = {
  tasks: "tasks",
  schedules: "schedule_items",
  habits: "habits",
  ideas: "ideas",
  events: "life_events",
  anniversaries: "anniversaries",
  gifts: "gift_records",
};

export async function batchSoftDeleteForUser(input: {
  userId: string;
  kind: string;
  ids: string[];
  deletedAt: Date;
}) {
  const tableName = batchDeleteTableMap[input.kind];
  if (!tableName) {
    throw new Error(`Unknown kind: ${input.kind}`);
  }
  const deletedAtIso = input.deletedAt.toISOString();
  const supabase = await createClient();
  const { error } = await supabase
    .from(tableName)
    .update({
      deleted_at: deletedAtIso,
      updated_at: deletedAtIso,
    })
    .in("id", input.ids)
    .eq("user_id", input.userId)
    .is("deleted_at", null);

  if (error) {
    throw error;
  }
}

const trashTableConfig: Array<{ kind: string; table: string; titleField: string; label: string }> = [
  { kind: "tasks", table: "tasks", titleField: "title", label: "任务" },
  { kind: "schedules", table: "schedule_items", titleField: "title", label: "日程" },
  { kind: "habits", table: "habits", titleField: "name", label: "习惯" },
  { kind: "ideas", table: "ideas", titleField: "content", label: "灵感" },
  { kind: "events", table: "life_events", titleField: "content", label: "事件" },
  { kind: "anniversaries", table: "anniversaries", titleField: "title", label: "纪念日" },
  { kind: "gifts", table: "gift_records", titleField: "gift_name", label: "礼物" },
];

export async function getTrashedItemsForUser(userId: string): Promise<TrashedItem[]> {
  const supabase = await createClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoff = thirtyDaysAgo.toISOString();
  const results = await Promise.all(
    trashTableConfig.map(async ({ kind, table, titleField, label }) => {
      const { data, error } = await supabase
        .from(table)
        .select(`id, ${titleField}, deleted_at`)
        .eq("user_id", userId)
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false })
        .returns<Array<{ id: string; deleted_at: string } & Record<string, string>>>();
      if (error) return [] as TrashedItem[];
      const items: TrashedItem[] = [];
      for (const row of data ?? []) {
        if (row.deleted_at < cutoff) {
          await supabase.from(table).delete().eq("id", row.id).eq("user_id", userId);
          continue;
        }
        items.push({
          id: row.id,
          kind,
          label,
          title: row[titleField] ?? "(无标题)",
          deletedAt: row.deleted_at,
        });
      }
      return items;
    }),
  );
  return results.flat();
}

export async function restoreTrashedItemForUser(input: {
  userId: string;
  kind: string;
  id: string;
}) {
  const config = trashTableConfig.find((c) => c.kind === input.kind);
  if (!config) throw new Error(`Unknown kind: ${input.kind}`);
  const now = new Date().toISOString();
  const supabase = await createClient();
  const { error } = await supabase
    .from(config.table)
    .update({ deleted_at: null, updated_at: now })
    .eq("id", input.id)
    .eq("user_id", input.userId);
  if (error) throw error;
}

export async function permanentlyDeleteTrashedItemForUser(input: {
  userId: string;
  kind: string;
  id: string;
}) {
  const config = trashTableConfig.find((c) => c.kind === input.kind);
  if (!config) throw new Error(`Unknown kind: ${input.kind}`);
  const supabase = await createClient();
  const { error } = await supabase
    .from(config.table)
    .delete()
    .eq("id", input.id)
    .eq("user_id", input.userId);
  if (error) throw error;
}

const searchTableConfig: Array<{ kind: string; table: string; titleField: string; dateField: string; label: string }> = [
  { kind: "tasks", table: "tasks", titleField: "title", dateField: "task_date", label: "任务" },
  { kind: "events", table: "life_events", titleField: "content", dateField: "event_date", label: "事件" },
  { kind: "ideas", table: "ideas", titleField: "content", dateField: "idea_date", label: "灵感" },
  { kind: "anniversaries", table: "anniversaries", titleField: "title", dateField: "anniversary_date", label: "纪念日" },
  { kind: "gifts", table: "gift_records", titleField: "gift_name", dateField: "gift_date", label: "礼物" },
  { kind: "schedules", table: "schedule_items", titleField: "title", dateField: "start_date", label: "日程" },
  { kind: "habits", table: "habits", titleField: "name", dateField: "start_date", label: "习惯" },
];

export async function searchAllForUser(userId: string, query: string, limit = 10): Promise<SearchResultItem[]> {
  if (!query.trim()) return [];
  const supabase = await createClient();
  const escaped = `%${query.trim()}%`;
  const results = await Promise.all(
    searchTableConfig.map(async ({ kind, table, titleField, dateField, label }) => {
      const { data, error } = await supabase
        .from(table)
        .select(`id, ${titleField}, ${dateField}`)
        .eq("user_id", userId)
        .is("deleted_at", null)
        .ilike(titleField, escaped)
        .order(dateField, { ascending: false })
        .limit(limit)
        .returns<Array<{ id: string } & Record<string, string>>>();
      if (error) return [] as SearchResultItem[];
      return (data ?? []).map((row) => ({
        id: row.id,
        kind,
        label,
        title: row[titleField] ?? "",
        date: row[dateField] ?? "",
      }));
    }),
  );
  return results.flat().sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit * 3);
}
