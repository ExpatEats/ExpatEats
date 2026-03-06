#!/usr/bin/env node

/**
 * Generate SQL INSERT statements from initialPlacesData.json
 *
 * This script reads the JSON file and generates INSERT statements
 * that can be added to the full_places_migration.sql file
 */

const fs = require('fs');
const path = require('path');

const JSON_PATH = path.join(__dirname, '..', 'bulk_script', 'initialPlacesData.json');
const OUTPUT_PATH = path.join(__dirname, 'places_inserts.sql');

function escapeSqlString(str) {
    if (str === null || str === undefined || str === '') return 'NULL';
    return "'" + String(str).replace(/'/g, "''") + "'";
}

function generateInsertStatements() {
    console.log('Reading JSON file...');
    const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));

    console.log(`Found ${data.length} places to convert`);

    const inserts = [];

    data.forEach((place, index) => {
        // Build the INSERT statement
        const values = [
            escapeSqlString(place.name),
            escapeSqlString(place.description),
            escapeSqlString(place.address),
            escapeSqlString(place.city),
            escapeSqlString(place.region),
            escapeSqlString(place.country),
            escapeSqlString(place.category),
            escapeSqlString(place.phone),
            escapeSqlString(place.email),
            escapeSqlString(place.website),
            escapeSqlString(place.instagram),
            escapeSqlString(place.latitude),
            escapeSqlString(place.longitude),
            escapeSqlString(place.cityTags),
            escapeSqlString(place.badges),
            place.groceryAndMarket ? 'true' : 'false',
            place.supplements ? 'true' : 'false',
            place.glutenFree ? 'true' : 'false',
            place.dairyFree ? 'true' : 'false',
            place.nutFree ? 'true' : 'false',
            place.vegan ? 'true' : 'false',
            place.organic ? 'true' : 'false',
            place.localFarms ? 'true' : 'false',
            place.freshVegetables ? 'true' : 'false',
            place.farmRaisedMeat ? 'true' : 'false',
            place.noProcessed ? 'true' : 'false',
            place.kidFriendly ? 'true' : 'false',
            place.bulkBuying ? 'true' : 'false',
            place.zeroWaste ? 'true' : 'false',
            place.generalSupplements ? 'true' : 'false',
            place.omega3 ? 'true' : 'false',
            place.veganSupplements ? 'true' : 'false',
            place.onlineRetailer ? 'true' : 'false',
            place.vitamins ? 'true' : 'false',
            place.herbalRemedies ? 'true' : 'false',
            place.organicSupplements ? 'true' : 'false',
            place.sportsNutrition ? 'true' : 'false',
            place.practitionerGrade ? 'true' : 'false',
            place.hypoallergenic ? 'true' : 'false',
            escapeSqlString(place.status || 'approved'),
            escapeSqlString(place.submittedBy)
        ];

        const insert = `INSERT INTO places (
    name, description, address, city, region, country, category,
    phone, email, website, instagram, latitude, longitude,
    city_tags, badges,
    grocery_and_market, supplements,
    gluten_free, dairy_free, nut_free, vegan, organic,
    local_farms, fresh_vegetables, farm_raised_meat, no_processed,
    kid_friendly, bulk_buying, zero_waste,
    general_supplements, omega3, vegan_supplements, online_retailer,
    vitamins, herbal_remedies, organic_supplements, sports_nutrition,
    practitioner_grade, hypoallergenic,
    status, submitted_by
) VALUES (
    ${values.join(',\n    ')}
);`;

        inserts.push(insert);
    });

    // Write to output file
    const output = `-- =====================================================
-- PLACES DATA INSERT STATEMENTS
-- Generated from initialPlacesData.json
-- Total records: ${data.length}
-- =====================================================

${inserts.join('\n\n')}

-- =====================================================
-- END OF INSERT STATEMENTS
-- =====================================================
`;

    fs.writeFileSync(OUTPUT_PATH, output, 'utf8');
    console.log(`\n✓ Generated ${inserts.length} INSERT statements`);
    console.log(`✓ Output written to: ${OUTPUT_PATH}`);
    console.log(`\nTo use this file:`);
    console.log(`1. Review the generated SQL in: ${OUTPUT_PATH}`);
    console.log(`2. Copy the INSERT statements`);
    console.log(`3. Paste them into: scripts/full_places_migration.sql`);
    console.log(`   (Replace the "-- Placeholder" comment)`);
}

try {
    generateInsertStatements();
} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}
