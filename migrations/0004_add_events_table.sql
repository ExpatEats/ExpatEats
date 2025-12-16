-- Add Events Table
-- Date: 2025-12-12
-- Description: Adds the missing events table for community events feature

-- Create events table
CREATE TABLE IF NOT EXISTS "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"date" timestamp NOT NULL,
	"time" text NOT NULL,
	"location" text NOT NULL,
	"city" text NOT NULL,
	"country" text DEFAULT 'Portugal',
	"organizer_name" text,
	"organizer_role" text,
	"organizer_email" text,
	"category" text,
	"image_url" text,
	"website" text,
	"max_attendees" integer,
	"current_attendees" integer DEFAULT 0,
	"submitted_by" text NOT NULL,
	"submitter_email" text NOT NULL,
	"user_id" integer,
	"status" text DEFAULT 'pending',
	"admin_notes" text,
	"reviewed_at" timestamp,
	"reviewed_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Add foreign key constraints
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                WHERE constraint_name = 'events_user_id_users_id_fk') THEN
    ALTER TABLE "events" ADD CONSTRAINT "events_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
 END IF;
END $$;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                WHERE constraint_name = 'events_reviewed_by_users_id_fk') THEN
    ALTER TABLE "events" ADD CONSTRAINT "events_reviewed_by_users_id_fk"
    FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
 END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_events_city" ON "events" ("city");
CREATE INDEX IF NOT EXISTS "idx_events_date" ON "events" ("date");
CREATE INDEX IF NOT EXISTS "idx_events_status" ON "events" ("status");
CREATE INDEX IF NOT EXISTS "idx_events_category" ON "events" ("category");
CREATE INDEX IF NOT EXISTS "idx_events_user_id" ON "events" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_events_created_at" ON "events" ("created_at" DESC);

-- Add check constraints
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints
                WHERE constraint_name = 'events_status_check') THEN
    ALTER TABLE "events" ADD CONSTRAINT "events_status_check"
    CHECK ("status" IN ('pending', 'approved', 'rejected'));
 END IF;
END $$;

-- Add comments for documentation
COMMENT ON TABLE "events" IS 'Community events and meetups for ExpatEats users';
COMMENT ON COLUMN "events"."status" IS 'Event approval status: pending (waiting admin review), approved (visible to public), rejected (not shown)';
COMMENT ON COLUMN "events"."category" IS 'Event type: Market Tour, Workshop, Social, Food Tasting, Cooking Class, Networking, Other';
COMMENT ON COLUMN "events"."max_attendees" IS 'Maximum number of attendees allowed (null = unlimited)';
COMMENT ON COLUMN "events"."current_attendees" IS 'Current number of registered attendees';
