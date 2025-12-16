# Production Database Seeding Scripts

This directory contains scripts to help you seed your production database on Render.

## Overview

Your development seed script (`server/seedData.ts`) imports data from various sources. To get this data into production, use these scripts:

## Files

### 1. `production_seed.sql` (Root Directory)

Main SQL script that seeds:
- ✅ Cities (8 cities in Portugal)
- ✅ Admin users (with bcrypt-hashed passwords)
- ✅ Events (3 sample events)

**Does NOT include:**
- ❌ Places data (needs to be exported separately)

### 2. `export-places-data.ts`

TypeScript script that exports all places from your development database into a SQL file.

**Usage:**
```bash
# From project root
npx tsx scripts/export-places-data.ts
```

**Output:**
- Creates `production_places_data.sql` with all places data
- Can be run in DataGrip to import places

### 3. `generate-admin-hashes.ts`

Utility script to generate bcrypt password hashes for admin users.

**Usage:**
```bash
npx tsx scripts/generate-admin-hashes.ts
```

**Output:**
- Displays bcrypt hashes for admin passwords
- Useful if you need to create new admin users

## Step-by-Step Guide: Seeding Production Database

### Step 1: Export Places Data from Development

```bash
# Make sure your development database is seeded first
npm run seed

# Export all places to SQL
npx tsx scripts/export-places-data.ts
```

This creates `production_places_data.sql` in your project root.

### Step 2: Connect to Render Database in DataGrip

1. Open DataGrip
2. Create new data source → PostgreSQL
3. Get connection details from Render:
   - Go to your `expatsdb` database on Render
   - Click "Connect" → "External Connection"
   - Copy the connection string

4. In DataGrip, configure:
   - **Host:** from Render (e.g., `dpg-xxxxx.oregon-postgres.render.com`)
   - **Port:** from Render (usually `5432`)
   - **Database:** `expatsdb`
   - **User:** from Render
   - **Password:** from Render
   - **SSL:** Required (check "Verify CA" = false)

5. Test Connection

### Step 3: Run Seed Scripts in Order

In DataGrip connected to your Render database:

#### A. Run Base Seed Script

1. Open `production_seed.sql`
2. Execute the entire script
3. Verify output shows:
   ```
   ✓ All tables cleared
   ✓ Seeded 8 cities
   ✓ Created 2 admin users
   ✓ Seeded 3 events
   ```

#### B. Import Places Data

1. Open `production_places_data.sql`
2. Execute the entire script
3. Verify with:
   ```sql
   SELECT COUNT(*) FROM places;
   ```

### Step 4: Verify Data

Run these queries in DataGrip to verify:

```sql
-- Check all tables
SELECT 'cities' as table_name, COUNT(*) as count FROM cities
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'events', COUNT(*) FROM events
UNION ALL
SELECT 'places', COUNT(*) FROM places;

-- Verify admin users can login
SELECT username, email, role, email_verified FROM users WHERE role = 'admin';

-- Check sample places
SELECT name, city, category, status FROM places LIMIT 10;
```

## Admin User Credentials

After seeding, you can login with:

**Admin Account:**
- Username: `admin`
- Email: `admin@expateats.com`
- Password: `ExpAt2024!SecureAdmin`

**Aaron's Account:**
- Username: `aaronrous`
- Email: `aaron145165@gmail.com`
- Password: `Cool!123129`

⚠️ **Important:** Change these passwords after first login in production!

## Alternative: Manual CSV Export/Import

If you prefer CSV format:

### Export from Development:

```sql
-- In DataGrip connected to LOCAL database
COPY cities TO '/tmp/cities.csv' CSV HEADER;
COPY users TO '/tmp/users.csv' CSV HEADER;
COPY places TO '/tmp/places.csv' CSV HEADER;
COPY events TO '/tmp/events.csv' CSV HEADER;
```

### Import to Production:

```sql
-- In DataGrip connected to RENDER database
COPY cities FROM '/tmp/cities.csv' CSV HEADER;
COPY users FROM '/tmp/users.csv' CSV HEADER;
COPY places FROM '/tmp/places.csv' CSV HEADER;
COPY events FROM '/tmp/events.csv' CSV HEADER;
```

## Troubleshooting

### "relation does not exist" error

**Cause:** Database schema hasn't been created yet.

**Solution:** Ensure migrations have run. On Render, the build command should have run:
```bash
npm run db:push
```

If not, manually run:
```bash
npx drizzle-kit push --config=drizzle.config.ts
```

### "duplicate key value violates unique constraint"

**Cause:** Data already exists in the table.

**Solution:** The seed script clears all tables first. If you want to preserve existing data, comment out the `TRUNCATE TABLE` statements in `production_seed.sql`.

### Foreign key constraint errors

**Cause:** Data being inserted out of order.

**Solution:** The seed scripts insert in the correct order:
1. Cities (no dependencies)
2. Users (no dependencies)
3. Events (references cities)
4. Places (references cities, users)

### bcrypt hash doesn't work

**Cause:** Hash may have been corrupted during copy/paste.

**Solution:** Run `npx tsx scripts/generate-admin-hashes.ts` to generate new hashes, then update the SQL file.

## Safety Notes

⚠️ **IMPORTANT:**
- Always backup your production database before running seed scripts
- The seed script uses `TRUNCATE TABLE CASCADE` which **deletes all data**
- Only run on fresh databases or when you want to completely reset
- Test on a staging database first if possible
- Consider running during low-traffic periods

## Data Sources

The places data comes from these import files:
- `server/importFoodSources.ts` - General food sources
- `server/importSupplementsData.ts` - Supplement stores
- `server/importEnhancedStores.ts` - Enhanced store listings
- `server/importLisbonFoodSources.ts` - Lisbon-specific sources
- `server/importLocationGuides.ts` - Location guides
- `server/importAdditionalFoodSources.ts` - Additional sources

All of this data is consolidated when you run `npm run seed` in development, then exported via `export-places-data.ts`.

## Questions?

If you encounter issues:
1. Check the error message in DataGrip
2. Verify database connection details
3. Ensure migrations have run (`npm run db:push`)
4. Check that tables exist: `\dt` in psql
5. Verify data with `SELECT COUNT(*)` queries
