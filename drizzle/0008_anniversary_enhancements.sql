-- Step 23.5: Anniversary enhancements
-- Add anniversary_type and reminder_mode enums
-- Add type, is_lunar, reminder_mode columns to anniversaries
-- Rename purpose to return_gift in gift_records

-- Create new enums
CREATE TYPE "anniversary_type" AS ENUM('anniversary', 'birthday');
CREATE TYPE "reminder_mode" AS ENUM('once', 'yearly');

-- Add new columns to anniversaries
ALTER TABLE "anniversaries" ADD COLUMN "type" "anniversary_type" DEFAULT 'anniversary' NOT NULL;
ALTER TABLE "anniversaries" ADD COLUMN "is_lunar" boolean DEFAULT false NOT NULL;
ALTER TABLE "anniversaries" ADD COLUMN "reminder_mode" "reminder_mode" DEFAULT 'once' NOT NULL;

-- Migrate gift_records: add return_gift, copy data from purpose, then drop purpose
ALTER TABLE "gift_records" ADD COLUMN "return_gift" text;
UPDATE "gift_records" SET "return_gift" = "purpose" WHERE "purpose" IS NOT NULL;
ALTER TABLE "gift_records" DROP COLUMN "purpose";
