import { importSupplementsData } from "./importSupplementsData.js";
import { importFoodSources } from "./importFoodSources.js";
import { importEnhancedStores } from "./importEnhancedStores.js";
import { importLisbonFoodSources } from "./importLisbonFoodSources.js";
import { importLocationGuides } from "./importLocationGuides.js";
import { importAdditionalFoodSources } from "./importAdditionalFoodSources.js";

export async function runSeedData() {
  console.log("🌱 Starting seed data import...");
  
  try {
    // Import food sources
    console.log("📦 Importing food sources...");
    const foodSourcesResult = await importFoodSources();
    if (foodSourcesResult.success) {
      console.log(`✅ Food sources imported: ${foodSourcesResult.count} items`);
    } else {
      console.error("❌ Food sources import failed:", foodSourcesResult.error);
    }

    // Import supplements data
    console.log("💊 Importing supplements data...");
    const supplementsResult = await importSupplementsData();
    if (supplementsResult.success) {
      console.log(`✅ Supplements imported: ${supplementsResult.count} items`);
    } else {
      console.error("❌ Supplements import failed:", supplementsResult.error);
    }

    // Import enhanced stores
    console.log("🏪 Importing enhanced stores...");
    const enhancedStoresResult = await importEnhancedStores();
    if (enhancedStoresResult.success) {
      console.log(`✅ Enhanced stores imported: ${enhancedStoresResult.count} items`);
    } else {
      console.error("❌ Enhanced stores import failed:", enhancedStoresResult.error);
    }

    // Import Lisbon food sources
    console.log("🇵🇹 Importing Lisbon food sources...");
    const lisbonResult = await importLisbonFoodSources();
    if (lisbonResult.success) {
      console.log(`✅ Lisbon food sources imported: ${lisbonResult.count} items`);
    } else {
      console.error("❌ Lisbon food sources import failed:", lisbonResult.error);
    }

    // Import location guides
    console.log("📍 Importing location guides...");
    const locationGuidesResult = await importLocationGuides();
    if (locationGuidesResult.success) {
      console.log(`✅ Location guides imported: ${locationGuidesResult.count} items`);
    } else {
      console.error("❌ Location guides import failed:", locationGuidesResult.error);
    }

    // Import additional food sources
    console.log("➕ Importing additional food sources...");
    const additionalResult = await importAdditionalFoodSources();
    if (additionalResult.success) {
      console.log(`✅ Additional food sources imported: ${additionalResult.count} items`);
    } else {
      console.error("❌ Additional food sources import failed:", additionalResult.error);
    }

    console.log("🎉 Seed data import completed!");
    return { success: true };
  } catch (error) {
    console.error("💥 Seed data import failed:", error);
    return { success: false, error };
  }
}

// Allow running this script directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeedData()
    .then(() => {
      console.log("Seed data script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seed data script failed:", error);
      process.exit(1);
    });
}