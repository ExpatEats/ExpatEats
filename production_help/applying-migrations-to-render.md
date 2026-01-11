# Applying Database Migrations to Production (Render.com)

This guide explains how to apply database migrations to your live production database hosted on Render.com.

## Migration File
**File:** `migrations/0006_update_events_table_fields.sql`

This migration adds new fields to the events table for enhanced event submission functionality.

---

## Option 1: Using Render Dashboard (Recommended for Quick Updates)

### Step 1: Access Your Database
1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Navigate to your PostgreSQL database service
3. Click on the database name to open its details page

### Step 2: Connect to Database Shell
1. Click on the **"Shell"** tab or **"Connect"** button
2. This will open a PostgreSQL shell connected to your production database

### Step 3: Run the Migration
1. Open the migration file on your local machine:
   ```
   /migrations/0006_update_events_table_fields.sql
   ```

2. Copy the entire contents of the migration file

3. Paste the SQL commands into the Render database shell

4. Press Enter to execute

5. Verify the migration was successful by checking for any error messages

### Step 4: Verify the Changes
Run this query to verify the new columns exist:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'events'
ORDER BY ordinal_position;
```

You should see the new columns:
- `venue_name`
- `event_cost`
- `event_language`
- `language_other`
- `featured_interest`

---

## Option 2: Using psql CLI (For Developers Comfortable with Command Line)

### Step 1: Get Database Connection String
1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Navigate to your PostgreSQL database
3. Click **"Connect"** and copy the **External Connection String**
   - It will look like: `postgresql://username:password@hostname/database`

### Step 2: Connect via psql
Open your terminal and connect to the database:
```bash
psql "postgresql://username:password@hostname/database"
```

Or if you have the connection string saved:
```bash
psql $RENDER_DATABASE_URL
```

### Step 3: Run the Migration File
From your project directory:
```bash
psql "your-connection-string" < migrations/0006_update_events_table_fields.sql
```

### Step 4: Verify
```sql
\d events
```

This will show the table structure with all columns.

---

## Option 3: Using a Database GUI Tool (DataGrip, pgAdmin, TablePlus, etc.)

### Step 1: Get Database Credentials
1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Navigate to your PostgreSQL database
3. Note the connection details:
   - Hostname
   - Port
   - Database name
   - Username
   - Password

### Step 2: Connect Your GUI Tool
1. Open your preferred database GUI tool
2. Create a new PostgreSQL connection using the credentials from Step 1
3. Test the connection

### Step 3: Execute the Migration
1. Open the migration file: `migrations/0006_update_events_table_fields.sql`
2. Copy the SQL content
3. Open a new SQL query window in your GUI tool
4. Paste the migration SQL
5. Execute the query

### Step 4: Refresh and Verify
Refresh the database schema in your GUI tool and verify the `events` table has the new columns.

---

## Option 4: Automated via Deployment (Future Setup)

For automated migrations on deployment, you can configure your Render service:

### Using a Build Command
In your Render service settings, update the **Build Command**:
```bash
npm install && npm run build && npm run db:migrate:prod
```

### Create the Migration Script
Add to your `package.json`:
```json
{
  "scripts": {
    "db:migrate:prod": "node scripts/run-migrations.js"
  }
}
```

### Create Migration Runner Script
Create `scripts/run-migrations.js`:
```javascript
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigrations() {
  const migrationsDir = path.join(process.cwd(), 'migrations');
  const migrationFile = '0006_update_events_table_fields.sql';

  const sql = fs.readFileSync(
    path.join(migrationsDir, migrationFile),
    'utf8'
  );

  try {
    await pool.query(sql);
    console.log(`✅ Migration ${migrationFile} applied successfully`);
  } catch (error) {
    console.error(`❌ Migration failed:`, error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
```

---

## Important Notes

### ⚠️ Before Running Migrations in Production:

1. **Backup Your Database**
   - In Render Dashboard, go to your database
   - Click on "Backups" tab
   - Create a manual backup before running migrations
   - Or use: `pg_dump` to create a local backup

2. **Test Locally First**
   - Always test migrations on your local database first
   - Verify the migration works without errors

3. **Check for Breaking Changes**
   - This migration is safe (only adds new columns)
   - It includes data migration for existing categories
   - No data will be lost

4. **Downtime Considerations**
   - These migrations should run quickly (< 1 second)
   - They add columns with NULL/default values, so no table locks
   - Safe to run while the app is live

5. **Verify After Migration**
   - Check that the new columns exist
   - Test event submission on the production site
   - Monitor error logs for any issues

---

## Rollback Plan (If Something Goes Wrong)

If you need to undo this migration:

```sql
-- Remove new columns
ALTER TABLE "events" DROP COLUMN IF EXISTS "venue_name";
ALTER TABLE "events" DROP COLUMN IF EXISTS "event_cost";
ALTER TABLE "events" DROP COLUMN IF EXISTS "event_language";
ALTER TABLE "events" DROP COLUMN IF EXISTS "language_other";
ALTER TABLE "events" DROP COLUMN IF EXISTS "featured_interest";

-- Restore old category constraint
ALTER TABLE "events" DROP CONSTRAINT IF EXISTS "events_category_check";
ALTER TABLE "events" ADD CONSTRAINT "events_category_check"
CHECK ("category" IN (
    'Market Tour', 'Workshop', 'Social', 'Food Tasting',
    'Cooking Class', 'Networking', 'Other'
) OR "category" IS NULL);
```

**Note:** This will lose any data entered in the new fields and revert categories to old values.

---

## Post-Migration Steps

After successfully applying the migration:

1. **Deploy Updated Application Code**
   - Push your code changes to GitHub
   - Render will automatically deploy the new version
   - The new schema.ts and form fields will be included

2. **Test the Event Submission Form**
   - Go to your production site
   - Try submitting a test event
   - Verify all new fields work correctly

3. **Monitor Error Logs**
   - Check Render logs for any database errors
   - Monitor for the first few hours after deployment

---

## Quick Reference Commands

### View Current Table Structure
```sql
\d events
```

### Check if Migration Already Applied
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'events' AND column_name = 'venue_name';
```

### View All Events (to verify data migration)
```sql
SELECT id, title, category, event_cost, event_language
FROM events
LIMIT 10;
```

---

## Questions or Issues?

If you encounter any problems:
1. Check Render service logs
2. Verify database connection is working
3. Ensure the migration file is complete and properly formatted
4. Contact Render support if database is unresponsive

---

**Last Updated:** January 11, 2026
**Migration File:** `0006_update_events_table_fields.sql`
**Database:** PostgreSQL on Render.com
