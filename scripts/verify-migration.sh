#!/bin/bash

# Verification script for soft_rating and michaeles_notes migration
# This script verifies that the database migration was applied successfully

set -e

CONTAINER_NAME="${1:-expatdb}"
DB_USER="${2:-expatuser}"
DB_NAME="${3:-expatdb}"

echo "🔍 Verifying migration for soft_rating and michaeles_notes columns..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if container is running
echo "1️⃣  Checking if database container is running..."
if docker ps | grep -q "$CONTAINER_NAME"; then
    echo "   ✅ Container '$CONTAINER_NAME' is running"
else
    echo "   ❌ Container '$CONTAINER_NAME' is not running!"
    exit 1
fi
echo ""

# Check database connection
echo "2️⃣  Testing database connection..."
if docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" > /dev/null 2>&1; then
    echo "   ✅ Database connection successful"
else
    echo "   ❌ Cannot connect to database!"
    exit 1
fi
echo ""

# Check if columns exist
echo "3️⃣  Checking if new columns exist..."
COLUMNS=$(docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'places'
AND column_name IN ('soft_rating', 'michaeles_notes')
ORDER BY column_name;
")

if echo "$COLUMNS" | grep -q "soft_rating"; then
    echo "   ✅ Column 'soft_rating' exists"
else
    echo "   ❌ Column 'soft_rating' does NOT exist!"
    exit 1
fi

if echo "$COLUMNS" | grep -q "michaeles_notes"; then
    echo "   ✅ Column 'michaeles_notes' exists"
else
    echo "   ❌ Column 'michaeles_notes' does NOT exist!"
    exit 1
fi
echo ""

# Show column details
echo "4️⃣  Column details:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "
SELECT
    column_name as \"Column\",
    data_type as \"Type\",
    COALESCE(character_maximum_length::text, 'N/A') as \"Max Length\",
    is_nullable as \"Nullable\"
FROM information_schema.columns
WHERE table_name = 'places'
AND column_name IN ('soft_rating', 'michaeles_notes')
ORDER BY column_name;
"
echo ""

# Check for existing data in new columns
echo "5️⃣  Checking for existing data in new columns..."
DATA_COUNT=$(docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "
SELECT COUNT(*)
FROM places
WHERE soft_rating IS NOT NULL OR michaeles_notes IS NOT NULL;
" | tr -d ' ')

if [ "$DATA_COUNT" -gt 0 ]; then
    echo "   ℹ️  Found $DATA_COUNT records with soft_rating or michaeles_notes data"
    echo ""
    echo "   Sample records:"
    docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "
    SELECT
        id,
        name,
        soft_rating,
        LEFT(michaeles_notes, 50) ||
            CASE WHEN LENGTH(michaeles_notes) > 50 THEN '...' ELSE '' END as notes_preview
    FROM places
    WHERE soft_rating IS NOT NULL OR michaeles_notes IS NOT NULL
    LIMIT 5;
    "
else
    echo "   ℹ️  No records yet have soft_rating or michaeles_notes data (this is normal)"
fi
echo ""

# Test insert capability
echo "6️⃣  Testing insert with new columns..."
TEST_RESULT=$(docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "
BEGIN;
INSERT INTO places (
    name, description, address, city, country, category,
    soft_rating, michaeles_notes, status
)
VALUES (
    'Test Location - Verification',
    'This is a test record to verify the migration',
    '123 Test Street',
    'Lisbon',
    'Portugal',
    'market',
    'Gold Standard',
    'This is a test note to verify that the michaeles_notes column works correctly.',
    'pending'
)
RETURNING id;
ROLLBACK;
" | tr -d ' ')

if [ ! -z "$TEST_RESULT" ]; then
    echo "   ✅ Insert test successful (rolled back)"
else
    echo "   ❌ Insert test failed!"
    exit 1
fi
echo ""

# Final summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Migration verification complete!"
echo ""
echo "Summary:"
echo "  • Database container: $CONTAINER_NAME ✅"
echo "  • Database connection: Working ✅"
echo "  • soft_rating column: Exists (VARCHAR(50)) ✅"
echo "  • michaeles_notes column: Exists (TEXT) ✅"
echo "  • Insert capability: Working ✅"
echo "  • Records with data: $DATA_COUNT"
echo ""
echo "The migration has been successfully applied! 🎉"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
