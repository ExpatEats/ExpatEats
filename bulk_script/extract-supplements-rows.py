#!/usr/bin/env python3

import openpyxl
import json
import sys

def parse_boolean(value):
    """Convert Excel boolean values to Python boolean"""
    if value is None or value == '':
        return False
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().upper() in ['TRUE', 'YES', '1', 'X']
    return bool(value)

def extract_rows(xlsx_path, start_row, end_row):
    """Extract specific rows from Excel file and convert to JSON"""

    print(f"Reading Excel file: {xlsx_path}")
    workbook = openpyxl.load_workbook(xlsx_path)
    sheet = workbook.active

    print(f"Sheet name: {sheet.title}")
    print(f"Total rows: {sheet.max_row}")
    print(f"Extracting rows {start_row} to {end_row}")
    print()

    # Get headers from row 1
    headers = []
    for cell in sheet[1]:
        if cell.value:
            headers.append(cell.value)

    print(f"Headers found: {len(headers)}")
    print("Headers:", headers[:10], "..." if len(headers) > 10 else "")
    print()

    # Extract data rows
    places = []
    for row_num in range(start_row, end_row + 1):
        row = sheet[row_num]
        place = {}

        for idx, cell in enumerate(row):
            if idx < len(headers):
                header = headers[idx]
                value = cell.value

                # Map headers to JSON structure
                if header == 'name':
                    place['name'] = value or ''
                elif header == 'description':
                    place['description'] = value or ''
                elif header == 'address':
                    place['address'] = value or ''
                elif header == 'city':
                    place['city'] = value or ''
                elif header == 'region':
                    place['region'] = value or ''
                elif header == 'country':
                    place['country'] = value or 'Portugal'
                elif header == 'city tags':
                    place['cityTags'] = value or ''
                elif header == 'category':
                    place['category'] = value or 'grocery'
                elif header == 'phone':
                    place['phone'] = value or ''
                elif header == 'email':
                    place['email'] = value or ''
                elif header == 'website':
                    place['website'] = value or ''
                elif header == 'instagram':
                    place['instagram'] = value or ''
                elif header == 'status':
                    place['status'] = value or 'pending'
                elif header == 'submittedBy':
                    place['submittedBy'] = value or 'Michaele-Supplements'
                elif header == 'latitude':
                    place['latitude'] = str(value) if value else ''
                elif header == 'longitude':
                    place['longitude'] = str(value) if value else ''
                elif header == 'GroceryAndMarket':
                    place['groceryAndMarket'] = parse_boolean(value)
                elif header == 'glutenFree':
                    place['glutenFree'] = parse_boolean(value)
                elif header == 'dairyFree':
                    place['dairyFree'] = parse_boolean(value)
                elif header == 'Nut free':
                    place['nutFree'] = parse_boolean(value)
                elif header == 'vegan':
                    place['vegan'] = parse_boolean(value)
                elif header == 'bio/organic':
                    place['organic'] = parse_boolean(value)
                elif header == 'localFarms':
                    place['localFarms'] = parse_boolean(value)
                elif header == 'fresh vegetables':
                    place['freshVegetables'] = parse_boolean(value)
                elif header == 'farmRaisedMeat':
                    place['farmRaisedMeat'] = parse_boolean(value)
                elif header == 'NoProcessed foods':
                    place['noProcessed'] = parse_boolean(value)
                elif header == 'kidFriendly snacks':
                    place['kidFriendly'] = parse_boolean(value)
                elif header == 'bulkBuying options':
                    place['bulkBuying'] = parse_boolean(value)
                elif header == 'zeroWaste':
                    place['zeroWaste'] = parse_boolean(value)
                elif header == 'Badges':
                    place['badges'] = value or ''
                elif header == 'Supplements':
                    place['supplements'] = parse_boolean(value)
                elif header == 'General Supplements':
                    place['generalSupplements'] = parse_boolean(value)
                elif header == 'Omega-3':
                    place['omega3'] = parse_boolean(value)
                elif header == 'VeganSup':
                    place['veganSupplements'] = parse_boolean(value)
                elif header == 'OnlineRetailer':
                    place['onlineRetailer'] = parse_boolean(value)
                elif header == 'Vitamins':
                    place['vitamins'] = parse_boolean(value)
                elif header == 'HerbalRemedies':
                    place['herbalRemedies'] = parse_boolean(value)
                elif header == 'OrganicSup':
                    place['organicSupplements'] = parse_boolean(value)
                elif header == 'SportsNutrtion':
                    place['sportsNutrition'] = parse_boolean(value)
                elif header == 'PractionerGrade':
                    place['practitionerGrade'] = parse_boolean(value)
                elif header == 'Hypoallergenic':
                    place['hypoallergenic'] = parse_boolean(value)

        if place.get('name'):  # Only add if name exists
            places.append(place)
            print(f"Row {row_num}: {place.get('name', 'NO NAME')}")

    print()
    print(f"Extracted {len(places)} places")

    return places

# Main execution
if __name__ == '__main__':
    xlsx_file = '/Users/aaronroussel/Documents/GitHub/ExpatEats/attached_assets/locations/supplementsadded.xlsx'
    output_file = '/Users/aaronroussel/Documents/GitHub/ExpatEats/bulk_script/supplements-rows-86-97.json'

    # Extract rows 86-97
    places = extract_rows(xlsx_file, 86, 97)

    # Write to JSON
    print()
    print(f"Writing to: {output_file}")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(places, f, indent=2, ensure_ascii=False)

    print()
    print("✓ Complete!")
    print()
    print("Summary:")
    for place in places:
        print(f"  - {place.get('name', 'NO NAME')} ({place.get('city', 'NO CITY')})")
