-- Drop the deprecated is_completed column from schedule_items.
-- Completion status is now tracked via schedule_completions table (migration 0011).

ALTER TABLE "schedule_items" DROP COLUMN IF EXISTS "is_completed";
