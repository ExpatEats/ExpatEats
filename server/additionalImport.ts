import { db } from "./db";
import { places } from "@shared/schema";
import { InsertPlace } from "@shared/schema";

// Function to import additional food sources focusing on specific diets/preferences
export async function importAdditionalFoodSources() {
    try {
        const additionalSources: InsertPlace[] = [
            // Farm-Raised Meat Sources
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
            // Add kid-friendly option
            {
                name: "Vivamus Natural Kids",
                description:
                    "Specialty store focusing on healthy, organic, kid-friendly snacks and foods suitable for children with various dietary needs.",
                address: "Rua Rodrigo da Fonseca 82, Lisbon",
                city: "Lisbon",
                country: "Portugal",
                category: "specialty store",
                tags: ["kid-friendly", "organic", "allergen-free"],
                imageUrl: "https://via.placeholder.com/150",
                website: "https://example.com/vivamus", // Placeholder as example
            },
        ];

        console.log(
            `Importing ${additionalSources.length} additional food sources...`,
        );

        // Insert all new food sources
        await db.transaction(async (tx) => {
            for (const source of additionalSources) {
                await tx.insert(places).values(source);
            }
        });

        console.log("Additional food sources imported successfully!");
        return { success: true, count: additionalSources.length };
    } catch (error) {
        console.error("Error importing additional food sources:", error);
        return { success: false, error };
    }
}
