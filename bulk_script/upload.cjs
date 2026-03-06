#!/usr/bin/env node

/**
 * Bulk Location Upload Script
 *
 * This script uploads a JSON file containing an array of locations to the ExpatEats API.
 * The locations will be validated and inserted into the database.
 *
 * Usage:
 *   node upload.js <path-to-json-file>
 *
 * Example:
 *   node upload.js sample-locations.json
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ===========================
// Configuration
// ===========================
const CONFIG = {
  // API endpoint URL - change this to your API server
  API_URL: process.env.API_URL || 'http://localhost:10000',

  // API endpoint path
  ENDPOINT: '/api/admin/bulk-places',

  // Session cookie (required for authentication)
  // You need to get this from your browser after logging in as admin
  SESSION_COOKIE: process.env.SESSION_COOKIE || '',

  // CSRF token (if required)
  CSRF_TOKEN: process.env.CSRF_TOKEN || '',

  // Skip geocoding (set to true to skip automatic geocoding)
  SKIP_GEOCODE: process.env.SKIP_GEOCODE === 'true',
};

// ===========================
// Helper Functions
// ===========================

/**
 * Read and parse JSON file
 */
function readJsonFile(filePath) {
  try {
    const absolutePath = path.resolve(filePath);
    const fileContent = fs.readFileSync(absolutePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    } else if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in file: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get CSRF token from the API
 */
async function getCsrfToken(baseUrl, sessionCookie) {
  return new Promise((resolve, reject) => {
    const url = new URL('/api/csrf-token', baseUrl);
    const protocol = url.protocol === 'https:' ? https : http;

    const options = {
      method: 'GET',
      headers: {
        'Cookie': sessionCookie,
      },
    };

    const req = protocol.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            resolve(response.csrfToken);
          } catch (error) {
            reject(new Error('Failed to parse CSRF token response'));
          }
        } else {
          reject(new Error(`Failed to get CSRF token: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Upload locations to API
 */
async function uploadLocations(places, apiUrl, endpoint, sessionCookie, csrfToken, skipGeocode = false) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, apiUrl);
    const protocol = url.protocol === 'https:' ? https : http;

    const payload = JSON.stringify({
      places,
      skipGeocode
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Cookie': sessionCookie,
        'x-csrf-token': csrfToken,
      },
    };

    const req = protocol.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            data: response,
          });
        } catch (error) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

/**
 * Display usage information
 */
function showUsage() {
  console.log(`
Usage: node upload.js <path-to-json-file>

Example:
  node upload.js sample-locations.json

Environment Variables:
  API_URL          - API server URL (default: http://localhost:10000)
  SESSION_COOKIE   - Admin session cookie for authentication
  CSRF_TOKEN       - CSRF token (optional, will be fetched if not provided)
  SKIP_GEOCODE     - Set to 'true' to skip automatic geocoding (default: false)

The JSON file should contain an array of location objects with the following structure:
{
  "places": [
    {
      "name": "Location Name",
      "description": "Location description",
      "address": "123 Main St",
      "city": "Lisbon",
      "country": "Portugal",
      "category": "market",
      // ... other fields
    }
  ]
}

Or just an array of places:
[
  {
    "name": "Location Name",
    ...
  }
]
`);
}

// ===========================
// Main Function
// ===========================

async function main() {
  try {
    // Check command line arguments
    if (process.argv.length < 3) {
      console.error('Error: Missing JSON file path\n');
      showUsage();
      process.exit(1);
    }

    const filePath = process.argv[2];

    // Show help if requested
    if (filePath === '--help' || filePath === '-h') {
      showUsage();
      process.exit(0);
    }

    console.log('='.repeat(60));
    console.log('ExpatEats Bulk Location Upload');
    console.log('='.repeat(60));
    console.log();

    // Validate configuration
    if (!CONFIG.SESSION_COOKIE) {
      console.error('Error: SESSION_COOKIE environment variable is required');
      console.error('Please set it with your admin session cookie from the browser');
      console.error('\nExample:');
      console.error('  export SESSION_COOKIE="expatEatsSession=s%3A..."');
      console.error('  node upload.js sample-locations.json');
      process.exit(1);
    }

    // Read JSON file
    console.log(`Reading file: ${filePath}`);
    let data = readJsonFile(filePath);

    // Handle both formats: { places: [...] } and [...]
    let places;
    if (Array.isArray(data)) {
      places = data;
    } else if (data.places && Array.isArray(data.places)) {
      places = data.places;
    } else {
      throw new Error('Invalid file format. Expected array of places or object with "places" array');
    }

    console.log(`Found ${places.length} locations to upload`);
    console.log();

    // Get CSRF token if not provided
    let csrfToken = CONFIG.CSRF_TOKEN;
    if (!csrfToken) {
      console.log('Fetching CSRF token...');
      csrfToken = await getCsrfToken(CONFIG.API_URL, CONFIG.SESSION_COOKIE);
      console.log('CSRF token obtained');
      console.log();
    }

    // Upload locations
    console.log(`Uploading to: ${CONFIG.API_URL}${CONFIG.ENDPOINT}`);
    if (CONFIG.SKIP_GEOCODE) {
      console.log('Geocoding: SKIPPED');
    } else {
      console.log('Geocoding: Will geocode addresses without coordinates');
    }
    console.log('Please wait...');
    console.log();

    const result = await uploadLocations(
      places,
      CONFIG.API_URL,
      CONFIG.ENDPOINT,
      CONFIG.SESSION_COOKIE,
      csrfToken,
      CONFIG.SKIP_GEOCODE
    );

    // Display results
    console.log('='.repeat(60));
    if (result.statusCode === 201) {
      console.log('✓ SUCCESS');
      console.log('='.repeat(60));
      console.log();
      console.log(`Created: ${result.data.count} locations`);
      console.log(`Message: ${result.data.message}`);
      console.log();

      if (result.data.geocoding) {
        console.log();
        console.log('Geocoding Results:');
        console.log(`  Total locations: ${result.data.geocoding.total}`);
        console.log(`  Geocoded: ${result.data.geocoding.geocoded}`);
        console.log(`  Skipped (had coordinates): ${result.data.geocoding.skipped}`);
        console.log(`  Failed: ${result.data.geocoding.failed}`);

        if (result.data.geocoding.errors && result.data.geocoding.errors.length > 0) {
          console.log();
          console.log('  Geocoding failures:');
          result.data.geocoding.errors.forEach((err, i) => {
            console.log(`    ${i + 1}. ${err.name} - ${err.error}`);
          });
        }
      }

      if (result.data.places && result.data.places.length > 0) {
        console.log();
        console.log('Sample of created locations:');
        result.data.places.slice(0, 5).forEach((place, i) => {
          console.log(`  ${i + 1}. ${place.name} (ID: ${place.id})`);
        });
        if (result.data.places.length > 5) {
          console.log(`  ... and ${result.data.places.length - 5} more`);
        }
      }
    } else if (result.statusCode === 400) {
      console.log('✗ VALIDATION ERRORS');
      console.log('='.repeat(60));
      console.log();
      console.log(`Valid locations: ${result.data.validCount || 0}`);
      console.log(`Invalid locations: ${result.data.invalidCount || 0}`);
      console.log();

      if (result.data.errors && result.data.errors.length > 0) {
        console.log('Errors:');
        result.data.errors.forEach((err, i) => {
          console.log(`\n  ${i + 1}. Location at index ${err.index}:`);
          if (err.place && err.place.name) {
            console.log(`     Name: ${err.place.name}`);
          }
          console.log('     Validation errors:');
          err.errors.forEach((validationErr) => {
            console.log(`       - ${validationErr.path.join('.')}: ${validationErr.message}`);
          });
        });
      }
      process.exit(1);
    } else {
      console.log('✗ ERROR');
      console.log('='.repeat(60));
      console.log();
      console.log(`Status: ${result.statusCode}`);
      console.log(`Message: ${result.data.message || 'Unknown error'}`);
      console.log();
      console.log('Full response:');
      console.log(JSON.stringify(result.data, null, 2));
      process.exit(1);
    }

    console.log('='.repeat(60));
    console.log();

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
}

// Run the script
main();
