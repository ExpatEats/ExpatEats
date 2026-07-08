-- Add world_cuisine column to places table
ALTER TABLE places ADD COLUMN IF NOT EXISTS world_cuisine BOOLEAN DEFAULT FALSE;

-- Add comment explaining the column
COMMENT ON COLUMN places.world_cuisine IS 'Indicates if the location offers world cuisine options';
