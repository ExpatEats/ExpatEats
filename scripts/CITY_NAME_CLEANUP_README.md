# City Name Cleanup Scripts

Two scripts for standardizing city names to match the cities table.

---

## Standard City Names

The following city names should be used consistently:

- ✅ **Mafra/Ourem** (includes Mafra, Ourem, Ericeira areas)
- ✅ **Parede/Carcavelos** (includes Parede, Carcavelos, Paço de Arcos)
- ✅ **Lisbon**
- ✅ **Cascais**
- ✅ **Sintra**
- ✅ **Oeiras**
- ✅ **Online**

---

## Script 1: `update_places_city_names.sql`

**Purpose:** Updates existing places in the database

**Location:** `scripts/update_places_city_names.sql`

### What it does:
- Updates any place with city containing "Mafra" or "Ourem" → "Mafra/Ourem"
- Updates any place with city containing "Parede" or "Carcavelos" → "Parede/Carcavelos"
- Shows before/after comparison
- Identifies any remaining mismatches

### When to use:
- After bulk importing CSV data with inconsistent city names
- After discovering places with non-standard city names
- As part of database cleanup/maintenance

### How to run:

**Local Docker:**
```bash
docker exec -i expatdb psql -U expatuser -d expatdb < scripts/update_places_city_names.sql
```

**Production:**
```bash
psql -h <host> -U <user> -d <database> -f scripts/update_places_city_names.sql
```

### What it updates:

**Examples:**
```
"Mafra" → "Mafra/Ourem"
"Ourem" → "Mafra/Ourem"
"Ericeira" → "Mafra/Ourem"
"Parede" → "Parede/Carcavelos"
"Carcavelos" → "Parede/Carcavelos"
```

---

## Script 2: `clean-city-names.cjs`

**Purpose:** Cleans city names in JSON files BEFORE importing to database

**Location:** `bulk_script/clean-city-names.cjs`

### What it does:
- Reads a JSON file with place data
- Standardizes all city names to match cities table
- Writes cleaned data back (can overwrite or create new file)
- Shows what was changed

### When to use:
- BEFORE running bulk upload script
- After converting CSV to JSON
- When preparing data for import

### How to run:

**Option 1: Overwrite existing file**
```bash
cd bulk_script
node clean-city-names.cjs initialPlacesData.json
```

**Option 2: Create new cleaned file**
```bash
cd bulk_script
node clean-city-names.cjs initialPlacesData.json initialPlacesData-cleaned.json
```

### Example output:
```
============================================================
City Name Standardization
============================================================

Reading: initialPlacesData.json
Found 85 places

Standardizing city names:
  ✓ Standardized: "Mafra" → "Mafra/Ourem"
  ✓ Standardized: "Parede" → "Parede/Carcavelos"
  ✓ Standardized: "Ericeira" → "Mafra/Ourem"

Changes made: 12

Writing: initialPlacesData.json

✓ Complete!

City distribution:
  Lisbon: 45
  Online: 15
  Cascais: 10
  Mafra/Ourem: 8
  Parede/Carcavelos: 4
  Sintra: 2
  Oeiras: 1
```

---

## Recommended Workflow

### For New Data Imports:

1. **Convert CSV to JSON** (if needed)
   ```bash
   cd bulk_script
   node convert-csv-to-json.cjs
   ```

2. **Clean city names BEFORE upload**
   ```bash
   node clean-city-names.cjs initialPlacesData.json
   ```

3. **Upload to database**
   ```bash
   export API_URL="http://localhost:3001"
   export SESSION_COOKIE="your-session-cookie"
   export SKIP_GEOCODE="true"
   node upload.cjs initialPlacesData.json
   ```

4. **Verify no mismatches**
   ```sql
   SELECT DISTINCT city FROM places
   WHERE city NOT IN (SELECT name FROM cities);
   ```

### For Existing Database Cleanup:

1. **Check for non-standard city names**
   ```sql
   SELECT DISTINCT city, COUNT(*)
   FROM places
   GROUP BY city
   ORDER BY city;
   ```

2. **Run cleanup script**
   ```bash
   docker exec -i expatdb psql -U expatuser -d expatdb < scripts/update_places_city_names.sql
   ```

3. **Verify results**
   ```sql
   SELECT city, COUNT(*) as count
   FROM places
   GROUP BY city
   ORDER BY city;
   ```

---

## Current Status (as of last run)

**Cities Table:**
```
✓ Lisbon
✓ Cascais
✓ Sintra
✓ Oeiras
✓ Mafra/Ourem
✓ Parede/Carcavelos
✓ Online
```

**Places Table:**
```
✓ 23 total places
✓ 0 mismatched cities
✓ All cities match cities table
```

**Distribution:**
- Cascais: 4 places
- Lisbon: 4 places
- Oeiras: 2 places
- Online: 10 places
- Sintra: 3 places
- Mafra/Ourem: 0 places
- Parede/Carcavelos: 0 places

---

## Notes

- **Case-insensitive matching:** Scripts use `ILIKE` for SQL and `.toLowerCase()` for JavaScript
- **Transaction safety:** SQL script wrapped in BEGIN/COMMIT
- **Backup recommended:** Always backup before running UPDATE scripts
- **Idempotent:** Safe to run multiple times (won't double-update)
