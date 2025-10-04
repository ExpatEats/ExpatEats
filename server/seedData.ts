import { importSupplementsData } from "./importSupplementsData.js";
import { importFoodSources } from "./importFoodSources.js";
import { importEnhancedStores } from "./importEnhancedStores.js";
import { importLisbonFoodSources } from "./importLisbonFoodSources.js";
import { importLocationGuides } from "./importLocationGuides.js";
import { importAdditionalFoodSources } from "./importAdditionalFoodSources.js";
import { AuthService } from "./services/authService.js";
import { db } from "./db.js";
import { sql } from "drizzle-orm";
import * as schema from "../shared/schema.js";

async function createAdminUser() {
    try {
        // Check if admin user already exists
        const existingAdmin = await AuthService.getUserByUsername("admin");
        if (existingAdmin) {
            console.log("✅ Admin user already exists");
        } else {
            // Create admin user with credentials from ADMININFO.txt
            await AuthService.createUser({
                username: "admin",
                email: "admin@expateats.com",
                password: "ExpAt2024!SecureAdmin",
                name: "Admin User",
                role: "admin"
            });
            console.log("✅ Admin user created successfully");
            console.log("📋 Admin credentials available in ADMININFO.txt");
        }

        // Check if Aaron user already exists
        const existingAaron = await AuthService.getUserByUsername("aaronrous");
        if (existingAaron) {
            console.log("✅ Aaron user already exists");
        } else {
            // Create Aaron user
            await AuthService.createUser({
                username: "aaronrous",
                email: "aaron145165@gmail.com",
                password: "Cool!123129",
                name: "Aaron Roussel",
                role: "admin"
            });
            console.log("✅ Aaron user created successfully");
        }
    } catch (error) {
        console.error("❌ Failed to create users:", error);
        throw error;
    }
}

async function clearAllTables() {
    try {
        console.log("🧹 Clearing all database tables...");

        // Delete in order to respect foreign key constraints
        await db.delete(schema.postLikes);
        console.log("  ✓ Cleared post_likes");

        await db.delete(schema.comments);
        console.log("  ✓ Cleared comments");

        await db.delete(schema.posts);
        console.log("  ✓ Cleared posts");

        await db.delete(schema.savedStores);
        console.log("  ✓ Cleared saved_stores");

        await db.delete(schema.reviews);
        console.log("  ✓ Cleared reviews");

        await db.delete(schema.nutrition);
        console.log("  ✓ Cleared nutrition");

        await db.delete(schema.places);
        console.log("  ✓ Cleared places");

        await db.delete(schema.users);
        console.log("  ✓ Cleared users");

        await db.delete(schema.cities);
        console.log("  ✓ Cleared cities");

        console.log("✅ All tables cleared successfully");
    } catch (error) {
        console.error("❌ Failed to clear tables:", error);
        throw error;
    }
}

async function deduplicatePlaces() {
    try {
        console.log("🔍 Checking for duplicate places...");

        // Get all places grouped by name
        const allPlaces = await db.select().from(schema.places);

        // Create a map to track duplicates by name (case-insensitive)
        const placesByName = new Map<string, typeof allPlaces>();

        for (const place of allPlaces) {
            const normalizedName = place.name.toLowerCase().trim();
            if (!placesByName.has(normalizedName)) {
                placesByName.set(normalizedName, []);
            }
            placesByName.get(normalizedName)!.push(place);
        }

        // Find and merge duplicates
        let duplicatesFound = 0;
        let duplicatesRemoved = 0;

        for (const [name, places] of placesByName.entries()) {
            if (places.length > 1) {
                duplicatesFound += places.length - 1;
                console.log(`  Found ${places.length} entries for "${places[0].name}"`);

                // Keep the first one, merge tags from others, then delete the rest
                const [keepPlace, ...duplicates] = places;
                const allTags = new Set(keepPlace.tags || []);

                // Collect all unique tags from duplicates
                for (const dup of duplicates) {
                    if (dup.tags) {
                        dup.tags.forEach(tag => allTags.add(tag));
                    }
                }

                // Update the kept place with merged tags
                await db
                    .update(schema.places)
                    .set({ tags: Array.from(allTags) })
                    .where(sql`${schema.places.id} = ${keepPlace.id}`);

                // Delete duplicates
                for (const dup of duplicates) {
                    await db.delete(schema.places).where(sql`${schema.places.id} = ${dup.id}`);
                    duplicatesRemoved++;
                }

                console.log(`  ✓ Merged and removed ${duplicates.length} duplicate(s) for "${places[0].name}"`);
            }
        }

        if (duplicatesFound === 0) {
            console.log("✅ No duplicate places found");
        } else {
            console.log(`✅ Removed ${duplicatesRemoved} duplicate places`);
        }
    } catch (error) {
        console.error("❌ Failed to deduplicate places:", error);
        throw error;
    }
}

async function seedCities() {
    try {
        console.log("🏙️  Seeding cities...");

        const citiesToSeed = [
            { name: "Lisbon", slug: "lisbon", country: "Portugal", region: "Lisbon" },
            { name: "Cascais", slug: "cascais", country: "Portugal", region: "Lisbon" },
            { name: "Sintra", slug: "sintra", country: "Portugal", region: "Lisbon" },
            { name: "Oeiras", slug: "oeiras", country: "Portugal", region: "Lisbon" },
            { name: "Mafra", slug: "mafra", country: "Portugal", region: "Lisbon" },
            { name: "Parede", slug: "parede", country: "Portugal", region: "Lisbon" },
            { name: "Ourém", slug: "ourem", country: "Portugal", region: "Santarém" },
            { name: "Online", slug: "online", country: "Online", region: null },
        ];

        for (const city of citiesToSeed) {
            await db.insert(schema.cities).values(city);
        }

        console.log(`✅ Seeded ${citiesToSeed.length} cities`);
    } catch (error) {
        console.error("❌ Failed to seed cities:", error);
        throw error;
    }
}

async function verifyDatabaseTables() {
    try {
        // Verify savedStores table exists
        const result = await db.execute(sql`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'saved_stores'
            )
        `);

        const tableExists = result.rows[0]?.exists;
        if (tableExists) {
            console.log("✅ savedStores table verified");
        } else {
            console.log("⚠️  savedStores table not found - running db:push may be needed");
        }
    } catch (error) {
        console.error("❌ Database table verification failed:", error);
    }
}

export async function runSeedData() {
    console.log("🌱 Starting seed data import...");

    try {
        // Verify database tables exist
        console.log("🔍 Verifying database tables...");
        await verifyDatabaseTables();

        // Clear all tables before seeding
        await clearAllTables();

        // Seed cities first
        await seedCities();

        // Import food sources
        console.log("📦 Importing food sources...");
        const foodSourcesResult = await importFoodSources();
        if (foodSourcesResult.success) {
            console.log(
                `✅ Food sources imported: ${foodSourcesResult.count} items`,
            );
        } else {
            console.error(
                "❌ Food sources import failed:",
                foodSourcesResult.error,
            );
        }

        // Import supplements data
        console.log("💊 Importing supplements data...");
        const supplementsResult = await importSupplementsData();
        if (supplementsResult.success) {
            console.log(
                `✅ Supplements imported: ${supplementsResult.count} items`,
            );
        } else {
            console.error(
                "❌ Supplements import failed:",
                supplementsResult.error,
            );
        }

        // Import enhanced stores
        console.log("🏪 Importing enhanced stores...");
        const enhancedStoresResult = await importEnhancedStores();
        if (enhancedStoresResult.success) {
            console.log(
                `✅ Enhanced stores imported: ${enhancedStoresResult.count} items`,
            );
        } else {
            console.error(
                "❌ Enhanced stores import failed:",
                enhancedStoresResult.error,
            );
        }

        // Import Lisbon food sources
        console.log("🇵🇹 Importing Lisbon food sources...");
        const lisbonResult = await importLisbonFoodSources();
        if (lisbonResult.success) {
            console.log(
                `✅ Lisbon food sources imported: ${lisbonResult.count} items`,
            );
        } else {
            console.error(
                "❌ Lisbon food sources import failed:",
                lisbonResult.error,
            );
        }

        // Import location guides
        console.log("📍 Importing location guides...");
        const locationGuidesResult = await importLocationGuides();
        if (locationGuidesResult.success) {
            console.log(
                `✅ Location guides imported: ${locationGuidesResult.count} items`,
            );
        } else {
            console.error(
                "❌ Location guides import failed:",
                locationGuidesResult.error,
            );
        }

        // Import additional food sources
        console.log("➕ Importing additional food sources...");
        const additionalResult = await importAdditionalFoodSources();
        if (additionalResult.success) {
            console.log(
                `✅ Additional food sources imported: ${additionalResult.count} items`,
            );
        } else {
            console.error(
                "❌ Additional food sources import failed:",
                additionalResult.error,
            );
        }

        // Deduplicate places after all imports
        console.log("🔄 Deduplicating places...");
        await deduplicatePlaces();

        // Create admin user if it doesn't exist
        console.log("👤 Creating admin user...");
        await createAdminUser();

        console.log("🎉 Seed data import completed!");
        return { success: true };
    } catch (error) {
        console.error("💥 Seed data import failed:", error);
        return { success: false, error };
    }
}

// Allow running this script directly (but only in development)
const isStandaloneScript = import.meta.url === `file://${process.argv[1]}`;

if (isStandaloneScript && process.env.NODE_ENV === "development") {
    runSeedData()
        .then(() => {
            console.log("Seed data script completed");
            // No process.exit() - let the script end naturally
        })
        .catch((error) => {
            console.error("Seed data script failed:", error);
            // No process.exit() - let the script end naturally
        });
} else if (isStandaloneScript) {
    console.log("⚠️ Seed data script disabled in production mode");
    // Script will end naturally without process.exit()
}
