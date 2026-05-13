CREATE TABLE "anniversaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"person_name" text NOT NULL,
	"anniversary_date" date NOT NULL,
	"reminder_date" date,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX "anniversaries_user_date_idx" ON "anniversaries" USING btree ("user_id","anniversary_date");--> statement-breakpoint
CREATE INDEX "anniversaries_user_reminder_idx" ON "anniversaries" USING btree ("user_id","reminder_date");--> statement-breakpoint
ALTER TABLE "public"."anniversaries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS "anniversaries_select_own" ON "public"."anniversaries";--> statement-breakpoint
CREATE POLICY "anniversaries_select_own" ON "public"."anniversaries" FOR SELECT TO authenticated USING (auth.uid() = "user_id");--> statement-breakpoint
DROP POLICY IF EXISTS "anniversaries_insert_own" ON "public"."anniversaries";--> statement-breakpoint
CREATE POLICY "anniversaries_insert_own" ON "public"."anniversaries" FOR INSERT TO authenticated WITH CHECK (auth.uid() = "user_id");--> statement-breakpoint
DROP POLICY IF EXISTS "anniversaries_update_own" ON "public"."anniversaries";--> statement-breakpoint
CREATE POLICY "anniversaries_update_own" ON "public"."anniversaries" FOR UPDATE TO authenticated USING (auth.uid() = "user_id") WITH CHECK (auth.uid() = "user_id");--> statement-breakpoint
DROP POLICY IF EXISTS "anniversaries_delete_own" ON "public"."anniversaries";--> statement-breakpoint
CREATE POLICY "anniversaries_delete_own" ON "public"."anniversaries" FOR DELETE TO authenticated USING (auth.uid() = "user_id");
