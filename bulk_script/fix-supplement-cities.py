#!/usr/bin/env python3

import json

# Read the JSON file
with open('supplements-rows-86-97.json', 'r', encoding='utf-8') as f:
    places = json.load(f)

print("Fixing city values for online stores...")
print()

fixed_count = 0

for place in places:
    # If city is empty or missing, set to "Online"
    if not place.get('city') or place.get('city').strip() == '':
        print(f"✓ Setting '{place['name']}' city to 'Online'")
        place['city'] = 'Online'
        fixed_count += 1

    # Colares is part of Sintra municipality
    if place.get('city') == 'Colares':
        print(f"✓ Mapping '{place['name']}' from 'Colares' to 'Sintra'")
        place['city'] = 'Sintra'
        place['cityTags'] = 'Sintra, Colares'
        fixed_count += 1

print()
print(f"Fixed {fixed_count} entries")

# Write back to file
with open('supplements-rows-86-97.json', 'w', encoding='utf-8') as f:
    json.dump(places, f, indent=2, ensure_ascii=False)

print()
print("✓ Complete!")
print()
print("City distribution:")
city_counts = {}
for place in places:
    city = place.get('city', 'NO CITY')
    city_counts[city] = city_counts.get(city, 0) + 1

for city, count in sorted(city_counts.items()):
    print(f"  {city}: {count}")
