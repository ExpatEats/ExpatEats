import { db } from "./db";
import { places } from "@shared/schema";
import { InsertPlace } from "@shared/schema";
import { eq } from "drizzle-orm";

// Function to add additional Lisbon food sources to the database
export async function importAdditionalFoodSources() {
    try {
        // This is the list of additional food sources we'll add to the database
        const additionalFoodSources: InsertPlace[] = [
            // Farm-Raised Meat Sources
            {
                name: "Biomercado (Farm Meat)",
                description:
                    "Biomercado offers organic, ethically sourced meat from local and regional farms, including beef, pork, and poultry.",
                address: "Multiple locations in Lisbon",
                city: "Lisbon",
                country: "Portugal",
                category: "organic supermarket",
                tags: ["farm-raised meat", "organic", "local"],
                imageUrl: "https://via.placeholder.com/150",
                website: "https://www.biomercado.pt/",
            },
            {
                name: "El Corte Inglés (Gourmet Meat)",
                description:
                    "Includes a gourmet meat section with select cuts from Portuguese farms known for humane and sustainable practices.",
                address: "Av. António Augusto de Aguiar, 31",
                city: "Lisbon",
                country: "Portugal",
                category: "department store",
                tags: ["farm-raised meat", "premium", "regional"],
                imageUrl: "https://via.placeholder.com/150",
                website: "https://www.elcorteingles.pt/",
            },
            {
                name: "Mercado de Campo de Ourique (Meat)",
                description:
                    "Traditional market with butchers offering farm-sourced meats including pasture-raised and locally butchered cuts.",
                address: "Rua Coelho da Rocha, 104",
                city: "Lisbon",
                country: "Portugal",
                category: "market",
                tags: ["farm-raised meat", "local", "traditional"],
                imageUrl: "https://via.placeholder.com/150",
                website: "https://www.mercadodecampodeourique.pt/",
            },
            {
                name: "Time Out Market Lisboa (Meat)",
                description:
                    "Several vendors sell farm-direct meat, including sausages and specialty cuts, often from small Portuguese producers.",
                address: "Avenida 24 de Julho",
                city: "Lisbon",
                country: "Portugal",
                category: "market",
                tags: ["farm-raised meat", "local", "artisan"],
                imageUrl: "https://via.placeholder.com/150",
                website: "https://www.timeoutmarket.com/lisboa/",
            },
            {
                name: "Miosótis Bio",
                description:
                    "Organic market known for high-quality produce and meats, including traceable farm-raised cuts of beef and poultry.",
                address: "Av. 5 de Outubro 143D, 1050-052 Lisboa",
                city: "Lisbon",
                country: "Portugal",
                category: "organic supermarket",
                tags: [
                    "farm-raised meat",
                    "organic",
                    "traceable",
                    "non-processed",
                    "bulk",
                ],
                imageUrl: "https://via.placeholder.com/150",
                website: "https://www.miosotis-bio.pt/",
            },
            {
                name: "Herdade do Freixo do Meio",
                description:
                    "A renowned organic farm offering direct-to-consumer meat deliveries, specializing in regenerative farming and Iberian breeds.",
                address: "Online and available at local Lisbon farmer markets",
                city: "Lisbon",
                country: "Portugal",
                category: "organic farm",
                tags: [
                    "farm-raised meat",
                    "organic",
                    "regenerative",
                    "delivery",
                    "direct purchase",
                ],
                imageUrl: "https://via.placeholder.com/150",
                website: "https://herdadedofreixodomeio.com/",
            },

            // Non-Processed Food Sources (not already included)
            {
                name: "Go Natural",
                description:
                    "Focuses on organic and natural products with some locations offering grains, legumes, and nuts in bulk packaging.",
                address: "Av. da Liberdade, and other locations in Lisbon",
                city: "Lisbon",
                country: "Portugal",
                category: "health food store",
                tags: ["non-processed", "organic", "bulk", "low-waste"],
                imageUrl: "https://via.placeholder.com/150",
                website: "https://www.gonatural.pt/",
            },

            // Kid-Friendly Healthy Snacks (additional tags for existing stores)
            // Note: Most of these stores are already in our database, we'll just add the kid-friendly tag to search

            // Bulk Buying Options (additional tagged locations)

            // Zero Waste Packaging Options
            {
                name: "Aromas do Valado",
                description:
                    "Specializes in herbal teas, legumes, and spices sold in bulk or compostable packaging, with a zero-waste ethic.",
                address: "Available at markets around Lisbon",
                city: "Lisbon",
                country: "Portugal",
                category: "market stall",
                tags: ["zero-waste", "organic", "bulk"],
                imageUrl: "https://via.placeholder.com/150",
                website: "https://aromasdovalado.pt/",
            },

            // Local Farms with Direct Purchase
            {
                name: "Quinta do Arneiro",
                description:
                    "Certified organic farm offering direct delivery of vegetable boxes, eggs, and seasonal items to the Lisbon area.",
                address: "Mafra, near Lisbon (deliveries to Lisbon)",
                city: "Mafra",
                country: "Portugal",
                category: "organic farm",
                tags: ["direct purchase", "organic", "CSA", "delivery"],
                imageUrl: "https://via.placeholder.com/150",
                website: "https://quintadoarneiro.com/",
            },
            {
                name: "Quinta das Abelhas",
                description:
                    "Produces seasonal vegetables, herbs, and preserves. Available at Lisbon markets or by farm pickup with pre-order.",
                address: "Sintra region (pickup and markets)",
                city: "Sintra",
                country: "Portugal",
                category: "sustainable farm",
                tags: ["local", "sustainable", "direct sales"],
                imageUrl: "https://via.placeholder.com/150",
                website: "https://www.instagram.com/quintadasabelhas/",
            },
            {
                name: "Cabaz Bio – BioCabaz.pt",
                description:
                    "A cooperative of organic farms delivering fresh seasonal produce directly to homes in Lisbon via box subscriptions.",
                address: "Deliveries from farms around Lisbon",
                city: "Lisbon",
                country: "Portugal",
                category: "farmers network",
                tags: ["organic", "direct purchase", "CSA", "delivery"],
                imageUrl: "https://via.placeholder.com/150",
                website: "https://www.biocabaz.pt/",
            },
            {
                name: "Quinta do Montalto",
                description:
                    "Family-run organic farm offering wine, olive oil, and seasonal produce for direct online order and Lisbon-area delivery.",
                address: "Ourém (delivers to Lisbon region)",
                city: "Ourém",
                country: "Portugal",
                category: "organic farm",
                tags: ["organic", "farm-direct", "delivery"],
                imageUrl: "https://via.placeholder.com/150",
                website: "https://www.quintadomontalto.pt/",
            },
            {
                name: "Raízes - Agricultura Sustentável",
                description:
                    "Provides local vegetable baskets sourced from sustainable farms, available via weekly subscription with Lisbon drop-off points.",
                address: "Lisbon and Greater Lisbon pickup points",
                city: "Lisbon",
                country: "Portugal",
                category: "CSA",
                tags: ["sustainable", "CSA", "local", "direct purchase"],
                imageUrl: "https://via.placeholder.com/150",
                website: "https://raizes.pt/",
            },
        ];

        // Now let's add additional tags to existing stores
        // We'll add kid-friendly and bulk buying tags to stores we know already exist
        const additionalTags = [
            { name: "Continente", tags: ["kid-friendly"] },
            { name: "Pingo Doce", tags: ["kid-friendly"] },
            { name: "Celeiro", tags: ["kid-friendly", "bulk"] },
            { name: "Biomercado", tags: ["kid-friendly", "bulk"] },
            {
                name: "Maria Granel",
                tags: ["kid-friendly", "bulk", "zero-waste"],
            },
            { name: "GreenBeans", tags: ["kid-friendly", "zero-waste"] },
            { name: "Lidl", tags: ["kid-friendly", "bulk value packs"] },
            { name: "Auchan", tags: ["bulk formats"] },
        ];

        console.log(
            `Importing ${additionalFoodSources.length} additional Lisbon food sources...`,
        );

        // Insert all food sources into the database
        await db.transaction(async (tx) => {
            for (const source of additionalFoodSources) {
                await tx.insert(places).values({
                    ...source,
                    status: "approved" as const,
                });
            }

            // Now update existing records with new tags
            for (const tagUpdate of additionalTags) {
                // Get the existing record
                const [existingPlace] = await db
                    .select()
                    .from(places)
                    .where(eq(places.name, tagUpdate.name));

                if (existingPlace) {
                    // Combine existing tags with new tags without duplicates
                    const existingTags = existingPlace.tags || [];
                    const newTags = [...existingTags];

                    // Add new tags that don't already exist
                    for (const tag of tagUpdate.tags) {
                        if (!newTags.includes(tag)) {
                            newTags.push(tag);
                        }
                    }

                    // Update the record
                    await tx
                        .update(places)
                        .set({ tags: newTags })
                        .where(eq(places.id, existingPlace.id));

                    console.log(`Updated tags for ${tagUpdate.name}`);
                }
            }
        });

        console.log("Additional food sources imported successfully!");
        return { success: true, count: additionalFoodSources.length };
    } catch (error) {
        console.error("Error importing additional food sources:", error);
        return { success: false, error };
    }
}
