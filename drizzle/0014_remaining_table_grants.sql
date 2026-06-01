-- Supplement explicit grants for remaining tables (Supabase security change)
-- These tables need explicit grants to be accessible via supabase-js (Data API)
-- See 0010_supabase_js_grants.sql for anniversaries, gift_records, tool_sessions

-- Grant for tasks table
GRANT SELECT ON public.tasks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO service_role;

-- Grant for habits table
GRANT SELECT ON public.habits TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.habits TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.habits TO service_role;

-- Grant for habit_checkins table
GRANT SELECT ON public.habit_checkins TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.habit_checkins TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.habit_checkins TO service_role;

-- Grant for schedule_items table
GRANT SELECT ON public.schedule_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.schedule_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.schedule_items TO service_role;

-- Grant for life_events table
GRANT SELECT ON public.life_events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.life_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.life_events TO service_role;

-- Grant for ideas table
GRANT SELECT ON public.ideas TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ideas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ideas TO service_role;

-- Grant for insight_reports table
GRANT SELECT ON public.insight_reports TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.insight_reports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.insight_reports TO service_role;

-- Grant for personal_manuals table
GRANT SELECT ON public.personal_manuals TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.personal_manuals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.personal_manuals TO service_role;

-- Grant for schedule_completions table
GRANT SELECT ON public.schedule_completions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.schedule_completions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.schedule_completions TO service_role;
