-- Fix payments table - Allow NULL for stripe_payment_intent_id
-- This is needed because Stripe creates the payment intent after the checkout session
-- Date: 2026-04-27

-- Remove NOT NULL constraint from stripe_payment_intent_id
ALTER TABLE "payments" ALTER COLUMN "stripe_payment_intent_id" DROP NOT NULL;

-- Verify the change
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'payments'
AND column_name = 'stripe_payment_intent_id';
