import { db } from "./db";
import { places } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { InsertPlace } from "@shared/schema";

export async function importEnhancedStores() {
    console.log("Starting enhanced store data import...");

    try {
        // Enhanced store data structure based on your Excel format
        const enhancedStores: Partial<InsertPlace>[] = [
            // Example entries - replace with your actual Excel data
            {
                uniqueId: "CELEIRO_LISBON_001",
                name: "Celeiro - Chiado",
                description:
                    "Portugal's leading health food chain offering organic products, supplements, and natural foods. Extensive gluten-free and vegan selection with knowledgeable staff.",
                address: "Rua do Carmo 88, 1200-092 Lisboa",
                city: "lisbon",
                region: "Greater Lisbon",
                country: "Portugal",
                category: "Health Food Store",
                tags: [
                    "organic",
                    "gluten-free",
                    "vegan",
                    "supplements",
                    "natural-products",
                ],
                latitude: "38.7114",
                longitude: "-9.1394",
                phone: "+351 21 342 4567",
                email: "chiado@celeiro.pt",
                instagram: "@celeiro_portugal",
                glutenFree: true,
                dairyFree: true,
                vegan: true,
                organic: true,
                status: "approved",
            },
            {
                uniqueId: "MERCADO_BIOLOGICO_001",
                name: "Mercado Biológico do Príncipe Real",
                description:
                    "Saturday organic market featuring local farmers and producers. Fresh seasonal vegetables, artisanal breads, and traditional Portuguese organic products.",
                address: "Praça do Príncipe Real, 1250-096 Lisboa",
                city: "lisbon",
                region: "Greater Lisbon",
                country: "Portugal",
                category: "Farmers Market",
                tags: [
                    "organic",
                    "local-farms",
                    "fresh-vegetables",
                    "weekend-market",
                ],
                latitude: "38.7158",
                longitude: "-9.1497",
                phone: "+351 96 123 4567",
                organic: true,
                localFarms: true,
                freshVegetables: true,
                status: "approved",
            },
            {
                uniqueId: "PINGO_DOCE_BIO_001",
                name: "Pingo Doce - Avenidas Novas",
                description:
                    "Major Portuguese supermarket chain with comprehensive Bio section. Wide selection of organic produce, gluten-free products, and international health foods.",
                address: "Av. da República 50, 1050-196 Lisboa",
                city: "lisbon",
                region: "Greater Lisbon",
                country: "Portugal",
                category: "Supermarket",
                tags: [
                    "organic",
                    "gluten-free",
                    "dairy-free",
                    "bulk-buying",
                    "bio-section",
                ],
                latitude: "38.7372",
                longitude: "-9.1457",
                phone: "+351 21 793 4000",
                website: "https://www.pingodoce.pt",
                glutenFree: true,
                dairyFree: true,
                organic: true,
                bulkBuying: true,
                status: "approved",
            },
        ];

        let importedCount = 0;

        for (const store of enhancedStores) {
            try {
                // Check if store already exists by uniqueId or name
                const existing = store.uniqueId
                    ? await db
                          .select()
                          .from(places)
                          .where(eq(places.uniqueId, store.uniqueId))
                          .limit(1)
                    : await db
                          .select()
                          .from(places)
                          .where(eq(places.name, store.name!))
                          .limit(1);

                if (existing) {
                    console.log(`Store already exists: ${store.name}`);
                    continue;
                }

                await db.insert(places).values({
                    ...store,
                    createdAt: new Date(),
                } as InsertPlace);

                importedCount++;
                console.log(`Imported: ${store.name}`);
            } catch (error) {
                console.error(`Error importing ${store.name}:`, error);
            }
        }

        console.log(
            `Enhanced store import completed. Imported ${importedCount} new stores.`,
        );
        return { success: true, count: importedCount };
    } catch (error) {
        console.error("Enhanced store import failed:", error);
        return { success: false, error: error.message };
    }
}

// Function to import from CSV/Excel data
export async function importFromExcelData(excelData: any[]) {
    console.log("Starting Excel data import...");

    try {
        let importedCount = 0;

        for (const row of excelData) {
            try {
                // Map Excel columns to database fields
                const storeData: Partial<InsertPlace> = {
                    uniqueId: row.uniqueId || row.id,
                    name: row.name,
                    description: row.description,
                    address: row.address,
                    city: row.city?.toLowerCase(),
                    region: row.region,
                    country: row.country || "Portugal",
                    category: row.category,
                    tags:
                        typeof row.tags === "string"
                            ? row.tags.split(",").map((t) => t.trim())
                            : row.tags || [],
                    latitude: row.latitude?.toString(),
                    longitude: row.longitude?.toString(),
                    phone: row.phone,
                    email: row.email,
                    instagram: row.instagram,
                    website: row.website,

                    // Boolean filters
                    glutenFree: Boolean(row.glutenFree || row.gluten_free),
                    dairyFree: Boolean(row.dairyFree || row.dairy_free),
                    nutFree: Boolean(row.nutFree || row.nut_free),
                    vegan: Boolean(row.vegan),
                    organic: Boolean(row.organic),
                    localFarms: Boolean(row.localFarms || row.local_farms),
                    freshVegetables: Boolean(
                        row.freshVegetables || row.fresh_vegetables,
                    ),
                    farmRaisedMeat: Boolean(
                        row.farmRaisedMeat || row.farm_raised_meat,
                    ),
                    noProcessed: Boolean(row.noProcessed || row.no_processed),
                    kidFriendly: Boolean(row.kidFriendly || row.kid_friendly),
                    bulkBuying: Boolean(row.bulkBuying || row.bulk_buying),
                    zeroWaste: Boolean(row.zeroWaste || row.zero_waste),

                    status: "approved",
                };

                // Check if store already exists
                const existing = storeData.uniqueId
                    ? await db.query.places.findFirst({
                          where: (places, { eq }) =>
                              eq(places.uniqueId, storeData.uniqueId),
                      })
                    : await db.query.places.findFirst({
                          where: (places, { eq }) =>
                              eq(places.name, storeData.name!),
                      });

                if (existing) {
                    console.log(`Store already exists: ${storeData.name}`);
                    continue;
                }

                await db.insert(places).values({
                    ...storeData,
                    createdAt: new Date(),
                } as InsertPlace);

                importedCount++;
                console.log(`Imported: ${storeData.name}`);
            } catch (error) {
                console.error(`Error importing row:`, error);
            }
        }

        console.log(
            `Excel import completed. Imported ${importedCount} new stores.`,
        );
        return { success: true, count: importedCount };
    } catch (error) {
        console.error("Excel import failed:", error);
        return { success: false, error: error.message };
    }
}
