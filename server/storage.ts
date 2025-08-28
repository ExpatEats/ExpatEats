import { eq, and, inArray, or } from "drizzle-orm";
import { db } from "./db";
import {
    places,
    users,
    reviews,
    nutrition,
} from "@shared/schema";
import {
    InsertPlace,
    InsertUser,
    InsertReview,
    InsertNutrition,
    Place,
    User,
    Review,
    Nutrition,
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

interface Storage {
    // Place methods
    getPlaces(filters?: PlaceFilters): Promise<Place[]>;
    getPlace(id: number): Promise<Place | null>;
    createPlace(place: InsertPlace): Promise<Place>;
    updatePlaceRating(placeId: number, rating: number): Promise<void>;

    // Review methods
    getReviewsByPlace(placeId: number): Promise<Review[]>;
    createReview(review: InsertReview): Promise<Review>;

    // User methods
    getAllUsers(): Promise<User[]>;

    // Nutrition methods
    createNutritionConsultation(nutrition: InsertNutrition): Promise<Nutrition>;

    // Location methods
    getDistinctLocations(): Promise<{id: string, name: string}[]>;

    // City methods
    getFeaturedCities(): Promise<City[]>;

    // Admin methods for place review
    getPendingPlaces(): Promise<Place[]>;
    approvePlace(placeId: number, adminNotes?: string): Promise<void>;
    rejectPlace(placeId: number, adminNotes: string): Promise<void>;
}

class DatabaseStorage implements Storage {
    cities: City[] = [
        { id: 1, name: "Lisbon", country: "Portugal" },
        { id: 2, name: "Porto", country: "Portugal" },
        { id: 3, name: "Coimbra", country: "Portugal" },
        { id: 4, name: "Braga", country: "Portugal" },
    ];

    // Place methods
    async getPlaces(filters?: PlaceFilters): Promise<Place[]> {
        let whereConditions = [eq(places.status, "approved")];

        if (filters?.city) {
            const cities = filters.city
                .split(",")
                .map((c) => c.trim())
                .filter((c) => c);

            if (cities.length > 0) {
                const capitalizedCities = cities.map(
                    (city) =>
                        city.charAt(0).toUpperCase() + city.slice(1).toLowerCase(),
                );

                if (capitalizedCities.some((city) => city === "Online")) {
                    whereConditions.push(
                        or(
                            inArray(places.city, capitalizedCities),
                            eq(places.city, "Online"),
                        ) as any,
                    );
                } else {
                    whereConditions.push(
                        inArray(places.city, capitalizedCities),
                    );
                }
            }
        }

        if (filters?.category) {
            if (filters.category.includes(",")) {
                const categories = filters.category
                    .split(",")
                    .map((cat) => cat.trim());
                whereConditions.push(inArray(places.category, categories));
            } else {
                whereConditions.push(eq(places.category, filters.category));
            }
        }

        if (filters?.tags && filters.tags.length > 0) {
            // This will need to be adjusted based on your actual tag filtering logic
        }

        return await db
            .select()
            .from(places)
            .where(and(...whereConditions));
    }

    async getPlace(id: number): Promise<Place | null> {
        const [place] = await db.select().from(places).where(eq(places.id, id));
        return place || null;
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
        return await db.select().from(reviews).where(eq(reviews.placeId, placeId));
    }

    async createReview(review: InsertReview): Promise<Review> {
        const [newReview] = await db.insert(reviews).values(review).returning();
        return newReview;
    }

    // User methods  
    async getAllUsers(): Promise<User[]> {
        return await db.select().from(users);
    }

    // Nutrition methods
    async createNutritionConsultation(nutritionData: InsertNutrition): Promise<Nutrition> {
        const [newConsultation] = await db
            .insert(nutrition)
            .values(nutritionData)
            .returning();
        return newConsultation;
    }

    // Location methods
    async getDistinctLocations(): Promise<{id: string, name: string}[]> {
        // Get distinct cities from places table
        const placeCities = await db.selectDistinct({ city: places.city }).from(places);
        
        // Combine and dedupe
        const allLocations = new Set<string>();
        placeCities.forEach(p => p.city && allLocations.add(p.city.toLowerCase()));
        
        // Convert to expected format with proper capitalization
        const locationMap: {[key: string]: string} = {
            'lisbon': 'Lisbon',
            'oeiras': 'Oeiras', 
            'cascais': 'Cascais',
            'sintra': 'Sintra',
            'oeires': 'Oeiras', // Handle typo in data
            'online': 'Online'
        };
        
        return Array.from(allLocations)
            .filter(loc => loc !== 'online') // Filter out online for location selector
            .map(loc => ({
                id: loc,
                name: locationMap[loc] || loc.charAt(0).toUpperCase() + loc.slice(1)
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
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