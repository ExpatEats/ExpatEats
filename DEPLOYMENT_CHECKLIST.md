# Deployment Checklist - Soft Rating & Michaele's Notes Feature

## ✅ Completed Changes

### 1. Database Changes
- ✅ Created migration file: `migrations/0001_add_soft_rating_michaeles_notes.sql`
- ✅ Added `soft_rating` column (VARCHAR(50)) to places table
- ✅ Added `michaeles_notes` column (TEXT) to places table
- ✅ Applied migration to development database
- ✅ Verified columns exist and are functioning

### 2. Docker Configuration Updates
- ✅ Updated `docker-compose.prod.yml` to mount migrations directory
- ✅ Verified `docker-compose.yml` (development) has migrations mounted
- ✅ Confirmed `Dockerfile` includes migrations in build
- ✅ Restarted app container to pick up schema changes

### 3. Backend Code Changes
- ✅ Updated `shared/schema.ts` - Added fields to Drizzle schema
- ✅ Updated `server/storage.ts` - Modified approvePlace method
- ✅ Updated `server/routes.ts` - Updated API endpoint to accept new fields

### 4. Frontend Code Changes
- ✅ Updated `client/src/pages/Admin.tsx`:
  - Added fields to form schema
  - Added Soft Rating dropdown to add location form
  - Added Michaele's Notes textarea to add location form
  - Updated mutation to send new fields
  - Integrated approval modal
- ✅ Created `client/src/components/ApprovalDialog.tsx` - New modal component

### 5. Documentation Created
- ✅ `DATABASE_MIGRATION_GUIDE.md` - Comprehensive deployment guide
- ✅ `migrations/README.md` - Migration documentation
- ✅ `scripts/verify-migration.sh` - Automated verification script
- ✅ This checklist

---

## 🚀 Deployment Status

### Development Environment
- ✅ Migration applied
- ✅ Database verified
- ✅ App container restarted
- ✅ API responding successfully
- 🟢 **READY FOR TESTING**

### Production Environment
- ⏳ **PENDING DEPLOYMENT**
- See instructions below

---

## 📋 Pre-Deployment Testing

Before deploying to production, test the following in development:

### Test 1: Add New Location with New Fields
1. Go to Admin Panel → Data Admin section
2. Fill out the "Add New Food Source" form
3. Select a value for "Soft Rating"
4. Enter text in "Michaele's Notes"
5. Submit the form
6. Verify the location was created successfully

### Test 2: Approve Pending Location with Modal
1. Go to Admin Panel → Pending Locations section
2. Click "Approve" on a pending location
3. Verify the modal appears
4. Select a "Soft Rating" from dropdown
5. Enter notes in "Michaele's Notes" textarea
6. Click "Accept"
7. Verify the location was approved successfully

### Test 3: Database Verification
```bash
# Run verification script
./scripts/verify-migration.sh

# Check a record in database
docker exec -i expatdb psql -U expatuser -d expatdb << 'EOF'
SELECT id, name, soft_rating, LEFT(michaeles_notes, 50) as notes
FROM places
WHERE soft_rating IS NOT NULL
LIMIT 1;
EOF
```

---

## 🎯 Production Deployment Instructions

### Option A: Fresh Production Deployment (New Database)

**Use this if**: You're deploying to a new server or can afford downtime

```bash
# 1. Pull latest code
git pull origin main

# 2. Stop existing containers (if any)
docker-compose -f docker-compose.prod.yml down -v

# 3. Start fresh containers (migrations run automatically)
docker-compose -f docker-compose.prod.yml up -d

# 4. Wait for containers to be healthy
docker ps

# 5. Verify migration
./scripts/verify-migration.sh expatdb-prod

# 6. Check app logs
docker logs expat-app-prod --tail 50
```

### Option B: Zero-Downtime Update (Existing Database)

**Use this if**: You have a running production database with data

```bash
# 1. Pull latest code
git pull origin main

# 2. Apply database migration FIRST (while app is still running)
docker exec -i expatdb-prod psql -U expatuser -d expatdb < migrations/0001_add_soft_rating_michaeles_notes.sql

# 3. Verify migration succeeded
./scripts/verify-migration.sh expatdb-prod

# 4. Build and deploy new app version
docker-compose -f docker-compose.prod.yml build app
docker-compose -f docker-compose.prod.yml up -d app

# 5. Monitor deployment
docker logs -f expat-app-prod

# 6. Verify app is healthy
curl -s https://your-domain.com/api/places | head -c 100
```

---

## 🧪 Post-Deployment Verification

### 1. Health Checks
```bash
# Check all containers are running
docker ps --format "table {{.Names}}\t{{.Status}}"

# Should show:
# expat-app-prod    Up X minutes (healthy)
# expatdb-prod      Up X minutes (healthy)
```

### 2. Database Verification
```bash
./scripts/verify-migration.sh expatdb-prod
```

Expected output:
```
✨ Migration verification complete!

Summary:
  • Database container: expatdb-prod ✅
  • Database connection: Working ✅
  • soft_rating column: Exists (VARCHAR(50)) ✅
  • michaeles_notes column: Exists (TEXT) ✅
  • Insert capability: Working ✅
```

### 3. Application Testing
1. Log into admin panel
2. Test adding a new location with the new fields
3. Test approving a pending location with the modal
4. Verify data is saved correctly in database

### 4. Check Logs
```bash
# Check for errors
docker logs expat-app-prod --tail 100 | grep -i error

# Should return no critical errors
```

---

## 🔄 Rollback Plan

If you need to rollback the changes:

### Rollback Database Only
```bash
# Remove the new columns
docker exec -i expatdb-prod psql -U expatuser -d expatdb << 'EOF'
ALTER TABLE places DROP COLUMN IF EXISTS soft_rating;
ALTER TABLE places DROP COLUMN IF EXISTS michaeles_notes;
EOF
```

### Rollback Entire Deployment
```bash
# 1. Checkout previous version
git checkout <previous-commit-hash>

# 2. Rollback database (see above)

# 3. Rebuild and redeploy app
docker-compose -f docker-compose.prod.yml build app
docker-compose -f docker-compose.prod.yml up -d app
```

---

## 📊 Monitoring

After deployment, monitor:

1. **Application Logs**
   ```bash
   docker logs -f expat-app-prod
   ```

2. **Database Performance**
   ```bash
   docker exec -i expatdb-prod psql -U expatuser -d expatdb -c "
   SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del
   FROM pg_stat_user_tables
   WHERE tablename = 'places';
   "
   ```

3. **API Response Times**
   - Monitor `/api/places` endpoint
   - Monitor `/api/admin/approve-place` endpoint

4. **Error Rates**
   - Check application error logs
   - Monitor database connection errors

---

## 📝 Notes

- Migration is idempotent (safe to run multiple times)
- New columns are nullable (won't break existing data)
- No data migration required
- Both dev and prod configurations updated
- Comprehensive documentation provided

---

## 🆘 Troubleshooting

### Issue: Migration fails with "relation already exists"
**Solution**: This is fine if you've run it before. Check if columns exist:
```bash
docker exec -i expatdb-prod psql -U expatuser -d expatdb -c "\d places" | grep -E "soft_rating|michaeles_notes"
```

### Issue: App won't start after deployment
**Solution**: Check logs for schema errors:
```bash
docker logs expat-app-prod --tail 50
```

### Issue: Modal doesn't appear in admin panel
**Solution**:
1. Clear browser cache
2. Check console for JavaScript errors
3. Verify app container is running latest code

### Issue: Data not saving
**Solution**:
1. Check database columns exist
2. Check API endpoint is receiving data
3. Check browser network tab for errors

---

## ✅ Sign-off Checklist

Before marking deployment as complete:

- [ ] All tests passed in development
- [ ] Migration applied successfully in production
- [ ] App deployed and healthy
- [ ] Admin panel tested with new features
- [ ] No errors in application logs
- [ ] No errors in database logs
- [ ] Approval modal works correctly
- [ ] Data saves correctly in database
- [ ] Documentation reviewed and accurate

---

**Deployment Date**: _____________

**Deployed By**: _____________

**Production URL**: _____________

**Notes**:
_____________________________________________________________________________
_____________________________________________________________________________
