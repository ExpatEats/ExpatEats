# Database Migration Guide - Soft Rating & Michaele's Notes

## Summary
Added `soft_rating` and `michaeles_notes` columns to the `places` table to support Michaele's custom ratings and personal notes about locations.

## Changes Made

### 1. Database Schema Updates
- **Column**: `soft_rating` (VARCHAR(50))
  - Purpose: Store Michaele's quality rating for locations
  - Values: "Gold Standard", "Great Choice", "This Will Do in a Pinch", or empty string

- **Column**: `michaeles_notes` (TEXT)
  - Purpose: Store Michaele's personal observations and notes about locations
  - Type: Unlimited text field

### 2. Migration File
- **File**: `migrations/0001_add_soft_rating_michaeles_notes.sql`
- **Location**: Already in migrations directory
- **Format**: PostgreSQL compatible with IF NOT EXISTS checks
- **Idempotent**: Safe to run multiple times

### 3. Application Updates
- **Backend**: Updated storage layer and API endpoints to handle new fields
- **Frontend**:
  - Added fields to admin form for adding new locations
  - Created approval modal for pending locations with soft rating dropdown and notes textarea
- **Schema**: Updated Drizzle ORM schema definition

---

## Deployment Instructions

### For Development (Current Running Container)

The migration has already been applied to your running development container.

To verify:
```bash
docker exec -i expatdb psql -U expatuser -d expatdb -c "\d places" | grep -E "soft_rating|michaeles_notes"
```

Expected output:
```
 soft_rating      | character varying(50) |           |          |
 michaeles_notes  | text                  |           |          |
```

---

### For Fresh Development Deployments

When creating new development containers from scratch:

```bash
# Remove old volumes (WARNING: This deletes all data!)
docker-compose down -v

# Start fresh containers
docker-compose up -d
```

**What happens automatically:**
1. PostgreSQL container starts with empty database
2. All `.sql` files in `migrations/` directory execute in alphabetical order:
   - `0000_complete_schema.sql` - Creates initial schema
   - `0001_add_soft_rating_michaeles_notes.sql` - Adds new columns
3. Application starts and connects to database
4. Seed data populates the database (if `SEED_DATA=true`)

---

### For Existing Development Containers

If you want to update an existing container without losing data:

**Option 1: Manual SQL Migration (Recommended - Already Done)**
```bash
docker exec -i expatdb psql -U expatuser -d expatdb < migrations/0001_add_soft_rating_michaeles_notes.sql
```

**Option 2: Execute SQL directly**
```bash
docker exec -i expatdb psql -U expatuser -d expatdb << 'EOF'
ALTER TABLE places ADD COLUMN IF NOT EXISTS soft_rating VARCHAR(50);
ALTER TABLE places ADD COLUMN IF NOT EXISTS michaeles_notes TEXT;
EOF
```

**Option 3: Use Drizzle Push (if available)**
```bash
docker exec expat-app npm run db:push
```

---

### For Production Deployments

#### New Production Deployment (Fresh Database)

```bash
# Using production docker-compose
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d
```

The migrations will run automatically on first database initialization.

#### Existing Production Deployment (Zero Downtime)

**Step 1: Verify Current State**
```bash
# Check if columns already exist
docker exec -i expatdb-prod psql -U expatuser -d expatdb -c "\d places" | grep -E "soft_rating|michaeles_notes"
```

**Step 2: Apply Migration**
```bash
# Apply migration to running production database
docker exec -i expatdb-prod psql -U expatuser -d expatdb < migrations/0001_add_soft_rating_michaeles_notes.sql
```

**Step 3: Verify Migration Success**
```bash
# Check that columns were added
docker exec -i expatdb-prod psql -U expatuser -d expatdb << 'EOF'
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'places'
AND column_name IN ('soft_rating', 'michaeles_notes');
EOF
```

Expected output:
```
    column_name    | data_type         | character_maximum_length
-------------------+-------------------+--------------------------
 soft_rating       | character varying | 50
 michaeles_notes   | text              |
```

**Step 4: Deploy Updated Application Code**
```bash
# Rebuild and restart app container
docker-compose -f docker-compose.prod.yml up -d --build app
```

---

## Rollback Plan

If you need to remove these columns:

```bash
# Development
docker exec -i expatdb psql -U expatuser -d expatdb << 'EOF'
ALTER TABLE places DROP COLUMN IF EXISTS soft_rating;
ALTER TABLE places DROP COLUMN IF EXISTS michaeles_notes;
EOF

# Production
docker exec -i expatdb-prod psql -U expatuser -d expatdb << 'EOF'
ALTER TABLE places DROP COLUMN IF EXISTS soft_rating;
ALTER TABLE places DROP COLUMN IF EXISTS michaeles_notes;
EOF
```

---

## Docker Configuration Updates

### Development (docker-compose.yml)
✅ Already configured - migrations directory is mounted:
```yaml
postgres:
  volumes:
    - postgres_data:/var/lib/postgresql/data
    - ./migrations:/docker-entrypoint-initdb.d  # ← Migrations auto-run on init
```

### Production (docker-compose.prod.yml)
✅ Updated - migrations directory now mounted:
```yaml
postgres:
  volumes:
    - postgres_prod_data:/var/lib/postgresql/data
    - ./migrations:/docker-entrypoint-initdb.d  # ← Added for production
```

### Dockerfile
✅ No changes needed - migrations are included in the build:
```dockerfile
COPY . .  # ← This includes the migrations directory
```

---

## Verification Commands

### Check Database Structure
```bash
# Development
docker exec -i expatdb psql -U expatuser -d expatdb -c "\d places"

# Production
docker exec -i expatdb-prod psql -U expatuser -d expatdb -c "\d places"
```

### Check for Existing Data in New Columns
```bash
# Development
docker exec -i expatdb psql -U expatuser -d expatdb << 'EOF'
SELECT id, name, soft_rating, michaelesNotes
FROM places
WHERE soft_rating IS NOT NULL OR michaeles_notes IS NOT NULL
LIMIT 5;
EOF
```

### Test Insert with New Columns
```bash
docker exec -i expatdb psql -U expatuser -d expatdb << 'EOF'
INSERT INTO places (name, description, address, city, country, category, soft_rating, michaeles_notes, status)
VALUES ('Test Location', 'Test description', '123 Test St', 'Lisbon', 'Portugal', 'market', 'Gold Standard', 'Great selection of organic produce!', 'approved')
RETURNING id, name, soft_rating, michaeles_notes;
EOF
```

---

## Troubleshooting

### Issue: Migration doesn't run on existing container
**Cause**: `/docker-entrypoint-initdb.d` only runs on first database initialization

**Solution**: Run migration manually (see "Existing Development Containers" section)

### Issue: Column already exists error
**Cause**: Migration was run multiple times

**Solution**: This is fine! The migration uses `IF NOT EXISTS` so it's safe to run multiple times

### Issue: Permission denied when running migration
**Cause**: Incorrect user permissions or database access

**Solution**:
```bash
# Ensure you're using the correct database user
docker exec -i expatdb psql -U expatuser -d expatdb -c "SELECT current_user;"

# Should return: expatuser
```

### Issue: Can't connect to database
**Cause**: Container might not be running or healthy

**Solution**:
```bash
# Check container status
docker ps | grep expatdb

# Check container health
docker inspect expatdb | grep -A 5 Health

# View container logs
docker logs expatdb
```

---

## Environment Variables

No new environment variables required. Uses existing:
- `DATABASE_URL` - PostgreSQL connection string
- `POSTGRES_DB` - Database name (default: expatdb)
- `POSTGRES_USER` - Database user (default: expatuser)
- `POSTGRES_PASSWORD` - Database password

---

## File Locations

### Migration Files
- `migrations/0000_complete_schema.sql` - Initial database schema
- `migrations/0001_add_soft_rating_michaeles_notes.sql` - New columns for ratings and notes

### Application Code
- `shared/schema.ts` - Drizzle ORM schema with new fields
- `server/storage.ts` - Database operations for new fields
- `server/routes.ts` - API endpoints updated to handle new fields
- `client/src/pages/Admin.tsx` - Admin panel with new form fields and approval modal
- `client/src/components/ApprovalDialog.tsx` - New modal component for location approval

### Docker Configuration
- `docker-compose.yml` - Development configuration
- `docker-compose.prod.yml` - Production configuration (updated)
- `Dockerfile` - Production build configuration

---

## Next Steps

1. ✅ Migration applied to development database
2. ✅ Docker configurations updated for both dev and prod
3. ✅ Application code updated and tested
4. 🔲 Test the approval workflow in the admin panel
5. 🔲 Apply migration to production when ready to deploy
6. 🔲 Monitor application logs after deployment

---

## Notes

- Migration is **idempotent** - safe to run multiple times
- Uses `IF NOT EXISTS` to prevent errors on re-runs
- Both columns are **optional** (nullable)
- No data migration needed - new columns can be NULL for existing records
- Application handles NULL values gracefully with empty strings as defaults
