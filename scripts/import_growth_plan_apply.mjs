#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import postgres from "postgres";

const CONFIRM_PHRASE = "IMPORT_FAYE_GROWTH_PLAN";
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DB_OPTIONS = {
  max: 1,
  prepare: false,
  ssl: "require",
  connect_timeout: 10,
};

function parseArgs(argv) {
  const args = {
    mode: "plan",
    file: "Faye的成长计划.xlsx",
    year: "2026",
    userId: "",
    email: "",
    confirmImport: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith("--")) {
      throw new Error(`Unknown argument: ${item}`);
    }
    const key = item.slice(2).replace(/-([a-z])/g, (_, char) => char.toUpperCase());
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for ${item}`);
    }
    args[key] = value;
    index += 1;
  }

  if (!["plan", "check", "probe", "probe-insert", "simulate", "apply"].includes(args.mode)) {
    throw new Error("--mode must be one of: plan, check, probe, probe-insert, simulate, apply");
  }

  return args;
}

function loadPlan(args) {
  const result = spawnSync(
    "python3",
    [
      "scripts/import_growth_plan_dry_run.py",
      "--format",
      "json",
      "--file",
      args.file,
      "--year",
      args.year,
    ],
    {
      cwd: ROOT,
      encoding: "utf8",
    },
  );

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "Failed to build import plan.");
  }

  return JSON.parse(result.stdout);
}

function getRows(plan, target) {
  return plan.targets[target]?.planned ?? [];
}

function printPlan(plan) {
  console.log(`Workbook: ${plan.workbook}`);
  console.log("Mode: plan only; no database connection; no writes.");
  console.log(
    `Summary: planned=${plan.summary.planned_rows}, skipped=${plan.summary.skipped_rows}, warnings=${plan.summary.warnings}`,
  );
  for (const [target, preview] of Object.entries(plan.targets)) {
    console.log(
      `${target}: source=${preview.source_count}, planned=${preview.planned.length}, skipped=${preview.skipped.length}, warnings=${preview.warnings.length}`,
    );
  }
  console.log("Next: run --mode check with --email or --user-id before applying.");
}

function requireDatabaseUrl() {
  dotenv.config({ path: resolve(ROOT, ".env.local"), quiet: true });
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured in .env.local.");
  }
  return process.env.DATABASE_URL;
}

function createSql(databaseUrl) {
  return postgres(databaseUrl, DB_OPTIONS);
}

async function withFreshSql(databaseUrl, callback) {
  const sql = createSql(databaseUrl);
  try {
    return await callback(sql);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

async function pause(ms) {
  await new Promise((resolvePause) => {
    setTimeout(resolvePause, ms);
  });
}

async function resolveUser(sql, args) {
  if (args.userId) {
    const rows = await sql`
      select id, email
      from auth.users
      where id = ${args.userId}
      limit 1
    `;
    if (rows.length === 0) {
      throw new Error(`No auth.users row found for user id ${args.userId}.`);
    }
    return rows[0];
  }

  if (args.email) {
    const rows = await sql`
      select id, email
      from auth.users
      where lower(email) = lower(${args.email})
      limit 1
    `;
    if (rows.length === 0) {
      throw new Error(`No auth.users row found for email ${args.email}.`);
    }
    return rows[0];
  }

  throw new Error("--mode check/apply requires --email or --user-id.");
}

async function countExisting(sql, userId) {
  const tasks = await sql`select count(*)::int as count from public.tasks where user_id = ${userId} and deleted_at is null`;
  const habits = await sql`select count(*)::int as count from public.habits where user_id = ${userId} and deleted_at is null`;
  const habitCheckins = await sql`select count(*)::int as count from public.habit_checkins where user_id = ${userId}`;
  const schedules = await sql`select count(*)::int as count from public.schedule_items where user_id = ${userId} and deleted_at is null`;
  const ideas = await sql`select count(*)::int as count from public.ideas where user_id = ${userId} and deleted_at is null`;
  const lifeEvents = await sql`select count(*)::int as count from public.life_events where user_id = ${userId} and deleted_at is null`;
  const anniversaries = await sql`select count(*)::int as count from public.anniversaries where user_id = ${userId} and deleted_at is null`;
  const giftRecords = await sql`select count(*)::int as count from public.gift_records where user_id = ${userId} and deleted_at is null`;

  return {
    tasks: tasks[0].count,
    habits: habits[0].count,
    habit_checkins: habitCheckins[0].count,
    schedule_items: schedules[0].count,
    ideas: ideas[0].count,
    life_events: lifeEvents[0].count,
    anniversaries: anniversaries[0].count,
    gift_records: giftRecords[0].count,
  };
}

async function countExistingFresh(databaseUrl, userId) {
  const targets = [
    "tasks",
    "habits",
    "habit_checkins",
    "schedule_items",
    "ideas",
    "life_events",
    "anniversaries",
    "gift_records",
  ];
  const counts = {};
  for (const target of targets) {
    counts[target] = await withFreshSql(databaseUrl, async (sql) => {
      const rows =
        target === "habit_checkins"
          ? await sql`select count(*)::int as count from public.habit_checkins where user_id = ${userId}`
          : await sql.unsafe(
              `select count(*)::int as count from public.${target} where user_id = $1 and deleted_at is null`,
              [userId],
            );
      return rows[0].count;
    });
  }
  return counts;
}

async function printCheck(databaseUrl, plan, user) {
  const existing = await countExistingFresh(databaseUrl, user.id);
  console.log(`Target user: ${user.email ?? "(no email)"} (${user.id})`);
  console.log("Mode: check only; no writes.");
  console.log(`Planned rows: ${plan.summary.planned_rows}`);
  console.log("Existing rows for this user:");
  for (const [target, count] of Object.entries(existing)) {
    console.log(`  ${target}: ${count}`);
  }
  console.log(`Apply guard: --mode apply --confirm-import ${CONFIRM_PHRASE}`);
}

async function probeFirstTask(sql, plan, user) {
  const [row] = getRows(plan, "tasks");
  if (!row) {
    throw new Error("No planned task row to probe.");
  }
  console.log(`Probe task: ${row.task_date} ${row.title}`);
  const existing = await sql`
    select id
    from public.tasks
    where user_id = ${user.id}
      and task_date = ${row.task_date}
      and title = ${row.title}
      and category = ${row.category}
      and deleted_at is null
    limit 1
  `;
  console.log(`Probe result: ${existing.length} existing row(s).`);
}

async function probeInsertTask(sql, plan, user, externalId) {
  const row =
    getRows(plan, "tasks").find((item) => item.external_id === externalId) ?? getRows(plan, "tasks")[0];
  if (!row) {
    throw new Error("No planned task row to probe.");
  }
  console.log(`Probe insert task: ${row.task_date} ${row.title}`);
  const reserved = await sql.reserve();
  try {
    await reserved`begin`;
    const inserted = await reserved`
      insert into public.tasks (
        user_id, title, description, category, status, task_date,
        review_note, completed_at, created_at, updated_at
      )
      values (
        ${user.id}, ${`${row.title}__probe`}, ${null}, ${row.category}, ${row.status}, ${row.task_date},
        ${row.review_note}, ${row.completed_at}, now(), now()
      )
      returning id
    `;
    console.log(`Probe insert returned id: ${inserted[0].id}`);
    await reserved`rollback`;
    console.log("Probe insert rolled back; no persistent writes.");
  } catch (error) {
    try {
      await reserved`rollback`;
    } catch {
      // Preserve original probe error.
    }
    throw error;
  } finally {
    reserved.release();
  }
}

async function importTasks(tx, plan, userId) {
  const rows = getRows(plan, "tasks");
  const externalToId = new Map();
  for (const row of rows) {
    console.log(`  task ${row.external_id}: ${row.task_date} ${row.title}`);
    const existing = await tx`
      select id
      from public.tasks
      where user_id = ${userId}
        and task_date = ${row.task_date}
        and title = ${row.title}
        and category = ${row.category}
        and deleted_at is null
      limit 1
    `;
    if (existing.length > 0) {
      externalToId.set(row.external_id, existing[0].id);
      continue;
    }

    const inserted = await tx`
      insert into public.tasks (
        user_id, title, description, category, status, task_date,
        review_note, completed_at, created_at, updated_at
      )
      values (
        ${userId}, ${row.title}, ${null}, ${row.category}, ${row.status}, ${row.task_date},
        ${row.review_note}, ${row.completed_at}, now(), now()
      )
      returning id
    `;
    externalToId.set(row.external_id, inserted[0].id);
  }
  return externalToId;
}

async function importHabits(tx, plan, userId) {
  const rows = getRows(plan, "habits");
  const nameToId = new Map();
  for (const row of rows) {
    const existing = await tx`
      select id
      from public.habits
      where user_id = ${userId}
        and name = ${row.name}
        and deleted_at is null
      limit 1
    `;
    if (existing.length > 0) {
      nameToId.set(row.name, existing[0].id);
      continue;
    }

    const inserted = await tx`
      insert into public.habits (
        user_id, name, description, category, is_active, start_date, created_at, updated_at
      )
      values (
        ${userId}, ${row.name}, ${null}, ${row.category}, ${row.is_active}, ${row.start_date}, now(), now()
      )
      returning id
    `;
    nameToId.set(row.name, inserted[0].id);
  }
  return nameToId;
}

async function importHabitCheckins(tx, plan, userId, habitNameToId) {
  for (const row of getRows(plan, "habit_checkins")) {
    const habitId = habitNameToId.get(row.habit_name);
    if (!habitId) {
      throw new Error(`Cannot import habit checkin; missing habit "${row.habit_name}".`);
    }

    await tx`
      insert into public.habit_checkins (
        user_id, habit_id, checkin_date, status, note, created_at, updated_at
      )
      values (
        ${userId}, ${habitId}, ${row.checkin_date}, ${row.status}, ${row.note}, now(), now()
      )
      on conflict (habit_id, checkin_date)
      do update set
        status = excluded.status,
        note = coalesce(excluded.note, public.habit_checkins.note),
        updated_at = now()
    `;
  }
}

async function importSchedules(tx, plan, userId) {
  for (const row of getRows(plan, "schedule_items")) {
    const existing = await tx`
      select id
      from public.schedule_items
      where user_id = ${userId}
        and title = ${row.title}
        and category = ${row.category}
        and schedule_date = ${row.schedule_date}
        and recurrence = ${row.recurrence}
        and start_time is not distinct from ${row.start_time}
        and deleted_at is null
      limit 1
    `;
    if (existing.length > 0) {
      continue;
    }

    await tx`
      insert into public.schedule_items (
        user_id, title, description, category, schedule_date, start_date,
        end_date, recurrence, start_time, created_at, updated_at
      )
      values (
        ${userId}, ${row.title}, ${null}, ${row.category}, ${row.schedule_date}, ${row.start_date},
        ${row.end_date}, ${row.recurrence}, ${row.start_time}, now(), now()
      )
    `;
  }
}

async function importIdeas(tx, plan, userId, taskExternalToId) {
  for (const row of getRows(plan, "ideas")) {
    const convertedTaskId = row.linked_task_external_id
      ? taskExternalToId.get(row.linked_task_external_id) ?? null
      : null;
    const existing = await tx`
      select id
      from public.ideas
      where user_id = ${userId}
        and idea_date = ${row.idea_date}
        and content = ${row.content}
        and deleted_at is null
      limit 1
    `;
    if (existing.length > 0) {
      continue;
    }

    await tx`
      insert into public.ideas (
        user_id, idea_date, content, status, solution_note, converted_task_id,
        converted_to_type, converted_to_id, created_at, updated_at
      )
      values (
        ${userId}, ${row.idea_date}, ${row.content}, ${row.status}, ${row.solution_note},
        ${convertedTaskId}, ${convertedTaskId ? "task" : null}, ${convertedTaskId}, now(), now()
      )
    `;
  }
}

async function importLifeEvents(tx, plan, userId) {
  for (const row of getRows(plan, "life_events")) {
    const existing = await tx`
      select id
      from public.life_events
      where user_id = ${userId}
        and event_date = ${row.event_date}
        and content = ${row.content}
        and deleted_at is null
      limit 1
    `;
    if (existing.length > 0) {
      continue;
    }

    await tx`
      insert into public.life_events (
        user_id, event_date, content, emotion_tags, tags, specific_event,
        next_action, ai_analysis_permission, created_at, updated_at
      )
      values (
        ${userId}, ${row.event_date}, ${row.content},
        ${JSON.stringify(row.emotion_tags)}::jsonb, ${JSON.stringify(row.tags)}::jsonb,
        ${row.specific_event}, ${row.next_action}, ${row.ai_analysis_permission}, now(), now()
      )
    `;
  }
}

async function importAnniversaries(tx, plan, userId) {
  const titleToId = new Map();
  for (const row of getRows(plan, "anniversaries")) {
    const existing = await tx`
      select id
      from public.anniversaries
      where user_id = ${userId}
        and title = ${row.title}
        and person_name = ${row.person_name}
        and anniversary_date = ${row.anniversary_date}
        and deleted_at is null
      limit 1
    `;
    if (existing.length > 0) {
      titleToId.set(row.title, existing[0].id);
      continue;
    }

    const inserted = await tx`
      insert into public.anniversaries (
        user_id, title, person_name, anniversary_date, reminder_date, note, created_at, updated_at
      )
      values (
        ${userId}, ${row.title}, ${row.person_name}, ${row.anniversary_date}, ${row.reminder_date},
        ${row.note}, now(), now()
      )
      returning id
    `;
    titleToId.set(row.title, inserted[0].id);
  }
  return titleToId;
}

async function importGifts(tx, plan, userId, anniversaryTitleToId) {
  for (const row of getRows(plan, "gift_records")) {
    const anniversaryId = row.anniversary_title
      ? anniversaryTitleToId.get(row.anniversary_title) ?? null
      : null;
    const existing = await tx`
      select id
      from public.gift_records
      where user_id = ${userId}
        and gift_name = ${row.gift_name}
        and recipient_name = ${row.recipient_name}
        and gift_date = ${row.gift_date}
        and deleted_at is null
      limit 1
    `;
    if (existing.length > 0) {
      continue;
    }

    await tx`
      insert into public.gift_records (
        user_id, anniversary_id, gift_name, recipient_name, gift_date,
        purpose, note, created_at, updated_at
      )
      values (
        ${userId}, ${anniversaryId}, ${row.gift_name}, ${row.recipient_name}, ${row.gift_date},
        ${row.purpose}, ${row.note}, now(), now()
      )
    `;
  }
}

async function runImport(tx, plan, user) {
  console.log("Import phase: tasks");
  const taskExternalToId = await importTasks(tx, plan, user.id);
  console.log("Import phase: habits");
  const habitNameToId = await importHabits(tx, plan, user.id);
  console.log("Import phase: habit_checkins");
  await importHabitCheckins(tx, plan, user.id, habitNameToId);
  console.log("Import phase: schedule_items");
  await importSchedules(tx, plan, user.id);
  console.log("Import phase: ideas");
  await importIdeas(tx, plan, user.id, taskExternalToId);
  console.log("Import phase: life_events");
  await importLifeEvents(tx, plan, user.id);
  console.log("Import phase: anniversaries");
  const anniversaryTitleToId = await importAnniversaries(tx, plan, user.id);
  console.log("Import phase: gift_records");
  await importGifts(tx, plan, user.id, anniversaryTitleToId);
}

async function simulateImport(sql, plan, user) {
  const reserved = await sql.reserve();
  try {
    await reserved`begin`;
    await runImport(reserved, plan, user);
    await reserved`rollback`;
  } catch (error) {
    try {
      await reserved`rollback`;
    } catch {
      // Preserve the original import error; rollback can fail if the connection already closed.
    }
    throw error;
  } finally {
    reserved.release();
  }
}

function singleTargetPlan(plan, target, rows) {
  return {
    ...plan,
    targets: {
      [target]: {
        ...(plan.targets[target] ?? {}),
        planned: rows,
      },
    },
  };
}

async function applyImportFresh(databaseUrl, plan, user) {
  console.log("Import phase: tasks");
  const taskExternalToId = new Map();
  for (const row of getRows(plan, "tasks")) {
    const partial = await withFreshSql(databaseUrl, (sql) =>
      importTasks(sql, singleTargetPlan(plan, "tasks", [row]), user.id),
    );
    for (const [externalId, id] of partial.entries()) {
      taskExternalToId.set(externalId, id);
    }
    await pause(80);
  }

  console.log("Import phase: habits");
  const habitNameToId = new Map();
  for (const row of getRows(plan, "habits")) {
    const partial = await withFreshSql(databaseUrl, (sql) =>
      importHabits(sql, singleTargetPlan(plan, "habits", [row]), user.id),
    );
    for (const [name, id] of partial.entries()) {
      habitNameToId.set(name, id);
    }
    await pause(80);
  }

  console.log("Import phase: habit_checkins");
  for (const row of getRows(plan, "habit_checkins")) {
    await withFreshSql(databaseUrl, (sql) =>
      importHabitCheckins(sql, singleTargetPlan(plan, "habit_checkins", [row]), user.id, habitNameToId),
    );
    await pause(80);
  }

  console.log("Import phase: schedule_items");
  for (const row of getRows(plan, "schedule_items")) {
    await withFreshSql(databaseUrl, (sql) =>
      importSchedules(sql, singleTargetPlan(plan, "schedule_items", [row]), user.id),
    );
    await pause(80);
  }

  console.log("Import phase: ideas");
  for (const row of getRows(plan, "ideas")) {
    await withFreshSql(databaseUrl, (sql) =>
      importIdeas(sql, singleTargetPlan(plan, "ideas", [row]), user.id, taskExternalToId),
    );
    await pause(80);
  }

  console.log("Import phase: life_events");
  for (const row of getRows(plan, "life_events")) {
    await withFreshSql(databaseUrl, (sql) =>
      importLifeEvents(sql, singleTargetPlan(plan, "life_events", [row]), user.id),
    );
    await pause(80);
  }

  console.log("Import phase: anniversaries");
  const anniversaryTitleToId = new Map();
  for (const row of getRows(plan, "anniversaries")) {
    const partial = await withFreshSql(databaseUrl, (sql) =>
      importAnniversaries(sql, singleTargetPlan(plan, "anniversaries", [row]), user.id),
    );
    for (const [title, id] of partial.entries()) {
      anniversaryTitleToId.set(title, id);
    }
    await pause(80);
  }

  console.log("Import phase: gift_records");
  for (const row of getRows(plan, "gift_records")) {
    await withFreshSql(databaseUrl, (sql) =>
      importGifts(sql, singleTargetPlan(plan, "gift_records", [row]), user.id, anniversaryTitleToId),
    );
    await pause(80);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const plan = loadPlan(args);

  if (args.mode === "plan") {
    printPlan(plan);
    return;
  }

  const databaseUrl = requireDatabaseUrl();
  const sql = createSql(databaseUrl);

  try {
    const user = await resolveUser(sql, args);
    if (args.mode === "check") {
      await printCheck(databaseUrl, plan, user);
      return;
    }

    if (args.mode === "probe") {
      await probeFirstTask(sql, plan, user);
      return;
    }

    if (args.mode === "probe-insert") {
      await probeInsertTask(sql, plan, user, args.externalId);
      return;
    }

    if (args.mode === "simulate") {
      await simulateImport(sql, plan, user);
      console.log("Simulation completed and rolled back; no persistent writes.");
      return;
    }

    if (args.confirmImport !== CONFIRM_PHRASE) {
      throw new Error(`Refusing to write. Pass --confirm-import ${CONFIRM_PHRASE} to apply.`);
    }

    await applyImportFresh(databaseUrl, plan, user);
    const existing = await countExisting(sql, user.id);
    console.log(`Imported growth plan data for ${user.email ?? user.id}.`);
    console.log("Current rows for this user:");
    for (const [target, count] of Object.entries(existing)) {
      console.log(`  ${target}: ${count}`);
    }
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
