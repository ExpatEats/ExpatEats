# Map View Issues - Diagnosis & Fixes

## Problem Reported
Map markers not showing for all search results, even though data has been geocoded. Only 1 or a few markers visible instead of all results.

---

## Root Causes Found

### Issue #1: Bounds Calculation Logic ✅ FIXED

**Location:** `client/src/components/MapView.tsx` (line 236-239)

**Problem:**
```typescript
// OLD CODE - BUGGY
if (hasValidAddress || places.length === 1) {
    bounds.extend(coordinates);
    validCoordinates = true;
}
```

The map bounds were **only extended for places with valid geocoded coordinates**. Places without valid coordinates got markers at city centers, but those coordinates weren't added to the bounds calculation.

**Result:**
- All places got markers (either at real location or city center)
- But map only fit bounds to places with valid coordinates
- Markers at city centers ended up **outside the visible map area**

**Fix Applied:**
```typescript
// NEW CODE - FIXED
// Always extend bounds for all markers, not just valid addresses
// This ensures all markers are visible on the map
bounds.extend(coordinates);
validCoordinates = true;
```

**Impact:** Now ALL markers will be visible when the map loads, regardless of whether they have geocoded coordinates or use city center fallback.

---

### Issue #2: Missing Coordinate Validation ✅ FIXED

**Location:** `client/src/components/MapView.tsx` (line 149-152)

**Problem:**
```typescript
// OLD CODE - NO RANGE VALIDATION
if (!isNaN(lat) && !isNaN(lng)) {
    coordinates = [lng, lat];
    hasValidAddress = true;
}
```

The code only checked if coordinates could be parsed as numbers, but didn't validate they were in valid geographic ranges:
- **Latitude:** Must be between -90 and 90
- **Longitude:** Must be between -180 and 180

**Fix Applied:**
```typescript
// NEW CODE - WITH VALIDATION
if (
    !isNaN(lat) && !isNaN(lng) &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
) {
    coordinates = [lng, lat];
    hasValidAddress = true;
} else if (!isNaN(lat) && !isNaN(lng)) {
    // Log invalid coordinates for debugging
    console.warn(`Invalid coordinates for ${place.name}: lat=${lat}, lng=${lng}`);
}
```

**Impact:** Invalid coordinates are now rejected and logged, preventing broken markers.

---

### Issue #3: Bad Data - Time Out Market Coordinates ⚠️ NEEDS SQL FIX

**Location:** Database `places` table, ID 86

**Problem:**
```
Name: Time Out Market
Latitude:  38.70856 ✓ (valid)
Longitude: -914591  ✗ (INVALID - should be -9.14591)
```

The longitude is missing a decimal point! Should be `-9.14591` not `-914591`.

**Source:** Excel file `supplementsadded.xlsx` row 86 has the bad data.

**Fixes Created:**

1. **SQL Script:** `scripts/fix_time_out_market_coordinates.sql`
   ```sql
   UPDATE places
   SET longitude = '-9.14591'
   WHERE (name = 'Time Out Market' OR id = 86)
   AND longitude = '-914591';
   ```

2. **JSON File:** Already fixed in `bulk_script/supplements-rows-86-97.json`

---

## Summary of Changes

### Code Changes (Already Applied):
1. ✅ **MapView.tsx** - Fixed bounds calculation to include all markers
2. ✅ **MapView.tsx** - Added coordinate range validation
3. ✅ **supplements-rows-86-97.json** - Fixed Time Out Market coordinates

### Database Changes (Need to Run):
1. ⚠️ **Fix Time Out Market coordinates in production**
   ```bash
   # Run this SQL script on production:
   psql -h <host> -U <user> -d <db> -f scripts/fix_time_out_market_coordinates.sql
   ```

2. ⚠️ **Fix supplement categories in production** (from earlier issue)
   ```bash
   # Run this SQL script on production:
   psql -h <host> -U <user> -d <db> -f scripts/fix_supplement_categories.sql
   ```

3. ⚠️ **Approve new supplement places**
   ```sql
   UPDATE places
   SET status = 'approved', reviewed_at = NOW()
   WHERE id BETWEEN 86 AND 97;
   ```

---

## Testing Checklist

After deploying fixes:

- [ ] Code changes deployed to production
- [ ] Time Out Market coordinates fixed in database
- [ ] Supplement categories fixed in database
- [ ] Places 86-97 approved
- [ ] Test search with multiple results
- [ ] Verify all markers show on map
- [ ] Check map bounds fit all markers
- [ ] Verify invalid coordinates log warnings (check browser console)
- [ ] Test with places that have no coordinates (should use city center)

---

## Expected Behavior After Fix

### Before:
- ❌ Some markers invisible (outside map bounds)
- ❌ Invalid coordinates (-914591) not rejected
- ❌ Map only fit to valid geocoded places

### After:
- ✅ All markers visible on map load
- ✅ Invalid coordinates rejected with warning logged
- ✅ Map fits bounds to include ALL markers
- ✅ Places without coordinates show at city center
- ✅ Places with valid coordinates show at exact location

---

## Additional Recommendations

### 1. Data Quality Check
Run this query to find any other coordinate issues:

```sql
SELECT id, name, latitude, longitude
FROM places
WHERE status = 'approved'
AND (
    -- Check for invalid ranges
    CAST(latitude AS FLOAT) < -90 OR CAST(latitude AS FLOAT) > 90
    OR CAST(longitude AS FLOAT) < -180 OR CAST(longitude AS FLOAT) > 180
    -- Check for obviously wrong values (missing decimals)
    OR ABS(CAST(longitude AS FLOAT)) > 180
);
```

### 2. Excel Data Validation
Before importing from Excel:
- Verify latitude is between -90 and 90
- Verify longitude is between -180 and 180
- Check for missing decimal points (Portugal longitude should be around -9, not -900 or -914591)

### 3. Frontend Validation
Consider adding coordinate validation when places are submitted via admin panel:
- Reject coordinates outside valid ranges
- Show warning if coordinates seem unusual for Portugal region
- Portugal typical ranges: Lat 37-42°N, Lng 6-9°W

---

## Files Modified

### Client Code:
- ✅ `client/src/components/MapView.tsx`

### Data Files:
- ✅ `bulk_script/supplements-rows-86-97.json`

### SQL Scripts Created:
- ✅ `scripts/fix_time_out_market_coordinates.sql`
- ✅ `scripts/fix_supplement_categories.sql` (from earlier)

### Documentation:
- ✅ `scripts/MAP_VIEW_FIX_SUMMARY.md` (this file)
