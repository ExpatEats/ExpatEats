import { db } from "./db";
import { places } from "@shared/schema";

export async function importLocationGuides() {
  console.log("Starting import of location guides...");
  
  try {
    // Sintra food sources
    const sintraPlaces = [
      // Gluten-Free stores in Sintra
      {
        name: "Continente Modelo",
        description: "Offers a variety of gluten-free products, including breads and pastas, under its in-house brand and international labels.",
        address: "Lourel, Sintra",
        city: "Sintra",
        country: "Portugal",
        category: "grocery",
        tags: ["gluten-free", "organic", "dairy-free", "vegan", "fresh-vegetables", "kid-friendly", "bio"],
        website: "https://www.continente.pt"
      },
      {
        name: "Pingo Doce",
        description: "Provides affordable gluten-free options such as cookies, crackers, and pasta in their health section.",
        address: "Multiple Locations in Sintra",
        city: "Sintra", 
        country: "Portugal",
        category: "grocery",
        tags: ["gluten-free", "dairy-free", "vegan", "fresh-vegetables", "kid-friendly", "organic"],
        website: "https://www.pingodoce.pt"
      },
      {
        name: "Auchan",
        description: "Stocks certified gluten-free snacks, grains, and baking mixes with clearly labeled sections.",
        address: "Mem Martins, Sintra",
        city: "Sintra",
        country: "Portugal", 
        category: "grocery",
        tags: ["gluten-free", "nut-free", "dairy-free", "vegan", "organic", "fresh-vegetables", "farm-raised-meat"],
        website: "https://www.auchan.pt"
      },
      {
        name: "Lidl",
        description: "Offers gluten-free products under their 'Free From' and 'Bio Organic' brands, especially in cereals and snacks.",
        address: "Multiple Locations in Sintra",
        city: "Sintra",
        country: "Portugal",
        category: "grocery", 
        tags: ["gluten-free", "nut-free", "dairy-free", "vegan", "organic", "fresh-vegetables", "kid-friendly"],
        website: "https://www.lidl.pt"
      },
      {
        name: "Celeiro",
        description: "Health food store with dedicated gluten-free shelves including cereals, pastas, and flours.",
        address: "Forum Sintra",
        city: "Sintra",
        country: "Portugal",
        category: "grocery",
        tags: ["gluten-free", "nut-free", "dairy-free", "vegan", "organic", "fresh-vegetables", "no-processed", "kid-friendly", "bulk-buying", "zero-waste"],
        website: "https://www.celeiro.pt/lojas/celeiro-forum-sintra"
      },
      {
        name: "Quinta dos 7 Nomes",
        description: "Small organic grocery shop offering gluten-free pantry items and fresh organic produce.",
        address: "Almocageme, Sintra",
        city: "Sintra", 
        country: "Portugal",
        category: "grocery",
        tags: ["gluten-free", "dairy-free", "vegan", "organic", "local-farms", "fresh-vegetables", "no-processed", "bulk-buying", "zero-waste"],
        website: "https://www.simbiotico.eco/en/ecospot/quinta-7-nomes"
      },
      {
        name: "Dookan",
        description: "Indian grocery offering gluten-free flours and naturally gluten-free grains.",
        address: "Online delivery to Sintra",
        city: "Sintra",
        country: "Portugal",
        category: "grocery",
        tags: ["gluten-free", "nut-free", "dairy-free", "vegan", "organic"],
        website: "https://eu.dookan.com"
      },
      {
        name: "Pisão Farm",
        description: "Eco community farm where visitors can pick organic vegetables.",
        address: "Sintra-Cascais Nature Park",
        city: "Sintra",
        country: "Portugal", 
        category: "market",
        tags: ["local-farms", "fresh-vegetables", "organic"],
        website: "https://www.theguardian.com/travel/2025/jan/19/culinary-adventure-lisbon-coast-cascais-estoril-and-sintra-portugal"
      },
      {
        name: "Mercado Saloio",
        description: "Local produce market offering a wide range of organic fruits and vegetables directly from local farmers.",
        address: "Estrada de São Romão, Sintra",
        city: "Sintra",
        country: "Portugal",
        category: "market", 
        tags: ["local-farms", "fresh-vegetables", "organic"],
        website: "https://www.expatexchange.com/ctryguide/22868/92/Portugal/Living-in-Sintra-Best-Markets-in-Sintra"
      }
    ];

    // Cascais food sources
    const cascaisPlaces = [
      {
        name: "Continente",
        description: "Offers a variety of gluten-free products, including breads and pastas, under its in-house brand and international labels.",
        address: "CascaiShopping, Cascais",
        city: "Cascais",
        country: "Portugal",
        category: "grocery",
        tags: ["gluten-free", "nut-free", "dairy-free", "vegan", "organic", "fresh-vegetables", "farm-raised-meat", "kid-friendly"],
        website: "https://www.continente.pt"
      },
      {
        name: "Pingo Doce",
        description: "Provides affordable gluten-free options such as cookies, crackers, and pasta in their health section.",
        address: "Multiple Locations in Cascais",
        city: "Cascais",
        country: "Portugal",
        category: "grocery",
        tags: ["gluten-free", "nut-free", "dairy-free", "vegan", "organic", "fresh-vegetables", "kid-friendly"],
        website: "https://www.pingodoce.pt"
      },
      {
        name: "Auchan",
        description: "Stocks certified gluten-free snacks, grains, and baking mixes with clearly labeled sections.",
        address: "Estrada Nacional 6, Cascais",
        city: "Cascais",
        country: "Portugal",
        category: "grocery",
        tags: ["gluten-free", "nut-free", "dairy-free", "vegan", "organic", "fresh-vegetables", "farm-raised-meat"],
        website: "https://www.auchan.pt"
      },
      {
        name: "Lidl",
        description: "Offers gluten-free products under their 'Free From' and 'Bio Organic' brands, especially in cereals and snacks.",
        address: "Rua da Torre 831, Cascais",
        city: "Cascais",
        country: "Portugal",
        category: "grocery",
        tags: ["gluten-free", "nut-free", "dairy-free", "vegan", "organic", "fresh-vegetables", "kid-friendly"],
        website: "https://www.lidl.pt"
      },
      {
        name: "Celeiro",
        description: "Health food store with dedicated gluten-free shelves including cereals, pastas, and flours.",
        address: "CascaiShopping, Cascais",
        city: "Cascais",
        country: "Portugal",
        category: "grocery",
        tags: ["gluten-free", "nut-free", "dairy-free", "vegan", "organic", "fresh-vegetables", "no-processed", "kid-friendly", "bulk-buying"],
        website: "https://www.celeiro.pt/lojas/celeiro-cascaishopping"
      },
      {
        name: "Bioshop",
        description: "Small organic store stocking some gluten-free foodstuffs and cosmetics.",
        address: "Avenida 25 de Abril 672, Cascais",
        city: "Cascais",
        country: "Portugal",
        category: "grocery",
        tags: ["gluten-free", "dairy-free", "vegan", "organic", "fresh-vegetables", "no-processed"],
        website: "https://www.happycow.net/reviews/bioshop-cascais-92393"
      },
      {
        name: "Mundo Bio Cascais",
        description: "Organic market praised for its extensive selection of unique products.",
        address: "Cascais",
        city: "Cascais",
        country: "Portugal",
        category: "grocery",
        tags: ["organic", "fresh-vegetables", "no-processed"],
        website: "https://wanderlog.com/place/details/12649927/mundo-bio-cascais"
      },
      {
        name: "AgroBio Markets",
        description: "Offers organic products from local producers, promoting sustainable local consumption.",
        address: "Cascais",
        city: "Cascais",
        country: "Portugal",
        category: "market",
        tags: ["local-farms", "organic"],
        website: "https://peggada.com/en/listing/agrobio-markets-cascais/"
      }
    ];

    // Oeiras food sources
    const oeirasPlaces = [
      {
        name: "Continente",
        description: "Offers a robust selection of gluten-free pastas, breads, and cereals under its in-house brand and international labels.",
        address: "Oeiras",
        city: "Oeiras",
        country: "Portugal",
        category: "grocery",
        tags: ["gluten-free", "nut-free", "dairy-free", "vegan", "organic", "fresh-vegetables", "kid-friendly", "bulk-buying"],
        website: "https://www.continente.pt"
      },
      {
        name: "Pingo Doce",
        description: "Affordable gluten-free options including cookies, crackers, and pasta in their health section.",
        address: "Oeiras",
        city: "Oeiras",
        country: "Portugal",
        category: "grocery",
        tags: ["gluten-free", "nut-free", "dairy-free", "vegan", "organic", "fresh-vegetables", "kid-friendly"],
        website: "https://www.pingodoce.pt"
      },
      {
        name: "Auchan",
        description: "Stocks certified gluten-free snacks, grains, and baking mixes with clearly labeled sections.",
        address: "Oeiras",
        city: "Oeiras",
        country: "Portugal",
        category: "grocery",
        tags: ["gluten-free", "nut-free", "dairy-free", "vegan", "organic", "fresh-vegetables", "farm-raised-meat", "bulk-buying"],
        website: "https://www.auchan.pt"
      },
      {
        name: "Lidl",
        description: "Offers gluten-free products under their 'Free From' and 'Bio Organic' brands, especially in cereals and snacks.",
        address: "Oeiras",
        city: "Oeiras",
        country: "Portugal",
        category: "grocery",
        tags: ["gluten-free", "nut-free", "dairy-free", "vegan", "organic", "fresh-vegetables", "kid-friendly", "bulk-buying"],
        website: "https://www.lidl.pt"
      },
      {
        name: "El Corte Inglés",
        description: "Premium gluten-free brands available, especially in their gourmet and import section.",
        address: "Oeiras",
        city: "Oeiras",
        country: "Portugal",
        category: "grocery",
        tags: ["gluten-free", "dairy-free", "vegan", "farm-raised-meat"],
        website: "https://www.elcorteingles.pt"
      },
      {
        name: "Celeiro",
        description: "Health food store with dedicated gluten-free shelves including cereals, pastas, and flours.",
        address: "Oeiras Parque",
        city: "Oeiras",
        country: "Portugal",
        category: "grocery",
        tags: ["gluten-free", "nut-free", "dairy-free", "vegan", "organic", "no-processed", "kid-friendly", "zero-waste"],
        website: "https://www.celeiro.pt"
      },
      {
        name: "Batarda's",
        description: "Dedicated gluten-free bakery offering breads, cakes, and pastries.",
        address: "Parede, Oeiras",
        city: "Oeiras",
        country: "Portugal",
        category: "grocery",
        tags: ["gluten-free"],
        website: "https://www.batardas.pt"
      },
      {
        name: "Miosótis",
        description: "100% organic grocery store offering local and organic produce from partner farms.",
        address: "Oeiras",
        city: "Oeiras",
        country: "Portugal",
        category: "grocery",
        tags: ["organic", "fresh-vegetables", "farm-raised-meat", "no-processed", "bulk-buying", "zero-waste"],
        website: "https://www.miosotis-bio.pt"
      },
      {
        name: "Biocourela",
        description: "Local organic grocery store offering certified organic products.",
        address: "Centro Comercial Palmeiras, Oeiras",
        city: "Oeiras",
        country: "Portugal",
        category: "grocery",
        tags: ["organic"],
        website: "https://www.instagram.com/biocourela"
      },
      {
        name: "Quinta do Arneiro",
        description: "Organic farm that delivers fresh produce to Oeiras.",
        address: "Oeiras",
        city: "Oeiras",
        country: "Portugal",
        category: "market",
        tags: ["local-farms", "organic", "fresh-vegetables", "no-processed"],
        website: "https://www.quintadoarneiro.com"
      },
      {
        name: "Semear",
        description: "Local Oeiras-based organic social farm offering fresh produce.",
        address: "Oeiras",
        city: "Oeiras",
        country: "Portugal",
        category: "market",
        tags: ["local-farms", "organic", "fresh-vegetables", "no-processed"],
        website: "https://semear.pt"
      },
      {
        name: "DaQuinta",
        description: "Fresh fruit and vegetable delivery boxes with organic options.",
        address: "Oeiras delivery service",
        city: "Oeiras",
        country: "Portugal",
        category: "market",
        tags: ["fresh-vegetables", "no-processed"],
        website: "https://da-quinta.tilda.ws"
      }
    ];

    // Combine all places
    const allPlaces = [...sintraPlaces, ...cascaisPlaces, ...oeirasPlaces];
    
    // Insert places into database
    // Add approved status to all places
    const allPlacesWithStatus = allPlaces.map(place => ({
      ...place,
      status: 'approved' as const
    }));
    
    const insertedPlaces = await db.insert(places).values(allPlacesWithStatus).returning();
    
    console.log(`Successfully imported ${insertedPlaces.length} food sources across all locations`);
    
    return {
      success: true,
      count: insertedPlaces.length,
      locations: {
        sintra: sintraPlaces.length,
        cascais: cascaisPlaces.length,
        oeiras: oeirasPlaces.length
      }
    };
    
  } catch (error) {
    console.error("Error importing location guides:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}