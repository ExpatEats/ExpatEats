-- Migration: 0007_add_deleted_column_to_places.sql
-- Date: 2025-06-02
-- Description: Add soft-delete column to places table for marking closed locations
-- =============================================================================

-- Add deleted column with default value false
ALTER TABLE places ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT false NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN places.deleted IS 'Soft-delete flag - true when location is marked as closed/deleted. Deleted locations are hidden from public searches but visible to admins.';

-- Create index for performance on queries filtering by deleted status
CREATE INDEX IF NOT EXISTS idx_places_deleted ON places(deleted);

-- Create composite index for common query pattern (status + deleted)
CREATE INDEX IF NOT EXISTS idx_places_status_deleted ON places(status, deleted);

-- =============================================================================
-- ROLLBACK INSTRUCTIONS (if needed):
-- ALTER TABLE places DROP COLUMN IF EXISTS deleted;
-- DROP INDEX IF EXISTS idx_places_deleted;
-- DROP INDEX IF EXISTS idx_places_status_deleted;
-- =============================================================================
