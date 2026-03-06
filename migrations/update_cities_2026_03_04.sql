-- Migration: Update city names and migrate Ourém data
-- Date: 2026-03-04
-- Description: Change Parede to Parede/Carcavelos, migrate Ourém places to Mafra, and deactivate Ourém

-- Update Parede to Parede/Carcavelos
UPDATE cities SET name = 'Parede/Carcavelos' WHERE slug = 'parede';

-- Update all places that have city='Ourém' to city='Mafra'
UPDATE places SET city = 'Mafra' WHERE city = 'Ourém';

-- Set Ourém city to inactive (if it exists)
UPDATE cities SET is_active = false WHERE slug = 'ourem';

-- Display results
SELECT 'Migration completed successfully' as status;
