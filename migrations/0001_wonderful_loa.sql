ALTER TABLE "places" ADD COLUMN "unique_id" text;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "region" text;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "instagram" text;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "gluten_free" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "dairy_free" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "nut_free" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "vegan" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "organic" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "local_farms" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "fresh_vegetables" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "farm_raised_meat" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "no_processed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "kid_friendly" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "bulk_buying" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "zero_waste" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "status" text DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "submitted_by" text;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "admin_notes" text;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "reviewed_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" text DEFAULT 'user';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verification_token" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_reset_token" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_reset_expires" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "failed_login_attempts" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "account_locked_until" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");