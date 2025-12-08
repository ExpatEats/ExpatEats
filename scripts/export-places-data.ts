#!/usr/bin/env tsx

/**
 * Export Places Data for Production
 *
 * This script exports all places data from your development database
 * into a SQL file that can be imported into production.
 *
 * Usage:
 *   tsx scripts/export-places-data.ts
 */

import { db } from "../server/db.js";
import { places } from "../shared/schema.js";
import { writeFileSync } from "fs";

async function exportPlacesData() {
    console.log("🔍 Fetching all places from development database...");

    try {
        const allPlaces = await db.select().from(places);

        console.log(`✅ Found ${allPlaces.length} places`);

        if (allPlaces.length === 0) {
            console.log("⚠️  No places found in database. Run 'npm run seed' first.");
            process.exit(1);
        }

        // Generate SQL INSERT statements
        let sql = `-- ================================================== \n`;
        sql += `-- PLACES DATA EXPORT\n`;
        sql += `-- Generated: ${new Date().toISOString()}\n`;
        sql += `-- Total places: ${allPlaces.length}\n`;
        sql += `-- ==================================================\n\n`;

        sql += `BEGIN;\n\n`;

        for (const place of allPlaces) {
            // Escape single quotes in strings
            const escape = (str: any) => {
                if (str === null || str === undefined) return 'NULL';
                if (typeof str === 'string') {
                    return `'${str.replace(/'/g, "''")}'`;
                }
                if (typeof str === 'boolean') {
                    return str ? 'true' : 'false';
                }
                if (Array.isArray(str)) {
                    // PostgreSQL array format
                    const escaped = str.map(item => `"${String(item).replace(/"/g, '\\"')}"`).join(',');
                    return `ARRAY[${escaped}]`;
                }
                return str;
            };

            sql += `INSERT INTO places (\n`;
            sql += `    unique_id, name, description, address, city, region, country, category, tags,\n`;
            sql += `    latitude, longitude, phone, email, instagram, website,\n`;
            sql += `    gluten_free, dairy_free, nut_free, vegan, organic, local_farms,\n`;
            sql += `    fresh_vegetables, farm_raised_meat, no_processed, kid_friendly,\n`;
            sql += `    bulk_buying, zero_waste, image_url, status, submitted_by,\n`;
            sql += `    soft_rating, michaeles_notes\n`;
            sql += `) VALUES (\n`;
            sql += `    ${escape(place.uniqueId)}, ${escape(place.name)}, ${escape(place.description)},\n`;
            sql += `    ${escape(place.address)}, ${escape(place.city)}, ${escape(place.region)},\n`;
            sql += `    ${escape(place.country)}, ${escape(place.category)}, ${escape(place.tags)},\n`;
            sql += `    ${escape(place.latitude)}, ${escape(place.longitude)}, ${escape(place.phone)},\n`;
            sql += `    ${escape(place.email)}, ${escape(place.instagram)}, ${escape(place.website)},\n`;
            sql += `    ${escape(place.glutenFree)}, ${escape(place.dairyFree)}, ${escape(place.nutFree)},\n`;
            sql += `    ${escape(place.vegan)}, ${escape(place.organic)}, ${escape(place.localFarms)},\n`;
            sql += `    ${escape(place.freshVegetables)}, ${escape(place.farmRaisedMeat)}, ${escape(place.noProcessed)},\n`;
            sql += `    ${escape(place.kidFriendly)}, ${escape(place.bulkBuying)}, ${escape(place.zeroWaste)},\n`;
            sql += `    ${escape(place.imageUrl)}, ${escape(place.status)}, ${escape(place.submittedBy)},\n`;
            sql += `    ${escape(place.softRating)}, ${escape(place.michaelesNotes)}\n`;
            sql += `);\n\n`;
        }

        sql += `COMMIT;\n\n`;
        sql += `-- ==================================================\n`;
        sql += `-- SUMMARY\n`;
        sql += `-- ==================================================\n`;
        sql += `-- Total places inserted: ${allPlaces.length}\n`;
        sql += `-- ==================================================\n`;

        // Write to file
        const filename = 'production_places_data.sql';
        writeFileSync(filename, sql, 'utf-8');

        console.log(`\n✅ Successfully exported ${allPlaces.length} places`);
        console.log(`📄 Saved to: ${filename}`);
        console.log(`\n📋 Next steps:`);
        console.log(`   1. Open ${filename} in DataGrip`);
        console.log(`   2. Connect to your Render production database`);
        console.log(`   3. Execute the script to import all places`);
        console.log(`   4. Verify the import with: SELECT COUNT(*) FROM places;`);

    } catch (error) {
        console.error("❌ Export failed:", error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

// Run the export
exportPlacesData();
