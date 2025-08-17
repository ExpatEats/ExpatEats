import { db } from './db';
import { places } from '@shared/schema';
import { InsertPlace } from '@shared/schema';

// Function to add food sources to the database
export async function importFoodSources() {
  try {
    // Adding a helper type to include website in our data (we'll remove it before DB insertion)
    type FoodSourceData = InsertPlace & { website?: string };
    
    // Dairy-Free Food Sources
    const dairyFreeFoodSources: FoodSourceData[] = [
      {
        name: 'Continente',
        description: 'Continente offers a wide range of dairy-free products, including plant-based yogurts under its \'Powered by Plants\' brand, featuring almond and coconut-based options.',
        address: 'Multiple locations in Lisbon',
        city: 'Lisbon',
        country: 'Portugal',
        category: 'supermarket',
        tags: ['dairy-free', 'vegan', 'plant-based'],
        imageUrl: 'https://www.continente.pt/favicon.ico',
        website: 'https://www.continente.pt/',
      },
      {
        name: 'Pingo Doce',
        description: 'Pingo Doce provides various plant-based products, including non-dairy milks, yogurts, and ice creams.',
        address: 'Multiple locations in Lisbon',
        city: 'Lisbon',
        country: 'Portugal',
        category: 'supermarket',
        tags: ['dairy-free', 'vegan', 'plant-based'],
        imageUrl: 'https://www.pingodoce.pt/favicon.ico',
        website: 'https://www.pingodoce.pt/',
      },
      {
        name: 'Lidl',
        description: 'Lidl offers a variety of dairy-free products, such as soy cream, non-dairy milks, and vegan ice creams.',
        address: 'Multiple locations in Lisbon',
        city: 'Lisbon',
        country: 'Portugal',
        category: 'supermarket',
        tags: ['dairy-free', 'vegan', 'plant-based'],
        imageUrl: 'https://www.lidl.pt/favicon.ico',
        website: 'https://www.lidl.pt/',
      },
      {
        name: 'Auchan',
        description: 'Auchan stores provide a selection of dairy-free products, including vegan cheeses and plant-based alternatives.',
        address: 'Multiple locations in Lisbon',
        city: 'Lisbon',
        country: 'Portugal',
        category: 'supermarket',
        tags: ['dairy-free', 'vegan', 'plant-based'],
        imageUrl: 'https://www.auchan.pt/favicon.ico',
        website: 'https://www.auchan.pt/',
      },
      {
        name: 'El Corte Inglés',
        description: 'El Corte Inglés includes a supermarket that stocks a variety of dairy-free and vegan products, catering to various dietary needs.',
        address: 'Av. António Augusto de Aguiar, 31',
        city: 'Lisbon',
        country: 'Portugal',
        category: 'department store',
        tags: ['dairy-free', 'vegan', 'plant-based'],
        imageUrl: 'https://www.elcorteingles.pt/favicon.ico',
        website: 'https://www.elcorteingles.pt/',
      },
      {
        name: 'Celeiro',
        description: 'Celeiro is a well-known health food chain offering a wide range of dairy-free products, including non-dairy milks and vegan items.',
        address: 'Multiple locations in Lisbon',
        city: 'Lisbon',
        country: 'Portugal',
        category: 'health food store',
        tags: ['dairy-free', 'vegan', 'organic'],
        imageUrl: 'https://www.celeiro.pt/favicon.ico',
        website: 'https://www.celeiro.pt/',
      },
      {
        name: 'Biomercado',
        description: 'Biomercado provides various dairy-free choices, including plant-based products and bulk ingredients.',
        address: 'Multiple locations in Lisbon',
        city: 'Lisbon',
        country: 'Portugal',
        category: 'organic supermarket',
        tags: ['dairy-free', 'vegan', 'organic'],
        imageUrl: 'https://www.biomercado.pt/favicon.ico',
        website: 'https://www.biomercado.pt/',
      },
      {
        name: 'Maria Granel',
        description: 'Maria Granel offers a range of certified organic products, including lactose-free and vegan items, with a focus on reducing ecological footprint.',
        address: 'Multiple locations in Lisbon',
        city: 'Lisbon',
        country: 'Portugal',
        category: 'bulk store',
        tags: ['dairy-free', 'vegan', 'organic', 'zero-waste'],
        imageUrl: 'https://mariagranel.com/favicon.ico',
        website: 'https://mariagranel.com/',
      },
      {
        name: 'GreenBeans',
        description: 'GreenBeans is a 100% vegan grocery store offering a fair, ethical, biological, and healthy alternative for shoppers.',
        address: 'Lisbon',
        city: 'Lisbon',
        country: 'Portugal',
        category: 'grocery store',
        tags: ['dairy-free', 'vegan', 'organic'],
        imageUrl: 'https://via.placeholder.com/150',
        website: 'https://www.simbiotico.eco/en/ecospot/greenbeans',
      },
      {
        name: 'Bomercado',
        description: 'Bomercado is an organic grocery store offering a variety of vegan products, including fruits, beverages, and gluten-free items, focusing on supporting small producers.',
        address: 'R. de São Bento 235, 1250-221 Lisbon',
        city: 'Lisbon',
        country: 'Portugal',
        category: 'grocery store',
        tags: ['dairy-free', 'vegan', 'organic'],
        imageUrl: 'https://via.placeholder.com/150',
        website: 'https://www.happycow.net/reviews/bomercado-lisbon-424897',
      },
    ];

    // Gluten-Free Food Sources
    const glutenFreeFoodSources: InsertPlace[] = [
      {
        name: 'Sam Pastelaria Saudável',
        description: 'Health-focused bakery offering certified gluten-free products, including vegan and sugar-free options.',
        address: 'Rua Luís Augusto Palmeirim, 1D',
        city: 'Lisbon',
        country: 'Portugal',
        category: 'bakery',
        tags: ['gluten-free', 'lactose-free', 'sugar-free', 'vegan'],
        imageUrl: 'https://www.sampastelariasaudavel.com/favicon.ico',
        website: 'https://www.sampastelariasaudavel.com/',
      },
      {
        name: 'Despensa No.6',
        description: 'Fully gluten-free and sugar-free bakery and café, offering a variety of pastries and brunch options.',
        address: 'Avenida Sacadura Cabral, 6A',
        city: 'Lisbon',
        country: 'Portugal',
        category: 'bakery',
        tags: ['gluten-free', 'sugar-free', 'vegan'],
        imageUrl: 'https://despensa6.pt/favicon.ico',
        website: 'https://despensa6.pt/en/',
      },
      {
        name: 'Saludê Pastelaria Fit',
        description: 'Bakery that is fully gluten-free, lactose-free, and refined sugar-free, providing a range of baked goods and brunch items.',
        address: 'Av. Santa Joana Princesa, 23C',
        city: 'Lisbon',
        country: 'Portugal',
        category: 'bakery',
        tags: ['gluten-free', 'lactose-free', 'sugar-free', 'vegan'],
        imageUrl: 'https://saludepastelariafit.com/favicon.ico',
        website: 'https://saludepastelariafit.com/',
      },
      {
        name: 'Batardas',
        description: 'Dedicated gluten-free bakery offering breads, pastries, and other treats.',
        address: 'Praceta Lagoa de Óbidos, 38',
        city: 'Parede',
        country: 'Portugal',
        category: 'bakery',
        tags: ['gluten-free'],
        imageUrl: 'https://www.batardas.pt/favicon.ico',
        website: 'https://www.batardas.pt/',
      },
      {
        name: 'Mercado de Campo de Ourique',
        description: 'Neighborhood food market offering a variety of fresh produce and gourmet food stalls.',
        address: 'Rua Coelho da Rocha, 104',
        city: 'Lisbon',
        country: 'Portugal',
        category: 'market',
        tags: ['fresh produce', 'gluten-free options'],
        imageUrl: 'https://www.mercadodecampodeourique.pt/favicon.ico',
        website: 'https://www.mercadodecampodeourique.pt/',
      },
      {
        name: 'Time Out Market Lisboa',
        description: 'Hosts numerous vendors, some of which offer gluten-free options. Always ask about cross-contamination.',
        address: 'Avenida 24 de Julho',
        city: 'Lisbon',
        country: 'Portugal',
        category: 'market',
        tags: ['varied', 'gluten-free options'],
        imageUrl: 'https://www.timeoutmarket.com/favicon.ico',
        website: 'https://www.timeoutmarket.com/lisboa/',
      },
    ];

    // Fresh Vegetables Food Sources - Adding only unique ones not already included
    const freshVegetablesFoodSources: InsertPlace[] = [
      {
        name: 'Mercado de Campo de Ourique',
        description: 'Historic food market offering a wide variety of fresh, seasonal vegetables from regional farmers.',
        address: 'Rua Coelho da Rocha, 104',
        city: 'Lisbon',
        country: 'Portugal',
        category: 'market',
        tags: ['fresh vegetables', 'local produce'],
        imageUrl: 'https://www.mercadodecampodeourique.pt/favicon.ico',
        website: 'https://www.mercadodecampodeourique.pt/',
      },
      {
        name: 'Time Out Market Lisboa',
        description: 'Popular market with stalls selling fresh produce including vegetables directly from Portuguese growers.',
        address: 'Avenida 24 de Julho',
        city: 'Lisbon',
        country: 'Portugal',
        category: 'market',
        tags: ['fresh vegetables', 'local produce'],
        imageUrl: 'https://www.timeoutmarket.com/favicon.ico',
        website: 'https://www.timeoutmarket.com/lisboa/',
      },
    ];

    // We'll use a Set to track unique place names to avoid duplicates
    const uniquePlaceNames = new Set<string>();
    const allFoodSources: InsertPlace[] = [];

    // Add all sources, checking for duplicates by name
    // We'll add tags to existing places if they already exist
    const addSourcesWithoutDuplicates = (sources: InsertPlace[]) => {
      sources.forEach(source => {
        if (!uniquePlaceNames.has(source.name)) {
          uniquePlaceNames.add(source.name);
          allFoodSources.push(source);
        } else {
          // If this place already exists, find it and add the new tags
          const existingPlace = allFoodSources.find(p => p.name === source.name);
          if (existingPlace && existingPlace.tags && source.tags) {
            // Add tags that don't already exist
            source.tags.forEach(tag => {
              if (!existingPlace.tags?.includes(tag)) {
                existingPlace.tags.push(tag);
              }
            });
          }
        }
      });
    };

    // Add all sources while avoiding duplicates
    addSourcesWithoutDuplicates(dairyFreeFoodSources);
    addSourcesWithoutDuplicates(glutenFreeFoodSources);
    addSourcesWithoutDuplicates(freshVegetablesFoodSources);

    // Add tags for all major dietary preferences to each place
    allFoodSources.forEach(place => {
      // Set status to approved so places show up in search results
      place.status = 'approved';
      
      // Add tags for specific dietary preferences based on their descriptions
      // We're doing this because the documents you provided have overlapping information
      
      if (place.description.toLowerCase().includes('gluten-free') || 
          (place.tags && place.tags.some(tag => tag.includes('gluten')))) {
        if (!place.tags?.includes('gluten-free')) {
          place.tags = [...(place.tags || []), 'gluten-free'];
        }
      }
      
      if (place.description.toLowerCase().includes('vegan') || 
          (place.tags && place.tags.some(tag => tag.includes('vegan')))) {
        if (!place.tags?.includes('vegan')) {
          place.tags = [...(place.tags || []), 'vegan'];
        }
      }
      
      if (place.description.toLowerCase().includes('organic') || 
          place.description.toLowerCase().includes('bio') || 
          (place.tags && place.tags.some(tag => tag.includes('organic') || tag.includes('bio')))) {
        if (!place.tags?.includes('organic')) {
          place.tags = [...(place.tags || []), 'organic'];
        }
      }
      
      if (place.description.toLowerCase().includes('fresh vegetables') || 
          place.description.toLowerCase().includes('produce') || 
          (place.tags && place.tags.some(tag => tag.includes('fresh') || tag.includes('vegetables')))) {
        if (!place.tags?.includes('fresh vegetables')) {
          place.tags = [...(place.tags || []), 'fresh vegetables'];
        }
      }
      
      if (place.description.toLowerCase().includes('nut-free') || 
          (place.tags && place.tags.some(tag => tag.includes('nut-free')))) {
        if (!place.tags?.includes('nut-free')) {
          place.tags = [...(place.tags || []), 'nut-free'];
        }
      }
    });

    // Insert all places into the database using a transaction
    console.log(`Importing ${allFoodSources.length} food sources...`);
    
    // Use a transaction to ensure all inserts succeed or fail together
    await db.transaction(async (tx) => {
      for (const source of allFoodSources) {
        // Remove website field as it's not in our schema
        const { website, ...placeData } = source as any;
        await tx.insert(places).values(placeData);
      }
    });

    console.log('Food sources imported successfully!');
    return { success: true, count: allFoodSources.length };
  } catch (error) {
    console.error('Error importing food sources:', error);
    return { success: false, error };
  }
}