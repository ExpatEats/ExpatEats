import { eq, and, inArray, or, sql, gte, desc, asc } from "drizzle-orm";
import { db } from "./db";
import {
    places,
    users,
    reviews,
    nutrition,
    savedStores,
    cities,
    events,
} from "@shared/schema";
import {
    InsertPlace,
    InsertUser,
    InsertReview,
    InsertNutrition,
    InsertSavedStore,
    InsertCity,
    InsertEvent,
    Place,
    User,
    Review,
    Nutrition,
    SavedStore,
    City,
    Event,
} from "@shared/schema";

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
    getCities(): Promise<City[]>;
    createCity(city: InsertCity): Promise<City>;
    getFeaturedCities(): Promise<City[]>;

    // Admin methods for place review
    getPendingPlaces(): Promise<Place[]>;
    approvePlace(placeId: number, adminNotes?: string, softRating?: string, michaelesNotes?: string): Promise<void>;
    rejectPlace(placeId: number, adminNotes: string): Promise<void>;
    updatePlaceNotesAndRating(placeId: number, softRating?: string, michaelesNotes?: string): Promise<void>;

    // Saved stores methods
    saveStore(userId: number, placeId: number): Promise<SavedStore>;
    unsaveStore(userId: number, placeId: number): Promise<void>;
    getSavedStoresByUserId(userId: number): Promise<Place[]>;
    isStoreSaved(userId: number, placeId: number): Promise<boolean>;

    // Event methods
    createEvent(event: InsertEvent): Promise<Event>;
    getEvents(filters?: { city?: string; category?: string; status?: string; includePast?: boolean }): Promise<Event[]>;
    getEventById(id: number): Promise<Event | null>;
    getPendingEvents(): Promise<Event[]>;
    getUpcomingEvents(limit?: number): Promise<Event[]>;
    getPastEvents(limit?: number): Promise<Event[]>;
    approveEvent(id: number, adminId: number, adminNotes?: string): Promise<void>;
    rejectEvent(id: number, adminId: number, adminNotes: string): Promise<void>;
    updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event>;
    deleteEvent(id: number): Promise<void>;
}

class DatabaseStorage implements Storage {

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
            // Use PostgreSQL array overlap operator to check if any of the requested tags match
            const tagConditions = filters.tags.map(tag => 
                sql`${places.tags} && ARRAY[${tag}]`
            );
            
            // Use OR condition to find places that have ANY of the requested tags
            whereConditions.push(or(...tagConditions) as any);
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
        // Get cities from the cities table, excluding "Online"
        const citiesFromDb = await db
            .select()
            .from(cities)
            .where(and(
                eq(cities.isActive, true),
                sql`${cities.slug} != 'online'`
            ))
            .orderBy(cities.name);

        return citiesFromDb.map(city => ({
            id: city.slug,
            name: city.name
        }));
    }

    // City methods
    async getCities(): Promise<City[]> {
        return await db
            .select()
            .from(cities)
            .where(eq(cities.isActive, true))
            .orderBy(cities.name);
    }

    async createCity(city: InsertCity): Promise<City> {
        const [newCity] = await db.insert(cities).values(city).returning();
        return newCity;
    }

    async getFeaturedCities(): Promise<City[]> {
        return await this.getCities();
    }

    // Admin methods for place review
    async getPendingPlaces(): Promise<Place[]> {
        return await db
            .select()
            .from(places)
            .where(eq(places.status, "pending"));
    }

    async approvePlace(placeId: number, adminNotes?: string, softRating?: string, michaelesNotes?: string): Promise<void> {
        await db
            .update(places)
            .set({
                status: "approved",
                adminNotes,
                softRating,
                michaelesNotes,
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

    async updatePlaceNotesAndRating(placeId: number, softRating?: string, michaelesNotes?: string): Promise<void> {
        await db
            .update(places)
            .set({
                softRating,
                michaelesNotes,
            })
            .where(eq(places.id, placeId));
    }

    // Saved stores methods
    async saveStore(userId: number, placeId: number): Promise<SavedStore> {
        // Check if already saved
        const existing = await db
            .select()
            .from(savedStores)
            .where(and(eq(savedStores.userId, userId), eq(savedStores.placeId, placeId)));

        if (existing.length > 0) {
            throw new Error("Store is already saved");
        }

        const [savedStore] = await db
            .insert(savedStores)
            .values({ userId, placeId })
            .returning();
        
        return savedStore;
    }

    async unsaveStore(userId: number, placeId: number): Promise<void> {
        await db
            .delete(savedStores)
            .where(and(eq(savedStores.userId, userId), eq(savedStores.placeId, placeId)));
    }

    async getSavedStoresByUserId(userId: number): Promise<Place[]> {
        const result = await db
            .select({
                id: places.id,
                uniqueId: places.uniqueId,
                name: places.name,
                description: places.description,
                address: places.address,
                city: places.city,
                region: places.region,
                country: places.country,
                category: places.category,
                tags: places.tags,
                latitude: places.latitude,
                longitude: places.longitude,
                phone: places.phone,
                email: places.email,
                instagram: places.instagram,
                website: places.website,
                glutenFree: places.glutenFree,
                dairyFree: places.dairyFree,
                nutFree: places.nutFree,
                vegan: places.vegan,
                organic: places.organic,
                localFarms: places.localFarms,
                freshVegetables: places.freshVegetables,
                farmRaisedMeat: places.farmRaisedMeat,
                noProcessed: places.noProcessed,
                kidFriendly: places.kidFriendly,
                bulkBuying: places.bulkBuying,
                zeroWaste: places.zeroWaste,
                userId: places.userId,
                imageUrl: places.imageUrl,
                averageRating: places.averageRating,
                status: places.status,
                submittedBy: places.submittedBy,
                adminNotes: places.adminNotes,
                reviewedAt: places.reviewedAt,
                createdAt: places.createdAt,
            })
            .from(savedStores)
            .innerJoin(places, eq(savedStores.placeId, places.id))
            .where(eq(savedStores.userId, userId))
            .orderBy(sql`${savedStores.createdAt} DESC`);

        return result;
    }

    async isStoreSaved(userId: number, placeId: number): Promise<boolean> {
        const result = await db
            .select()
            .from(savedStores)
            .where(and(eq(savedStores.userId, userId), eq(savedStores.placeId, placeId)));

        return result.length > 0;
    }

    // Event methods
    async createEvent(event: InsertEvent): Promise<Event> {
        const [newEvent] = await db
            .insert(events)
            .values(event)
            .returning();

        return newEvent;
    }

    async getEvents(filters?: {
        city?: string;
        category?: string;
        status?: string;
        includePast?: boolean
    }): Promise<Event[]> {
        let whereConditions: any[] = [];

        // Default to only approved events
        const status = filters?.status || "approved";
        whereConditions.push(eq(events.status, status));

        // Filter by city
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
                whereConditions.push(inArray(events.city, capitalizedCities));
            }
        }

        // Filter by category
        if (filters?.category) {
            whereConditions.push(eq(events.category, filters.category));
        }

        // Exclude past events by default (unless includePast is true)
        if (!filters?.includePast) {
            whereConditions.push(gte(events.date, new Date()));
        }

        let query = db.select().from(events);

        if (whereConditions.length > 0) {
            query = query.where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions)) as any;
        }

        const result = await query.orderBy(asc(events.date));

        return result;
    }

    async getEventById(id: number): Promise<Event | null> {
        const result = await db
            .select()
            .from(events)
            .where(eq(events.id, id));

        return result[0] || null;
    }

    async getPendingEvents(): Promise<Event[]> {
        const result = await db
            .select()
            .from(events)
            .where(eq(events.status, "pending"))
            .orderBy(asc(events.createdAt));

        return result;
    }

    async getUpcomingEvents(limit?: number): Promise<Event[]> {
        let query = db
            .select()
            .from(events)
            .where(and(
                eq(events.status, "approved"),
                gte(events.date, new Date())
            ))
            .orderBy(asc(events.date));

        if (limit) {
            query = query.limit(limit) as any;
        }

        return await query;
    }

    async getPastEvents(limit?: number): Promise<Event[]> {
        let query = db
            .select()
            .from(events)
            .where(and(
                eq(events.status, "approved"),
                sql`${events.date} < NOW()`
            ))
            .orderBy(desc(events.date));

        if (limit) {
            query = query.limit(limit) as any;
        }

        return await query;
    }

    async approveEvent(id: number, adminId: number, adminNotes?: string): Promise<void> {
        await db
            .update(events)
            .set({
                status: "approved",
                reviewedAt: new Date(),
                reviewedBy: adminId,
                adminNotes: adminNotes || null,
                updatedAt: new Date(),
            })
            .where(eq(events.id, id));
    }

    async rejectEvent(id: number, adminId: number, adminNotes: string): Promise<void> {
        await db
            .update(events)
            .set({
                status: "rejected",
                reviewedAt: new Date(),
                reviewedBy: adminId,
                adminNotes,
                updatedAt: new Date(),
            })
            .where(eq(events.id, id));
    }

    async updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event> {
        const [updatedEvent] = await db
            .update(events)
            .set({
                ...eventData,
                updatedAt: new Date(),
            })
            .where(eq(events.id, id))
            .returning();

        return updatedEvent;
    }

    async deleteEvent(id: number): Promise<void> {
        await db
            .delete(events)
            .where(eq(events.id, id));
    }
}

export const storage = new DatabaseStorage();