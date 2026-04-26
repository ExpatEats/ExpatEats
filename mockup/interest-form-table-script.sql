-- Add Interest Submissions Table
-- Date: 2026-04-26
-- Description: Adds the interest_submissions table to store user interest form submissions

-- Create interest_submissions table
CREATE TABLE IF NOT EXISTS "interest_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"interest" text NOT NULL,
	"comments" text,
	"status" text DEFAULT 'new',
	"user_id" integer,
	"created_at" timestamp DEFAULT now()
);

-- Add foreign key constraint
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                WHERE constraint_name = 'interest_submissions_user_id_users_id_fk') THEN
    ALTER TABLE "interest_submissions" ADD CONSTRAINT "interest_submissions_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
 END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_interest_submissions_email" ON "interest_submissions" ("email");
CREATE INDEX IF NOT EXISTS "idx_interest_submissions_status" ON "interest_submissions" ("status");
CREATE INDEX IF NOT EXISTS "idx_interest_submissions_interest" ON "interest_submissions" ("interest");
CREATE INDEX IF NOT EXISTS "idx_interest_submissions_user_id" ON "interest_submissions" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_interest_submissions_created_at" ON "interest_submissions" ("created_at" DESC);

-- Add check constraints
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints
                WHERE constraint_name = 'interest_submissions_interest_check') THEN
    ALTER TABLE "interest_submissions" ADD CONSTRAINT "interest_submissions_interest_check"
    CHECK ("interest" IN ('healthy-food', 'supplements', 'both', 'exploring'));
 END IF;
END $$;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints
                WHERE constraint_name = 'interest_submissions_status_check') THEN
    ALTER TABLE "interest_submissions" ADD CONSTRAINT "interest_submissions_status_check"
    CHECK ("status" IN ('new', 'contacted', 'resolved'));
 END IF;
END $$;

-- Add comments for documentation
COMMENT ON TABLE "interest_submissions" IS 'User interest form submissions for ExpatEats';
COMMENT ON COLUMN "interest_submissions"."name" IS 'Name of the person submitting the interest form';
COMMENT ON COLUMN "interest_submissions"."email" IS 'Email address of the person submitting the interest form';
COMMENT ON COLUMN "interest_submissions"."interest" IS 'Type of interest: healthy-food, supplements, both, exploring';
COMMENT ON COLUMN "interest_submissions"."comments" IS 'Optional additional comments from the user';
COMMENT ON COLUMN "interest_submissions"."status" IS 'Status of the submission: new (not yet contacted), contacted (reached out), resolved (completed)';
COMMENT ON COLUMN "interest_submissions"."user_id" IS 'Optional reference to authenticated user who submitted the form';
COMMENT ON COLUMN "interest_submissions"."created_at" IS 'Timestamp when the submission was created';
