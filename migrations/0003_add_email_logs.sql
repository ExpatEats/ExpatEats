-- Migration: 0003_add_email_logs.sql
-- Date: 2025-11-15
-- Description: Add email logging and newsletter subscription tables
-- This enables tracking of sent emails and managing newsletter subscriptions

-- =============================================================================
-- CREATE EMAIL_LOGS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS email_logs (
    id SERIAL PRIMARY KEY,

    -- Email addressing
    to_email VARCHAR(255) NOT NULL,
    from_email VARCHAR(255),

    -- Email content
    subject VARCHAR(500) NOT NULL,
    email_type VARCHAR(100), -- 'password-reset', 'verification', 'welcome', 'newsletter', 'purchase', etc.

    -- Delivery tracking
    status VARCHAR(50) NOT NULL, -- 'sent', 'failed', 'bounced', 'delivered', 'opened', 'clicked'
    message_id VARCHAR(255), -- SendGrid message ID for tracking
    error_message TEXT, -- Error details if status is 'failed'

    -- User association (optional - not all emails are to registered users)
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- CREATE NEWSLETTER_SUBSCRIBERS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id SERIAL PRIMARY KEY,

    -- Subscriber information
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),

    -- Subscription status
    status VARCHAR(50) DEFAULT 'subscribed', -- 'subscribed', 'unsubscribed', 'bounced'
    subscription_source VARCHAR(100), -- 'website', 'registration', 'import', 'admin'

    -- User association (if subscriber is also a registered user)
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

    -- Subscription management
    subscribed_at TIMESTAMP DEFAULT NOW(),
    unsubscribed_at TIMESTAMP,
    unsubscribe_token VARCHAR(255) UNIQUE, -- Used for one-click unsubscribe

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Email logs indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_to_email ON email_logs(to_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_created ON email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);

-- Newsletter subscribers indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_token ON newsletter_subscribers(unsubscribe_token);
CREATE INDEX IF NOT EXISTS idx_newsletter_user_id ON newsletter_subscribers(user_id);

-- =============================================================================
-- ADD TABLE AND COLUMN COMMENTS
-- =============================================================================

-- Email logs table comments
COMMENT ON TABLE email_logs IS 'Logs of all emails sent from the application for tracking and debugging';
COMMENT ON COLUMN email_logs.to_email IS 'Recipient email address';
COMMENT ON COLUMN email_logs.email_type IS 'Type of email sent (password-reset, verification, welcome, newsletter, etc.)';
COMMENT ON COLUMN email_logs.status IS 'Delivery status (sent, failed, bounced, delivered, opened, clicked)';
COMMENT ON COLUMN email_logs.message_id IS 'SendGrid message ID for tracking delivery events';
COMMENT ON COLUMN email_logs.user_id IS 'Associated user ID if email was sent to a registered user';

-- Newsletter subscribers table comments
COMMENT ON TABLE newsletter_subscribers IS 'Newsletter subscription management and tracking';
COMMENT ON COLUMN newsletter_subscribers.status IS 'Current subscription status (subscribed, unsubscribed, bounced)';
COMMENT ON COLUMN newsletter_subscribers.subscription_source IS 'How the user subscribed (website form, registration, import, admin)';
COMMENT ON COLUMN newsletter_subscribers.unsubscribe_token IS 'Unique token for one-click unsubscribe links in emails';
COMMENT ON COLUMN newsletter_subscribers.user_id IS 'Associated user ID if subscriber is also a registered user';

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- To rollback this migration, run:
-- DROP INDEX IF EXISTS idx_email_logs_to_email;
-- DROP INDEX IF EXISTS idx_email_logs_status;
-- DROP INDEX IF EXISTS idx_email_logs_type;
-- DROP INDEX IF EXISTS idx_email_logs_created;
-- DROP INDEX IF EXISTS idx_email_logs_user_id;
-- DROP INDEX IF EXISTS idx_newsletter_email;
-- DROP INDEX IF EXISTS idx_newsletter_status;
-- DROP INDEX IF EXISTS idx_newsletter_token;
-- DROP INDEX IF EXISTS idx_newsletter_user_id;
-- DROP TABLE IF EXISTS newsletter_subscribers;
-- DROP TABLE IF EXISTS email_logs;
