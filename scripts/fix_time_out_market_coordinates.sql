-- =====================================================
-- FIX TIME OUT MARKET COORDINATES
-- =====================================================
-- The longitude is missing a decimal point
-- Should be: -9.14591 (not -914591)
-- =====================================================

BEGIN;

-- Show current state
SELECT
    'BEFORE FIX' as status,
    id,
    name,
    latitude,
    longitude
FROM places
WHERE name = 'Time Out Market'
OR id = 86;

-- Fix the longitude coordinate
UPDATE places
SET longitude = '-9.14591'
WHERE (name = 'Time Out Market' OR id = 86)
AND longitude = '-914591';

-- Show updated state
SELECT
    'AFTER FIX' as status,
    id,
    name,
    latitude,
    longitude,
    address
FROM places
WHERE name = 'Time Out Market'
OR id = 86;

COMMIT;

-- =====================================================
-- NOTES
-- =====================================================
-- Time Out Market location:
--   Address: Av. 24 de Julho, 1200-479 Lisboa, Portugal
--   Correct coordinates: 38.70856, -9.14591
-- =====================================================
