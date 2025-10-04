import { db } from "./db";
import { places } from "@shared/schema";

export async function importLisbonFoodSources() {
    console.log("Starting import of Lisbon food sources...");

    const lisbonFoodSources = [
        // Local Farms Direct Purchase
        {
            name: "Herdade do Freixo do Meio",
            description:
                "One of Portugal's most well-known regenerative farms offering organic meats, vegetables, and pantry items delivered directly to Lisbon residents.",
            address: "Sales via online store and Lisbon markets",
            city: "Lisbon",
            country: "Portugal",
            category: "Organic Farm & Online Store",
            tags: ["direct-purchase", "organic", "regenerative", "delivery"],
            website: "https://herdadedofreixodomeio.com/",
        },
        {
            name: "Quinta do Arneiro",
            description:
                "Certified organic farm offering direct delivery of vegetable boxes, eggs, and seasonal items to the Lisbon area.",
            address: "Mafra, near Lisbon (deliveries to Lisbon)",
            city: "Mafra",
            country: "Portugal",
            category: "Organic Farm",
            tags: ["direct-purchase", "organic", "csa", "delivery"],
            website: "https://quintadoarneiro.com/",
        },
        {
            name: "Quinta das Abelhas",
            description:
                "Produces seasonal vegetables, herbs, and preserves. Available at Lisbon markets or by farm pickup with pre-order.",
            address: "Sintra region (pickup and markets)",
            city: "Sintra",
            country: "Portugal",
            category: "Small Sustainable Farm",
            tags: ["local", "sustainable", "direct-sales"],
            website: "https://www.instagram.com/quintadasabelhas/",
        },
        {
            name: "Cabaz Bio – BioCabaz.pt",
            description:
                "A cooperative of organic farms delivering fresh seasonal produce directly to homes in Lisbon via box subscriptions.",
            address: "Deliveries from farms around Lisbon",
            city: "Lisbon",
            country: "Portugal",
            category: "Organic Farmers Network",
            tags: ["organic", "direct-purchase", "csa", "delivery"],
            website: "https://www.biocabaz.pt/",
        },
        {
            name: "Quinta do Montalto",
            description:
                "Family-run organic farm offering wine, olive oil, and seasonal produce for direct online order and Lisbon-area delivery.",
            address: "Ourém (delivers to Lisbon region)",
            city: "Ourém",
            country: "Portugal",
            category: "Family Organic Farm",
            tags: ["organic", "farm-direct", "delivery"],
            website: "https://www.quintadomontalto.pt/",
        },
        {
            name: "Raízes - Agricultura Sustentável",
            description:
                "Provides local vegetable baskets sourced from sustainable farms, available via weekly subscription with Lisbon drop-off points.",
            address: "Lisbon and Greater Lisbon pickup points",
            city: "Lisbon",
            country: "Portugal",
            category: "Community-Supported Agriculture (CSA)",
            tags: ["sustainable", "csa", "local", "no-intermediaries"],
            website: "https://raizes.pt/",
        },

        // Zero Waste Packaging
        {
            name: "Maria Granel",
            description:
                "Pioneering zero-waste store in Lisbon focused on bulk, organic goods where customers bring their own containers for all purchases.",
            address: "Multiple locations in Lisbon",
            city: "Lisbon",
            country: "Portugal",
            category: "Organic Bulk Store",
            tags: ["zero-waste", "organic", "bulk"],
            website: "https://mariagranel.com/",
        },
        {
            name: "Miosótis Bio",
            description:
                "Eco-conscious supermarket offering a range of plastic-free produce, dry goods in compostable or recyclable packaging, and refill stations.",
            address: "Av. 5 de Outubro 143D, 1050-052 Lisboa",
            city: "Lisbon",
            country: "Portugal",
            category: "Organic Supermarket",
            tags: ["zero-waste", "organic", "compostable-packaging"],
            website: "https://www.miosotis-bio.pt/",
        },
        {
            name: "Celeiro",
            description:
                "While not a zero-waste store, Celeiro offers some bulk items and reusable packaging products such as beeswax wraps and refillable jars.",
            address: "Multiple locations in Lisbon",
            city: "Lisbon",
            country: "Portugal",
            category: "Health Food Store",
            tags: [
                "low-waste",
                "reusable-options",
                "organic",
                "gluten-free",
                "vegan",
            ],
            website: "https://www.celeiro.pt/",
        },
        {
            name: "Go Natural",
            description:
                "Provides natural and organic foods, with some bulk options and a section dedicated to sustainable household products.",
            address: "Av. da Liberdade, and other locations in Lisbon",
            city: "Lisbon",
            country: "Portugal",
            category: "Health Food Store",
            tags: [
                "low-waste",
                "natural",
                "sustainable-packaging",
                "bulk",
                "organic",
            ],
            website: "https://www.gonatural.pt/",
        },
        {
            name: "GreenBeans",
            description:
                "100% vegan and eco-focused store with minimal packaging, promoting biodegradable and reusable options.",
            address: "Lisbon",
            city: "Lisbon",
            country: "Portugal",
            category: "Vegan Grocery Store",
            tags: [
                "zero-waste",
                "vegan",
                "sustainable",
                "organic",
                "dairy-free",
            ],
            website: "https://www.simbiotico.eco/en/ecospot/greenbeans",
        },
        {
            name: "Aromas do Valado",
            description:
                "Specializes in herbal teas, legumes, and spices sold in bulk or compostable packaging, with a zero-waste ethic.",
            address: "Available at markets around Lisbon",
            city: "Lisbon",
            country: "Portugal",
            category: "Organic Market Stall & Online Store",
            tags: ["zero-waste", "organic", "bulk"],
            website: "https://aromasdovalado.pt/",
        },

        // Bulk Buying
        {
            name: "Biomercado",
            description:
                "Carries a variety of bulk-packaged goods including flours, beans, and grains, all certified organic.",
            address: "Multiple locations in Lisbon",
            city: "Lisbon",
            country: "Portugal",
            category: "Organic Supermarket",
            tags: [
                "bulk",
                "organic",
                "zero-waste",
                "gluten-free",
                "vegan",
                "dairy-free",
            ],
            website: "https://www.biomercado.pt/",
        },
        {
            name: "Lidl",
            description:
                "Though not a bulk store, Lidl regularly offers large value packs of grains, snacks, and frozen items at discount prices.",
            address: "Multiple locations in Lisbon",
            city: "Lisbon",
            country: "Portugal",
            category: "Supermarket",
            tags: [
                "bulk-value-packs",
                "budget-friendly",
                "gluten-free",
                "vegan",
                "dairy-free",
            ],
            website: "https://www.lidl.pt/",
        },
        {
            name: "Auchan",
            description:
                "Provides a selection of dry goods and frozen items in bulk or extra-large formats, often with store-brand discounts.",
            address: "Multiple locations in Lisbon",
            city: "Lisbon",
            country: "Portugal",
            category: "Supermarket",
            tags: [
                "bulk-formats",
                "family-size",
                "gluten-free",
                "vegan",
                "dairy-free",
            ],
            website: "https://www.auchan.pt/",
        },

        // Kid-Friendly Healthy Snacks
        {
            name: "Continente",
            description:
                "Carries a wide selection of kid-friendly snacks including fruit bars, rice cakes, organic applesauce, and dairy-free yogurts.",
            address: "Multiple locations in Lisbon",
            city: "Lisbon",
            country: "Portugal",
            category: "Supermarket",
            tags: [
                "kid-friendly",
                "organic",
                "dairy-free",
                "gluten-free",
                "vegan",
                "fresh-vegetables",
            ],
            website: "https://www.continente.pt/",
        },
        {
            name: "Pingo Doce",
            description:
                "Offers a variety of affordable healthy snack options for children such as dried fruits, fruit puree pouches, and non-sugar cereals.",
            address: "Multiple locations in Lisbon",
            city: "Lisbon",
            country: "Portugal",
            category: "Supermarket",
            tags: [
                "kid-friendly",
                "no-added-sugar",
                "budget-friendly",
                "gluten-free",
                "vegan",
                "dairy-free",
                "fresh-vegetables",
            ],
            website: "https://www.pingodoce.pt/",
        },

        // No Processed Food Sources
        {
            name: "Mercado de Campo de Ourique",
            description:
                "Traditional neighborhood market offering fresh produce, meats, and other naturally sourced goods with minimal processing.",
            address: "Rua Coelho da Rocha, 104",
            city: "Lisbon",
            country: "Portugal",
            category: "Traditional Market",
            tags: [
                "non-processed",
                "fresh",
                "traditional",
                "farm-raised-meat",
                "fresh-vegetables",
            ],
            website: "https://www.mercadodecampodeourique.pt/",
        },
        {
            name: "Time Out Market Lisboa (Mercado da Ribeira)",
            description:
                "Public market with vendors selling fresh fruits, vegetables, and farm products directly from source with minimal handling.",
            address: "Avenida 24 de Julho",
            city: "Lisbon",
            country: "Portugal",
            category: "Market",
            tags: [
                "non-processed",
                "local-produce",
                "farm-raised-meat",
                "fresh-vegetables",
            ],
            website: "https://www.timeoutmarket.com/lisboa/",
        },

        // Farm-Raised Meat
        {
            name: "El Corte Inglés",
            description:
                "Includes a gourmet meat section with select cuts from Portuguese farms known for humane and sustainable practices.",
            address: "Av. António Augusto de Aguiar, 31",
            city: "Lisbon",
            country: "Portugal",
            category: "Department Store with Supermarket",
            tags: [
                "farm-raised-meat",
                "premium",
                "regional",
                "gluten-free",
                "vegan",
                "dairy-free",
                "organic",
                "fresh-vegetables",
            ],
            website: "https://www.elcorteingles.pt/",
        },

        // Additional comprehensive stores
        {
            name: "Bomercado",
            description:
                "Focuses on supporting local producers with organic certifications, offering fruits, vegetables, and pantry goods.",
            address: "R. de São Bento 235, 1250-221 Lisbon",
            city: "Lisbon",
            country: "Portugal",
            category: "Organic Grocery Store",
            tags: ["organic", "fresh-vegetables", "vegan", "dairy-free"],
            website: "https://www.happycow.net/reviews/bomercado-lisbon-424897",
        },

        // Specialized Gluten-Free
        {
            name: "Sam Pastelaria Saudável",
            description:
                "Health-focused bakery offering certified gluten-free products, including vegan and sugar-free options.",
            address: "Rua Luís Augusto Palmeirim, 1D",
            city: "Lisbon",
            country: "Portugal",
            category: "Bakery",
            tags: ["gluten-free", "lactose-free", "sugar-free", "vegan"],
            website: "https://www.sampastelariasaudavel.com/",
        },
        {
            name: "Despensa No.6",
            description:
                "Fully gluten-free and sugar-free bakery and café, offering a variety of pastries and brunch options.",
            address: "Avenida Sacadura Cabral, 6A",
            city: "Lisbon",
            country: "Portugal",
            category: "Bakery & Café",
            tags: ["gluten-free", "sugar-free", "vegan"],
            website: "https://despensa6.pt/en/",
        },
        {
            name: "Saludê Pastelaria Fit",
            description:
                "Bakery that is fully gluten-free, lactose-free, and refined sugar-free, providing a range of baked goods and brunch items.",
            address: "Av. Santa Joana Princesa, 23C",
            city: "Lisbon",
            country: "Portugal",
            category: "Bakery",
            tags: ["gluten-free", "lactose-free", "sugar-free", "vegan"],
            website: "https://saludepastelariafit.com/",
        },
        {
            name: "Batardas",
            description:
                "Dedicated gluten-free bakery offering breads, pastries, and other treats.",
            address: "Praceta Lagoa de Óbidos, 38",
            city: "Parede",
            country: "Portugal",
            category: "Bakery",
            tags: ["gluten-free"],
            website: "https://www.batardas.pt/",
        },
        {
            name: "Minipreço",
            description:
                "Discount supermarket chain with multiple locations in Lisbon, offering some gluten-free options.",
            address: "Multiple locations in Lisbon",
            city: "Lisbon",
            country: "Portugal",
            category: "Supermarket",
            tags: ["gluten-free"],
            website: "https://www.minipreco.pt/",
        },
    ];

    try {
        // Add approved status to all places
        const lisbonFoodSourcesWithStatus = lisbonFoodSources.map((place) => ({
            ...place,
            status: "approved" as const,
        }));

        const insertedPlaces = await db
            .insert(places)
            .values(lisbonFoodSourcesWithStatus)
            .returning();
        console.log(
            `Successfully imported ${insertedPlaces.length} Lisbon food sources`,
        );
        return { success: true, count: insertedPlaces.length };
    } catch (error) {
        console.error("Error importing Lisbon food sources:", error);
        return { success: false, error: error.message };
    }
}
