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
import fs from "fs";
import path from "path";

async function seedGuides() {
    try {
        console.log("📚 Seeding guides from PDF files...");

        // Path to guides directory
        const guidesDir = path.join(process.cwd(), "guides", "full");

        // Check if directory exists
        if (!fs.existsSync(guidesDir)) {
            console.log("  ⚠️  Guides directory not found, skipping guide seeding");
            return;
        }

        // Read all PDF files from the directory
        const files = fs.readdirSync(guidesDir);
        const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));

        if (pdfFiles.length === 0) {
            console.log("  ⚠️  No PDF files found in guides/full, skipping guide seeding");
            return;
        }

        console.log(`  Found ${pdfFiles.length} PDF file(s)`);

        // Create guide entries for each PDF
        for (const filename of pdfFiles) {
            // Generate slug from filename
            // Remove .pdf extension and convert to slug
            const nameWithoutExt = filename.replace(/\.pdf$/i, '');
            const slug = nameWithoutExt
                .toLowerCase()
                .replace(/copy of /gi, '') // Remove "Copy of " prefix
                .replace(/expat eats guide /gi, '') // Remove common prefix
                .trim()
                .replace(/\s+/g, '-') // Replace spaces with hyphens
                .replace(/[^a-z0-9-]/g, '') // Remove special characters
                .replace(/-+/g, '-') // Replace multiple hyphens with single
                .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

            const url = `/guides/full/${filename}`;

            // Check if guide already exists
            const [existingGuide] = await db
                .select()
                .from(schema.guides)
                .where(sql`${schema.guides.slug} = ${slug}`);

            if (existingGuide) {
                console.log(`  ✓ Guide "${slug}" already exists, skipping`);
            } else {
                await db.insert(schema.guides).values({
                    slug,
                    url,
                });
                console.log(`  ✅ Added guide: "${slug}" -> ${filename}`);
            }
        }

        console.log("✅ Guide seeding completed");
    } catch (error) {
        console.error("❌ Failed to seed guides:", error);
        throw error;
    }
}

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
            // Create Aaron user as superadmin
            await AuthService.createUser({
                username: "aaronrous",
                email: "aaron145165@gmail.com",
                password: "Cool!123129",
                name: "Aaron Roussel",
                role: "superadmin"
            });
            console.log("✅ Aaron user created successfully as superadmin");
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

        await db.delete(schema.events);
        console.log("  ✓ Cleared events");

        await db.delete(schema.places);
        console.log("  ✓ Cleared places");

        await db.delete(schema.users);
        console.log("  ✓ Cleared users");

        await db.delete(schema.cities);
        console.log("  ✓ Cleared cities");

        await db.delete(schema.guidePurchases);
        console.log("  ✓ Cleared guide_purchases");

        await db.delete(schema.guides);
        console.log("  ✓ Cleared guides");

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
            { name: "Parede/Carcavelos", slug: "parede", country: "Portugal", region: "Lisbon" },
            { name: "Online", slug: "online", country: "Online", region: null },
        ];

        let insertedCount = 0;
        let skippedCount = 0;

        for (const city of citiesToSeed) {
            // Check if city already exists by slug (unique identifier)
            const existingCity = await db
                .select()
                .from(schema.cities)
                .where(sql`${schema.cities.slug} = ${city.slug}`)
                .limit(1);

            if (existingCity.length === 0) {
                await db.insert(schema.cities).values(city);
                insertedCount++;
            } else {
                skippedCount++;
            }
        }

        console.log(`✅ Cities seeded: ${insertedCount} inserted, ${skippedCount} already existed`);
    } catch (error) {
        console.error("❌ Failed to seed cities:", error);
        throw error;
    }
}

async function seedEvents() {
    try {
        console.log("📅 Seeding events...");

        const eventsToSeed = [
            {
                title: "Organic Market Tour in Principe Real",
                description: "Join us for a guided tour of the Mercado Biológico do Principe Real. Learn how to select the best organic produce and meet local farmers.",
                date: new Date("2025-11-15T10:00:00"),
                time: "10:00 AM",
                location: "Principe Real Garden, Lisbon",
                city: "Lisbon",
                country: "Portugal",
                organizerName: "Maria Santos",
                organizerRole: "Local Food Guide",
                category: "Food & Nutrition",
                imageUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
                submittedBy: "ExpatEats Team",
                submitterEmail: "team@expateats.com",
                status: "approved"
            },
            {
                title: "Zero Waste Shopping Workshop",
                description: "Learn practical tips for shopping without plastic and reducing food waste. We'll visit Maria Granel and other zero waste shops in central Lisbon.",
                date: new Date("2025-11-22T14:00:00"),
                time: "2:00 PM",
                location: "Maria Granel, Rua da Assunção 7, Lisbon",
                city: "Lisbon",
                country: "Portugal",
                organizerName: "João Silva",
                organizerRole: "Zero Waste Advocate",
                category: "Workshops & Talks",
                imageUrl: "https://images.unsplash.com/photo-1579113800032-c38bd7635818?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
                submittedBy: "ExpatEats Team",
                submitterEmail: "team@expateats.com",
                status: "approved"
            },
            {
                title: "Expat Dinner: Portuguese Cuisine with Dietary Adaptations",
                description: "Join fellow expats for a community dinner featuring traditional Portuguese dishes adapted for various dietary needs (gluten-free, vegan, etc.).",
                date: new Date("2025-12-05T19:00:00"),
                time: "7:00 PM",
                location: "Community Kitchen, Av. Almirante Reis 45, Lisbon",
                city: "Lisbon",
                country: "Portugal",
                organizerName: "ExpatEats Community",
                organizerRole: "Community Organization",
                category: "Community & Social",
                imageUrl: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
                submittedBy: "ExpatEats Team",
                submitterEmail: "team@expateats.com",
                status: "approved"
            }
        ];

        let insertedCount = 0;
        let skippedCount = 0;

        for (const event of eventsToSeed) {
            // Check if event already exists by title and date
            const existingEvent = await db
                .select()
                .from(schema.events)
                .where(sql`${schema.events.title} = ${event.title} AND ${schema.events.date} = ${event.date}`)
                .limit(1);

            if (existingEvent.length === 0) {
                await db.insert(schema.events).values(event);
                insertedCount++;
            } else {
                skippedCount++;
            }
        }

        console.log(`✅ Events seeded: ${insertedCount} inserted, ${skippedCount} already existed`);
    } catch (error) {
        console.error("❌ Failed to seed events:", error);
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

        // Clear all tables before seeding (only in development or if explicitly enabled)
        const shouldClearTables = process.env.CLEAR_TABLES === "true" || process.env.NODE_ENV === "development";

        if (shouldClearTables) {
            console.log("⚠️  Clearing all tables...");
            await clearAllTables();
        } else {
            console.log("ℹ️  Skipping table clearing (set CLEAR_TABLES=true to enable)");
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

        // Create admin user if it doesn't exist
        console.log("👤 Creating users...");
        await createAdminUser();

        // Seed guides from PDF files
        console.log("📚 Seeding guides...");
        await seedGuides();

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
