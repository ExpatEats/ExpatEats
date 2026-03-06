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
    guides,
    guidePurchases,
} from "@shared/schema";
import {
    InsertPlace,
    InsertUser,
    InsertReview,
    InsertNutrition,
    InsertSavedStore,
    InsertCity,
    InsertEvent,
    InsertGuide,
    InsertGuidePurchase,
    Place,
    User,
    Review,
    Nutrition,
    SavedStore,
    City,
    Event,
    Guide,
    GuidePurchase,
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
    bulkCreatePlaces(places: InsertPlace[]): Promise<Place[]>;
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

    // Guide methods
    getAllGuides(): Promise<Guide[]>;
    getGuideById(id: number): Promise<Guide | null>;
    getGuideBySlug(slug: string): Promise<Guide | null>;
    getUserGuides(userId: number): Promise<Guide[]>;
    getUserGuidePurchase(userId: number, guideId: number): Promise<GuidePurchase | null>;
    createGuidePurchase(purchase: InsertGuidePurchase): Promise<GuidePurchase>;
}

class DatabaseStorage implements Storage {

    // Place methods
    async getPlaces(filters?: PlaceFilters): Promise<Place[]> {
        let whereConditions = [eq(places.status, "approved")];

        // Determine if this is a supplements search based on category filter
        const isSupplementsSearch = filters?.category?.includes("Health Food Store") ||
                                   filters?.category?.includes("Online Store") ||
                                   filters?.category?.includes("Department Store");

        // Filter by groceryAndMarket or supplements based on search type
        if (isSupplementsSearch) {
            whereConditions.push(eq(places.supplements, true));
        } else {
            whereConditions.push(eq(places.groceryAndMarket, true));
        }

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
            const tagConditions = filters.tags.map(tag => {
                // Map tag IDs to database columns
                if (isSupplementsSearch) {
                    // Supplement tags
                    switch(tag) {
                        case "supplements":
                            return eq(places.generalSupplements, true);
                        case "vitamins":
                            return eq(places.vitamins, true);
                        case "sports-nutrition":
                            return eq(places.sportsNutrition, true);
                        case "omega-3":
                            return eq(places.omega3, true);
                        case "herbal-remedies":
                            return eq(places.herbalRemedies, true);
                        case "practitioner-grade":
                            return eq(places.practitionerGrade, true);
                        case "vegan":
                            return eq(places.veganSupplements, true);
                        case "organic":
                            return eq(places.organicSupplements, true);
                        case "hypoallergenic":
                            return eq(places.hypoallergenic, true);
                        case "online":
                            return eq(places.onlineRetailer, true);
                        default:
                            return null;
                    }
                } else {
                    // Grocery & Market tags
                    switch(tag) {
                        case "gluten-free":
                            return eq(places.glutenFree, true);
                        case "dairy-free":
                            return eq(places.dairyFree, true);
                        case "nut-free":
                            return eq(places.nutFree, true);
                        case "vegan":
                            return eq(places.vegan, true);
                        case "organic":
                            return eq(places.organic, true);
                        case "local-farms":
                            return eq(places.localFarms, true);
                        case "fresh-vegetables":
                            return eq(places.freshVegetables, true);
                        case "farm-raised-meat":
                            return eq(places.farmRaisedMeat, true);
                        case "no-processed":
                            return eq(places.noProcessed, true);
                        case "kid-friendly":
                            return eq(places.kidFriendly, true);
                        case "bulk-buying":
                            return eq(places.bulkBuying, true);
                        case "zero-waste":
                            return eq(places.zeroWaste, true);
                        default:
                            return null;
                    }
                }
            }).filter(condition => condition !== null);

            // Use OR condition to find places that have ANY of the requested tags
            if (tagConditions.length > 0) {
                whereConditions.push(or(...tagConditions) as any);
            }
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

    async bulkCreatePlaces(placesArray: InsertPlace[]): Promise<Place[]> {
        if (placesArray.length === 0) {
            return [];
        }
        const newPlaces = await db.insert(places).values(placesArray).returning();
        return newPlaces;
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

    // Geocoding-enhanced approval method
    async approvePlaceWithCoordinates(
        placeId: number,
        adminNotes?: string,
        softRating?: string,
        michaelesNotes?: string,
        coordinates?: { latitude: string; longitude: string }
    ): Promise<void> {
        const updateData: any = {
            status: "approved",
            adminNotes,
            softRating,
            michaelesNotes,
            reviewedAt: new Date(),
        };

        if (coordinates) {
            updateData.latitude = coordinates.latitude;
            updateData.longitude = coordinates.longitude;
        }

        await db
            .update(places)
            .set(updateData)
            .where(eq(places.id, placeId));
    }

    // Get places without coordinates for batch geocoding
    async getPlacesWithoutCoordinates(): Promise<Place[]> {
        return await db
            .select()
            .from(places)
            .where(
                and(
                    eq(places.status, "approved"),
                    or(
                        eq(places.latitude, ""),
                        eq(places.longitude, ""),
                        sql`${places.latitude} IS NULL`,
                        sql`${places.longitude} IS NULL`
                    )
                )
            );
    }

    // Update only the coordinate fields
    async updatePlaceCoordinates(
        placeId: number,
        latitude: string,
        longitude: string
    ): Promise<void> {
        await db
            .update(places)
            .set({ latitude, longitude })
            .where(eq(places.id, placeId));
    }

    // Update place data for edit & retry scenario
    async updatePlaceData(
        placeId: number,
        updateData: Partial<Place>
    ): Promise<void> {
        await db
            .update(places)
            .set(updateData)
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

    // Guide methods
    async getAllGuides(): Promise<Guide[]> {
        return await db.select().from(guides);
    }

    async getGuideById(id: number): Promise<Guide | null> {
        const [guide] = await db
            .select()
            .from(guides)
            .where(eq(guides.id, id));
        return guide || null;
    }

    async getGuideBySlug(slug: string): Promise<Guide | null> {
        const [guide] = await db
            .select()
            .from(guides)
            .where(eq(guides.slug, slug));
        return guide || null;
    }

    async getUserGuides(userId: number): Promise<Guide[]> {
        const result = await db
            .select({
                id: guides.id,
                slug: guides.slug,
                url: guides.url,
                createdAt: guides.createdAt,
            })
            .from(guidePurchases)
            .innerJoin(guides, eq(guidePurchases.guideId, guides.id))
            .where(eq(guidePurchases.userId, userId));

        return result;
    }

    async getUserGuidePurchase(userId: number, guideId: number): Promise<GuidePurchase | null> {
        const [purchase] = await db
            .select()
            .from(guidePurchases)
            .where(and(
                eq(guidePurchases.userId, userId),
                eq(guidePurchases.guideId, guideId)
            ));
        return purchase || null;
    }

    async createGuidePurchase(purchase: InsertGuidePurchase): Promise<GuidePurchase> {
        const [newPurchase] = await db
            .insert(guidePurchases)
            .values(purchase)
            .returning();
        return newPurchase;
    }
}

export const storage = new DatabaseStorage();