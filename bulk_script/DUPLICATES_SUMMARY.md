# Duplicate Locations Analysis

## Summary

Found **313 potential duplicate issues** across 4 categories:

1. **Same Address**: 84 pairs
2. **Same Coordinates**: 127 pairs
3. **Same Name & City**: 88 pairs
4. **Similar Names**: 14 pairs

## Main Issues Identified

### 1. Multi-City Businesses (MAJOR ISSUE)

Many businesses were listed as serving multiple cities (e.g., "Lisbon, Cascais, Sintra, Oeiras"). When we split these, we created duplicate entries with the same address but different cities.

**Examples:**

- **Jacaranda Teas** - Listed 4 times (Lisbon, Cascais, Sintra, Oeiras)
  - All have address: "Lisbon, Portugal"
  - These are likely delivery/online businesses serving multiple areas

- **The Hummus Shack** - Listed 4 times
  - All have address: "Cascais, Portugal"
  - Similar issue

- **Nathalie's Healthy Kitchen** - Listed 4 times
  - All have address: "Cascais, Portugal"

- **Quinta do Arneiro** - Listed 4 times
  - All have same address: "Quinta do Arneiro, 2665-004 Azueira, Portugal"
  - Same coordinates on all entries

- **Talhos das Manas** - Listed 4 times
  - Same address across all entries

### 2. Celeiro Duplicate

- **Celeiro** appears twice at "R. Abílio Mendes 16A 1500, 1500-458 Lisboa" (indices 53 & 63)
  - Exact duplicate from Excel data

### 3. Restaurant Duplicates (Minor)

- **Cria Padaria Artesanal** and **SULT** both have address "[TBD] Cascais"
  - Not real duplicates, just placeholder addresses

## Recommended Actions

### Option A: Keep All Entries (For businesses serving multiple areas)

Some businesses legitimately serve multiple cities:
- Online delivery services
- Farms that deliver to multiple locations
- Businesses with mobile/pop-up presence

**Should KEEP multiple entries for:**
- Jacaranda Teas (delivery service)
- The Hummus Shack (multiple locations or delivery)
- Nathalie's Healthy Kitchen (catering/delivery)
- Quinta do Arneiro (farm with delivery)
- Talhos das Manas (butcher with delivery)
- Herdade do Freixo do Meio (farm with multiple pickup points)
- Raizes Mercearia a Granel (chain or delivery)
- Nourish and Nosh PT (catering/delivery)
- The Broth Kitchen (delivery service)

### Option B: Deduplicate to Single Entry

For businesses with physical locations, keep one entry with:
- Primary/main location city
- Most complete address
- Coordinates if available

**Should DEDUPLICATE:**
- Celeiro at R. Abílio Mendes (keep one)
- Any businesses that are actually chains with ONE location per city

## Recommended Solution

I can create a script that:

1. **Identifies true duplicates** (same name + same exact address + same coordinates)
2. **Keeps ONE entry per unique business**
3. **For multi-city businesses**, choose the entry with:
   - Most complete address (not just "City, Portugal")
   - Has coordinates
   - Primary city (usually the first city listed)

4. **Adds a note** to multi-city businesses indicating they serve multiple areas

Would you like me to:

A. **Create a deduplication script** to automatically remove duplicates
B. **Provide a list** of specific duplicates for you to manually review
C. **Keep all entries as-is** (businesses can serve multiple cities)

## Technical Details

### Businesses with Multiple Entries (Likely Delivery/Multi-City Services)

| Business Name | Times Listed | Cities | Address Type |
|---------------|--------------|---------|--------------|
| Jacaranda Teas | 4 | Lisbon, Cascais, Sintra, Oeiras | Vague |
| The Hummus Shack | 4 | Lisbon, Cascais, Sintra, Oeiras | Vague |
| Nathalie's Healthy Kitchen | 4 | Lisbon, Cascais, Sintra, Oeiras | Vague |
| Quinta do Arneiro | 4 | Lisbon, Cascais, Sintra, Oeiras | Specific |
| Talhos das Manas | 4 | Lisbon, Cascais, Sintra, Oeiras | Specific |
| Raizes Mercearia a Granel | 4 | Lisbon, Cascais, Sintra, Oeiras | Specific |
| Herdade do Freixo do Meio | 3 | Lisbon, Cascais, Sintra | Specific |
| Nourish and Nosh PT | 4 | Lisbon, Cascais, Sintra, Oeiras | Specific |
| Cayu veg | 2 | Cascais, Sintra | Vague |
| Terra Leaf | 2 | Cascais, Sintra | Specific |
| Quinta Linda | 2 | Cascais, Sintra | Specific |
| Qunita das Abelhas | 2 | Lisbon, Cascais | Specific |
| Qunita do Montalto | 2 | Lisbon, Cascais | Specific |
| The Broth Kitchen | 4 | Lisbon, Cascais, Sintra, Oeiras | Vague |

### True Excel Duplicates

| Business Name | Location | Issue |
|---------------|----------|-------|
| Celeiro | R. Abílio Mendes, Lisboa | Listed twice in Excel (rows 53 & 63) |
