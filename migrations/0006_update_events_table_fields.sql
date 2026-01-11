-- Update Events Table with New Fields
-- Date: 2026-01-11
-- Description: Adds new fields to events table for enhanced event submission form

-- Add new columns to events table
ALTER TABLE "events"
ADD COLUMN IF NOT EXISTS "venue_name" text,
ADD COLUMN IF NOT EXISTS "event_cost" text,
ADD COLUMN IF NOT EXISTS "event_language" text,
ADD COLUMN IF NOT EXISTS "language_other" text,
ADD COLUMN IF NOT EXISTS "featured_interest" boolean DEFAULT false;

-- Add check constraint for event_cost
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints
                WHERE constraint_name = 'events_event_cost_check') THEN
    ALTER TABLE "events" ADD CONSTRAINT "events_event_cost_check"
    CHECK ("event_cost" IN ('Free', 'Paid', 'Donation-based') OR "event_cost" IS NULL);
 END IF;
END $$;

-- Add check constraint for event_language
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints
                WHERE constraint_name = 'events_event_language_check') THEN
    ALTER TABLE "events" ADD CONSTRAINT "events_event_language_check"
    CHECK ("event_language" IN ('English', 'Portuguese', 'Bilingual', 'Other') OR "event_language" IS NULL);
 END IF;
END $$;

-- Update existing events with new categories BEFORE applying constraint
-- Note: This maps old categories to new ones.
UPDATE "events"
SET "category" = CASE
    WHEN "category" = 'Market Tour' THEN 'Food & Nutrition'
    WHEN "category" = 'Workshop' THEN 'Workshops & Talks'
    WHEN "category" = 'Social' THEN 'Community & Social'
    WHEN "category" = 'Food Tasting' THEN 'Food & Nutrition'
    WHEN "category" = 'Cooking Class' THEN 'Cooking & Culinary'
    WHEN "category" = 'Networking' THEN 'Community & Social'
    WHEN "category" = 'Other' THEN 'Community & Social'
    ELSE "category"
END
WHERE "category" IS NOT NULL;

-- Update category check constraint to include new categories
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM information_schema.check_constraints
            WHERE constraint_name = 'events_category_check') THEN
    ALTER TABLE "events" DROP CONSTRAINT "events_category_check";
 END IF;
END $$;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints
                WHERE constraint_name = 'events_category_check') THEN
    ALTER TABLE "events" ADD CONSTRAINT "events_category_check"
    CHECK ("category" IN (
        'Food & Nutrition',
        'Cooking & Culinary',
        'Wellness & Self-Care',
        'Movement & Fitness',
        'Outdoor & Nature',
        'Sustainable or Low-Tox Living',
        'Community & Social',
        'Workshops & Talks'
    ) OR "category" IS NULL);
 END IF;
END $$;

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS "idx_events_event_cost" ON "events" ("event_cost");
CREATE INDEX IF NOT EXISTS "idx_events_event_language" ON "events" ("event_language");
CREATE INDEX IF NOT EXISTS "idx_events_featured_interest" ON "events" ("featured_interest");

-- Add comments for documentation
COMMENT ON COLUMN "events"."venue_name" IS 'Name of the venue where the event takes place';
COMMENT ON COLUMN "events"."event_cost" IS 'Event cost type: Free, Paid, or Donation-based';
COMMENT ON COLUMN "events"."event_language" IS 'Primary language(s) of the event: English, Portuguese, Bilingual, or Other';
COMMENT ON COLUMN "events"."language_other" IS 'Specify language when event_language is Other';
COMMENT ON COLUMN "events"."featured_interest" IS 'Whether the organizer is interested in featured/promoted listing';
COMMENT ON COLUMN "events"."category" IS 'Updated event categories: Food & Nutrition, Cooking & Culinary, Wellness & Self-Care, Movement & Fitness, Outdoor & Nature, Sustainable or Low-Tox Living, Community & Social, Workshops & Talks';
