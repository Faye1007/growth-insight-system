CREATE TYPE "public"."converted_to_type" AS ENUM('task', 'habit');--> statement-breakpoint
ALTER TABLE "ideas" ADD COLUMN "converted_to_type" "converted_to_type";--> statement-breakpoint
ALTER TABLE "ideas" ADD COLUMN "converted_to_id" uuid;--> statement-breakpoint
ALTER TABLE "ideas" ADD COLUMN "shelved_at" timestamp with time zone;