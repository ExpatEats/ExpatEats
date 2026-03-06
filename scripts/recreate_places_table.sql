-- =====================================================
-- RECREATE PLACES TABLE WITH NEW STRUCTURE
-- =====================================================
-- This script drops and recreates the places table
-- with the updated structure including new columns for
-- grocery/market and supplement filtering
--
-- WARNING: This will delete all existing places data,
-- reviews, and saved stores!
-- =====================================================

BEGIN;

-- Drop dependent foreign key constraints
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_place_id_places_id_fk;
ALTER TABLE saved_stores DROP CONSTRAINT IF EXISTS saved_stores_place_id_places_id_fk;

-- Drop the places table
DROP TABLE IF EXISTS places CASCADE;

-- Clear dependent tables (they now have orphaned references)
DELETE FROM reviews;
DELETE FROM saved_stores;

-- Create new places table with updated structure
CREATE TABLE places (
    id SERIAL PRIMARY KEY,
    unique_id TEXT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    region TEXT,
    country TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[],
    latitude TEXT,
    longitude TEXT,
    phone TEXT,
    email TEXT,
    instagram TEXT,
    website TEXT,

    -- Category filters (NEW)
    grocery_and_market BOOLEAN DEFAULT false,
    supplements BOOLEAN DEFAULT false,

    -- Additional text fields (NEW)
    city_tags TEXT,
    badges TEXT,

    -- Grocery & Market boolean filters
    gluten_free BOOLEAN DEFAULT false,
    dairy_free BOOLEAN DEFAULT false,
    nut_free BOOLEAN DEFAULT false,
    vegan BOOLEAN DEFAULT false,
    organic BOOLEAN DEFAULT false,
    local_farms BOOLEAN DEFAULT false,
    fresh_vegetables BOOLEAN DEFAULT false,
    farm_raised_meat BOOLEAN DEFAULT false,
    no_processed BOOLEAN DEFAULT false,
    kid_friendly BOOLEAN DEFAULT false,
    bulk_buying BOOLEAN DEFAULT false,
    zero_waste BOOLEAN DEFAULT false,

    -- Supplement boolean filters (NEW)
    general_supplements BOOLEAN DEFAULT false,
    omega3 BOOLEAN DEFAULT false,
    vegan_supplements BOOLEAN DEFAULT false,
    online_retailer BOOLEAN DEFAULT false,
    vitamins BOOLEAN DEFAULT false,
    herbal_remedies BOOLEAN DEFAULT false,
    organic_supplements BOOLEAN DEFAULT false,
    sports_nutrition BOOLEAN DEFAULT false,
    practitioner_grade BOOLEAN DEFAULT false,
    hypoallergenic BOOLEAN DEFAULT false,

    -- Metadata
    user_id INTEGER REFERENCES users(id),
    image_url TEXT,
    average_rating INTEGER,
    status TEXT DEFAULT 'pending',
    submitted_by TEXT,
    admin_notes TEXT,
    soft_rating VARCHAR(50),
    michaeles_notes TEXT,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_places_category ON places(category);
CREATE INDEX idx_places_city ON places(city);
CREATE INDEX idx_places_status ON places(status);
CREATE INDEX idx_places_user_id ON places(user_id);
CREATE INDEX idx_places_grocery_and_market ON places(grocery_and_market);
CREATE INDEX idx_places_supplements ON places(supplements);

-- Recreate foreign key constraints
ALTER TABLE reviews
    ADD CONSTRAINT reviews_place_id_places_id_fk
    FOREIGN KEY (place_id) REFERENCES places(id);

ALTER TABLE saved_stores
    ADD CONSTRAINT saved_stores_place_id_places_id_fk
    FOREIGN KEY (place_id) REFERENCES places(id)
    ON DELETE CASCADE;

COMMIT;

-- =====================================================
-- DONE
-- =====================================================
-- The places table has been recreated with new structure
-- You can now import data using the bulk upload script
-- =====================================================
