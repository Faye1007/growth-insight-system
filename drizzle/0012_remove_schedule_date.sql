-- Migration 0012: Remove schedule_date from schedule_items
-- schedule_date is redundant with start_date + recurrence rules
-- All queries now rely on start_date only

-- Drop the index on schedule_date first
DROP INDEX IF EXISTS "schedule_items_user_date_idx";

-- Drop the column
ALTER TABLE "schedule_items" DROP COLUMN IF EXISTS "schedule_date";
