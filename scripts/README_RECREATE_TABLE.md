# Recreate Places Table Script

## Overview

This script drops and recreates the `places` table with the new structure needed for the updated search functionality.

## File

**`recreate_places_table.sql`** (111 lines)

## What It Does

1. Drops foreign key constraints from dependent tables
2. Drops the existing `places` table
3. Clears all data from `reviews` and `saved_stores` tables (orphaned references)
4. Creates new `places` table with updated structure
5. Creates 6 performance indexes
6. Restores foreign key constraints

## New Columns Added

### Category Filters
- `grocery_and_market` (boolean) - Flag for grocery/market searches
- `supplements` (boolean) - Flag for supplement searches

### Text Fields
- `city_tags` (text) - City-specific tags
- `badges` (text) - Special badges like "local favorite"

### Supplement Filters (10 new columns)
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

## How to Use

### ⚠️ WARNING
**This script will delete ALL existing places data, reviews, and saved stores!**

### Step 1: Backup Database (IMPORTANT!)

```bash
docker exec expatdb pg_dump -U expatuser expatdb > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Run the Script

```bash
# Using Docker
docker exec -i expatdb psql -U expatuser -d expatdb < scripts/recreate_places_table.sql

# Using local psql
psql -h localhost -U expatuser -d expatdb -f scripts/recreate_places_table.sql
```

### Step 3: Import Data

After recreating the table, import your data using the bulk upload:

```bash
cd bulk_script
export API_URL="http://localhost:3001"
export SESSION_COOKIE="your-session-cookie"
export SKIP_GEOCODE="true"
node upload.cjs initialPlacesData.json
```

Or use the seed script to import supplement stores:
```bash
# The app will automatically seed supplements on restart
docker restart expat-app
```

## Verification

After running, verify the table structure:

```sql
-- Check column count (should be 52)
SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'places';

-- Check new columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'places'
AND column_name IN ('grocery_and_market', 'supplements', 'omega3', 'vitamins');

-- Check indexes were created
\d places
```

## Rollback

If you need to rollback:

```bash
docker exec -i expatdb psql -U expatuser -d expatdb < backup_YYYYMMDD_HHMMSS.sql
```

## Notes

- The script is wrapped in a transaction (automatic rollback on error)
- All foreign key constraints are safely handled
- Performance indexes are automatically created
- The table starts empty - you need to import data separately

## Next Steps

After running this script:
1. Import places data using bulk upload script
2. Ensure cities table is populated
3. Approve imported places (set status to 'approved')
4. Test the Find My Food search functionality
