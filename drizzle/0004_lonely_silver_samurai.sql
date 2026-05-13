CREATE TYPE "public"."tool_type" AS ENUM('emotion_review', 'stress_sorting', 'tomorrow_plan');--> statement-breakpoint
CREATE TABLE "tool_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tool_type" "tool_type" NOT NULL,
	"title" text NOT NULL,
	"input_content" text NOT NULL,
	"output_content" text NOT NULL,
	"ai_used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX "tool_sessions_user_type_idx" ON "tool_sessions" USING btree ("user_id","tool_type");--> statement-breakpoint
CREATE INDEX "tool_sessions_user_created_idx" ON "tool_sessions" USING btree ("user_id","created_at");--> statement-breakpoint
ALTER TABLE "public"."tool_sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS "tool_sessions_select_own" ON "public"."tool_sessions";--> statement-breakpoint
CREATE POLICY "tool_sessions_select_own" ON "public"."tool_sessions" FOR SELECT TO authenticated USING (auth.uid() = "user_id");--> statement-breakpoint
DROP POLICY IF EXISTS "tool_sessions_insert_own" ON "public"."tool_sessions";--> statement-breakpoint
CREATE POLICY "tool_sessions_insert_own" ON "public"."tool_sessions" FOR INSERT TO authenticated WITH CHECK (auth.uid() = "user_id");--> statement-breakpoint
DROP POLICY IF EXISTS "tool_sessions_update_own" ON "public"."tool_sessions";--> statement-breakpoint
CREATE POLICY "tool_sessions_update_own" ON "public"."tool_sessions" FOR UPDATE TO authenticated USING (auth.uid() = "user_id") WITH CHECK (auth.uid() = "user_id");--> statement-breakpoint
DROP POLICY IF EXISTS "tool_sessions_delete_own" ON "public"."tool_sessions";--> statement-breakpoint
CREATE POLICY "tool_sessions_delete_own" ON "public"."tool_sessions" FOR DELETE TO authenticated USING (auth.uid() = "user_id");
