-- =====================================================
-- APPROVE ALL PENDING PLACES
-- =====================================================
-- This script approves all places with 'pending' status
-- making them visible on the Find My Food search page
-- =====================================================

BEGIN;

-- Update all pending places to approved status
UPDATE places
SET status = 'approved',
    reviewed_at = NOW()
WHERE status = 'pending';

COMMIT;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Check the results

SELECT
    status,
    COUNT(*) as count
FROM places
GROUP BY status
ORDER BY status;

-- =====================================================
