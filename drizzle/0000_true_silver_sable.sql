CREATE TYPE "public"."ai_analysis_permission" AS ENUM('none', 'summary_only', 'allow_original');--> statement-breakpoint
CREATE TYPE "public"."generation_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."habit_checkin_status" AS ENUM('checked', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."idea_status" AS ENUM('to_review', 'converted_to_task', 'shelved', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."report_type" AS ENUM('daily', 'weekly', 'monthly');--> statement-breakpoint
CREATE TYPE "public"."task_category" AS ENUM('study', 'work', 'life', 'health', 'relationship', 'other');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('todo', 'in_progress', 'completed', 'postponed');--> statement-breakpoint
CREATE TABLE "habit_checkins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"habit_id" uuid NOT NULL,
	"checkin_date" date NOT NULL,
	"status" "habit_checkin_status" DEFAULT 'checked' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "habits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" "task_category" DEFAULT 'other' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"start_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ideas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"idea_date" date NOT NULL,
	"content" text NOT NULL,
	"status" "idea_status" DEFAULT 'to_review' NOT NULL,
	"solution_note" text,
	"converted_task_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "insight_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"report_type" "report_type" NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"patterns" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"suggestions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"next_actions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"source_stats" jsonb,
	"source_highlights" jsonb,
	"selected_original_event_ids" jsonb,
	"model_provider" text NOT NULL,
	"model_name" text NOT NULL,
	"generation_status" "generation_status" DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"generated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "life_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"event_date" date NOT NULL,
	"content" text NOT NULL,
	"emotion_tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"specific_event" text,
	"next_action" text,
	"ai_analysis_permission" "ai_analysis_permission" DEFAULT 'summary_only' NOT NULL,
	"summary" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "personal_manuals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"life_stage" text,
	"current_goals" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"ability_profile" text,
	"emotion_patterns" text,
	"energy_sources" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"drain_sources" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"recurring_problems" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"preferred_action_style" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedule_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" "task_category" DEFAULT 'other' NOT NULL,
	"schedule_date" date NOT NULL,
	"start_time" time,
	"end_time" time,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" "task_category" DEFAULT 'other' NOT NULL,
	"status" "task_status" DEFAULT 'todo' NOT NULL,
	"task_date" date NOT NULL,
	"is_postponed" boolean DEFAULT false NOT NULL,
	"postponed_from_date" date,
	"postponed_to_date" date,
	"review_note" text,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "habit_checkins" ADD CONSTRAINT "habit_checkins_habit_id_habits_id_fk" FOREIGN KEY ("habit_id") REFERENCES "public"."habits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ideas" ADD CONSTRAINT "ideas_converted_task_id_tasks_id_fk" FOREIGN KEY ("converted_task_id") REFERENCES "public"."tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "habit_checkins_habit_date_unique" ON "habit_checkins" USING btree ("habit_id","checkin_date");--> statement-breakpoint
CREATE INDEX "habit_checkins_user_date_idx" ON "habit_checkins" USING btree ("user_id","checkin_date");--> statement-breakpoint
CREATE INDEX "habits_user_active_idx" ON "habits" USING btree ("user_id","is_active");--> statement-breakpoint
CREATE INDEX "habits_user_category_idx" ON "habits" USING btree ("user_id","category");--> statement-breakpoint
CREATE INDEX "ideas_user_date_idx" ON "ideas" USING btree ("user_id","idea_date");--> statement-breakpoint
CREATE INDEX "ideas_user_status_idx" ON "ideas" USING btree ("user_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "insight_reports_user_period_unique" ON "insight_reports" USING btree ("user_id","report_type","period_start","period_end");--> statement-breakpoint
CREATE INDEX "insight_reports_user_type_idx" ON "insight_reports" USING btree ("user_id","report_type");--> statement-breakpoint
CREATE INDEX "life_events_user_date_idx" ON "life_events" USING btree ("user_id","event_date");--> statement-breakpoint
CREATE INDEX "life_events_ai_permission_idx" ON "life_events" USING btree ("user_id","ai_analysis_permission");--> statement-breakpoint
CREATE UNIQUE INDEX "personal_manuals_user_unique" ON "personal_manuals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "schedule_items_user_date_idx" ON "schedule_items" USING btree ("user_id","schedule_date");--> statement-breakpoint
CREATE INDEX "schedule_items_user_category_idx" ON "schedule_items" USING btree ("user_id","category");--> statement-breakpoint
CREATE INDEX "tasks_user_date_idx" ON "tasks" USING btree ("user_id","task_date");--> statement-breakpoint
CREATE INDEX "tasks_user_status_idx" ON "tasks" USING btree ("user_id","status");