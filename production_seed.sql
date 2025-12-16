-- ==================================================
-- PRODUCTION DATABASE SEED SCRIPT
-- ExpatEats Application
-- ==================================================
--
-- WARNING: This script will DELETE ALL DATA in your database!
-- Only run this on a fresh production database or when you want to completely reset data.
--
-- Usage in DataGrip:
-- 1. Connect to your Render PostgreSQL database
-- 2. Open this file
-- 3. Execute the entire script
-- ==================================================

BEGIN;

-- ==================================================
-- STEP 1: CLEAR ALL TABLES
-- ==================================================
-- Order is important due to foreign key constraints

DO $$
BEGIN
    -- Disable triggers temporarily for faster deletion
    SET session_replication_role = replica;

    TRUNCATE TABLE post_likes CASCADE;
    TRUNCATE TABLE comments CASCADE;
    TRUNCATE TABLE posts CASCADE;
    TRUNCATE TABLE saved_stores CASCADE;
    TRUNCATE TABLE reviews CASCADE;
    TRUNCATE TABLE nutrition CASCADE;
    TRUNCATE TABLE events CASCADE;
    TRUNCATE TABLE places CASCADE;
    TRUNCATE TABLE users CASCADE;
    TRUNCATE TABLE cities CASCADE;
    TRUNCATE TABLE email_logs CASCADE;
    TRUNCATE TABLE newsletter_subscribers CASCADE;

    -- Re-enable triggers
    SET session_replication_role = DEFAULT;

    RAISE NOTICE '✓ All tables cleared';
END $$;

-- ==================================================
-- STEP 2: SEED CITIES
-- ==================================================

INSERT INTO cities (name, slug, country, region, is_active) VALUES
    ('Lisbon', 'lisbon', 'Portugal', 'Lisbon', true),
    ('Cascais', 'cascais', 'Portugal', 'Lisbon', true),
    ('Sintra', 'sintra', 'Portugal', 'Lisbon', true),
    ('Oeiras', 'oeiras', 'Portugal', 'Lisbon', true),
    ('Mafra', 'mafra', 'Portugal', 'Lisbon', true),
    ('Parede', 'parede', 'Portugal', 'Lisbon', true),
    ('Ourém', 'ourem', 'Portugal', 'Santarém', true),
    ('Online', 'online', 'Online', NULL, true);

-- Verify
DO $$
DECLARE
    city_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO city_count FROM cities;
    RAISE NOTICE '✓ Seeded % cities', city_count;
END $$;

-- ==================================================
-- STEP 3: SEED ADMIN USERS
-- ==================================================
-- Passwords are bcrypt-hashed with 12 rounds
-- These hashes are secure and cannot be reversed to get the original password
--
-- Admin user:
--   Username: admin
--   Email: admin@expateats.com
--   Password: ExpAt2024!SecureAdmin
--
-- Aaron user:
--   Username: aaronrous
--   Email: aaron145165@gmail.com
--   Password: Cool!123129

INSERT INTO users (
    username,
    password,
    email,
    name,
    role,
    email_verified,
    auth_provider,
    failed_login_attempts
) VALUES
    (
        'admin',
        '$2b$12$.7hTt0JSpkCbqE50KByH7uC9DjXNplzg/T4Ef9J9wZIJHFojmGuwm', -- ExpAt2024!SecureAdmin
        'admin@expateats.com',
        'Admin User',
        'admin',
        true,
        'local',
        0
    ),
    (
        'aaronrous',
        '$2b$12$evibKyIiFbEMUzE.Y7DkY.sgQtainJA3IzunuN6bQDsj9elzx7EvS', -- Cool!123129
        'aaron145165@gmail.com',
        'Aaron Roussel',
        'admin',
        true,
        'local',
        0
    );

-- Verify
DO $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    RAISE NOTICE '✓ Created % admin users', user_count;
END $$;

-- ==================================================
-- STEP 4: SEED EVENTS
-- ==================================================

INSERT INTO events (
    title,
    description,
    date,
    time,
    location,
    city,
    country,
    organizer_name,
    organizer_role,
    category,
    image_url,
    submitted_by,
    submitter_email,
    status,
    current_attendees
) VALUES
    (
        'Organic Market Tour in Principe Real',
        'Join us for a guided tour of the Mercado Biológico do Principe Real. Learn how to select the best organic produce and meet local farmers.',
        '2025-11-15 10:00:00',
        '10:00 AM',
        'Principe Real Garden, Lisbon',
        'Lisbon',
        'Portugal',
        'Maria Santos',
        'Local Food Guide',
        'Market Tour',
        'https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400',
        'ExpatEats Team',
        'team@expateats.com',
        'approved',
        0
    ),
    (
        'Zero Waste Shopping Workshop',
        'Learn practical tips for shopping without plastic and reducing food waste. We''ll visit Maria Granel and other zero waste shops in central Lisbon.',
        '2025-11-22 14:00:00',
        '2:00 PM',
        'Maria Granel, Rua da Assunção 7, Lisbon',
        'Lisbon',
        'Portugal',
        'João Silva',
        'Zero Waste Advocate',
        'Workshop',
        'https://images.unsplash.com/photo-1579113800032-c38bd7635818?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400',
        'ExpatEats Team',
        'team@expateats.com',
        'approved',
        0
    ),
    (
        'Expat Dinner: Portuguese Cuisine with Dietary Adaptations',
        'Join fellow expats for a community dinner featuring traditional Portuguese dishes adapted for various dietary needs (gluten-free, vegan, etc.).',
        '2025-12-05 19:00:00',
        '7:00 PM',
        'Community Kitchen, Av. Almirante Reis 45, Lisbon',
        'Lisbon',
        'Portugal',
        'ExpatEats Community',
        'Community Organization',
        'Social',
        'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400',
        'ExpatEats Team',
        'team@expateats.com',
        'approved',
        0
    );

-- Verify
DO $$
DECLARE
    event_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO event_count FROM events;
    RAISE NOTICE '✓ Seeded % events', event_count;
END $$;

-- ==================================================
-- STEP 5: SEED PLACES DATA (TO BE ADDED)
-- ==================================================
-- Your places data comes from various import files in your seed script.
-- To get this data into production, you have two options:
--
-- OPTION A: Export from development database
-- -----------------------------------------
-- On your development database, run:
--
--   COPY (SELECT * FROM places ORDER BY id) TO '/tmp/places_export.csv' WITH (FORMAT CSV, HEADER);
--
-- Then import here:
--
--   COPY places FROM '/tmp/places_export.csv' WITH (FORMAT CSV, HEADER);
--
-- OPTION B: Run the TypeScript seed script
-- -----------------------------------------
-- Since your places data comes from importFoodSources(), importEnhancedStores(),
-- importLisbonFoodSources(), etc., you can:
--
-- 1. Temporarily set NODE_ENV=development in Render
-- 2. Run: npm run seed
-- 3. Set NODE_ENV=production again
--
-- However, OPTION A is safer for production.

-- ==================================================
-- STEP 6: RESET SEQUENCES
-- ==================================================
-- Reset auto-increment sequences to continue from max ID

DO $$
BEGIN
    -- Reset sequences for all tables with serial IDs
    PERFORM setval('cities_id_seq', COALESCE((SELECT MAX(id) FROM cities), 0) + 1, false);
    PERFORM setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 0) + 1, false);
    PERFORM setval('places_id_seq', COALESCE((SELECT MAX(id) FROM places), 0) + 1, false);
    PERFORM setval('events_id_seq', COALESCE((SELECT MAX(id) FROM events), 0) + 1, false);
    PERFORM setval('reviews_id_seq', COALESCE((SELECT MAX(id) FROM reviews), 0) + 1, false);
    PERFORM setval('nutrition_id_seq', COALESCE((SELECT MAX(id) FROM nutrition), 0) + 1, false);
    PERFORM setval('saved_stores_id_seq', COALESCE((SELECT MAX(id) FROM saved_stores), 0) + 1, false);
    PERFORM setval('posts_id_seq', COALESCE((SELECT MAX(id) FROM posts), 0) + 1, false);
    PERFORM setval('comments_id_seq', COALESCE((SELECT MAX(id) FROM comments), 0) + 1, false);
    PERFORM setval('post_likes_id_seq', COALESCE((SELECT MAX(id) FROM post_likes), 0) + 1, false);
    PERFORM setval('email_logs_id_seq', COALESCE((SELECT MAX(id) FROM email_logs), 0) + 1, false);
    PERFORM setval('newsletter_subscribers_id_seq', COALESCE((SELECT MAX(id) FROM newsletter_subscribers), 0) + 1, false);

    RAISE NOTICE '✓ Reset all sequences';
END $$;

-- ==================================================
-- FINAL SUMMARY
-- ==================================================

DO $$
DECLARE
    city_count INTEGER;
    user_count INTEGER;
    event_count INTEGER;
    place_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO city_count FROM cities;
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO event_count FROM events;
    SELECT COUNT(*) INTO place_count FROM places;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '  SEED DATA SUMMARY';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Cities:  %', city_count;
    RAISE NOTICE 'Users:   %', user_count;
    RAISE NOTICE 'Events:  %', event_count;
    RAISE NOTICE 'Places:  %', place_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE '';

    IF place_count = 0 THEN
        RAISE WARNING 'No places data found! Remember to import places data separately.';
        RAISE WARNING 'See STEP 5 comments in this script for instructions.';
    END IF;
END $$;

COMMIT;

-- ==================================================
-- ADMIN USER CREDENTIALS
-- ==================================================
--
-- Username: admin
-- Email: admin@expateats.com
-- Password: ExpAt2024!SecureAdmin
--
-- Username: aaronrous
-- Email: aaron145165@gmail.com
-- Password: Cool!123129
--
-- ==================================================
