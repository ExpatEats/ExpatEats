# Docker Database Update - Favorites Feature

## Summary
Added `savedStores` table to support user favorites functionality. The Docker setup will automatically handle the database migration.

## Changes Made

### 1. Database Schema Addition
- **Table**: `saved_stores`
- **Purpose**: Junction table for many-to-many relationship between users and places
- **Columns**:
  - `id` (serial primary key)
  - `user_id` (foreign key to users table)
  - `place_id` (foreign key to places table)  
  - `created_at` (timestamp)
- **Constraints**:
  - Foreign keys with CASCADE delete
  - Unique constraint on (user_id, place_id) to prevent duplicates

### 2. Migration File
- **File**: `migrations/0002_add_saved_stores.sql`
- **Location**: Already in migrations directory
- **Format**: PostgreSQL compatible with IF NOT EXISTS checks
- **Auto-execution**: Will run automatically on fresh Docker container creation

### 3. Application Code
- **Backend**: API endpoints added for favorites functionality
- **Frontend**: Favorites page and UI components added
- **Storage**: Database methods for save/unsave operations

## Docker Deployment Process

### For Fresh Deployments (New Containers)
```bash
docker-compose down -v  # Remove old volumes if needed
docker-compose up -d    # Start fresh containers
```

**What happens:**
1. PostgreSQL container starts fresh
2. All `.sql` files in `/migrations` directory execute automatically
3. `0000_young_electro.sql` creates initial schema
4. `0001_wonderful_loa.sql` adds additional columns
5. `0002_add_saved_stores.sql` creates savedStores table
6. Application starts and verifies table exists
7. Seed data populates the database

### For Existing Deployments (Container Updates)
```bash
# Option 1: Manual migration on running container
docker exec -i <postgres_container> psql -U expatuser -d expatdb < migrations/0002_add_saved_stores.sql

# Option 2: Run db:push from app container  
docker exec <app_container> npm run db:push

# Option 3: Fresh deployment (if acceptable downtime)
docker-compose down -v && docker-compose up -d
```

### Verification
The application now includes automatic table verification on startup:
- Checks if `saved_stores` table exists
- Logs success/failure for debugging
- Continues operation even if verification fails

## File Locations

### Database Migration
- `migrations/0002_add_saved_stores.sql` - PostgreSQL migration script
- Auto-mounted to PostgreSQL container via docker-compose.yml

### Application Code  
- `server/routes.ts` - API endpoints for favorites
- `server/storage.ts` - Database operations
- `shared/schema.ts` - Drizzle ORM schema definition
- `client/src/pages/Favorites.tsx` - Favorites page UI

### Docker Configuration
- `docker-compose.yml` - Development setup with auto-migration
- `Dockerfile` - Includes migrations in production build
- `databasedockersetup.md` - Original database setup documentation

## Environment Variables
No new environment variables required. Uses existing:
- `DATABASE_URL` - PostgreSQL connection string
- `SEED_DATA=true` - Enables data import and verification
- `NODE_ENV=development` - Enables automatic seed data

## Rollback Plan
If needed, to remove the savedStores table:
```sql
DROP TABLE IF EXISTS saved_stores CASCADE;
```

## Production Considerations
- Migration is idempotent (safe to run multiple times)
- Uses IF NOT EXISTS checks to prevent conflicts
- CASCADE delete maintains data integrity
- Unique constraints prevent duplicate favorites
- Table verification helps with debugging

The favorites functionality is now fully integrated with the Docker deployment process and will work automatically when containers are deployed.