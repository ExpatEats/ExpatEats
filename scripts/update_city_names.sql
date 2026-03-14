-- =====================================================
-- UPDATE CITY NAMES
-- =====================================================
-- This script updates city names to reflect combined areas
-- =====================================================

BEGIN;

-- Update Parede to Parede/Carcavelos
UPDATE cities
SET name = 'Parede/Carcavelos'
WHERE slug = 'parede';

-- Update Mafra to Mafra/Ourem
UPDATE cities
SET name = 'Mafra/Ourem'
WHERE slug = 'mafra';

COMMIT;

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT
    name,
    slug,
    country,
    region,
    (SELECT COUNT(*) FROM places WHERE city = cities.name) as place_count
FROM cities
ORDER BY name;

-- =====================================================
-- NOTES
-- =====================================================
-- After running this script:
-- 1. City names in the UI will show combined areas (Parede/Carcavelos, Mafra/Ourem)
-- 2. Places table data needs to be checked - some places may have old city names
-- 3. Run the following to check for mismatched places:
--
-- SELECT DISTINCT city FROM places
-- WHERE city NOT IN (SELECT name FROM cities);
--
-- =====================================================
