# Bulk Location Upload Script

This script allows you to upload multiple locations to the ExpatEats database in a single request using a JSON file.

## Prerequisites

- Node.js installed on your system
- Admin access to the ExpatEats application
- Admin session cookie from your browser

## Setup

### 1. Get Your Session Cookie

1. Open your browser and log in to ExpatEats as an admin
2. Open the browser's Developer Tools (F12 or Right-click → Inspect)
3. Go to the "Application" or "Storage" tab
4. Find "Cookies" in the left sidebar
5. Look for a cookie named `expatEatsSession`
6. Copy the entire cookie value (it will look like `s%3A...`)

### 2. Set Environment Variables

You can set the session cookie in two ways:

**Option A: Export as environment variable (recommended)**
```bash
export SESSION_COOKIE="expatEatsSession=s%3A..."
```

**Option B: Set in your shell profile**
Add to your `~/.bashrc` or `~/.zshrc`:
```bash
export SESSION_COOKIE="expatEatsSession=s%3A..."
```

### 3. Configure API URL (Optional)

By default, the script connects to `http://localhost:10000`. To change this:

```bash
export API_URL="https://your-production-api.com"
```

## Usage

### Basic Usage

```bash
node upload.js <path-to-json-file>
```

### Example

```bash
node upload.js sample-locations.json
```

### With Environment Variables

```bash
SESSION_COOKIE="expatEatsSession=s%3A..." node upload.js my-locations.json
```

### Production Environment

```bash
API_URL="https://api.expateatsguide.com" \
SESSION_COOKIE="expatEatsSession=s%3A..." \
node upload.js locations.json
```

### Skip Automatic Geocoding

By default, the script will automatically geocode addresses that don't have coordinates. To skip this:

```bash
SKIP_GEOCODE=true node upload.js locations.json
```

## JSON File Format

The JSON file should contain an array of location objects. You can use either format:

### Format 1: Array of locations (recommended)

```json
[
  {
    "name": "Location Name",
    "description": "Description of the location",
    "address": "Street address",
    "city": "City name",
    "country": "Country name",
    "category": "market",
    ...
  },
  {
    "name": "Another Location",
    ...
  }
]
```

### Format 2: Object with places array

```json
{
  "places": [
    {
      "name": "Location Name",
      ...
    }
  ]
}
```

## Required Fields

Each location must have these required fields:

- `name` (string) - Name of the location
- `description` (string) - Description of the location
- `address` (string) - Street address
- `city` (string) - City name
- `country` (string) - Country name
- `category` (string) - One of: `market`, `restaurant`, `grocery`, `community`

## Optional Fields

- `region` (string) - Region or state
- `tags` (array of strings) - Tags for the location
- `phone` (string) - Phone number
- `email` (string) - Email address
- `website` (string) - Website URL
- `instagram` (string) - Instagram handle
- `latitude` (string) - Latitude coordinate
- `longitude` (string) - Longitude coordinate

### Boolean Filter Fields

All default to `false` if not specified:

- `glutenFree`
- `dairyFree`
- `nutFree`
- `vegan`
- `organic`
- `localFarms`
- `freshVegetables`
- `farmRaisedMeat`
- `noProcessed`
- `kidFriendly`
- `bulkBuying`
- `zeroWaste`

### Admin Fields

- `status` (string) - Default: `"pending"`. Can be: `pending`, `approved`, `rejected`
- `submittedBy` (string) - Name or identifier of who submitted this
- `adminNotes` (string) - Notes from admin review
- `softRating` (string) - Rating: `Gold Standard`, `Great Choice`, or `This Will Do in a Pinch`
- `michaelesNotes` (string) - Personal notes

## Example Location Object

```json
{
  "name": "Organic Market Lisbon",
  "description": "Family-owned organic market with local produce",
  "address": "Rua das Flores 123",
  "city": "Lisbon",
  "region": "Lisboa",
  "country": "Portugal",
  "category": "market",
  "tags": ["organic", "local", "vegetables"],
  "phone": "+351 21 123 4567",
  "email": "info@organicmarket.pt",
  "website": "https://organicmarket.pt",
  "instagram": "@organicmarketlisbon",
  "glutenFree": true,
  "vegan": true,
  "organic": true,
  "localFarms": true,
  "freshVegetables": true,
  "kidFriendly": true,
  "zeroWaste": true,
  "status": "pending",
  "submittedBy": "Bulk Import - January 2024"
}
```

## Output

The script will display:

- Number of locations read from the file
- Upload progress
- Success/failure status
- Number of locations created
- Any validation errors with details

### Success Output

```
============================================================
ExpatEats Bulk Location Upload
============================================================

Reading file: locations.json
Found 10 locations to upload

Fetching CSRF token...
CSRF token obtained

Uploading to: http://localhost:10000/api/admin/bulk-places
Please wait...

============================================================
✓ SUCCESS
============================================================

Created: 10 locations
Message: Successfully created 10 places

Sample of created locations:
  1. Organic Market Lisbon (ID: 123)
  2. Health Food Store (ID: 124)
  3. Vegan Restaurant (ID: 125)
  ... and 7 more

============================================================
```

### Validation Error Output

```
============================================================
✗ VALIDATION ERRORS
============================================================

Valid locations: 8
Invalid locations: 2

Errors:

  1. Location at index 3:
     Name: Missing Address Location
     Validation errors:
       - address: Required

  2. Location at index 7:
     Name: Invalid Category
     Validation errors:
       - category: Invalid enum value
```

## Troubleshooting

### "SESSION_COOKIE environment variable is required"

You need to set your admin session cookie. See the Setup section above.

### "Failed to get CSRF token"

Your session cookie may have expired. Log in again and get a new cookie.

### Authentication errors (401, 403)

- Make sure you're logged in as an admin
- Check that your session cookie is correct and not expired
- Ensure the cookie includes the full `expatEatsSession=...` part

### Connection errors

- Check that the API_URL is correct
- Ensure the API server is running
- Verify you can access the API URL from your browser

### Validation errors

- Check that all required fields are present
- Verify field types match the schema (strings, booleans, etc.)
- Ensure category is one of: `market`, `restaurant`, `grocery`, `community`

## Automatic Geocoding

The bulk upload endpoint automatically geocodes addresses for locations that don't have coordinates:

- If a location has both `latitude` and `longitude` fields, geocoding is skipped for that location
- If either coordinate is missing, the script will attempt to geocode the address
- Geocoding uses the address, city, region, and country fields
- Failed geocoding doesn't prevent the location from being created - it just won't have coordinates
- You can disable automatic geocoding by setting `SKIP_GEOCODE=true`

The upload response includes geocoding statistics:
- Total locations processed
- Number successfully geocoded
- Number skipped (already had coordinates)
- Number that failed to geocode
- Detailed error messages for failed geocoding attempts

## Notes

- All locations are created with `status: "pending"` by default (unless you specify otherwise)
- Locations will need to be approved by an admin before appearing publicly
- The script validates all locations before uploading
- If any location fails validation, no locations will be uploaded
- Locations without coordinates will be automatically geocoded (unless `skipGeocode` is true)
- Failed geocoding doesn't prevent location creation - the location is still saved without coordinates
- You can also use the batch geocode admin endpoint after uploading to retry failed geocoding

## Security

- Never commit your session cookie to version control
- Session cookies expire after a period of inactivity
- Keep your session cookie secure and don't share it
- The script requires admin privileges to execute
