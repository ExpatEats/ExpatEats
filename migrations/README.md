# Database Migrations

This directory contains all database migrations for the ExpatEats application.

## Migration Files

| File | Date | Description |
|------|------|-------------|
| `0000_complete_schema.sql` | 2025-09-21 | Initial database schema with all base tables (users, places, reviews, nutrition, saved_stores, posts, comments, post_likes, events) |
| `0001_add_soft_rating_michaeles_notes.sql` | 2025-11-13 | Add `soft_rating` and `michaeles_notes` columns to places table for Michaele's custom ratings and notes |

## How Migrations Work

### Development Environment
When you start the development containers with `docker-compose up`, all SQL files in this directory are automatically executed in alphabetical order during database initialization (only on first run with empty database).

**docker-compose.yml** mounts this directory to PostgreSQL's init directory:
```yaml
volumes:
  - ./migrations:/docker-entrypoint-initdb.d
```

### Production Environment
Same process applies for production deployments using `docker-compose.prod.yml`.

**Important**: The auto-execution only happens when the database is initialized for the first time (empty data directory). For existing databases, migrations must be applied manually.

## Running Migrations

### On Fresh Database (Auto)
```bash
# Development
docker-compose down -v  # WARNING: Deletes all data!
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml down -v  # WARNING: Deletes all data!
docker-compose -f docker-compose.prod.yml up -d
```

### On Existing Database (Manual)
```bash
# Development
docker exec -i expatdb psql -U expatuser -d expatdb < migrations/0001_add_soft_rating_michaeles_notes.sql

# Production
docker exec -i expatdb-prod psql -U expatuser -d expatdb < migrations/0001_add_soft_rating_michaeles_notes.sql
```

## Verifying Migrations

Use the verification script:
```bash
# Development
./scripts/verify-migration.sh

# Production
./scripts/verify-migration.sh expatdb-prod
```

Or manually check:
```bash
# Development
docker exec -i expatdb psql -U expatuser -d expatdb -c "\d places"

# Production
docker exec -i expatdb-prod psql -U expatuser -d expatdb -c "\d places"
```

## Creating New Migrations

When creating a new migration:

1. **Name the file** with the next sequential number:
   - Format: `####_descriptive_name.sql`
   - Example: `0002_add_location_tags.sql`

2. **Use idempotent SQL** (safe to run multiple times):
   ```sql
   ALTER TABLE tablename ADD COLUMN IF NOT EXISTS column_name type;
   CREATE TABLE IF NOT EXISTS tablename (...);
   CREATE INDEX IF NOT EXISTS index_name ON tablename(column);
   ```

3. **Add comments** to explain the migration:
   ```sql
   -- Migration: Add location tags feature
   -- Date: 2025-XX-XX
   -- Description: Adds tags table and relationship to places
   ```

4. **Test the migration** on a local database:
   ```bash
   docker exec -i expatdb psql -U expatuser -d expatdb < migrations/####_new_migration.sql
   ```

5. **Update this README** with the new migration details

6. **Create rollback instructions** in the migration file:
   ```sql
   -- Rollback:
   -- ALTER TABLE tablename DROP COLUMN IF EXISTS column_name;
   ```

## Migration Best Practices

✅ **DO:**
- Use `IF NOT EXISTS` / `IF EXISTS` for idempotency
- Add detailed comments explaining the purpose
- Test on development before production
- Include rollback instructions
- Update this README
- Keep migrations small and focused

❌ **DON'T:**
- Delete or modify existing migration files
- Create migrations that depend on data being present
- Use non-idempotent SQL (migrations may run multiple times)
- Skip sequential numbering
- Mix schema changes with data changes (create separate migrations)

## Troubleshooting

### Migration didn't run automatically
**Cause**: Database already initialized

**Solution**: Run migration manually (see "On Existing Database" section)

### Column already exists error
**Cause**: Migration was run multiple times without `IF NOT EXISTS`

**Solution**:
- If using `IF NOT EXISTS`, this shouldn't happen
- If it does, check the migration file syntax
- Verify with `\d tablename` in psql

### Permission denied
**Cause**: Wrong database user or insufficient privileges

**Solution**: Ensure you're using the correct database user (expatuser)

### Can't find migration file
**Cause**: File not mounted or incorrect path

**Solution**:
- Check `docker-compose.yml` volumes configuration
- Verify file exists: `ls -la migrations/`
- Restart containers: `docker-compose restart`

## Database Schema Documentation

For complete database schema documentation, see:
- `migrations/0000_complete_schema.sql` - Base schema
- `shared/schema.ts` - Drizzle ORM schema definitions
- `DATABASE_MIGRATION_GUIDE.md` - Detailed migration guide

## Useful Commands

### View all tables
```bash
docker exec -i expatdb psql -U expatuser -d expatdb -c "\dt"
```

### View table structure
```bash
docker exec -i expatdb psql -U expatuser -d expatdb -c "\d places"
```

### Count records
```bash
docker exec -i expatdb psql -U expatuser -d expatdb -c "SELECT COUNT(*) FROM places;"
```

### Backup database
```bash
docker exec expatdb pg_dump -U expatuser expatdb > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore database
```bash
docker exec -i expatdb psql -U expatuser -d expatdb < backup_20251113_123456.sql
```

---

For detailed deployment instructions, see [DATABASE_MIGRATION_GUIDE.md](../DATABASE_MIGRATION_GUIDE.md)
