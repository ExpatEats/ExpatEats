-- Complete ExpatEats Database Schema
-- Date: 2025-09-21
-- Description: Complete database schema including all tables for ExpatEats application

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"city" text,
	"country" text,
	"bio" text,
	"role" text DEFAULT 'user',
	"email_verified" boolean DEFAULT false,
	"email_verification_token" text,
	"password_reset_token" text,
	"password_reset_expires" timestamp,
	"failed_login_attempts" integer DEFAULT 0,
	"account_locked_until" timestamp,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

-- Create places table
CREATE TABLE IF NOT EXISTS "places" (
	"id" serial PRIMARY KEY NOT NULL,
	"unique_id" text,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"region" text,
	"country" text NOT NULL,
	"category" text NOT NULL,
	"tags" text[],
	"latitude" text,
	"longitude" text,
	"phone" text,
	"email" text,
	"instagram" text,
	"website" text,
	"gluten_free" boolean DEFAULT false,
	"dairy_free" boolean DEFAULT false,
	"nut_free" boolean DEFAULT false,
	"vegan" boolean DEFAULT false,
	"organic" boolean DEFAULT false,
	"local_farms" boolean DEFAULT false,
	"fresh_vegetables" boolean DEFAULT false,
	"farm_raised_meat" boolean DEFAULT false,
	"no_processed" boolean DEFAULT false,
	"kid_friendly" boolean DEFAULT false,
	"bulk_buying" boolean DEFAULT false,
	"zero_waste" boolean DEFAULT false,
	"user_id" integer,
	"image_url" text,
	"average_rating" integer,
	"status" text DEFAULT 'pending',
	"submitted_by" text,
	"admin_notes" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"place_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now()
);

-- Create nutrition table
CREATE TABLE IF NOT EXISTS "nutrition" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"goals" text NOT NULL,
	"user_id" integer,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);

-- Create saved_stores table
CREATE TABLE IF NOT EXISTS "saved_stores" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"place_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);

-- Create posts table (Community feature)
CREATE TABLE IF NOT EXISTS "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"user_id" integer NOT NULL,
	"section" text NOT NULL,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create comments table (Community feature)
CREATE TABLE IF NOT EXISTS "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"body" text NOT NULL,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create post_likes table (Community feature)
CREATE TABLE IF NOT EXISTS "post_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);

-- Add foreign key constraints
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                WHERE constraint_name = 'places_user_id_users_id_fk') THEN
    ALTER TABLE "places" ADD CONSTRAINT "places_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
 END IF;
END $$;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                WHERE constraint_name = 'reviews_place_id_places_id_fk') THEN
    ALTER TABLE "reviews" ADD CONSTRAINT "reviews_place_id_places_id_fk"
    FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
 END IF;
END $$;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                WHERE constraint_name = 'reviews_user_id_users_id_fk') THEN
    ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
 END IF;
END $$;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                WHERE constraint_name = 'nutrition_user_id_users_id_fk') THEN
    ALTER TABLE "nutrition" ADD CONSTRAINT "nutrition_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
 END IF;
END $$;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                WHERE constraint_name = 'saved_stores_user_id_users_id_fk') THEN
    ALTER TABLE "saved_stores" ADD CONSTRAINT "saved_stores_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
 END IF;
END $$;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                WHERE constraint_name = 'saved_stores_place_id_places_id_fk') THEN
    ALTER TABLE "saved_stores" ADD CONSTRAINT "saved_stores_place_id_places_id_fk"
    FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
 END IF;
END $$;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                WHERE constraint_name = 'posts_user_id_users_id_fk') THEN
    ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
 END IF;
END $$;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                WHERE constraint_name = 'comments_post_id_posts_id_fk') THEN
    ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fk"
    FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
 END IF;
END $$;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                WHERE constraint_name = 'comments_user_id_users_id_fk') THEN
    ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
 END IF;
END $$;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                WHERE constraint_name = 'post_likes_post_id_posts_id_fk') THEN
    ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_post_id_posts_id_fk"
    FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
 END IF;
END $$;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                WHERE constraint_name = 'post_likes_user_id_users_id_fk') THEN
    ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
 END IF;
END $$;

-- Add unique constraints
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                WHERE constraint_name = 'saved_stores_user_id_place_id_unique') THEN
    ALTER TABLE "saved_stores" ADD CONSTRAINT "saved_stores_user_id_place_id_unique"
    UNIQUE("user_id","place_id");
 END IF;
END $$;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                WHERE constraint_name = 'post_likes_user_id_post_id_unique') THEN
    ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_user_id_post_id_unique"
    UNIQUE("user_id","post_id");
 END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_places_user_id" ON "places" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_places_category" ON "places" ("category");
CREATE INDEX IF NOT EXISTS "idx_places_city" ON "places" ("city");
CREATE INDEX IF NOT EXISTS "idx_places_status" ON "places" ("status");

CREATE INDEX IF NOT EXISTS "idx_reviews_place_id" ON "reviews" ("place_id");
CREATE INDEX IF NOT EXISTS "idx_reviews_user_id" ON "reviews" ("user_id");

CREATE INDEX IF NOT EXISTS "idx_saved_stores_user_id" ON "saved_stores" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_saved_stores_place_id" ON "saved_stores" ("place_id");

CREATE INDEX IF NOT EXISTS "idx_posts_user_id" ON "posts" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_posts_section" ON "posts" ("section");
CREATE INDEX IF NOT EXISTS "idx_posts_created_at" ON "posts" ("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_posts_status" ON "posts" ("status");

CREATE INDEX IF NOT EXISTS "idx_comments_post_id" ON "comments" ("post_id");
CREATE INDEX IF NOT EXISTS "idx_comments_user_id" ON "comments" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_comments_created_at" ON "comments" ("created_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_post_likes_post_id" ON "post_likes" ("post_id");
CREATE INDEX IF NOT EXISTS "idx_post_likes_user_id" ON "post_likes" ("user_id");

-- Add check constraints for valid values
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints
                WHERE constraint_name = 'posts_section_check') THEN
    ALTER TABLE "posts" ADD CONSTRAINT "posts_section_check"
    CHECK ("section" IN ('general', 'where-to-find', 'product-swaps'));
 END IF;
END $$;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints
                WHERE constraint_name = 'posts_status_check') THEN
    ALTER TABLE "posts" ADD CONSTRAINT "posts_status_check"
    CHECK ("status" IN ('active', 'hidden', 'deleted'));
 END IF;
END $$;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints
                WHERE constraint_name = 'comments_status_check') THEN
    ALTER TABLE "comments" ADD CONSTRAINT "comments_status_check"
    CHECK ("status" IN ('active', 'hidden', 'deleted'));
 END IF;
END $$;