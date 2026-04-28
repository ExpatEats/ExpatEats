-- Setup Payment System Tables (Simple version - no DO blocks)
-- Run this on production to add/update all payment-related tables
-- Date: 2026-04-26
-- NOTE: Some statements may error if they already exist - that's OK, just continue

-- Create payments table
CREATE TABLE IF NOT EXISTS "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"stripe_payment_intent_id" text,
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

-- Add columns to guide_purchases (will error if they already exist - ignore those errors)
ALTER TABLE "guide_purchases" ADD COLUMN "stripe_payment_intent_id" text;
ALTER TABLE "guide_purchases" ADD COLUMN "purchase_status" text DEFAULT 'pending';

-- Add constraints (will error if they already exist - ignore those errors)
ALTER TABLE "payments" ADD CONSTRAINT "payments_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id");
ALTER TABLE "payments" ADD CONSTRAINT "payments_stripe_checkout_session_id_unique" UNIQUE("stripe_checkout_session_id");
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id");
ALTER TABLE "payments" ADD CONSTRAINT "payments_guide_id_guides_id_fk" FOREIGN KEY ("guide_id") REFERENCES "guides"("id");
ALTER TABLE "payments" ADD CONSTRAINT "payments_guide_purchase_id_guide_purchases_id_fk" FOREIGN KEY ("guide_purchase_id") REFERENCES "guide_purchases"("id");
ALTER TABLE "guide_purchases" ADD CONSTRAINT "guide_purchases_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id");
