#!/usr/bin/env node

/**
 * Generate SQL INSERT statements from initialPlacesData.json
 */

const fs = require('fs');
const path = require('path');

const JSON_PATH = path.join(__dirname, 'initialPlacesData.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'scripts', 'insert_places_data.sql');

console.log('='.repeat(60));
console.log('SQL INSERT Statement Generator');
console.log('='.repeat(60));
console.log();

// Read JSON file
console.log(`Reading JSON file: ${JSON_PATH}`);
const places = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
console.log(`Found ${places.length} places`);
console.log();

// Helper to escape single quotes in SQL strings
function escapeSql(value) {
    if (value === null || value === undefined) {
        return 'NULL';
    }
    if (typeof value === 'boolean') {
        return value ? 'true' : 'false';
    }
    if (typeof value === 'number') {
        return value;
    }
    // Escape single quotes by doubling them
    return `'${String(value).replace(/'/g, "''")}'`;
}

// Generate SQL
let sql = `-- =====================================================
-- INSERT PLACES DATA FROM CSV
-- =====================================================
-- This script inserts all ${places.length} places from initialPlacesData.csv
-- =====================================================

BEGIN;

`;

places.forEach((place, index) => {
    const values = [
        escapeSql(place.name),
        escapeSql(place.description),
        escapeSql(place.address),
        escapeSql(place.city),
        escapeSql(place.region),
        escapeSql(place.country),
        escapeSql(place.category),
        escapeSql(place.latitude),
        escapeSql(place.longitude),
        escapeSql(place.phone),
        escapeSql(place.email),
        escapeSql(place.instagram),
        escapeSql(place.website),
        escapeSql(place.groceryAndMarket),
        escapeSql(place.supplements),
        escapeSql(place.cityTags),
        escapeSql(place.badges),
        escapeSql(place.glutenFree),
        escapeSql(place.dairyFree),
        escapeSql(place.nutFree),
        escapeSql(place.vegan),
        escapeSql(place.organic),
        escapeSql(place.localFarms),
        escapeSql(place.freshVegetables),
        escapeSql(place.farmRaisedMeat),
        escapeSql(place.noProcessed),
        escapeSql(place.kidFriendly),
        escapeSql(place.bulkBuying),
        escapeSql(place.zeroWaste),
        escapeSql(place.generalSupplements),
        escapeSql(place.omega3),
        escapeSql(place.veganSupplements),
        escapeSql(place.onlineRetailer),
        escapeSql(place.vitamins),
        escapeSql(place.herbalRemedies),
        escapeSql(place.organicSupplements),
        escapeSql(place.sportsNutrition),
        escapeSql(place.practitionerGrade),
        escapeSql(place.hypoallergenic),
        escapeSql(place.status || 'approved'),
        escapeSql(place.submittedBy),
    ];

    sql += `INSERT INTO places (
    name, description, address, city, region, country, category,
    latitude, longitude, phone, email, instagram, website,
    grocery_and_market, supplements, city_tags, badges,
    gluten_free, dairy_free, nut_free, vegan, organic, local_farms,
    fresh_vegetables, farm_raised_meat, no_processed, kid_friendly,
    bulk_buying, zero_waste,
    general_supplements, omega3, vegan_supplements, online_retailer,
    vitamins, herbal_remedies, organic_supplements, sports_nutrition,
    practitioner_grade, hypoallergenic,
    status, submitted_by
) VALUES (
    ${values.join(', ')}
);

`;
});

sql += `COMMIT;

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT COUNT(*) as total_places FROM places;
SELECT status, COUNT(*) FROM places GROUP BY status;
`;

// Write to file
console.log(`Writing SQL file: ${OUTPUT_PATH}`);
fs.writeFileSync(OUTPUT_PATH, sql, 'utf8');

console.log('✓ SQL generation complete!');
console.log();
console.log('Summary:');
console.log(`  Input:  ${JSON_PATH}`);
console.log(`  Output: ${OUTPUT_PATH}`);
console.log(`  Places: ${places.length}`);
console.log();
console.log('Next step:');
console.log('  docker exec -i expatdb psql -U expatuser -d expatdb < scripts/insert_places_data.sql');
console.log();
