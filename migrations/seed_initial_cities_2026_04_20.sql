-- Migration: Seed initial cities
-- Date: 2026-04-20
-- Description: Populate cities table with initial cities based on existing places data

-- Insert cities if they don't already exist
INSERT INTO cities (name, slug, country, region, is_active) VALUES
('Lisbon', 'lisbon', 'Portugal', 'Lisboa', true),
('Porto', 'porto', 'Portugal', 'Porto', true),
('Cascais', 'cascais', 'Portugal', 'Lisboa', true),
('Sintra', 'sintra', 'Portugal', 'Lisboa', true),
('Oeiras', 'oeiras', 'Portugal', 'Lisboa', true),
('Online', 'online', 'Portugal', NULL, true)
ON CONFLICT (slug) DO NOTHING;

-- Display results
SELECT 'Initial cities seeded successfully' as status;
SELECT slug, name, is_active FROM cities ORDER BY name;
