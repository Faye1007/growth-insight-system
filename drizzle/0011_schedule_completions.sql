-- Migration 0011: schedule_completions table
-- Create a new table to track schedule completion by date, replacing the boolean is_completed on schedule_items

CREATE TABLE IF NOT EXISTS "schedule_completions" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES "schedule_items"("id") ON DELETE CASCADE,
  user_id UUID NOT NULL,
  completion_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT schedule_completions_schedule_date_unique UNIQUE (schedule_id, completion_date)
);

CREATE INDEX IF NOT EXISTS "idx_schedule_completions_user_date" ON "schedule_completions"("user_id", "completion_date");
CREATE INDEX IF NOT EXISTS "idx_schedule_completions_schedule_date" ON "schedule_completions"("schedule_id", "completion_date");

-- RLS for schedule_completions
ALTER TABLE "schedule_completions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read their own schedule completions"
  ON "schedule_completions" FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "users can insert their own schedule completions"
  ON "schedule_completions" FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can update their own schedule completions"
  ON "schedule_completions" FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "users can delete their own schedule completions"
  ON "schedule_completions" FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Supabase JS grants
GRANT SELECT ON public.schedule_completions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.schedule_completions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.schedule_completions TO service_role;
