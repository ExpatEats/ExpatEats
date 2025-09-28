import { importSupplementsData } from "./importSupplementsData.js";
import { importFoodSources } from "./importFoodSources.js";
import { importEnhancedStores } from "./importEnhancedStores.js";
import { importLisbonFoodSources } from "./importLisbonFoodSources.js";
import { importLocationGuides } from "./importLocationGuides.js";
import { importAdditionalFoodSources } from "./importAdditionalFoodSources.js";
import { AuthService } from "./services/authService.js";
import { db } from "./db.js";
import { sql } from "drizzle-orm";

async function createAdminUser() {
    try {
        // Check if admin user already exists
        const existingAdmin = await AuthService.getUserByUsername("admin");
        if (existingAdmin) {
            console.log("✅ Admin user already exists");
            return;
        }

        // Create admin user with credentials from ADMININFO.txt
        const adminUser = await AuthService.createUser({
            username: "admin",
            email: "admin@expateats.com",
            password: "ExpAt2024!SecureAdmin",
            name: "Admin User",
            role: "admin"
        });

        console.log("✅ Admin user created successfully");
        console.log("📋 Admin credentials available in ADMININFO.txt");
        return adminUser;
    } catch (error) {
        console.error("❌ Failed to create admin user:", error);
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
            process.exit(0);
        })
        .catch((error) => {
            console.error("Seed data script failed:", error);
            process.exit(1);
        });
} else if (isStandaloneScript) {
    console.log("⚠️ Seed data script disabled in production mode");
    process.exit(0);
}
