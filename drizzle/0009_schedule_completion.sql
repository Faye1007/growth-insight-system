-- Step 24.1: Schedule completion checkbox
ALTER TABLE "schedule_items" ADD COLUMN "is_completed" boolean DEFAULT false NOT NULL;
