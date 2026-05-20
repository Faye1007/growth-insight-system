-- Add explicit grants for tables created after Oct 30, 2026 (Supabase security change)
-- These tables need explicit grants to be accessible via supabase-js (Data API)

-- Grant for anniversaries table
GRANT SELECT ON public.anniversaries TO anon;
GRANT SELECT ON public.anniversaries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.anniversaries TO service_role;

-- Grant for gift_records table
GRANT SELECT ON public.gift_records TO anon;
GRANT SELECT ON public.gift_records TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gift_records TO service_role;

-- Grant for tool_sessions table
GRANT SELECT ON public.tool_sessions TO anon;
GRANT SELECT ON public.tool_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tool_sessions TO service_role;