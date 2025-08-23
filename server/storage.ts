import { eq, and, inArray, or } from "drizzle-orm";
import { db } from "./db";
import {
    places,
    users,
    reviews,
    nutrition,
    businessLocations,
} from "@shared/schema";
import {
    InsertPlace,
    InsertUser,
    InsertReview,
    InsertNutrition,
    InsertBusinessLocation,
    Place,
    User,
    Review,
    Nutrition,
    BusinessLocation,
} from "@shared/schema";

interface City {
    id: number;
    name: string;
    country: string;
}

interface PlaceFilters {
    city?: string;
    category?: string;
    tags?: string[];
}

interface BusinessLocationFilters {
    locations?: string[];
    category?: string;
    subcategory?: string;
}

export interface IStorage {
    // User methods
    getUser(id: number): Promise<User | undefined>;
    getUserByUsername(username: string): Promise<User | undefined>;
    createUser(user: InsertUser): Promise<User>;
    getAllUsers(): Promise<User[]>;

    // Place methods
    getPlaces(filters?: PlaceFilters): Promise<Place[]>;
    getPlace(id: number): Promise<Place | undefined>;
    createPlace(place: InsertPlace): Promise<Place>;
    updatePlaceRating(placeId: number, rating: number): Promise<void>;

    // Review methods
    getReviewsByPlace(placeId: number): Promise<Review[]>;
    createReview(review: InsertReview): Promise<Review>;

    // Nutrition methods
    createNutritionConsultation(nutrition: InsertNutrition): Promise<Nutrition>;

    // Business location methods
    getBusinessLocations(
        filters?: BusinessLocationFilters,
    ): Promise<BusinessLocation[]>;
    createBusinessLocation(
        location: InsertBusinessLocation,
    ): Promise<BusinessLocation>;
    importSupplementsData(): Promise<{
        success: boolean;
        count?: number;
        error?: string;
    }>;

    // City methods
    getFeaturedCities(): Promise<City[]>;

    // Admin methods for place review
    getPendingPlaces(): Promise<Place[]>;
    approvePlace(placeId: number, adminNotes?: string): Promise<void>;
    rejectPlace(placeId: number, adminNotes: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
    private cities: City[];

    constructor() {
        // Initialize featured cities
        this.cities = [
            { id: 1, name: "Lisbon", country: "Portugal" },
            { id: 2, name: "Porto", country: "Portugal" },
            { id: 3, name: "Barcelona", country: "Spain" },
            { id: 4, name: "Madrid", country: "Spain" },
            { id: 5, name: "Berlin", country: "Germany" },
            { id: 6, name: "Paris", country: "France" },
        ];
    }

    // User methods
    async getUser(id: number): Promise<User | undefined> {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user || undefined;
    }

    async getUserByUsername(username: string): Promise<User | undefined> {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.username, username));
        return user || undefined;
    }

    async createUser(user: InsertUser): Promise<User> {
        const [newUser] = await db.insert(users).values(user).returning();
        return newUser;
    }

    async getAllUsers(): Promise<User[]> {
        return await db.select().from(users);
    }

    // Place methods
    async getPlaces(filters?: PlaceFilters): Promise<Place[]> {
        // Build base query with status filter
        let whereConditions = [eq(places.status, "approved")];

        if (filters) {
            if (filters.city) {
                // Handle comma-separated cities
                const cities = filters.city
                    .split(",")
                    .map((c) => c.trim().toLowerCase());
                const capitalizedCities = cities.map(
                    (city) => city.charAt(0).toUpperCase() + city.slice(1),
                );

                // For supplements, include online retailers regardless of city
                if (
                    filters.category &&
                    filters.category.includes("Online Store")
                ) {
                    const cityCondition = or(
                        inArray(places.city, capitalizedCities),
                        eq(places.city, "Online"),
                    );
                    if (cityCondition) whereConditions.push(cityCondition);
                } else {
                    whereConditions.push(
                        inArray(places.city, capitalizedCities),
                    );
                }
            }

            if (filters.category) {
                // Handle comma-separated categories for supplements
                const categories = filters.category
                    .split(",")
                    .map((c) => c.trim());
                if (categories.length > 1) {
                    whereConditions.push(inArray(places.category, categories));
                } else {
                    whereConditions.push(eq(places.category, filters.category));
                }
            }
        }

        let results = await db
            .select()
            .from(places)
            .where(and(...whereConditions));

        // Filter by tags if provided
        // This is done in-memory since array filtering is complex in SQL
        if (filters?.tags && filters.tags.length > 0) {
            results = results.filter((place) => {
                // Make sure place has tags and at least one of the required tags
                return (
                    place.tags &&
                    place.tags.some((tag) =>
                        filters.tags!.some((filterTag) =>
                            tag.toLowerCase().includes(filterTag.toLowerCase()),
                        ),
                    )
                );
            });
        }

        return results;
    }

    async getPlace(id: number): Promise<Place | undefined> {
        const [place] = await db.select().from(places).where(eq(places.id, id));
        return place || undefined;
    }

    async createPlace(place: InsertPlace): Promise<Place> {
        const [newPlace] = await db.insert(places).values(place).returning();
        return newPlace;
    }

    async updatePlaceRating(placeId: number, rating: number): Promise<void> {
        await db
            .update(places)
            .set({ averageRating: rating })
            .where(eq(places.id, placeId));
    }

    // Review methods
    async getReviewsByPlace(placeId: number): Promise<Review[]> {
        return await db
            .select()
            .from(reviews)
            .where(eq(reviews.placeId, placeId));
    }

    async createReview(review: InsertReview): Promise<Review> {
        const [newReview] = await db.insert(reviews).values(review).returning();
        return newReview;
    }

    // Nutrition methods
    async createNutritionConsultation(
        nutritionData: InsertNutrition,
    ): Promise<Nutrition> {
        const [newConsultation] = await db
            .insert(nutrition)
            .values(nutritionData)
            .returning();
        return newConsultation;
    }

    // Business location methods
    async getBusinessLocations(
        filters?: BusinessLocationFilters,
    ): Promise<BusinessLocation[]> {
        let query = db.select().from(businessLocations);

        const conditions = [];

        if (filters?.locations && filters.locations.length > 0) {
            conditions.push(
                inArray(businessLocations.location, filters.locations),
            );
        }

        if (filters?.category) {
            conditions.push(eq(businessLocations.category, filters.category));
        }

        if (filters?.subcategory) {
            conditions.push(
                eq(businessLocations.subcategory, filters.subcategory),
            );
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions));
        }

        return await query;
    }

    async createBusinessLocation(
        location: InsertBusinessLocation,
    ): Promise<BusinessLocation> {
        const [newLocation] = await db
            .insert(businessLocations)
            .values(location)
            .returning();
        return newLocation;
    }

    async importSupplementsData(): Promise<{
        success: boolean;
        count?: number;
        error?: string;
    }> {
        try {
            const supplementsData = [
                // Physical Stores in Lisbon
                {
                    name: "Celeiro",
                    description:
                        "A well-established Portuguese health food chain with multiple locations across Lisbon. Offers a wide range of vitamins, minerals, herbal remedies, and natural products. Also provides gluten-free, vegetarian, and vegan options.",
                    address: "Multiple locations across Lisbon",
                    category: "food-nutrition",
                    subcategory: "supplements",
                    location: "lisbon",
                    tags: [
                        "vitamins",
                        "minerals",
                        "herbal",
                        "gluten-free",
                        "vegan",
                        "vegetarian",
                    ],
                    isOnline: false,
                    shipsToPortugal: false,
                },
                {
                    name: "PrimeBody",
                    description:
                        "Specializes in sports nutrition, offering products like creatine, protein powders, and vitamins. Known for high-quality products and expert staff.",
                    category: "food-nutrition",
                    subcategory: "supplements",
                    location: "lisbon",
                    tags: [
                        "sports nutrition",
                        "protein",
                        "creatine",
                        "vitamins",
                    ],
                    isOnline: false,
                    shipsToPortugal: false,
                },
                {
                    name: "My Whey Store",
                    description:
                        "Focuses on fitness supplements, including whey proteins, amino acids, and pre-workouts. Caters to both amateur and professional athletes.",
                    category: "food-nutrition",
                    subcategory: "supplements",
                    location: "lisbon",
                    tags: [
                        "whey protein",
                        "amino acids",
                        "pre-workout",
                        "fitness",
                    ],
                    isOnline: false,
                    shipsToPortugal: false,
                },
                {
                    name: "Essentia Produtos Naturais",
                    description:
                        "Offers a variety of natural health products, including supplements, teas, and organic foods. Emphasizes holistic wellness and natural remedies.",
                    category: "food-nutrition",
                    subcategory: "supplements",
                    location: "lisbon",
                    tags: [
                        "natural health",
                        "supplements",
                        "teas",
                        "organic",
                        "holistic",
                    ],
                    isOnline: false,
                    shipsToPortugal: false,
                },
                {
                    name: "Segredos da Saúde",
                    description:
                        "Provides a selection of health supplements, natural cosmetics, and wellness products. Known for personalized customer service.",
                    category: "food-nutrition",
                    subcategory: "supplements",
                    location: "lisbon",
                    tags: [
                        "health supplements",
                        "natural cosmetics",
                        "wellness",
                    ],
                    isOnline: false,
                    shipsToPortugal: false,
                },

                // Online Retailers Shipping to Portugal
                {
                    name: "iHerb",
                    description:
                        "Offers a vast selection of international supplement brands. Ships to Portugal with VAT included at checkout, ensuring transparency.",
                    website: "https://iherb.com",
                    category: "food-nutrition",
                    subcategory: "supplements",
                    location: "online",
                    tags: [
                        "international brands",
                        "VAT included",
                        "vitamins",
                        "supplements",
                    ],
                    isOnline: true,
                    shipsToPortugal: true,
                },
                {
                    name: "Greatlife.eu",
                    description:
                        "European-based retailer specializing in premium supplements. Ships to Portugal within 5–7 business days using reliable carriers like DHL and UPS.",
                    website: "https://greatlife.eu",
                    category: "food-nutrition",
                    subcategory: "supplements",
                    location: "online",
                    tags: ["premium supplements", "European", "DHL", "UPS"],
                    isOnline: true,
                    shipsToPortugal: true,
                },
                {
                    name: "Life Extension Europe",
                    description:
                        "Offers science-based supplements focusing on longevity and wellness. Products are non-GMO, gluten-free, and plant-based.",
                    website: "https://lifeextensioneurope.com",
                    category: "food-nutrition",
                    subcategory: "supplements",
                    location: "online",
                    tags: [
                        "science-based",
                        "longevity",
                        "non-GMO",
                        "gluten-free",
                        "plant-based",
                    ],
                    isOnline: true,
                    shipsToPortugal: true,
                },
                {
                    name: "VitalAbo",
                    description:
                        "Provides a wide range of vitamins, minerals, and sports nutrition products. Free shipping to Portugal on orders over €39.90.",
                    website: "https://vitalabo.de",
                    category: "food-nutrition",
                    subcategory: "supplements",
                    location: "online",
                    tags: [
                        "vitamins",
                        "minerals",
                        "sports nutrition",
                        "free shipping",
                    ],
                    isOnline: true,
                    shipsToPortugal: true,
                },
                {
                    name: "Vitafor Europe",
                    description:
                        "Specializes in health and sports supplements, including probiotics and omega-3s. Free shipping to Portugal on orders over €99.",
                    website: "https://vitafor.eu",
                    category: "food-nutrition",
                    subcategory: "supplements",
                    location: "online",
                    tags: [
                        "health supplements",
                        "sports",
                        "probiotics",
                        "omega-3",
                    ],
                    isOnline: true,
                    shipsToPortugal: true,
                },
                {
                    name: "BulkSupplements.com",
                    description:
                        "Offers a broad selection of pure supplement powders. Ships to Portugal in 4–10 days; note that certain products like fish oil and melatonin may be restricted.",
                    website: "https://bulksupplements.com",
                    category: "food-nutrition",
                    subcategory: "supplements",
                    location: "online",
                    tags: ["pure powders", "bulk", "restrictions apply"],
                    isOnline: true,
                    shipsToPortugal: true,
                },
                {
                    name: "Mass-Zone.eu",
                    description:
                        "European retailer with a comprehensive range of supplements. Provides worldwide shipping, including to Portugal.",
                    website: "https://mass-zone.eu",
                    category: "food-nutrition",
                    subcategory: "supplements",
                    location: "online",
                    tags: [
                        "European",
                        "comprehensive range",
                        "worldwide shipping",
                    ],
                    isOnline: true,
                    shipsToPortugal: true,
                },
                {
                    name: "6PAK Nutrition",
                    description:
                        "Polish-based company offering sports nutrition products. Ships to Portugal with competitive rates.",
                    website: "https://6paknutrition.com",
                    category: "food-nutrition",
                    subcategory: "supplements",
                    location: "online",
                    tags: ["Polish", "sports nutrition", "competitive rates"],
                    isOnline: true,
                    shipsToPortugal: true,
                },
                {
                    name: "Wild Nutrition",
                    description:
                        "UK-based company offering natural, food-grown supplements. Ships to Portugal within 3–5 business days.",
                    website: "https://wildnutrition.com",
                    category: "food-nutrition",
                    subcategory: "supplements",
                    location: "online",
                    tags: ["UK-based", "natural", "food-grown"],
                    isOnline: true,
                    shipsToPortugal: true,
                },

                // Portuguese Supplement Brands
                {
                    name: "Prozis",
                    description:
                        "One of Europe's largest sports nutrition brands, headquartered in Portugal. Offers a wide range of supplements, functional foods, and fitness apparel. Ships globally with a strong online presence.",
                    website: "https://prozis.com",
                    category: "food-nutrition",
                    subcategory: "supplements",
                    location: "lisbon",
                    tags: [
                        "Portuguese brand",
                        "sports nutrition",
                        "functional foods",
                        "fitness apparel",
                    ],
                    isOnline: true,
                    shipsToPortugal: true,
                },
                {
                    name: "Marvelous Nutrition",
                    description:
                        "Portuguese company specializing in research-backed sports supplements. Focuses on delivering clinically dosed products for athletes.",
                    category: "food-nutrition",
                    subcategory: "supplements",
                    location: "lisbon",
                    tags: [
                        "Portuguese",
                        "research-backed",
                        "clinically dosed",
                        "athletes",
                    ],
                    isOnline: false,
                    shipsToPortugal: false,
                },
                {
                    name: "Lusodiete",
                    description:
                        "Based in Oeiras, this company offers natural, plant-based supplements. Emphasizes the use of nutrient-rich wild plants in their formulations.",
                    address: "Oeiras, Portugal",
                    category: "food-nutrition",
                    subcategory: "supplements",
                    location: "oeires",
                    tags: [
                        "natural",
                        "plant-based",
                        "wild plants",
                        "nutrient-rich",
                    ],
                    isOnline: false,
                    shipsToPortugal: false,
                },
                {
                    name: "My Pharma Spot",
                    description:
                        "Online para-pharmacy offering a variety of supplements, including those targeting memory and mental performance. Caters to the Portuguese market with a user-friendly platform.",
                    website: "https://mypharmaspot.pt",
                    category: "food-nutrition",
                    subcategory: "supplements",
                    location: "online",
                    tags: [
                        "para-pharmacy",
                        "memory",
                        "mental performance",
                        "Portuguese market",
                    ],
                    isOnline: true,
                    shipsToPortugal: true,
                },
            ];

            let count = 0;
            for (const data of supplementsData) {
                await this.createBusinessLocation(data);
                count++;
            }

            return { success: true, count };
        } catch (error) {
            console.error("Error importing supplements data:", error);
            return { success: false, error: String(error) };
        }
    }

    // City methods
    async getFeaturedCities(): Promise<City[]> {
        // In a real application, this would be fetched from the database
        return this.cities;
    }

    // Admin methods for place review
    async getPendingPlaces(): Promise<Place[]> {
        return await db
            .select()
            .from(places)
            .where(eq(places.status, "pending"));
    }

    async approvePlace(placeId: number, adminNotes?: string): Promise<void> {
        await db
            .update(places)
            .set({
                status: "approved",
                adminNotes,
                reviewedAt: new Date(),
            })
            .where(eq(places.id, placeId));
    }

    async rejectPlace(placeId: number, adminNotes: string): Promise<void> {
        await db
            .update(places)
            .set({
                status: "rejected",
                adminNotes,
                reviewedAt: new Date(),
            })
            .where(eq(places.id, placeId));
    }
}

export const storage = new DatabaseStorage();
