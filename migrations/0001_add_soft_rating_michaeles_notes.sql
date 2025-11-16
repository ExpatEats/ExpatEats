-- Add soft_rating and michaeles_notes columns to places table
-- Date: 2025-11-13
-- Description: Add Michaele's custom fields for rating and notes on locations

-- Add soft_rating column
ALTER TABLE places ADD COLUMN IF NOT EXISTS soft_rating VARCHAR(50);

-- Add michaeles_notes column (using TEXT for unlimited length instead of VARCHAR(MAX))
ALTER TABLE places ADD COLUMN IF NOT EXISTS michaeles_notes TEXT;

-- Add comments for documentation
COMMENT ON COLUMN places.soft_rating IS 'Michaele''s quality rating: Gold Standard, Great Choice, This Will Do in a Pinch, or empty';
COMMENT ON COLUMN places.michaeles_notes IS 'Michaele''s personal notes and observations about the location';
