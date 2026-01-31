-- SQL script to insert guides data
-- Generated from PDF files in guides/full directory
-- Run this script in production database after deployment

-- Insert guides (checking for duplicates with ON CONFLICT DO NOTHING)
INSERT INTO guides (slug, url, created_at)
VALUES
  ('home-goods', '/guides/full/Copy of Expat Eats Guide Home goods.pdf', NOW()),
  ('beauty', '/guides/full/Expat Eats Guide Beauty .pdf', NOW()),
  ('cleaning-guide', '/guides/full/Expat Eats Guide Cleaning Guide.pdf', NOW()),
  ('clothing', '/guides/full/Expat Eats Guide Clothing.pdf', NOW()),
  ('wellness-guide', '/guides/full/Expat Eats Guide Wellness Guide.pdf', NOW())
ON CONFLICT (slug) DO NOTHING;

-- Verify the insert
SELECT id, slug, url, created_at FROM guides ORDER BY id;
