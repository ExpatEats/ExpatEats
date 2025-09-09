-- Create saved_stores table for user favorites functionality
CREATE TABLE IF NOT EXISTS "saved_stores" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"place_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);

-- Add foreign key constraints
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'saved_stores_user_id_users_id_fk') THEN
    ALTER TABLE "saved_stores" ADD CONSTRAINT "saved_stores_user_id_users_id_fk" 
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
 END IF;
END $$;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'saved_stores_place_id_places_id_fk') THEN
    ALTER TABLE "saved_stores" ADD CONSTRAINT "saved_stores_place_id_places_id_fk" 
    FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
 END IF;
END $$;

-- Add unique constraint to prevent duplicate favorites
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'saved_stores_user_id_place_id_unique') THEN
    ALTER TABLE "saved_stores" ADD CONSTRAINT "saved_stores_user_id_place_id_unique" 
    UNIQUE("user_id","place_id");
 END IF;
END $$;