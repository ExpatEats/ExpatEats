-- Setup Payment System Tables
-- Run this on production to add/update all payment-related tables
-- Date: 2026-04-26
-- This is a safe script that checks for existing columns/tables before creating

-- ========================================
-- 1. Create payments table if it doesn't exist
-- ========================================
CREATE TABLE IF NOT EXISTS "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"stripe_payment_intent_id" text NOT NULL,
	"stripe_checkout_session_id" text,
	"stripe_customer_id" text,
	"user_id" integer NOT NULL,
	"guide_id" integer NOT NULL,
	"guide_purchase_id" integer,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'eur' NOT NULL,
	"status" text NOT NULL,
	"payment_method" text,
	"receipt_email" text,
	"error_message" text,
	"refund_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"succeeded_at" timestamp,
	"refunded_at" timestamp
);

-- Add unique constraints if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'payments_stripe_payment_intent_id_unique'
    ) THEN
        ALTER TABLE "payments" ADD CONSTRAINT "payments_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id");
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'payments_stripe_checkout_session_id_unique'
    ) THEN
        ALTER TABLE "payments" ADD CONSTRAINT "payments_stripe_checkout_session_id_unique" UNIQUE("stripe_checkout_session_id");
    END IF;
END $$;

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'payments_user_id_users_id_fk'
    ) THEN
        ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'payments_guide_id_guides_id_fk'
    ) THEN
        ALTER TABLE "payments" ADD CONSTRAINT "payments_guide_id_guides_id_fk" FOREIGN KEY ("guide_id") REFERENCES "public"."guides"("id") ON DELETE no action ON UPDATE no action;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'payments_guide_purchase_id_guide_purchases_id_fk'
    ) THEN
        ALTER TABLE "payments" ADD CONSTRAINT "payments_guide_purchase_id_guide_purchases_id_fk" FOREIGN KEY ("guide_purchase_id") REFERENCES "public"."guide_purchases"("id") ON DELETE no action ON UPDATE no action;
    END IF;
END $$;

-- ========================================
-- 2. Update guide_purchases table
-- ========================================

-- Add stripe_payment_intent_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'guide_purchases'
        AND column_name = 'stripe_payment_intent_id'
    ) THEN
        ALTER TABLE "guide_purchases" ADD COLUMN "stripe_payment_intent_id" text;
        RAISE NOTICE 'Added stripe_payment_intent_id column to guide_purchases';
    ELSE
        RAISE NOTICE 'stripe_payment_intent_id column already exists in guide_purchases';
    END IF;
END $$;

-- Add purchase_status column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'guide_purchases'
        AND column_name = 'purchase_status'
    ) THEN
        ALTER TABLE "guide_purchases" ADD COLUMN "purchase_status" text DEFAULT 'pending';
        RAISE NOTICE 'Added purchase_status column to guide_purchases';
    ELSE
        RAISE NOTICE 'purchase_status column already exists in guide_purchases';
    END IF;
END $$;

-- Add unique constraint for stripe_payment_intent_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'guide_purchases_stripe_payment_intent_id_unique'
    ) THEN
        ALTER TABLE "guide_purchases" ADD CONSTRAINT "guide_purchases_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id");
        RAISE NOTICE 'Added unique constraint for stripe_payment_intent_id';
    ELSE
        RAISE NOTICE 'Unique constraint already exists for stripe_payment_intent_id';
    END IF;
END $$;

-- ========================================
-- 3. Verify tables and columns
-- ========================================

-- Show payments table structure
\echo '\n=== PAYMENTS TABLE STRUCTURE ==='
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'payments'
ORDER BY ordinal_position;

-- Show guide_purchases table structure
\echo '\n=== GUIDE_PURCHASES TABLE STRUCTURE ==='
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'guide_purchases'
ORDER BY ordinal_position;

\echo '\n=== SETUP COMPLETE ==='
