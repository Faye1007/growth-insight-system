CREATE TYPE "public"."schedule_recurrence" AS ENUM('none', 'daily', 'weekly', 'monthly');--> statement-breakpoint
ALTER TABLE "schedule_items" ADD COLUMN "start_date" date;--> statement-breakpoint
ALTER TABLE "schedule_items" ADD COLUMN "end_date" date;--> statement-breakpoint
ALTER TABLE "schedule_items" ADD COLUMN "recurrence" "schedule_recurrence" DEFAULT 'none' NOT NULL;--> statement-breakpoint
UPDATE "schedule_items" SET "start_date" = "schedule_date" WHERE "start_date" IS NULL;--> statement-breakpoint
CREATE INDEX "schedule_items_user_start_idx" ON "schedule_items" USING btree ("user_id","start_date");
