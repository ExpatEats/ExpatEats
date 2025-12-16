-- Add Cities Table
-- Date: 2025-12-12
-- Description: Adds the missing cities table for location management

-- Create cities table
CREATE TABLE IF NOT EXISTS "cities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"country" text NOT NULL,
	"region" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "cities_name_unique" UNIQUE("name"),
	CONSTRAINT "cities_slug_unique" UNIQUE("slug")
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_cities_country" ON "cities" ("country");
CREATE INDEX IF NOT EXISTS "idx_cities_slug" ON "cities" ("slug");
CREATE INDEX IF NOT EXISTS "idx_cities_is_active" ON "cities" ("is_active");

-- Add comments for documentation
COMMENT ON TABLE "cities" IS 'Available cities/locations for the ExpatEats platform';
COMMENT ON COLUMN "cities"."slug" IS 'URL-friendly version of the city name';
COMMENT ON COLUMN "cities"."is_active" IS 'Whether this city is currently active and visible on the platform';
