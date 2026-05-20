import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const taskCategoryEnum = pgEnum("task_category", [
  "study",
  "work",
  "life",
  "health",
  "relationship",
  "other",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "completed",
  "postponed",
]);

export const habitCheckinStatusEnum = pgEnum("habit_checkin_status", [
  "checked",
  "skipped",
]);

export const aiAnalysisPermissionEnum = pgEnum("ai_analysis_permission", [
  "none",
  "summary_only",
  "allow_original",
]);

export const ideaStatusEnum = pgEnum("idea_status", [
  "to_review",
  "converted_to_task",
  "shelved",
  "abandoned",
]);

export const convertedToTypeEnum = pgEnum("converted_to_type", ["task", "habit"]);

export const reportTypeEnum = pgEnum("report_type", [
  "daily",
  "weekly",
  "monthly",
]);

export const generationStatusEnum = pgEnum("generation_status", [
  "pending",
  "completed",
  "failed",
]);

export const toolTypeEnum = pgEnum("tool_type", [
  "emotion_review",
  "stress_sorting",
  "tomorrow_plan",
]);

export const scheduleRecurrenceEnum = pgEnum("schedule_recurrence", [
  "none",
  "daily",
  "weekly",
  "monthly",
]);

export const anniversaryTypeEnum = pgEnum("anniversary_type", [
  "anniversary",
  "birthday",
]);

export const reminderModeEnum = pgEnum("reminder_mode", [
  "once",
  "yearly",
]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

const softDeleteTimestamp = {
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
};

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    category: taskCategoryEnum("category").default("other").notNull(),
    status: taskStatusEnum("status").default("todo").notNull(),
    taskDate: date("task_date").notNull(),
    isPostponed: boolean("is_postponed").default(false).notNull(),
    postponedFromDate: date("postponed_from_date"),
    postponedToDate: date("postponed_to_date"),
    reviewNote: text("review_note"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    isPinned: boolean("is_pinned").default(false).notNull(),
    ...timestamps,
    ...softDeleteTimestamp,
  },
  (table) => [
    index("tasks_user_date_idx").on(table.userId, table.taskDate),
    index("tasks_user_status_idx").on(table.userId, table.status),
  ],
);

export const habits = pgTable(
  "habits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    category: taskCategoryEnum("category").default("other").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    startDate: date("start_date"),
    isPinned: boolean("is_pinned").default(false).notNull(),
    ...timestamps,
    ...softDeleteTimestamp,
  },
  (table) => [
    index("habits_user_active_idx").on(table.userId, table.isActive),
    index("habits_user_category_idx").on(table.userId, table.category),
  ],
);

export const habitCheckins = pgTable(
  "habit_checkins",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    habitId: uuid("habit_id")
      .notNull()
      .references(() => habits.id, { onDelete: "cascade" }),
    checkinDate: date("checkin_date").notNull(),
    status: habitCheckinStatusEnum("status").default("checked").notNull(),
    note: text("note"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("habit_checkins_habit_date_unique").on(table.habitId, table.checkinDate),
    index("habit_checkins_user_date_idx").on(table.userId, table.checkinDate),
  ],
);

export const scheduleItems = pgTable(
  "schedule_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    category: taskCategoryEnum("category").default("other").notNull(),
    scheduleDate: date("schedule_date").notNull(),
    startDate: date("start_date"),
    endDate: date("end_date"),
    recurrence: scheduleRecurrenceEnum("recurrence").default("none").notNull(),
    startTime: time("start_time"),
    endTime: time("end_time"),
    isPinned: boolean("is_pinned").default(false).notNull(),
    isCompleted: boolean("is_completed").default(false).notNull(),
    ...timestamps,
    ...softDeleteTimestamp,
  },
  (table) => [
    index("schedule_items_user_date_idx").on(table.userId, table.scheduleDate),
    index("schedule_items_user_start_idx").on(table.userId, table.startDate),
    index("schedule_items_user_category_idx").on(table.userId, table.category),
  ],
);

export const lifeEvents = pgTable(
  "life_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    eventDate: date("event_date").notNull(),
    content: text("content").notNull(),
    emotionTags: jsonb("emotion_tags").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
    tags: jsonb("tags").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
    specificEvent: text("specific_event"),
    nextAction: text("next_action"),
    aiAnalysisPermission: aiAnalysisPermissionEnum("ai_analysis_permission")
      .default("summary_only")
      .notNull(),
    summary: text("summary"),
    isPinned: boolean("is_pinned").default(false).notNull(),
    ...timestamps,
    ...softDeleteTimestamp,
  },
  (table) => [
    index("life_events_user_date_idx").on(table.userId, table.eventDate),
    index("life_events_ai_permission_idx").on(table.userId, table.aiAnalysisPermission),
  ],
);

export const ideas = pgTable(
  "ideas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    ideaDate: date("idea_date").notNull(),
    content: text("content").notNull(),
    status: ideaStatusEnum("status").default("to_review").notNull(),
    solutionNote: text("solution_note"),
    convertedTaskId: uuid("converted_task_id").references(() => tasks.id, {
      onDelete: "set null",
    }),
    convertedToType: convertedToTypeEnum("converted_to_type"),
    convertedToId: uuid("converted_to_id"),
    shelvedAt: timestamp("shelved_at", { withTimezone: true }),
    isPinned: boolean("is_pinned").default(false).notNull(),
    ...timestamps,
    ...softDeleteTimestamp,
  },
  (table) => [
    index("ideas_user_date_idx").on(table.userId, table.ideaDate),
    index("ideas_user_status_idx").on(table.userId, table.status),
  ],
);

export const insightReports = pgTable(
  "insight_reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    reportType: reportTypeEnum("report_type").notNull(),
    periodStart: date("period_start").notNull(),
    periodEnd: date("period_end").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    patterns: jsonb("patterns").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
    suggestions: jsonb("suggestions").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
    nextActions: jsonb("next_actions").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
    sourceStats: jsonb("source_stats").$type<Record<string, unknown>>(),
    sourceHighlights: jsonb("source_highlights").$type<string[]>(),
    selectedOriginalEventIds: jsonb("selected_original_event_ids").$type<string[]>(),
    modelProvider: text("model_provider").notNull(),
    modelName: text("model_name").notNull(),
    generationStatus: generationStatusEnum("generation_status").default("pending").notNull(),
    errorMessage: text("error_message"),
    generatedAt: timestamp("generated_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("insight_reports_user_period_unique").on(
      table.userId,
      table.reportType,
      table.periodStart,
      table.periodEnd,
    ),
    index("insight_reports_user_type_idx").on(table.userId, table.reportType),
  ],
);

export const personalManuals = pgTable(
  "personal_manuals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    lifeStage: text("life_stage"),
    currentGoals: jsonb("current_goals").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
    abilityProfile: text("ability_profile"),
    emotionPatterns: text("emotion_patterns"),
    energySources: jsonb("energy_sources").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
    drainSources: jsonb("drain_sources").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
    recurringProblems: jsonb("recurring_problems").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
    preferredActionStyle: text("preferred_action_style"),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [uniqueIndex("personal_manuals_user_unique").on(table.userId)],
);

export const anniversaries = pgTable(
  "anniversaries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    title: text("title").notNull(),
    personName: text("person_name").notNull(),
    type: anniversaryTypeEnum("type").default("anniversary").notNull(),
    anniversaryDate: date("anniversary_date").notNull(),
    isLunar: boolean("is_lunar").default(false).notNull(),
    reminderDate: date("reminder_date"),
    reminderMode: reminderModeEnum("reminder_mode").default("once").notNull(),
    note: text("note"),
    ...timestamps,
    ...softDeleteTimestamp,
  },
  (table) => [
    index("anniversaries_user_date_idx").on(table.userId, table.anniversaryDate),
    index("anniversaries_user_reminder_idx").on(table.userId, table.reminderDate),
  ],
);

export const giftRecords = pgTable(
  "gift_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    anniversaryId: uuid("anniversary_id").references(() => anniversaries.id, {
      onDelete: "set null",
    }),
    giftName: text("gift_name").notNull(),
    recipientName: text("recipient_name").notNull(),
    giftDate: date("gift_date").notNull(),
    returnGift: text("return_gift"),
    note: text("note"),
    ...timestamps,
    ...softDeleteTimestamp,
  },
  (table) => [
    index("gift_records_user_date_idx").on(table.userId, table.giftDate),
    index("gift_records_user_recipient_idx").on(table.userId, table.recipientName),
    index("gift_records_user_anniversary_idx").on(table.userId, table.anniversaryId),
  ],
);

export const toolSessions = pgTable(
  "tool_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    toolType: toolTypeEnum("tool_type").notNull(),
    title: text("title").notNull(),
    inputContent: text("input_content").notNull(),
    outputContent: text("output_content").notNull(),
    aiUsed: boolean("ai_used").default(false).notNull(),
    ...timestamps,
    ...softDeleteTimestamp,
  },
  (table) => [
    index("tool_sessions_user_type_idx").on(table.userId, table.toolType),
    index("tool_sessions_user_created_idx").on(table.userId, table.createdAt),
  ],
);
