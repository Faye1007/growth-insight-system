ALTER TABLE "public"."tasks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS "tasks_select_own" ON "public"."tasks";--> statement-breakpoint
CREATE POLICY "tasks_select_own" ON "public"."tasks" FOR SELECT TO authenticated USING (auth.uid() = "user_id");--> statement-breakpoint
DROP POLICY IF EXISTS "tasks_insert_own" ON "public"."tasks";--> statement-breakpoint
CREATE POLICY "tasks_insert_own" ON "public"."tasks" FOR INSERT TO authenticated WITH CHECK (auth.uid() = "user_id");--> statement-breakpoint
DROP POLICY IF EXISTS "tasks_update_own" ON "public"."tasks";--> statement-breakpoint
CREATE POLICY "tasks_update_own" ON "public"."tasks" FOR UPDATE TO authenticated USING (auth.uid() = "user_id") WITH CHECK (auth.uid() = "user_id");--> statement-breakpoint
DROP POLICY IF EXISTS "tasks_delete_own" ON "public"."tasks";--> statement-breakpoint
CREATE POLICY "tasks_delete_own" ON "public"."tasks" FOR DELETE TO authenticated USING (auth.uid() = "user_id");--> statement-breakpoint
ALTER TABLE "public"."habits" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS "habits_select_own" ON "public"."habits";--> statement-breakpoint
CREATE POLICY "habits_select_own" ON "public"."habits" FOR SELECT TO authenticated USING (auth.uid() = "user_id");--> statement-breakpoint
DROP POLICY IF EXISTS "habits_insert_own" ON "public"."habits";--> statement-breakpoint
CREATE POLICY "habits_insert_own" ON "public"."habits" FOR INSERT TO authenticated WITH CHECK (auth.uid() = "user_id");--> statement-breakpoint
DROP POLICY IF EXISTS "habits_update_own" ON "public"."habits";--> statement-breakpoint
CREATE POLICY "habits_update_own" ON "public"."habits" FOR UPDATE TO authenticated USING (auth.uid() = "user_id") WITH CHECK (auth.uid() = "user_id");--> statement-breakpoint
DROP POLICY IF EXISTS "habits_delete_own" ON "public"."habits";--> statement-breakpoint
CREATE POLICY "habits_delete_own" ON "public"."habits" FOR DELETE TO authenticated USING (auth.uid() = "user_id");--> statement-breakpoint
ALTER TABLE "public"."habit_checkins" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS "habit_checkins_select_own" ON "public"."habit_checkins";--> statement-breakpoint
CREATE POLICY "habit_checkins_select_own" ON "public"."habit_checkins" FOR SELECT TO authenticated USING (auth.uid() = "user_id");--> statement-breakpoint
DROP POLICY IF EXISTS "habit_checkins_insert_own" ON "public"."habit_checkins";--> statement-breakpoint
CREATE POLICY "habit_checkins_insert_own" ON "public"."habit_checkins" FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = "user_id"
  AND EXISTS (
    SELECT 1
    FROM "public"."habits"
    WHERE "habits"."id" = "habit_checkins"."habit_id"
      AND "habits"."user_id" = auth.uid()
  )
);--> statement-breakpoint
DROP POLICY IF EXISTS "habit_checkins_update_own" ON "public"."habit_checkins";--> statement-breakpoint
CREATE POLICY "habit_checkins_update_own" ON "public"."habit_checkins" FOR UPDATE TO authenticated USING (auth.uid() = "user_id") WITH CHECK (
  auth.uid() = "user_id"
  AND EXISTS (
    SELECT 1
    FROM "public"."habits"
    WHERE "habits"."id" = "habit_checkins"."habit_id"
      AND "habits"."user_id" = auth.uid()
  )
);--> statement-breakpoint
DROP POLICY IF EXISTS "habit_checkins_delete_own" ON "public"."habit_checkins";--> statement-breakpoint
CREATE POLICY "habit_checkins_delete_own" ON "public"."habit_checkins" FOR DELETE TO authenticated USING (auth.uid() = "user_id");--> statement-breakpoint
ALTER TABLE "public"."schedule_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS "schedule_items_select_own" ON "public"."schedule_items";--> statement-breakpoint
CREATE POLICY "schedule_items_select_own" ON "public"."schedule_items" FOR SELECT TO authenticated USING (auth.uid() = "user_id");--> statement-breakpoint
DROP POLICY IF EXISTS "schedule_items_insert_own" ON "public"."schedule_items";--> statement-breakpoint
CREATE POLICY "schedule_items_insert_own" ON "public"."schedule_items" FOR INSERT TO authenticated WITH CHECK (auth.uid() = "user_id");--> statement-breakpoint
DROP POLICY IF EXISTS "schedule_items_update_own" ON "public"."schedule_items";--> statement-breakpoint
CREATE POLICY "schedule_items_update_own" ON "public"."schedule_items" FOR UPDATE TO authenticated USING (auth.uid() = "user_id") WITH CHECK (auth.uid() = "user_id");--> statement-breakpoint
DROP POLICY IF EXISTS "schedule_items_delete_own" ON "public"."schedule_items";--> statement-breakpoint
CREATE POLICY "schedule_items_delete_own" ON "public"."schedule_items" FOR DELETE TO authenticated USING (auth.uid() = "user_id");--> statement-breakpoint
ALTER TABLE "public"."life_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS "life_events_select_own" ON "public"."life_events";--> statement-breakpoint
CREATE POLICY "life_events_select_own" ON "public"."life_events" FOR SELECT TO authenticated USING (auth.uid() = "user_id");--> statement-breakpoint
DROP POLICY IF EXISTS "life_events_insert_own" ON "public"."life_events";--> statement-breakpoint
CREATE POLICY "life_events_insert_own" ON "public"."life_events" FOR INSERT TO authenticated WITH CHECK (auth.uid() = "user_id");--> statement-breakpoint
DROP POLICY IF EXISTS "life_events_update_own" ON "public"."life_events";--> statement-breakpoint
CREATE POLICY "life_events_update_own" ON "public"."life_events" FOR UPDATE TO authenticated USING (auth.uid() = "user_id") WITH CHECK (auth.uid() = "user_id");--> statement-breakpoint
DROP POLICY IF EXISTS "life_events_delete_own" ON "public"."life_events";--> statement-breakpoint
CREATE POLICY "life_events_delete_own" ON "public"."life_events" FOR DELETE TO authenticated USING (auth.uid() = "user_id");--> statement-breakpoint
ALTER TABLE "public"."ideas" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS "ideas_select_own" ON "public"."ideas";--> statement-breakpoint
CREATE POLICY "ideas_select_own" ON "public"."ideas" FOR SELECT TO authenticated USING (auth.uid() = "user_id");--> statement-breakpoint
DROP POLICY IF EXISTS "ideas_insert_own" ON "public"."ideas";--> statement-breakpoint
CREATE POLICY "ideas_insert_own" ON "public"."ideas" FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = "user_id"
  AND (
    "converted_task_id" IS NULL
    OR EXISTS (
      SELECT 1
      FROM "public"."tasks"
      WHERE "tasks"."id" = "ideas"."converted_task_id"
        AND "tasks"."user_id" = auth.uid()
    )
  )
);--> statement-breakpoint
DROP POLICY IF EXISTS "ideas_update_own" ON "public"."ideas";--> statement-breakpoint
CREATE POLICY "ideas_update_own" ON "public"."ideas" FOR UPDATE TO authenticated USING (auth.uid() = "user_id") WITH CHECK (
  auth.uid() = "user_id"
  AND (
    "converted_task_id" IS NULL
    OR EXISTS (
      SELECT 1
      FROM "public"."tasks"
      WHERE "tasks"."id" = "ideas"."converted_task_id"
        AND "tasks"."user_id" = auth.uid()
    )
  )
);--> statement-breakpoint
DROP POLICY IF EXISTS "ideas_delete_own" ON "public"."ideas";--> statement-breakpoint
CREATE POLICY "ideas_delete_own" ON "public"."ideas" FOR DELETE TO authenticated USING (auth.uid() = "user_id");--> statement-breakpoint
ALTER TABLE "public"."insight_reports" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS "insight_reports_select_own" ON "public"."insight_reports";--> statement-breakpoint
CREATE POLICY "insight_reports_select_own" ON "public"."insight_reports" FOR SELECT TO authenticated USING (auth.uid() = "user_id");--> statement-breakpoint
DROP POLICY IF EXISTS "insight_reports_insert_own" ON "public"."insight_reports";--> statement-breakpoint
CREATE POLICY "insight_reports_insert_own" ON "public"."insight_reports" FOR INSERT TO authenticated WITH CHECK (auth.uid() = "user_id");--> statement-breakpoint
DROP POLICY IF EXISTS "insight_reports_update_own" ON "public"."insight_reports";--> statement-breakpoint
CREATE POLICY "insight_reports_update_own" ON "public"."insight_reports" FOR UPDATE TO authenticated USING (auth.uid() = "user_id") WITH CHECK (auth.uid() = "user_id");--> statement-breakpoint
DROP POLICY IF EXISTS "insight_reports_delete_own" ON "public"."insight_reports";--> statement-breakpoint
CREATE POLICY "insight_reports_delete_own" ON "public"."insight_reports" FOR DELETE TO authenticated USING (auth.uid() = "user_id");--> statement-breakpoint
ALTER TABLE "public"."personal_manuals" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS "personal_manuals_select_own" ON "public"."personal_manuals";--> statement-breakpoint
CREATE POLICY "personal_manuals_select_own" ON "public"."personal_manuals" FOR SELECT TO authenticated USING (auth.uid() = "user_id");--> statement-breakpoint
DROP POLICY IF EXISTS "personal_manuals_insert_own" ON "public"."personal_manuals";--> statement-breakpoint
CREATE POLICY "personal_manuals_insert_own" ON "public"."personal_manuals" FOR INSERT TO authenticated WITH CHECK (auth.uid() = "user_id");--> statement-breakpoint
DROP POLICY IF EXISTS "personal_manuals_update_own" ON "public"."personal_manuals";--> statement-breakpoint
CREATE POLICY "personal_manuals_update_own" ON "public"."personal_manuals" FOR UPDATE TO authenticated USING (auth.uid() = "user_id") WITH CHECK (auth.uid() = "user_id");--> statement-breakpoint
DROP POLICY IF EXISTS "personal_manuals_delete_own" ON "public"."personal_manuals";--> statement-breakpoint
CREATE POLICY "personal_manuals_delete_own" ON "public"."personal_manuals" FOR DELETE TO authenticated USING (auth.uid() = "user_id");
