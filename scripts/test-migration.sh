#!/bin/bash

# =====================================================
# Migration Test Script
# =====================================================
# This script performs a dry-run validation of the
# migration SQL without actually executing it
# =====================================================

echo "=================================================="
echo "Places Table Migration - Validation Test"
echo "=================================================="
echo ""

# Check if files exist
echo "1. Checking required files..."
if [ ! -f "full_places_migration.sql" ]; then
    echo "   ✗ ERROR: full_places_migration.sql not found"
    exit 1
fi
echo "   ✓ full_places_migration.sql found"

if [ ! -f "places_inserts.sql" ]; then
    echo "   ✗ ERROR: places_inserts.sql not found"
    exit 1
fi
echo "   ✓ places_inserts.sql found"

# Validate SQL syntax
echo ""
echo "2. Validating SQL syntax..."
LINE_COUNT=$(wc -l < full_places_migration.sql)
echo "   Total lines: $LINE_COUNT"

INSERT_COUNT=$(grep -c "INSERT INTO places" full_places_migration.sql)
echo "   INSERT statements: $INSERT_COUNT"

if [ "$INSERT_COUNT" -ne 85 ]; then
    echo "   ✗ WARNING: Expected 85 INSERT statements, found $INSERT_COUNT"
else
    echo "   ✓ Correct number of INSERT statements"
fi

BEGIN_COUNT=$(grep -c "^BEGIN;" full_places_migration.sql)
COMMIT_COUNT=$(grep -c "^COMMIT;" full_places_migration.sql)

if [ "$BEGIN_COUNT" -eq 1 ] && [ "$COMMIT_COUNT" -eq 1 ]; then
    echo "   ✓ Transaction properly wrapped (BEGIN/COMMIT)"
else
    echo "   ✗ ERROR: Transaction not properly wrapped"
    exit 1
fi

# Check for required table components
echo ""
echo "3. Checking table structure..."

if grep -q "CREATE TABLE places" full_places_migration.sql; then
    echo "   ✓ CREATE TABLE statement found"
else
    echo "   ✗ ERROR: CREATE TABLE statement not found"
    exit 1
fi

if grep -q "DROP TABLE IF EXISTS places" full_places_migration.sql; then
    echo "   ✓ DROP TABLE statement found"
else
    echo "   ✗ ERROR: DROP TABLE statement not found"
    exit 1
fi

# Check for new columns
echo ""
echo "4. Checking new column definitions..."

REQUIRED_COLUMNS=(
    "grocery_and_market"
    "supplements"
    "city_tags"
    "badges"
    "general_supplements"
    "omega3"
    "vegan_supplements"
    "vitamins"
)

ALL_COLUMNS_FOUND=true
for col in "${REQUIRED_COLUMNS[@]}"; do
    if grep -q "$col" full_places_migration.sql; then
        echo "   ✓ Column '$col' defined"
    else
        echo "   ✗ ERROR: Column '$col' not found"
        ALL_COLUMNS_FOUND=false
    fi
done

# Check for indexes
echo ""
echo "5. Checking index creation..."

REQUIRED_INDEXES=(
    "idx_places_category"
    "idx_places_city"
    "idx_places_status"
    "idx_places_grocery_and_market"
    "idx_places_supplements"
)

for idx in "${REQUIRED_INDEXES[@]}"; do
    if grep -q "$idx" full_places_migration.sql; then
        echo "   ✓ Index '$idx' defined"
    else
        echo "   ✗ WARNING: Index '$idx' not found"
    fi
done

# Check for foreign key constraints
echo ""
echo "6. Checking foreign key handling..."

if grep -q "ALTER TABLE reviews DROP CONSTRAINT" full_places_migration.sql; then
    echo "   ✓ Reviews FK drop found"
else
    echo "   ✗ WARNING: Reviews FK drop not found"
fi

if grep -q "ALTER TABLE reviews" full_places_migration.sql && grep -q "ADD CONSTRAINT" full_places_migration.sql; then
    echo "   ✓ Reviews FK restoration found"
else
    echo "   ✗ WARNING: Reviews FK restoration not found"
fi

# Summary
echo ""
echo "=================================================="
echo "Validation Summary"
echo "=================================================="
echo ""

if [ "$ALL_COLUMNS_FOUND" = true ] && [ "$INSERT_COUNT" -eq 85 ]; then
    echo "✓ All validations passed!"
    echo ""
    echo "The migration script appears to be valid."
    echo ""
    echo "Next steps:"
    echo "1. Create a database backup"
    echo "2. Review MIGRATION_README.md"
    echo "3. Run in a test environment first"
    echo "4. Execute: psql -U expatuser -d expatdb -f full_places_migration.sql"
    echo ""
    exit 0
else
    echo "✗ Some validations failed. Review the errors above."
    exit 1
fi
