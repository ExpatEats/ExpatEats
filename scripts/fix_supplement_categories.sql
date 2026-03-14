-- =====================================================
-- FIX SUPPLEMENT STORE CATEGORIES
-- =====================================================
-- Updates category for newly added supplement stores
-- so they appear in supplement search results
-- =====================================================

BEGIN;

-- Show current state
SELECT
    'BEFORE UPDATE' as status,
    id,
    name,
    category,
    supplements,
    status
FROM places
WHERE id BETWEEN 86 AND 97
ORDER BY id;

-- Update physical supplement stores to "Health Food Store"
UPDATE places
SET category = 'Health Food Store'
WHERE id IN (86, 87, 88, 89, 90, 91)  -- Physical locations
AND supplements = true;

-- Update online supplement stores to "Online Store"
UPDATE places
SET category = 'Online Store'
WHERE id IN (92, 93, 94, 95, 96, 97)  -- Online stores
AND supplements = true;

-- Show updated state
SELECT
    'AFTER UPDATE' as status,
    id,
    name,
    category,
    supplements,
    status
FROM places
WHERE id BETWEEN 86 AND 97
ORDER BY id;

COMMIT;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check all supplement stores now have correct categories
SELECT
    'SUPPLEMENT STORES' as report,
    category,
    COUNT(*) as count
FROM places
WHERE supplements = true
GROUP BY category
ORDER BY category;

-- =====================================================
-- NOTES
-- =====================================================
-- Physical supplement stores (IDs 86-91):
--   Time Out Market, Prime Body NutriShop, Healthcare Store Lisbon Airport,
--   Natural Crave, Terra Pura, Quintas dos 7 Nomes
--   → Category: "Health Food Store"
--
-- Online supplement stores (IDs 92-97):
--   iHerb, Prozis, Welldium, Nordic Kings, Grealife.Eu, Pure Encapsulations
--   → Category: "Online Store"
-- =====================================================
