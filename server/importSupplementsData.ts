import { db } from "./db";
import { places } from "@shared/schema";
import type { InsertPlace } from "@shared/schema";

export async function importSupplementsData() {
    console.log("Starting supplements data import...");

    const supplementsData: InsertPlace[] = [
        // Lisbon
        {
            name: "Celeiro",
            description:
                "Portugal's leading natural products chain with a wide selection of supplements, vitamins, and herbal remedies.",
            address: "Av. de Roma 8, 1000-265 Lisboa",
            city: "Lisbon",
            country: "Portugal",
            category: "Health Food Store",
            tags: ["supplements", "vitamins", "herbal-remedies", "organic"],
            website: "https://www.celeiro.pt",
        },
        {
            name: "PrimeBody NutriShop",
            description:
                "Offers a strong range of sports nutrition and wellness supplements in central Lisbon.",
            address: "Av. 5 de Outubro 293B, 1600-035 Lisboa",
            city: "Lisbon",
            country: "Portugal",
            category: "Health Food Store",
            tags: ["supplements", "sports-nutrition", "wellness"],
            website:
                "https://www.tripadvisor.com/Attraction_Review-g189158-d25642203-Reviews-PrimeBody-Lisbon_Lisbon_District",
        },
        {
            name: "El Corte Inglés",
            description:
                "Carries domestic and international supplement brands, including sports nutrition and specialty wellness products.",
            address: "Av. António Augusto de Aguiar 31, 1069-413 Lisboa",
            city: "Lisbon",
            country: "Portugal",
            category: "Department Store",
            tags: [
                "supplements",
                "sports-nutrition",
                "wellness",
                "international-brands",
            ],
            website: "https://www.elcorteingles.pt",
        },
        {
            name: "Healthcare Store (Lisbon Airport)",
            description:
                "Focused on supplements and natural wellness, including travel-friendly formats.",
            address: "Lisbon Airport, Terminal 1",
            city: "Lisbon",
            country: "Portugal",
            category: "Health Food Store",
            tags: ["supplements", "natural-wellness", "travel-friendly"],
            website:
                "https://www.lisbonairport.pt/en/lis/services-shopping/shops-and-food/healthcare-store",
        },

        // Oeiras
        {
            name: "Celeiro (Oeiras Parque Shopping)",
            description:
                "Full range of natural health products and supplements, including vegan and gluten-free options.",
            address:
                "Av. António Bernardo Cabral de Macedo 19, 2770-219 Oeiras",
            city: "Oeiras",
            country: "Portugal",
            category: "Health Food Store",
            tags: ["supplements", "vegan", "gluten-free", "natural-health"],
            website: "https://www.celeiro.pt/lojas/celeiro-oeiras-parque",
        },
        {
            name: "Natural Crave",
            description:
                "Smaller health store with a strong focus on supplements and clean ingredient lists.",
            address: "Oeiras Parque Shopping, Loja 220",
            city: "Oeiras",
            country: "Portugal",
            category: "Health Food Store",
            tags: ["supplements", "clean-ingredients", "health-store"],
            website: "https://www.instagram.com/naturalcrave.pt",
        },

        // Cascais
        {
            name: "Celeiro (CascaiShopping)",
            description:
                "Offers certified supplements, herbal extracts, and wellness products.",
            address: "Estrada Nacional 9, 2645-543 Alcabideche",
            city: "Cascais",
            country: "Portugal",
            category: "Health Food Store",
            tags: ["supplements", "herbal-extracts", "wellness", "certified"],
            website: "https://www.celeiro.pt/lojas/celeiro-cascaishopping",
        },
        {
            name: "Terra Pura",
            description:
                "Features natural supplements, superfoods, and essential oils in a well-curated environment.",
            address: "CascaiShopping, Loja 0.132",
            city: "Cascais",
            country: "Portugal",
            category: "Health Food Store",
            tags: ["supplements", "superfoods", "essential-oils", "natural"],
            website: "https://www.cascaishopping.pt/en/store/terra-pura-2-en",
        },
        {
            name: "Bioshop",
            description:
                "Small store in central Cascais with organic pantry goods and some natural supplements.",
            address: "Av. 25 de Abril 672, 2750-511 Cascais",
            city: "Cascais",
            country: "Portugal",
            category: "Health Food Store",
            tags: ["supplements", "organic", "natural"],
            website: "https://www.happycow.net/reviews/bioshop-cascais-92393",
        },
        {
            name: "Mundo Bio",
            description:
                "Organic market in Cascais offering a wide range of supplements, wellness products, and clean-label groceries.",
            address: "Rua de Alvide 289, 2750-289 Cascais",
            city: "Cascais",
            country: "Portugal",
            category: "Organic Market",
            tags: ["supplements", "wellness", "organic", "clean-label"],
            website:
                "https://wanderlog.com/place/details/12649927/mundo-bio-cascais",
        },

        // Sintra
        {
            name: "Celeiro (Forum Sintra)",
            description:
                "Reliable stock of supplements, especially natural and allergy-friendly options.",
            address: "IC19, Loja 0.065, 2635-018 Rio de Mouro",
            city: "Sintra",
            country: "Portugal",
            category: "Health Food Store",
            tags: ["supplements", "natural", "allergy-friendly"],
            website: "https://www.celeiro.pt/lojas/celeiro-forum-sintra",
        },
        {
            name: "Quinta dos 7 Nomes",
            description:
                "Offers locally made and bulk natural products, including select supplements.",
            address: "Rua das Lameiras, 2705-353 Colares",
            city: "Sintra",
            country: "Portugal",
            category: "Farm",
            tags: ["supplements", "local", "bulk", "natural"],
            website: "https://www.simbiotico.eco/en/ecospot/quinta-7-nomes",
        },
        {
            name: "Aldeia Coop",
            description:
                "Regenerative cooperative market offering supplements, bulk goods, and wellness products.",
            address: "Rua Marquês de Pombal 22, 2710-519 Sintra",
            city: "Sintra",
            country: "Portugal",
            category: "Cooperative Market",
            tags: [
                "supplements",
                "bulk",
                "wellness",
                "cooperative",
                "regenerative",
            ],
            website: "https://www.instagram.com/aldeia.coop",
        },

        // Online Retailers - All regions
        {
            name: "iHerb",
            description:
                "Comprehensive global retailer for supplements, with shipping to Portugal.",
            address: "Online Store",
            city: "Online",
            country: "Portugal",
            category: "Online Store",
            tags: ["supplements", "online", "global", "shipping"],
            website: "https://www.iherb.com",
        },
        {
            name: "Prozis",
            description:
                "Portugal-based online store for fitness, wellness, and lifestyle supplements.",
            address: "Online Store",
            city: "Online",
            country: "Portugal",
            category: "Online Store",
            tags: ["supplements", "fitness", "wellness", "lifestyle", "online"],
            website: "https://www.prozis.com/pt/pt",
        },
        {
            name: "Welldium",
            description:
                "Practitioner-grade supplements from brands like Pure Encapsulations and Nordic Naturals.",
            address: "Online Store",
            city: "Online",
            country: "Portugal",
            category: "Online Store",
            tags: ["supplements", "practitioner-grade", "online"],
            website: "https://welldium.com",
        },
        {
            name: "Nordic Naturals",
            description:
                "Renowned for high-purity omega-3 and DHA supplements.",
            address: "Online Store",
            city: "Online",
            country: "Portugal",
            category: "Online Store",
            tags: ["supplements", "omega-3", "dha", "high-purity", "online"],
            website: "https://www.nordicnaturals.com",
        },
        {
            name: "Pure Encapsulations",
            description:
                "Specializes in hypoallergenic, vegan-friendly, and clinically backed supplements.",
            address: "Online Store",
            city: "Online",
            country: "Portugal",
            category: "Online Store",
            tags: [
                "supplements",
                "hypoallergenic",
                "vegan",
                "clinically-backed",
                "online",
            ],
            website: "https://www.pureencapsulations.com",
        },
        {
            name: "Holland & Barrett",
            description:
                "Well-known retailer with a wide selection of global supplement brands.",
            address: "Online Store",
            city: "Online",
            country: "Portugal",
            category: "Online Store",
            tags: ["supplements", "global-brands", "online"],
            website: "https://www.hollandandbarrett.com",
        },
        {
            name: "Alnatura",
            description:
                "Organic product line including dietary supplements and nutritional aids.",
            address: "Online Store",
            city: "Online",
            country: "Portugal",
            category: "Online Store",
            tags: [
                "supplements",
                "organic",
                "dietary",
                "nutritional",
                "online",
            ],
            website: "https://www.alnatura.de",
        },
        {
            name: "FutuNatura",
            description: "Clean-label and sustainable supplement formulations.",
            address: "Online Store",
            city: "Online",
            country: "Portugal",
            category: "Online Store",
            tags: ["supplements", "clean-label", "sustainable", "online"],
            website: "https://www.futunatura.com",
        },
        {
            name: "Greatlife.eu",
            description:
                "European-based store with creatine, omega-3s, and essential minerals.",
            address: "Online Store",
            city: "Online",
            country: "Portugal",
            category: "Online Store",
            tags: ["supplements", "creatine", "omega-3", "minerals", "online"],
            website: "https://greatlife.eu",
        },
        {
            name: "Nordic Kings",
            description:
                "Grass-fed and organic animal-based supplements like liver and bone broth.",
            address: "Online Store",
            city: "Online",
            country: "Portugal",
            category: "Online Store",
            tags: [
                "supplements",
                "grass-fed",
                "organic",
                "animal-based",
                "online",
            ],
            website: "https://nordickings.com",
        },
    ];

    try {
        // Add approved status to all supplement data
        const supplementsWithStatus = supplementsData.map((place) => ({
            ...place,
            status: "approved" as const,
        }));

        // Insert all supplements data
        const result = await db
            .insert(places)
            .values(supplementsWithStatus)
            .returning();
        console.log(`Successfully imported ${result.length} supplement stores`);
        return { success: true, count: result.length };
    } catch (error) {
        console.error("Error importing supplements data:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
