CREATE TABLE "payments" (
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
	"refunded_at" timestamp,
	CONSTRAINT "payments_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id"),
	CONSTRAINT "payments_stripe_checkout_session_id_unique" UNIQUE("stripe_checkout_session_id")
);
--> statement-breakpoint
ALTER TABLE "guide_purchases" ADD COLUMN "stripe_payment_intent_id" text;--> statement-breakpoint
ALTER TABLE "guide_purchases" ADD COLUMN "purchase_status" text DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "grocery_and_market" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "supplements" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "city_tags" text;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "badges" text;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "general_supplements" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "omega3" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "vegan_supplements" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "online_retailer" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "vitamins" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "herbal_remedies" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "organic_supplements" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "sports_nutrition" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "practitioner_grade" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN "hypoallergenic" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_guide_id_guides_id_fk" FOREIGN KEY ("guide_id") REFERENCES "public"."guides"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_guide_purchase_id_guide_purchases_id_fk" FOREIGN KEY ("guide_purchase_id") REFERENCES "public"."guide_purchases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guide_purchases" ADD CONSTRAINT "guide_purchases_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id");