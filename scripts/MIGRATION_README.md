# Full Places Table Migration Script

## Overview

This directory contains a complete SQL migration script that:
1. Drops the existing `places` table
2. Creates a new `places` table with the updated structure
3. Inserts all 85 places from `initialPlacesData.csv`

## ⚠️ IMPORTANT WARNINGS

**THIS SCRIPT WILL DELETE ALL EXISTING PLACES DATA!**

Before running in production:
1. **BACKUP YOUR DATABASE** (see backup instructions below)
2. Test the script in a staging environment first
3. Verify you have the correct database connection
4. Make sure no users are actively using the system

## Files in This Directory

- **`full_places_migration.sql`** - Complete migration script (4,877 lines)
  - Includes table drop, creation, and all INSERT statements
  - Handles foreign key constraints safely
  - Wrapped in a transaction for safety

- **`generate-places-sql.cjs`** - Script to regenerate INSERT statements
  - Reads from `bulk_script/initialPlacesData.json`
  - Generates SQL INSERT statements
  - Useful if you need to update the data

- **`places_inserts.sql`** - Raw INSERT statements (generated)
  - Contains all 85 INSERT statements
  - Can be used separately if needed

## Database Backup Instructions

### Option 1: Using pg_dump (Recommended)

```bash
# Backup entire database
pg_dump -h localhost -U expatuser -d expatdb > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup only places table
pg_dump -h localhost -U expatuser -d expatdb -t places > places_backup_$(date +%Y%m%d_%H%M%S).sql
```

### Option 2: Using Docker

```bash
# Backup from Docker container
docker exec expatdb pg_dump -U expatuser expatdb > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup only places table
docker exec expatdb pg_dump -U expatuser expatdb -t places > places_backup_$(date +%Y%m%d_%H%M%S).sql
```

## Running the Migration

### Development/Local Environment

```bash
# Using Docker
docker exec -i expatdb psql -U expatuser -d expatdb < scripts/full_places_migration.sql

# Using local psql
psql -h localhost -U expatuser -d expatdb -f scripts/full_places_migration.sql
```

### Production Environment

```bash
# 1. BACKUP FIRST!
pg_dump -h YOUR_HOST -U YOUR_USER -d YOUR_DB > backup_before_migration.sql

# 2. Run the migration
psql -h YOUR_HOST -U YOUR_USER -d YOUR_DB -f scripts/full_places_migration.sql

# 3. Verify the results (see Verification section below)
```

## Verification Steps

After running the migration, execute these queries to verify success:

```sql
-- Check total places count (should be 85)
SELECT COUNT(*) as total_places FROM places;

-- Check grocery & market places (should be 85)
SELECT COUNT(*) as grocery_market_count
FROM places
WHERE grocery_and_market = true;

-- Check supplement places (should be 19)
SELECT COUNT(*) as supplements_count
FROM places
WHERE supplements = true;

-- Check all cities are represented
SELECT DISTINCT city FROM places ORDER BY city;

-- Check status distribution
SELECT status, COUNT(*)
FROM places
GROUP BY status;

-- Verify table structure
\d places
```

### Expected Results

```
total_places:           85
grocery_market_count:   85
supplements_count:      19
status (approved):      85
cities:                 14 distinct cities
```

## What the Script Does

### Step 1: Drop Foreign Key Constraints
Temporarily removes foreign key constraints from:
- `reviews` table
- `saved_stores` table

### Step 2: Drop Places Table
Drops the existing `places` table completely (CASCADE)

### Step 3: Create New Table
Creates the new `places` table with:
- All original columns
- 4 new columns: `grocery_and_market`, `supplements`, `city_tags`, `badges`
- 10 new supplement-specific boolean columns
- Proper indexes for performance

### Step 4: Create Indexes
Creates performance indexes on:
- `category`
- `city`
- `status`
- `user_id`
- `grocery_and_market`
- `supplements`

### Step 5: Restore Foreign Keys
Re-creates foreign key constraints on dependent tables

### Step 6: Insert Data
Inserts all 85 places with:
- Complete data from CSV
- All boolean flags properly set
- Status set to 'approved'

### Step 7: Transaction Commit
Commits all changes (or rolls back on error)

## Rollback Instructions

If something goes wrong, you can restore from your backup:

```bash
# Stop the application first
docker stop expat-app

# Restore from backup
psql -h localhost -U expatuser -d expatdb < backup_YYYYMMDD_HHMMSS.sql

# Or with Docker
docker exec -i expatdb psql -U expatuser -d expatdb < backup_YYYYMMDD_HHMMSS.sql

# Restart the application
docker start expat-app
```

## Regenerating INSERT Statements

If you need to update the data or regenerate the INSERT statements:

```bash
cd scripts
node generate-places-sql.cjs
```

This will:
1. Read `bulk_script/initialPlacesData.json`
2. Generate fresh INSERT statements
3. Save to `places_inserts.sql`
4. You can then manually update `full_places_migration.sql`

## New Table Structure

The new `places` table includes these additional columns:

### Category Filters
- `grocery_and_market` (boolean) - Place appears in grocery searches
- `supplements` (boolean) - Place appears in supplement searches

### Text Fields
- `city_tags` (text) - City-specific tags
- `badges` (text) - Special badges like "local favorite"

### Supplement Filters
- `general_supplements` (boolean)
- `omega3` (boolean)
- `vegan_supplements` (boolean)
- `online_retailer` (boolean)
- `vitamins` (boolean)
- `herbal_remedies` (boolean)
- `organic_supplements` (boolean)
- `sports_nutrition` (boolean)
- `practitioner_grade` (boolean)
- `hypoallergenic` (boolean)

## Troubleshooting

### Error: "relation does not exist"
Make sure dependent tables (reviews, saved_stores) exist before running the migration.

### Error: "permission denied"
Ensure your database user has DROP, CREATE, and INSERT permissions.

### Migration takes too long
The script inserts 85 records which should be fast. If it hangs, check:
- Database connection
- Lock contention (other processes using the table)

### Data doesn't match expected counts
Verify the `initialPlacesData.json` file hasn't been modified.

## Support

If you encounter issues:
1. Check the verification queries above
2. Review the PostgreSQL logs
3. Ensure the backup was created successfully
4. Contact the development team with the error message

## File Checksums

To verify file integrity before running:

```bash
# Check line count
wc -l scripts/full_places_migration.sql
# Expected: 4877 lines

# Check INSERT statement count
grep -c "INSERT INTO places" scripts/full_places_migration.sql
# Expected: 85
```
