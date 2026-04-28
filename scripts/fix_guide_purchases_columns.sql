-- Fix guide_purchases table - Add missing columns
-- Run this on production if migration 0003_productive_odin.sql hasn't been applied
-- Date: 2026-04-26

-- Add stripe_payment_intent_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'guide_purchases'
        AND column_name = 'stripe_payment_intent_id'
    ) THEN
        ALTER TABLE "guide_purchases" ADD COLUMN "stripe_payment_intent_id" text;
        ALTER TABLE "guide_purchases" ADD CONSTRAINT "guide_purchases_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id");
        RAISE NOTICE 'Added stripe_payment_intent_id column';
    ELSE
        RAISE NOTICE 'stripe_payment_intent_id column already exists';
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
        RAISE NOTICE 'Added purchase_status column';
    ELSE
        RAISE NOTICE 'purchase_status column already exists';
    END IF;
END $$;

-- Verify columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'guide_purchases'
ORDER BY ordinal_position;
