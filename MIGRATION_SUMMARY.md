# Places Table Migration Summary

## Overview
This migration updates the `places` table structure to match the `initialPlacesData.csv` file, enabling better filtering for grocery/market and supplements searches.

## Changes Made

### 1. Database Migration
**File:** `migrations/update_places_structure_2026_03_05.sql`

Added new columns to `places` table:
- `grocery_and_market` (boolean) - Flags places for grocery/market searches
- `supplements` (boolean) - Flags places for supplement searches
- `city_tags` (text) - City-specific tags
- `badges` (text) - Special badges (e.g., "local favorite")

**Supplement Filter Columns:**
- `general_supplements`, `omega3`, `vegan_supplements`, `online_retailer`
- `vitamins`, `herbal_remedies`, `organic_supplements`
- `sports_nutrition`, `practitioner_grade`, `hypoallergenic`

### 2. Schema Updates
**File:** `shared/schema.ts`

Updated the `places` table schema to include all new fields with proper TypeScript types.

### 3. Search Logic Updates
**File:** `server/storage.ts`

Updated `getPlaces()` method to:
- Determine search type (grocery/market vs supplements) based on category filter
- Filter by `groceryAndMarket` or `supplements` boolean
- Map tag IDs to appropriate database column filters
- Use OR logic to show places matching ANY selected preference

### 4. Data Import Tools
**Created:** `bulk_script/convert-csv-to-json.cjs`

Converts `initialPlacesData.csv` to JSON format compatible with the bulk upload script.

**Generated:** `bulk_script/initialPlacesData.json`

Contains 85 locations from the CSV, ready for bulk import.

## Tag Mapping

### Grocery & Market Tags → Database Columns
| Frontend Tag | Database Column |
|-------------|----------------|
| gluten-free | glutenFree |
| dairy-free | dairyFree |
| nut-free | nutFree |
| vegan | vegan |
| organic | organic |
| local-farms | localFarms |
| fresh-vegetables | freshVegetables |
| farm-raised-meat | farmRaisedMeat |
| no-processed | noProcessed |
| kid-friendly | kidFriendly |
| bulk-buying | bulkBuying |
| zero-waste | zeroWaste |

### Supplement Tags → Database Columns
| Frontend Tag | Database Column |
|-------------|----------------|
| supplements | generalSupplements |
| vitamins | vitamins |
| sports-nutrition | sportsNutrition |
| omega-3 | omega3 |
| herbal-remedies | herbalRemedies |
| practitioner-grade | practitionerGrade |
| vegan | veganSupplements |
| organic | organicSupplements |
| hypoallergenic | hypoallergenic |
| online | onlineRetailer |

## Migration Steps

### Step 1: Run Database Migration
```bash
# Set your DATABASE_URL if not in .env
source .env
psql $DATABASE_URL -f migrations/update_places_structure_2026_03_05.sql
```

### Step 2: Import New Places Data
```bash
cd bulk_script

# Get your session cookie from browser after logging in as admin
# In Chrome: DevTools → Application → Cookies → expatEatsSession
export SESSION_COOKIE="expatEatsSession=s%3A..."

# Run the bulk upload
node upload.js initialPlacesData.json
```

### Step 3: Verify the Changes
1. Check that all 85 locations imported successfully
2. Test grocery/market search with various tag combinations
3. Test supplements search with various tag combinations
4. Verify that:
   - Grocery searches only show places with `groceryAndMarket = true`
   - Supplement searches only show places with `supplements = true`
   - Tag filters correctly filter by the appropriate boolean columns

## Notes

- The frontend tag selections in `client/src/pages/FindMyFood.tsx` remain unchanged
- All tag IDs correctly map to the new database column structure
- The search logic now uses boolean columns instead of the `tags` array
- The `tags` array field is still available for future use if needed
- Category filter "Health Food Store,Online Store,Department Store" triggers supplement search mode

## Rollback

If you need to rollback the migration:

```sql
-- Remove new columns
ALTER TABLE places DROP COLUMN IF EXISTS grocery_and_market;
ALTER TABLE places DROP COLUMN IF EXISTS supplements;
ALTER TABLE places DROP COLUMN IF EXISTS city_tags;
ALTER TABLE places DROP COLUMN IF EXISTS badges;
ALTER TABLE places DROP COLUMN IF EXISTS general_supplements;
ALTER TABLE places DROP COLUMN IF EXISTS omega3;
ALTER TABLE places DROP COLUMN IF EXISTS vegan_supplements;
ALTER TABLE places DROP COLUMN IF EXISTS online_retailer;
ALTER TABLE places DROP COLUMN IF EXISTS vitamins;
ALTER TABLE places DROP COLUMN IF EXISTS herbal_remedies;
ALTER TABLE places DROP COLUMN IF EXISTS organic_supplements;
ALTER TABLE places DROP COLUMN IF EXISTS sports_nutrition;
ALTER TABLE places DROP COLUMN IF EXISTS practitioner_grade;
ALTER TABLE places DROP COLUMN IF EXISTS hypoallergenic;
```

Then revert the changes to `shared/schema.ts` and `server/storage.ts` using git.
