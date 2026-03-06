-- Migration: Update places table structure to match initialPlacesData.csv
-- Date: 2026-03-05
-- Description: Add new columns for grocery/market and supplements filtering

-- Add new categorical boolean columns
ALTER TABLE places ADD COLUMN IF NOT EXISTS grocery_and_market BOOLEAN DEFAULT false;
ALTER TABLE places ADD COLUMN IF NOT EXISTS supplements BOOLEAN DEFAULT false;

-- Add new text columns
ALTER TABLE places ADD COLUMN IF NOT EXISTS city_tags TEXT;
ALTER TABLE places ADD COLUMN IF NOT EXISTS badges TEXT;

-- Add supplement-specific filter columns
ALTER TABLE places ADD COLUMN IF NOT EXISTS general_supplements BOOLEAN DEFAULT false;
ALTER TABLE places ADD COLUMN IF NOT EXISTS omega3 BOOLEAN DEFAULT false;
ALTER TABLE places ADD COLUMN IF NOT EXISTS vegan_supplements BOOLEAN DEFAULT false;
ALTER TABLE places ADD COLUMN IF NOT EXISTS online_retailer BOOLEAN DEFAULT false;
ALTER TABLE places ADD COLUMN IF NOT EXISTS vitamins BOOLEAN DEFAULT false;
ALTER TABLE places ADD COLUMN IF NOT EXISTS herbal_remedies BOOLEAN DEFAULT false;
ALTER TABLE places ADD COLUMN IF NOT EXISTS organic_supplements BOOLEAN DEFAULT false;
ALTER TABLE places ADD COLUMN IF NOT EXISTS sports_nutrition BOOLEAN DEFAULT false;
ALTER TABLE places ADD COLUMN IF NOT EXISTS practitioner_grade BOOLEAN DEFAULT false;
ALTER TABLE places ADD COLUMN IF NOT EXISTS hypoallergenic BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN places.grocery_and_market IS 'True if place should appear in grocery and market searches';
COMMENT ON COLUMN places.supplements IS 'True if place should appear in supplements searches';
COMMENT ON COLUMN places.city_tags IS 'Tags associated with the city location';
COMMENT ON COLUMN places.badges IS 'Special badges like "local favorite", "will do in a pinch", etc.';

-- Display completion message
SELECT 'Migration completed successfully - places table updated with new columns' as status;
