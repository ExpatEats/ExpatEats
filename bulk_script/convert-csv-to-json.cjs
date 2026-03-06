#!/usr/bin/env node

/**
 * CSV to JSON Converter for initialPlacesData.csv
 *
 * This script converts the initialPlacesData.csv file to a JSON format
 * compatible with the bulk upload script.
 *
 * Usage:
 *   node convert-csv-to-json.js
 *
 * Output:
 *   initialPlacesData.json
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CSV_PATH = path.join(__dirname, '..', 'attached_assets', 'locations', 'initialPlacesData.csv');
const OUTPUT_PATH = path.join(__dirname, 'initialPlacesData.json');

/**
 * Parse CSV line respecting quoted fields
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Convert boolean-like string to actual boolean
 */
function parseBoolean(value) {
  if (!value || value === '') return false;
  const normalized = value.toLowerCase().trim();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}

/**
 * Clean and validate field value
 */
function cleanField(value) {
  if (!value || value === '') return null;
  return value.trim();
}

/**
 * Convert CSV row to place object
 */
function convertRowToPlace(row, headers) {
  const place = {};

  headers.forEach((header, index) => {
    const value = row[index] || '';

    // Map CSV columns to JSON fields
    switch (header) {
      case 'name':
        place.name = cleanField(value) || 'Unnamed Location';
        break;
      case 'description':
        place.description = cleanField(value) || 'No description available';
        break;
      case 'address':
        place.address = cleanField(value) || '';
        break;
      case 'city':
        place.city = cleanField(value) || '';
        break;
      case 'region':
        place.region = cleanField(value);
        break;
      case 'country':
        place.country = cleanField(value) || 'Portugal';
        break;
      case 'city tags':
        place.cityTags = cleanField(value);
        break;
      case 'category':
        place.category = cleanField(value) || 'grocery';
        break;
      case 'phone':
        place.phone = cleanField(value);
        break;
      case 'email':
        place.email = cleanField(value);
        break;
      case 'website':
        place.website = cleanField(value);
        break;
      case 'instagram':
        place.instagram = cleanField(value);
        break;
      case 'status':
        place.status = cleanField(value) || 'pending';
        break;
      case 'submittedBy':
        place.submittedBy = cleanField(value) || 'CSV Import';
        break;
      case 'latitude':
        const lat = cleanField(value);
        place.latitude = lat ? lat.replace('.', '') !== '' ? lat : null : null;
        break;
      case 'longitude':
        const lon = cleanField(value);
        place.longitude = lon ? lon.replace('.', '') !== '' ? lon : null : null;
        break;
      case 'Badges':
        place.badges = cleanField(value);
        break;

      // Category filters
      case 'GroceryAndMarket':
        place.groceryAndMarket = parseBoolean(value);
        break;
      case 'Supplements':
        place.supplements = parseBoolean(value);
        break;

      // Grocery & Market filters
      case 'glutenFree':
        place.glutenFree = parseBoolean(value);
        break;
      case 'dairyFree':
        place.dairyFree = parseBoolean(value);
        break;
      case 'Nut free':
        place.nutFree = parseBoolean(value);
        break;
      case 'vegan':
        place.vegan = parseBoolean(value);
        break;
      case 'bio/organic':
        place.organic = parseBoolean(value);
        break;
      case 'localFarms':
        place.localFarms = parseBoolean(value);
        break;
      case 'fresh vegetables':
        place.freshVegetables = parseBoolean(value);
        break;
      case 'farmRaisedMeat':
        place.farmRaisedMeat = parseBoolean(value);
        break;
      case 'NoProcessed foods':
        place.noProcessed = parseBoolean(value);
        break;
      case 'kidFriendly snacks':
        place.kidFriendly = parseBoolean(value);
        break;
      case 'bulkBuying options':
        place.bulkBuying = parseBoolean(value);
        break;
      case 'zeroWaste':
        place.zeroWaste = parseBoolean(value);
        break;

      // Supplement filters
      case 'General Supplements':
        place.generalSupplements = parseBoolean(value);
        break;
      case 'Omega-3':
        place.omega3 = parseBoolean(value);
        break;
      case 'VeganSup':
        place.veganSupplements = parseBoolean(value);
        break;
      case 'OnlineRetailer':
        place.onlineRetailer = parseBoolean(value);
        break;
      case 'Vitamins':
        place.vitamins = parseBoolean(value);
        break;
      case 'HerbalRemedies':
        place.herbalRemedies = parseBoolean(value);
        break;
      case 'OrganicSup':
        place.organicSupplements = parseBoolean(value);
        break;
      case 'SportsNutrtion':
        place.sportsNutrition = parseBoolean(value);
        break;
      case 'PractionerGrade':
        place.practitionerGrade = parseBoolean(value);
        break;
      case 'Hypoallergenic':
        place.hypoallergenic = parseBoolean(value);
        break;
    }
  });

  return place;
}

/**
 * Main conversion function
 */
function convertCSVToJSON() {
  console.log('='.repeat(60));
  console.log('CSV to JSON Converter');
  console.log('='.repeat(60));
  console.log();

  // Read CSV file
  console.log(`Reading CSV file: ${CSV_PATH}`);

  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`CSV file not found: ${CSV_PATH}`);
  }

  const csvContent = fs.readFileSync(CSV_PATH, 'utf8');
  const lines = csvContent.split('\n').filter(line => line.trim());

  console.log(`Found ${lines.length} lines (including header)`);
  console.log();

  // Parse header
  const headers = parseCSVLine(lines[0]);
  console.log(`Detected ${headers.length} columns:`);
  console.log(headers.join(', '));
  console.log();

  // Convert rows to places
  const places = [];
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    try {
      const row = parseCSVLine(lines[i]);

      // Skip empty rows
      if (row.length < 2 || !row[0]) {
        skipped++;
        continue;
      }

      const place = convertRowToPlace(row, headers);

      // Validate required fields
      if (!place.name || !place.address || !place.city) {
        console.warn(`Warning: Row ${i + 1} missing required fields, skipping`);
        skipped++;
        continue;
      }

      places.push(place);
    } catch (error) {
      console.error(`Error processing row ${i + 1}: ${error.message}`);
      skipped++;
    }
  }

  console.log(`Converted ${places.length} locations`);
  if (skipped > 0) {
    console.log(`Skipped ${skipped} rows`);
  }
  console.log();

  // Write JSON file
  console.log(`Writing JSON file: ${OUTPUT_PATH}`);
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(places, null, 2), 'utf8');

  console.log('✓ Conversion complete!');
  console.log();
  console.log('Summary:');
  console.log(`  Input:  ${CSV_PATH}`);
  console.log(`  Output: ${OUTPUT_PATH}`);
  console.log(`  Places: ${places.length}`);
  console.log();
  console.log('Next steps:');
  console.log('  1. Review the generated JSON file');
  console.log('  2. Upload using: node upload.js initialPlacesData.json');
  console.log();
}

// Run the converter
try {
  convertCSVToJSON();
} catch (error) {
  console.error('\n✗ ERROR\n');
  console.error(error.message);
  console.error();

  if (error.stack && process.env.DEBUG) {
    console.error('Stack trace:');
    console.error(error.stack);
  }

  process.exit(1);
}
