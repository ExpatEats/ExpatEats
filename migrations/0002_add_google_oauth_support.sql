-- Migration: 0002_add_google_oauth_support.sql
-- Date: 2025-11-15
-- Description: Add Google OAuth 2.0 authentication support to users table
-- This enables users to sign in with their Google account

-- =============================================================================
-- ADD OAUTH COLUMNS TO USERS TABLE
-- =============================================================================

-- Add Google OAuth unique identifier
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;

-- Add authentication provider field (local, google, or hybrid)
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'local';

-- Add profile picture URL
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Add Google email (may differ from primary email)
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_email VARCHAR(255);

-- =============================================================================
-- MAKE USERNAME AND PASSWORD NULLABLE FOR OAUTH-ONLY USERS
-- =============================================================================

-- Allow OAuth users to not have traditional username/password
ALTER TABLE users ALTER COLUMN username DROP NOT NULL;
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- =============================================================================
-- ADD CONSTRAINT TO ENSURE AT LEAST ONE AUTHENTICATION METHOD
-- =============================================================================

-- User must have EITHER username/password OR google_id
-- This prevents accounts with no way to authenticate
ALTER TABLE users ADD CONSTRAINT auth_method_check
CHECK (
  (username IS NOT NULL AND password IS NOT NULL) OR
  (google_id IS NOT NULL)
);

-- =============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Index on google_id for fast OAuth lookups
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Index on auth_provider for filtering users by auth type
CREATE INDEX IF NOT EXISTS idx_users_auth_provider ON users(auth_provider);

-- =============================================================================
-- ADD COLUMN COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON COLUMN users.google_id IS 'Google OAuth unique identifier - used for Google sign-in';
COMMENT ON COLUMN users.auth_provider IS 'Authentication method: local (username/password), google (Google OAuth only), or hybrid (both methods linked)';
COMMENT ON COLUMN users.profile_picture IS 'URL to user profile picture from Google or uploaded';
COMMENT ON COLUMN users.google_email IS 'Email address from Google OAuth (may differ from primary email)';

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- To rollback this migration, run:
-- ALTER TABLE users DROP CONSTRAINT IF EXISTS auth_method_check;
-- ALTER TABLE users ALTER COLUMN username SET NOT NULL;
-- ALTER TABLE users ALTER COLUMN password SET NOT NULL;
-- DROP INDEX IF EXISTS idx_users_google_id;
-- DROP INDEX IF EXISTS idx_users_auth_provider;
-- ALTER TABLE users DROP COLUMN IF EXISTS google_id;
-- ALTER TABLE users DROP COLUMN IF EXISTS auth_provider;
-- ALTER TABLE users DROP COLUMN IF EXISTS profile_picture;
-- ALTER TABLE users DROP COLUMN IF EXISTS google_email;
