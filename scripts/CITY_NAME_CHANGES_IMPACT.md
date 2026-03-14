# City Name Changes - Impact Analysis

## Changes Made

The following city names have been updated:

1. **Parede** → **Parede/Carcavelos**
2. **Mafra** → **Mafra/Ourem**

---

## How This Affects the Search Feature

### ✅ **What WILL Work:**

#### 1. **City Selection Dropdowns**
- The Find My Food search page displays cities from the `cities` table
- Users will now see "Parede/Carcavelos" and "Mafra/Ourem" in location selection
- When clicked, these will correctly filter places

#### 2. **Existing Places with Matching Names**
- Any places in the `places` table with city = "Parede/Carcavelos" will show up when that location is selected
- Any places with city = "Mafra/Ourem" will show up when that location is selected

---

### ⚠️ **Potential Issues:**

#### 1. **Places Table Data Mismatch**
The search filter uses **exact string matching** on the `places.city` column:

```typescript
// In storage.ts - line 119-142
if (filters?.city) {
    const capitalizedCities = cities.map(
        (city) => city.charAt(0).toUpperCase() + city.slice(1).toLowerCase()
    );
    whereConditions.push(inArray(places.city, capitalizedCities));
}
```

**Problem:**
- If a place has `city = "Mafra"` in the places table
- But the cities table now has `name = "Mafra/Ourem"`
- That place **will NOT appear** when "Mafra/Ourem" is selected

**Current Status:**
```
✓ No places currently have city = "Parede" or city = "Mafra"
✓ All 23 places have: Cascais, Lisbon, Oeiras, Online, or Sintra
✓ No immediate data mismatch issues
```

#### 2. **Future Data Entry**
When adding new places manually or via CSV:
- Users/admins must enter city as "Parede/Carcavelos" (not "Parede")
- Users/admins must enter city as "Mafra/Ourem" (not "Mafra")
- Otherwise, those places won't show up in search

---

## Recommended Actions

### **Option 1: Keep Current Approach (Recommended)**
✅ **Best if:** You rarely add places in these locations

**Requirements:**
- When adding new places via admin panel, select "Parede/Carcavelos" or "Mafra/Ourem"
- When bulk uploading via CSV, use exact names: "Parede/Carcavelos" and "Mafra/Ourem"
- Update existing places if any have old city names (currently there are none)

**How to check for mismatches:**
```sql
SELECT DISTINCT city FROM places
WHERE city NOT IN (SELECT name FROM cities);
```

---

### **Option 2: Update Places Table to Allow Partial Matching**
⚠️ **More complex** - Would require code changes

**What would change:**
```typescript
// Instead of exact match
inArray(places.city, capitalizedCities)

// Use partial match (like '%Mafra%')
or(
    places.city.like('%Mafra%'),
    places.city.like('%Parede%')
)
```

**Pros:**
- Places with city = "Mafra" would show when "Mafra/Ourem" is selected
- More forgiving for data entry

**Cons:**
- Could create unexpected matches
- More complex query logic
- Potential performance impact

---

### **Option 3: Update Existing CSV Data**
If you're using the CSV file `initialPlacesData.csv`:

**Before importing:**
1. Open `bulk_script/initialPlacesData.csv`
2. Find/Replace:
   - "Parede" → "Parede/Carcavelos"
   - "Mafra" → "Mafra/Ourem"
3. Re-run JSON generation and upload

---

## Testing Checklist

After making these changes, verify:

- [ ] Visit Find My Food page
- [ ] City dropdown shows "Parede/Carcavelos" and "Mafra/Ourem"
- [ ] Selecting "Parede/Carcavelos" filters places correctly
- [ ] Selecting "Mafra/Ourem" filters places correctly
- [ ] Run query to check for data mismatches:
  ```sql
  SELECT DISTINCT city FROM places
  WHERE city NOT IN (SELECT name FROM cities);
  ```
- [ ] If adding new places, use exact city names

---

## Summary

**Impact Level:** 🟡 **Medium**

- ✅ **UI will display correct names** (Parede/Carcavelos, Mafra/Ourem)
- ✅ **No immediate data issues** (no existing places with old names)
- ⚠️ **Future data entry** must use exact names
- ⚠️ **CSV imports** must have updated city names

**Recommended:** Keep current approach (Option 1) and ensure future data uses the new city names.
