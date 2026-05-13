CREATE TABLE "gift_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"anniversary_id" uuid,
	"gift_name" text NOT NULL,
	"recipient_name" text NOT NULL,
	"gift_date" date NOT NULL,
	"purpose" text NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "gift_records" ADD CONSTRAINT "gift_records_anniversary_id_anniversaries_id_fk" FOREIGN KEY ("anniversary_id") REFERENCES "public"."anniversaries"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "gift_records_user_date_idx" ON "gift_records" USING btree ("user_id","gift_date");--> statement-breakpoint
CREATE INDEX "gift_records_user_recipient_idx" ON "gift_records" USING btree ("user_id","recipient_name");--> statement-breakpoint
CREATE INDEX "gift_records_user_anniversary_idx" ON "gift_records" USING btree ("user_id","anniversary_id");--> statement-breakpoint
ALTER TABLE "public"."gift_records" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY IF EXISTS "gift_records_select_own" ON "public"."gift_records";--> statement-breakpoint
CREATE POLICY "gift_records_select_own" ON "public"."gift_records" FOR SELECT TO authenticated USING (auth.uid() = "user_id");--> statement-breakpoint
DROP POLICY IF EXISTS "gift_records_insert_own" ON "public"."gift_records";--> statement-breakpoint
CREATE POLICY "gift_records_insert_own" ON "public"."gift_records" FOR INSERT TO authenticated WITH CHECK (auth.uid() = "user_id");--> statement-breakpoint
DROP POLICY IF EXISTS "gift_records_update_own" ON "public"."gift_records";--> statement-breakpoint
CREATE POLICY "gift_records_update_own" ON "public"."gift_records" FOR UPDATE TO authenticated USING (auth.uid() = "user_id") WITH CHECK (auth.uid() = "user_id");--> statement-breakpoint
DROP POLICY IF EXISTS "gift_records_delete_own" ON "public"."gift_records";--> statement-breakpoint
CREATE POLICY "gift_records_delete_own" ON "public"."gift_records" FOR DELETE TO authenticated USING (auth.uid() = "user_id");
