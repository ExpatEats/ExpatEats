#!/usr/bin/env node

/**
 * Clean and standardize city names in CSV/JSON data before import
 *
 * This ensures city names match the standardized values in the cities table:
 * - Any "Mafra", "Ourem", "Ericeira" → "Mafra/Ourem"
 * - Any "Parede", "Carcavelos" → "Parede/Carcavelos"
 */

const fs = require('fs');
const path = require('path');

// City name mappings
const CITY_MAPPINGS = {
    'mafra': 'Mafra/Ourem',
    'ourem': 'Mafra/Ourem',
    'ericeira': 'Mafra/Ourem',
    'parede': 'Parede/Carcavelos',
    'carcavelos': 'Parede/Carcavelos',
    'paço de arcos': 'Parede/Carcavelos',
    'paco de arcos': 'Parede/Carcavelos',
};

// Standardize city name
function standardizeCityName(cityName) {
    if (!cityName) return cityName;

    const normalized = cityName.trim().toLowerCase();

    // Check if the city name needs to be standardized
    for (const [key, value] of Object.entries(CITY_MAPPINGS)) {
        if (normalized.includes(key)) {
            console.log(`  ✓ Standardized: "${cityName}" → "${value}"`);
            return value;
        }
    }

    // Return original with proper capitalization
    return cityName.charAt(0).toUpperCase() + cityName.slice(1);
}

// Process JSON file
function processJsonFile(inputFile, outputFile) {
    console.log('='.repeat(60));
    console.log('City Name Standardization');
    console.log('='.repeat(60));
    console.log();

    console.log(`Reading: ${inputFile}`);

    const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

    if (!Array.isArray(data)) {
        console.error('Error: Input file must contain an array of places');
        process.exit(1);
    }

    console.log(`Found ${data.length} places`);
    console.log();
    console.log('Standardizing city names:');

    let changedCount = 0;

    // Process each place
    const processedData = data.map(place => {
        if (!place.city) return place;

        const originalCity = place.city;
        const standardizedCity = standardizeCityName(place.city);

        if (originalCity !== standardizedCity) {
            changedCount++;
        }

        return {
            ...place,
            city: standardizedCity
        };
    });

    console.log();
    console.log(`Changes made: ${changedCount}`);
    console.log();

    // Write output
    console.log(`Writing: ${outputFile}`);
    fs.writeFileSync(outputFile, JSON.stringify(processedData, null, 2), 'utf8');

    console.log();
    console.log('✓ Complete!');
    console.log();

    // Show city distribution
    const cityCount = {};
    processedData.forEach(place => {
        if (place.city) {
            cityCount[place.city] = (cityCount[place.city] || 0) + 1;
        }
    });

    console.log('City distribution:');
    Object.entries(cityCount)
        .sort((a, b) => b[1] - a[1])
        .forEach(([city, count]) => {
            console.log(`  ${city}: ${count}`);
        });
    console.log();
}

// Main
const args = process.argv.slice(2);

if (args.length === 0) {
    console.log('Usage: node clean-city-names.cjs <input-file> [output-file]');
    console.log();
    console.log('Examples:');
    console.log('  node clean-city-names.cjs initialPlacesData.json');
    console.log('  node clean-city-names.cjs input.json output.json');
    console.log();
    console.log('If no output file is specified, it will overwrite the input file.');
    process.exit(1);
}

const inputFile = path.resolve(args[0]);
const outputFile = args[1] ? path.resolve(args[1]) : inputFile;

if (!fs.existsSync(inputFile)) {
    console.error(`Error: Input file not found: ${inputFile}`);
    process.exit(1);
}

processJsonFile(inputFile, outputFile);
