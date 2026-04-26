-- Migration: Update places flags for supplements and grocery filtering
-- Date: 2026-04-22
-- Description: Set supplements and grocery_and_market flags on existing places

-- Set supplements flag for supplement-related stores
UPDATE places
SET supplements = true
WHERE category IN ('Health Food Store', 'Department Store', 'Online Store', 'Organic Market');

-- Set grocery_and_market flag for grocery-related stores
UPDATE places
SET grocery_and_market = true
WHERE category IN ('Farm', 'Cooperative Market');

-- Display results
SELECT 'Places flags updated successfully' as status;
SELECT
    COUNT(*) as total_places,
    SUM(CASE WHEN supplements THEN 1 ELSE 0 END) as supplements_count,
    SUM(CASE WHEN grocery_and_market THEN 1 ELSE 0 END) as grocery_count
FROM places;
