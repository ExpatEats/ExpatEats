-- =====================================================
-- UPDATE PLACES TABLE - STANDARDIZE CITY NAMES
-- =====================================================
-- This script updates city names in the places table to match
-- the standardized city names in the cities table
-- =====================================================

BEGIN;

-- =====================================================
-- BEFORE: Check current state
-- =====================================================
SELECT
    'BEFORE UPDATE' as status,
    city,
    COUNT(*) as place_count
FROM places
WHERE
    city ILIKE '%Mafra%'
    OR city ILIKE '%Ourem%'
    OR city ILIKE '%Parede%'
    OR city ILIKE '%Carcavelos%'
GROUP BY city
ORDER BY city;

-- =====================================================
-- UPDATE 1: Mafra/Ourem consolidation
-- =====================================================
-- Update any city containing "Mafra" or "Ourem" to "Mafra/Ourem"
UPDATE places
SET city = 'Mafra/Ourem'
WHERE
    city ILIKE '%Mafra%'
    OR city ILIKE '%Ourem%'
    OR city ILIKE '%Ericeira%';  -- Also catch Ericeira if it's in this region

-- Show what was updated
SELECT
    'UPDATED TO Mafra/Ourem' as status,
    COUNT(*) as updated_count
FROM places
WHERE city = 'Mafra/Ourem';

-- =====================================================
-- UPDATE 2: Parede/Carcavelos consolidation
-- =====================================================
-- Update any city containing "Parede" or "Carcavelos" to "Parede/Carcavelos"
UPDATE places
SET city = 'Parede/Carcavelos'
WHERE
    city ILIKE '%Parede%'
    OR city ILIKE '%Carcavelos%'
    OR city = 'Paço de Arcos';  -- Also include Paço de Arcos (part of Oeiras/Parede area)

-- Show what was updated
SELECT
    'UPDATED TO Parede/Carcavelos' as status,
    COUNT(*) as updated_count
FROM places
WHERE city = 'Parede/Carcavelos';

-- =====================================================
-- VERIFICATION: Show all distinct city values
-- =====================================================
SELECT
    'AFTER UPDATE - All Cities' as status,
    city,
    COUNT(*) as place_count
FROM places
GROUP BY city
ORDER BY city;

-- =====================================================
-- MISMATCH CHECK: Find places with cities not in cities table
-- =====================================================
SELECT
    'MISMATCHED CITIES' as status,
    places.city,
    COUNT(*) as place_count
FROM places
WHERE places.city NOT IN (
    SELECT name FROM cities
)
GROUP BY places.city
ORDER BY place_count DESC;

COMMIT;

-- =====================================================
-- FINAL SUMMARY
-- =====================================================
SELECT
    'SUMMARY' as report,
    (SELECT COUNT(*) FROM places WHERE city = 'Mafra/Ourem') as mafra_ourem_count,
    (SELECT COUNT(*) FROM places WHERE city = 'Parede/Carcavelos') as parede_carcavelos_count,
    (SELECT COUNT(*) FROM places WHERE city NOT IN (SELECT name FROM cities)) as mismatched_count,
    (SELECT COUNT(*) FROM places) as total_places;

-- =====================================================
-- NOTES
-- =====================================================
-- This script will:
-- 1. Update any place with city containing "Mafra" or "Ourem" → "Mafra/Ourem"
-- 2. Update any place with city containing "Parede" or "Carcavelos" → "Parede/Carcavelos"
-- 3. Show before/after comparison
-- 4. Identify any remaining mismatches
--
-- Examples of what gets updated:
-- - "Mafra" → "Mafra/Ourem"
-- - "Ourem" → "Mafra/Ourem"
-- - "Ericeira" → "Mafra/Ourem" (if in that region)
-- - "Parede" → "Parede/Carcavelos"
-- - "Carcavelos" → "Parede/Carcavelos"
-- - "Paço de Arcos" → "Parede/Carcavelos" (optional - comment out if not wanted)
-- =====================================================
