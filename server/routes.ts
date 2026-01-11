import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "./config/passport";
import { storage } from "./storage";
import {
    insertPlaceSchema,
    insertReviewSchema,
    insertUserSchema,
    insertNutritionSchema,
    insertSavedStoreSchema,
    savedStores,
} from "@shared/schema";
import { z } from "zod";
import { requireAuth, requireAdmin, optionalAuth } from "./middleware/auth";
import { AuthService } from "./services/authService";
import { AuthenticatedRequest } from "./types/session";
import { CsrfService } from "./services/csrfService";
import { RateLimitService } from "./services/rateLimitService";
import { GeocodingService } from "./services/geocodingService";
import { registerCommunityRoutes } from "./routes/community";

const submissionSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    title: z.string(),
    description: z.string(),
    location: z.string(),
    website: z.string().optional(),
    type: z.enum(["event", "location"]),
    submittedAt: z.string(),
});
import { importLisbonFoodSources } from "./importLisbonFoodSources";
import { importAdditionalFoodSources } from "./additionalImport";
import { updateFoodSourcesImages } from "./updateFoodSourcesImages";
import { importLocationGuides } from "./importLocationGuides";

export async function registerRoutes(app: Express): Promise<Server> {
    // Apply general rate limiting to all API routes
    app.use("/api", RateLimitService.generalLimiter);

    // CSRF token endpoint
    app.get("/api/csrf-token", (req, res) => {
        try {
            const token = CsrfService.generateToken(req);
            res.json({ csrfToken: token });
        } catch (error) {
            console.error("CSRF token generation error:", error);
            res.status(500).json({ message: "Failed to generate CSRF token" });
        }
    });

    // Check username availability
    app.get("/api/auth/check-username/:username", RateLimitService.generalLimiter, async (req, res) => {
        try {
            const { username } = req.params;
            const existingUser = await AuthService.getUserByUsername(username);
            res.json({ available: !existingUser });
        } catch (error) {
            console.error("Username check error:", error);
            res.status(500).json({ message: "Failed to check username availability" });
        }
    });

    // Check email availability
    app.get("/api/auth/check-email/:email", RateLimitService.generalLimiter, async (req, res) => {
        try {
            const { email } = req.params;
            const existingUser = await AuthService.getUserByEmail(email);
            res.json({ available: !existingUser });
        } catch (error) {
            console.error("Email check error:", error);
            res.status(500).json({ message: "Failed to check email availability" });
        }
    });

    // Authentication routes
    app.post("/api/auth/register", RateLimitService.authLimiter, CsrfService.middleware(), async (req, res) => {
        try {
            const userData = insertUserSchema.parse(req.body);

            // Check if username already exists
            const existingUser = await AuthService.getUserByUsername(userData.username);
            if (existingUser) {
                return res.status(409).json({ 
                    message: "Username already exists",
                    code: "USERNAME_EXISTS" 
                });
            }

            // Check if email already exists
            const existingEmail = await AuthService.getUserByEmail(userData.email);
            if (existingEmail) {
                return res.status(409).json({ 
                    message: "Email already exists",
                    code: "EMAIL_EXISTS" 
                });
            }

            const newUser = await AuthService.createUser({
                ...userData,
                name: userData.name ?? undefined,
                city: userData.city ?? undefined,
                country: userData.country ?? undefined,
                bio: userData.bio ?? undefined,
            });

            // Create session
            const session = req.session as AuthenticatedRequest["session"];
            session.userId = newUser.id;
            session.username = newUser.username;
            session.isAdmin = newUser.role === "admin";
            session.lastActivity = new Date();

            res.status(201).json({
                message: "Registration successful",
                user: newUser
            });
        } catch (error) {
            console.error("Registration error:", error);
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    message: "Invalid user data",
                    errors: error.errors,
                });
            } else {
                res.status(500).json({ message: "Failed to create user" });
            }
        }
    });

    app.post("/api/auth/login", RateLimitService.loginLimiter, CsrfService.middleware(), async (req, res) => {
        try {
            const { username, password, rememberMe } = req.body;

            if (!username || !password) {
                return res.status(400).json({ 
                    message: "Username and password are required",
                    code: "MISSING_CREDENTIALS" 
                });
            }

            const authResult = await AuthService.authenticateUser(username, password);

            if (!authResult.success) {
                return res.status(401).json({
                    message: authResult.message,
                    code: "locked" in authResult ? "ACCOUNT_LOCKED" : "INVALID_CREDENTIALS",
                    attemptsRemaining: "attemptsRemaining" in authResult ? authResult.attemptsRemaining : undefined
                });
            }

            // Create session
            const session = req.session as AuthenticatedRequest["session"];
            const user = (authResult as any).user;
            session.userId = user.id;
            session.username = user.username;
            session.isAdmin = user.role === "admin";
            session.lastActivity = new Date();

            // Extend session duration if "remember me" is checked
            if (rememberMe) {
                session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
            }

            res.json({
                message: "Login successful",
                user: user
            });
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ message: "Login failed" });
        }
    });

    app.post("/api/auth/logout", RateLimitService.authLimiter, CsrfService.middleware(), (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error("Logout error:", err);
                return res.status(500).json({ message: "Failed to logout" });
            }
            
            res.clearCookie("expatEatsSession");
            res.json({ message: "Logout successful" });
        });
    });

    app.get("/api/auth/me", requireAuth, async (req: AuthenticatedRequest, res) => {
        try {
            const user = await AuthService.getUserById(req.session.userId!);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json({ user });
        } catch (error) {
            console.error("Get user error:", error);
            res.status(500).json({ message: "Failed to get user data" });
        }
    });

    // =========================================================================
    // GOOGLE OAUTH ROUTES
    // =========================================================================

    /**
     * Initiate Google OAuth flow
     * Redirects user to Google sign-in page
     */
    app.get(
        "/api/auth/google",
        RateLimitService.authLimiter,
        passport.authenticate("google", {
            scope: ["profile", "email"],
        })
    );

    /**
     * Google OAuth callback
     * Handles response from Google after user grants/denies permission
     */
    app.get(
        "/api/auth/google/callback",
        RateLimitService.authLimiter,
        passport.authenticate("google", {
            failureRedirect: "/login?error=oauth_failed",
            session: false, // We'll handle session manually
        }),
        async (req: AuthenticatedRequest, res) => {
            try {
                const user = req.user as any;

                if (!user) {
                    console.error("[OAuth] No user returned from Google authentication");
                    return res.redirect("/login?error=auth_failed");
                }

                // Set up session
                const session = req.session as AuthenticatedRequest["session"];
                session.userId = user.id;
                session.username = user.username || user.email;
                session.isAdmin = user.role === "admin";
                session.lastActivity = new Date();

                // Save session before redirect
                req.session.save((err) => {
                    if (err) {
                        console.error("[OAuth] Session save error:", err);
                        return res.redirect("/login?error=session_failed");
                    }

                    // Check if there's a returnTo URL stored in session
                    const returnTo = (session as any).returnTo || "/";
                    delete (session as any).returnTo;

                    console.log(`[OAuth] User ${user.email} logged in successfully via Google`);
                    res.redirect(returnTo);
                });
            } catch (error) {
                console.error("[OAuth] Callback error:", error);
                res.redirect("/login?error=callback_failed");
            }
        }
    );

    /**
     * Get Google OAuth status for current user
     * Returns whether user has Google account linked
     */
    app.get("/api/auth/google/status", requireAuth, async (req: AuthenticatedRequest, res) => {
        try {
            const user = await AuthService.getUserById(req.session.userId!);

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            res.json({
                isLinked: !!user.googleId,
                authProvider: user.authProvider || "local",
                googleEmail: user.googleEmail || null,
                hasPassword: !!user.password,
            });
        } catch (error) {
            console.error("[OAuth] Status check error:", error);
            res.status(500).json({ message: "Failed to get OAuth status" });
        }
    });

    /**
     * Unlink Google account from current user
     * Only allowed if user has username/password
     */
    app.post(
        "/api/auth/google/unlink",
        requireAuth,
        RateLimitService.authLimiter,
        CsrfService.middleware(),
        async (req: AuthenticatedRequest, res) => {
            try {
                const userId = req.session.userId!;

                await AuthService.unlinkGoogleAccount(userId);

                console.log(`[OAuth] User ${userId} unlinked Google account`);

                res.json({
                    message: "Google account unlinked successfully",
                    success: true,
                });
            } catch (error) {
                console.error("[OAuth] Unlink error:", error);

                const errorMessage = error instanceof Error ? error.message : "Failed to unlink Google account";

                res.status(400).json({
                    message: errorMessage,
                    success: false,
                });
            }
        }
    );

    // Get all places with optional filters
    app.get("/api/places", async (req, res) => {
        try {
            const { city, category, tags } = req.query;
            console.log("API Query params:", { city, category, tags });

            const filters = {
                city: city as string,
                category: category as string,
                tags: tags
                    ? (tags as string).split(",").filter((t) => t.trim())
                    : undefined,
            };
            console.log("Processed filters:", filters);

            const places = await storage.getPlaces(filters);
            console.log(`Found ${places.length} places`);
            res.json(places);
        } catch (error) {
            console.error("Error fetching places:", error);
            res.status(500).json({ message: "Failed to fetch places" });
        }
    });

    // Get place by ID
    app.get("/api/places/:id", async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const place = await storage.getPlace(id);

            if (!place) {
                return res.status(404).json({ message: "Place not found" });
            }

            res.json(place);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch place" });
        }
    });

    // Create a new place
    app.post("/api/places", CsrfService.middleware(), async (req, res) => {
        try {
            console.log(
                "Received place data:",
                JSON.stringify(req.body, null, 2),
            );
            const placeData = insertPlaceSchema.parse(req.body);
            console.log(
                "Validated place data:",
                JSON.stringify(placeData, null, 2),
            );
            const newPlace = await storage.createPlace(placeData);
            res.status(201).json(newPlace);
        } catch (error) {
            console.error("Place creation error:", error);
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    message: "Invalid place data",
                    errors: error.errors,
                });
            } else {
                res.status(500).json({ message: "Failed to create place" });
            }
        }
    });


    // Admin endpoints for place review
    app.get("/api/admin/pending-places", requireAdmin, async (req: AuthenticatedRequest, res) => {
        try {
            const pendingPlaces = await storage.getPendingPlaces();
            res.json(pendingPlaces);
        } catch (error) {
            console.error("Error fetching pending places:", error);
            res.status(500).json({ message: "Failed to fetch pending places" });
        }
    });

    app.post("/api/admin/approve-place/:id", CsrfService.middleware(), requireAdmin, async (req: AuthenticatedRequest, res) => {
        try {
            const placeId = parseInt(req.params.id);
            const { adminNotes, softRating, michaelesNotes, skipGeocode, coordinates } = req.body;

            // Get place details for geocoding
            const place = await storage.getPlace(placeId);
            if (!place) {
                return res.status(404).json({ message: "Place not found" });
            }

            let finalCoordinates = null;

            // Geocode unless skipped or manual coordinates provided
            if (!skipGeocode && !coordinates) {
                console.log(`Geocoding place: ${place.name} at ${place.address}, ${place.city}`);

                const geocodeResult = await GeocodingService.geocodeAddress(
                    place.address,
                    place.city,
                    place.region || undefined,
                    place.country
                );

                if (geocodeResult.success) {
                    finalCoordinates = geocodeResult.coordinates;
                    console.log(`Geocoding successful: ${finalCoordinates?.latitude}, ${finalCoordinates?.longitude}`);
                } else {
                    // Return geocoding error to frontend for handling
                    console.warn(`Geocoding failed for place ${placeId}: ${geocodeResult.error}`);
                    return res.status(422).json({
                        geocodingError: true,
                        message: geocodeResult.error || "Failed to geocode address",
                        place: place
                    });
                }
            } else if (coordinates) {
                // Use admin-provided coordinates (from manual correction)
                finalCoordinates = coordinates;
                console.log(`Using admin-provided coordinates: ${finalCoordinates.latitude}, ${finalCoordinates.longitude}`);
            } else {
                console.log(`Geocoding skipped for place ${placeId}`);
            }

            // Approve with coordinates
            await storage.approvePlaceWithCoordinates(
                placeId,
                adminNotes,
                softRating,
                michaelesNotes,
                finalCoordinates || undefined
            );

            res.json({
                success: true,
                message: "Place approved successfully",
                coordinates: finalCoordinates
            });
        } catch (error) {
            console.error("Error approving place:", error);
            res.status(500).json({ message: "Failed to approve place" });
        }
    });

    app.post("/api/admin/reject-place/:id", CsrfService.middleware(), requireAdmin, async (req: AuthenticatedRequest, res) => {
        try {
            const placeId = parseInt(req.params.id);
            const { adminNotes } = req.body;
            if (!adminNotes) {
                return res
                    .status(400)
                    .json({
                        message: "Admin notes are required for rejection",
                    });
            }
            await storage.rejectPlace(placeId, adminNotes);
            res.json({ success: true, message: "Place rejected successfully" });
        } catch (error) {
            console.error("Error rejecting place:", error);
            res.status(500).json({ message: "Failed to reject place" });
        }
    });

    // Admin: Update place notes and rating
    app.patch("/api/admin/update-place-notes/:id", CsrfService.middleware(), requireAdmin, async (req: AuthenticatedRequest, res) => {
        try {
            const placeId = parseInt(req.params.id);
            const { softRating, michaelesNotes } = req.body;
            await storage.updatePlaceNotesAndRating(placeId, softRating, michaelesNotes);
            res.json({ success: true, message: "Place notes and rating updated successfully" });
        } catch (error) {
            console.error("Error updating place notes and rating:", error);
            res.status(500).json({ message: "Failed to update place notes and rating" });
        }
    });

    // Admin: Update place data (for edit & retry geocoding scenario)
    app.patch("/api/admin/update-place/:id", CsrfService.middleware(), requireAdmin, async (req: AuthenticatedRequest, res) => {
        try {
            const placeId = parseInt(req.params.id);
            const { address, city, region, country } = req.body;

            const updateData: any = {};
            if (address) updateData.address = address;
            if (city) updateData.city = city;
            if (region !== undefined) updateData.region = region;
            if (country) updateData.country = country;

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({ message: "No fields to update" });
            }

            await storage.updatePlaceData(placeId, updateData);
            res.json({ success: true, message: "Place updated successfully" });
        } catch (error) {
            console.error("Error updating place:", error);
            res.status(500).json({ message: "Failed to update place" });
        }
    });

    // Admin: Batch geocode approved places without coordinates
    app.post("/api/admin/batch-geocode", CsrfService.middleware(), requireAdmin, async (req: AuthenticatedRequest, res) => {
        try {
            console.log("Starting batch geocoding process...");

            // Get all approved places without coordinates
            const placesWithoutCoords = await storage.getPlacesWithoutCoordinates();

            if (placesWithoutCoords.length === 0) {
                return res.json({
                    success: true,
                    message: "No places need geocoding",
                    results: [],
                    summary: { total: 0, successful: 0, failed: 0 }
                });
            }

            console.log(`Found ${placesWithoutCoords.length} places without coordinates`);

            // Batch geocode with progress tracking
            const results = await GeocodingService.geocodeBatch(placesWithoutCoords);

            // Update database with successful results
            let updateCount = 0;
            for (const result of results) {
                if (result.success && result.coordinates) {
                    try {
                        await storage.updatePlaceCoordinates(
                            result.placeId,
                            result.coordinates.latitude,
                            result.coordinates.longitude
                        );
                        updateCount++;
                    } catch (error) {
                        console.error(`Failed to update coordinates for place ${result.placeId}:`, error);
                    }
                }
            }

            // Calculate summary
            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;

            console.log(`Batch geocoding complete: ${successful} successful, ${failed} failed, ${updateCount} updated in DB`);

            res.json({
                success: true,
                message: `Geocoded ${successful} places successfully, ${failed} failed`,
                results: results,
                summary: {
                    total: results.length,
                    successful,
                    failed
                }
            });

        } catch (error) {
            console.error("Batch geocoding error:", error);
            res.status(500).json({ message: "Batch geocoding failed" });
        }
    });

    // Admin: Create a new city
    app.post("/api/admin/cities", CsrfService.middleware(), requireAdmin, async (req: AuthenticatedRequest, res) => {
        try {
            const { name, country, region } = req.body;
            if (!name || !country) {
                return res.status(400).json({ message: "Name and country are required" });
            }

            const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

            const newCity = await storage.createCity({
                name,
                slug,
                country,
                region: region || null,
            });

            res.json(newCity);
        } catch (error) {
            console.error("Error creating city:", error);
            res.status(500).json({ message: "Failed to create city" });
        }
    });

    // Get all users (admin only)
    app.get("/api/users", requireAdmin, async (req: AuthenticatedRequest, res) => {
        try {
            const users = await storage.getAllUsers();
            // Remove password field for security
            const safeUsers = users.map((user) => {
                const { password, ...safeUser } = user;
                return safeUser;
            });
            res.json(safeUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
            res.status(500).json({ message: "Failed to fetch users" });
        }
    });

    // Get reviews for a place
    app.get("/api/places/:id/reviews", async (req, res) => {
        try {
            const placeId = parseInt(req.params.id);
            const reviews = await storage.getReviewsByPlace(placeId);
            res.json(reviews);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch reviews" });
        }
    });

    // Create a new review
    app.post("/api/reviews", CsrfService.middleware(), async (req, res) => {
        try {
            const reviewData = insertReviewSchema.parse(req.body);
            const newReview = await storage.createReview(reviewData);

            // Update place average rating
            const placeId = reviewData.placeId;
            const reviews = await storage.getReviewsByPlace(placeId);

            if (reviews.length > 0) {
                const sum = reviews.reduce(
                    (total, review) => total + review.rating,
                    0,
                );
                const average = Math.round(sum / reviews.length);
                await storage.updatePlaceRating(placeId, average);
            }

            res.status(201).json(newReview);
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    message: "Invalid review data",
                    errors: error.errors,
                });
            } else {
                res.status(500).json({ message: "Failed to create review" });
            }
        }
    });

    // Submit nutrition consultation request
    app.post("/api/nutrition", CsrfService.middleware(), async (req, res) => {
        try {
            const nutritionData = insertNutritionSchema.parse(req.body);
            const consultation =
                await storage.createNutritionConsultation(nutritionData);
            res.status(201).json(consultation);
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    message: "Invalid consultation data",
                    errors: error.errors,
                });
            } else {
                res.status(500).json({
                    message: "Failed to submit consultation request",
                });
            }
        }
    });

    // Legacy user registration endpoint (deprecated - use /api/auth/register instead)
    app.post("/api/users", CsrfService.middleware(), async (req, res) => {
        try {
            const userData = insertUserSchema.parse(req.body);

            // Check if username already exists
            const existingUser = await AuthService.getUserByUsername(userData.username);
            if (existingUser) {
                return res.status(409).json({ message: "Username already exists" });
            }

            // Check if email already exists
            const existingEmail = await AuthService.getUserByEmail(userData.email);
            if (existingEmail) {
                return res.status(409).json({ message: "Email already exists" });
            }

            const newUser = await AuthService.createUser({
                ...userData,
                name: userData.name ?? undefined,
                city: userData.city ?? undefined,
                country: userData.country ?? undefined,
                bio: userData.bio ?? undefined,
            });
            res.status(201).json(newUser);
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    message: "Invalid user data",
                    errors: error.errors,
                });
            } else {
                res.status(500).json({ message: "Failed to create user" });
            }
        }
    });

    // Get all locations from existing data
    app.get("/api/locations", async (req, res) => {
        try {
            const locations = await storage.getDistinctLocations();
            res.json(locations);
        } catch (error) {
            console.error("Error fetching locations:", error);
            res.status(500).json({ message: "Failed to fetch locations" });
        }
    });

    // Get featured cities
    app.get("/api/cities", async (req, res) => {
        try {
            const cities = await storage.getFeaturedCities();
            res.json(cities);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch cities" });
        }
    });

    // Import Lisbon food sources (development only)
    if (process.env.NODE_ENV === "development") {
        app.post("/api/import-food-sources", async (req, res) => {
        try {
            const result = await importLisbonFoodSources();
            if (result.success) {
                res.status(200).json({
                    message: `Successfully imported ${result.count} food sources`,
                });
            } else {
                res.status(500).json({
                    message: "Failed to import food sources",
                    error: result.error,
                });
            }
        } catch (error) {
            console.error("Error importing food sources:", error);
            res.status(500).json({ message: "Failed to import food sources" });
        }
        });
    }

    // Import additional specialized food sources (development only)
    if (process.env.NODE_ENV === "development") {
        app.post("/api/import-additional-sources", async (req, res) => {
        try {
            const result = await importAdditionalFoodSources();
            if (result.success) {
                res.status(200).json({
                    message: `Successfully imported ${result.count} additional food sources`,
                });
            } else {
                res.status(500).json({
                    message: "Failed to import additional food sources",
                    error: result.error,
                });
            }
        } catch (error) {
            console.error("Error importing additional food sources:", error);
            res.status(500).json({
                message: "Failed to import additional food sources",
            });
        }
        });
    }

    // Import location guides (Sintra, Cascais, Oeiras) (development only)
    if (process.env.NODE_ENV === "development") {
        app.post("/api/import-location-guides", async (req, res) => {
        try {
            const result = await importLocationGuides();
            if (result.success) {
                res.status(200).json({
                    message: `Successfully imported ${result.count} food sources across all locations`,
                    locations: result.locations,
                });
            } else {
                res.status(500).json({
                    message: "Failed to import location guides",
                    error: result.error,
                });
            }
        } catch (error) {
            console.error("Error importing location guides:", error);
            res.status(500).json({
                message: "Failed to import location guides",
            });
        }
        });
    }

    // Import supplements data (development only)
    if (process.env.NODE_ENV === "development") {
        app.post("/api/import-supplements", async (req, res) => {
        try {
            const { importSupplementsData } = await import(
                "./importSupplementsData"
            );
            const result = await importSupplementsData();
            if (result.success) {
                res.status(200).json({
                    message: `Successfully imported ${result.count} supplement stores`,
                });
            } else {
                res.status(500).json({
                    message: "Failed to import supplements",
                    error: result.error,
                });
            }
        } catch (error) {
            console.error("Error importing supplements:", error);
            res.status(500).json({ message: "Failed to import supplements" });
        }
        });
    }

    // Import enhanced store data with contact info and social media (development only)
    if (process.env.NODE_ENV === "development") {
        app.post("/api/import-enhanced-stores", async (req, res) => {
        try {
            const { importEnhancedStores } = await import(
                "./importEnhancedStores"
            );
            const result = await importEnhancedStores();
            if (result.success) {
                res.status(200).json({
                    message: `Successfully imported ${result.count} enhanced stores`,
                });
            } else {
                res.status(500).json({
                    message: "Failed to import enhanced stores",
                    error: result.error,
                });
            }
        } catch (error) {
            console.error("Error importing enhanced stores:", error);
            res.status(500).json({
                message: "Failed to import enhanced stores",
            });
        }
        });
    }

    // Submit event or location submissions via email
    app.post("/api/submissions", CsrfService.middleware(), async (req, res) => {
        try {
            const validatedData = submissionSchema.parse(req.body);

            // Log the submission for now - in production, this would send an email
            console.log(`New ${validatedData.type} submission:`, {
                from: `${validatedData.name} <${validatedData.email}>`,
                title: validatedData.title,
                description: validatedData.description,
                location: validatedData.location,
                website: validatedData.website,
                submittedAt: validatedData.submittedAt,
            });

            res.status(200).json({
                message: `${validatedData.type} submission received successfully`,
                success: true,
            });
        } catch (error) {
            console.error("Error processing submission:", error);
            res.status(400).json({ message: "Invalid submission data" });
        }
    });

    // Submit feedback via email
    app.post("/api/feedback", CsrfService.middleware(), async (req, res) => {
        try {
            const feedbackSchema = z.object({
                name: z.string().min(2, "Name is required"),
                email: z.string().email("Please enter a valid email"),
                feedback: z
                    .string()
                    .min(10, "Feedback must be at least 10 characters"),
            });

            const { name, email, feedback } = feedbackSchema.parse(req.body);

            // Send email to Michaele using SendGrid
            const sgMail = require("@sendgrid/mail");

            if (!process.env.SENDGRID_API_KEY) {
                return res
                    .status(500)
                    .json({ message: "Email service not configured" });
            }

            sgMail.setApiKey(process.env.SENDGRID_API_KEY);

            const msg = {
                to: "admin@expateatsguide.com",
                from: "noreply@expateatsguide.com", // This should be a verified sender domain
                subject: `ExpatEats Feedback from ${name}`,
                text: `
New feedback received from ExpatEats:

Name: ${name}
Email: ${email}

Feedback:
${feedback}
        `,
                html: `
<h2>New feedback received from ExpatEats</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<h3>Feedback:</h3>
<p>${feedback.replace(/\n/g, "<br>")}</p>
        `,
            };

            await sgMail.send(msg);

            res.status(200).json({ message: "Feedback sent successfully" });
        } catch (error) {
            console.error("Error sending feedback:", error);
            res.status(500).json({ message: "Failed to send feedback" });
        }
    });

    // Before You Go guide purchase endpoint
    app.post("/api/before-you-go/purchase", requireAuth, CsrfService.middleware(), async (req: AuthenticatedRequest, res) => {
        try {
            const purchaseSchema = z.object({
                email: z.string().email(),
            });

            const { email } = purchaseSchema.parse(req.body);
            const userId = req.session.userId!;
            const user = await AuthService.getUserById(userId);

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Send email to customer using SendGrid
            const sgMail = require("@sendgrid/mail");

            if (!process.env.SENDGRID_API_KEY) {
                return res
                    .status(500)
                    .json({ message: "Email service not configured" });
            }

            sgMail.setApiKey(process.env.SENDGRID_API_KEY);

            const customerMsg = {
                to: email,
                from: "noreply@expateatsguide.com",
                subject: "Your 'What to Know Before You Go' Guide is Ready!",
                text: `
Welcome to Expat Eats!

Thank you for purchasing "What to Know Before You Go" - your essential preparation guide for moving to Portugal.

Your guide is now ready for download:
[DOWNLOAD_LINK]

This comprehensive guide includes:
✓ Pre-move checklist for wellness-minded families and individuals
✓ Tips for sourcing clean food, water, and personal care in Portugal
✓ Guide to grocery store chains
✓ Cultural insights and common market phrases
✓ What to bring vs. what to buy locally
✓ Local wellness spots, markets, and trusted vendors
✓ Expat Eats member tips and favorite finds

BONUS: You're also invited to join the Expat Eats community - the place where wellness meets connection. Click here to join: [COMMUNITY_LINK]

Need more personalized support? We also offer:
- Personalized Meal Plans
- Grocery Store Tours
- Arrival Packages
- And more!

Visit our Services page to learn more: [SERVICES_LINK]

Welcome to the journey,
The Expat Eats Team

Questions? Reply to this email and we'll be happy to help.
                `,
                html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Montserrat', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #94AF9F 0%, #DDB892 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .header h1 {
            margin: 0;
            font-size: 26px;
            font-weight: 300;
        }
        .content {
            background-color: #F9F5F0;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .download-box {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            margin: 20px 0;
            border: 2px solid #94AF9F;
        }
        .download-button {
            display: inline-block;
            background-color: #E07A5F;
            color: white;
            padding: 15px 40px;
            text-decoration: none;
            border-radius: 30px;
            margin: 15px 0;
            font-weight: 600;
            font-size: 16px;
        }
        .features {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .feature-item {
            padding: 10px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        .feature-item:last-child {
            border-bottom: none;
        }
        .checkmark {
            color: #94AF9F;
            font-weight: bold;
            margin-right: 10px;
        }
        .bonus-box {
            background: linear-gradient(135deg, #E07A5F 0%, #DDB892 100%);
            color: white;
            padding: 25px;
            border-radius: 10px;
            margin: 20px 0;
            text-align: center;
        }
        .cta-button {
            display: inline-block;
            background-color: white;
            color: #94AF9F;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 25px;
            margin: 10px;
            font-weight: 600;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧭 Your Guide is Ready!</h1>
        <p style="margin: 10px 0 0 0; font-size: 18px;">What to Know Before You Go to Portugal</p>
    </div>

    <div class="content">
        <p style="font-size: 18px; color: #94AF9F; font-weight: 600;">Welcome to Expat Eats, ${user.name || user.username}!</p>

        <p>Thank you for purchasing <strong>"What to Know Before You Go"</strong> - your essential preparation guide for moving to Portugal.</p>

        <div class="download-box">
            <h2 style="color: #94AF9F; margin-top: 0;">📥 Download Your Guide</h2>
            <p>Click the button below to access your comprehensive guide:</p>
            <a href="[DOWNLOAD_LINK]" class="download-button">Download Guide Now</a>
            <p style="font-size: 12px; color: #666; margin-top: 15px;">Link expires in 30 days • PDF format • 50+ pages</p>
        </div>

        <div class="features">
            <h3 style="color: #94AF9F; margin-top: 0;">What's Inside Your Guide:</h3>
            <div class="feature-item">
                <span class="checkmark">✓</span> Pre-move checklist for wellness-minded families and individuals
            </div>
            <div class="feature-item">
                <span class="checkmark">✓</span> Tips for sourcing clean food, water, and personal care in Portugal
            </div>
            <div class="feature-item">
                <span class="checkmark">✓</span> Complete guide to grocery store chains
            </div>
            <div class="feature-item">
                <span class="checkmark">✓</span> Cultural insights and common phrases for markets
            </div>
            <div class="feature-item">
                <span class="checkmark">✓</span> What to bring vs. what to buy locally
            </div>
            <div class="feature-item">
                <span class="checkmark">✓</span> Local wellness spots, markets, and trusted vendors
            </div>
            <div class="feature-item">
                <span class="checkmark">✓</span> Real tips from Expat Eats community members
            </div>
        </div>

        <div class="bonus-box">
            <h3 style="margin-top: 0;">🎁 Special Bonus!</h3>
            <p>You're invited to join the <strong>Expat Eats community</strong> - where wellness meets connection.</p>
            <a href="[COMMUNITY_LINK]" class="cta-button">Join the Community</a>
        </div>

        <p style="margin-top: 25px;">Need more personalized support? We also offer:</p>
        <ul style="color: #666;">
            <li>Personalized Meal Plans</li>
            <li>Grocery Store & Shopping Tours</li>
            <li>Arrival Packages & Assistance</li>
        </ul>
        <p style="text-align: center;">
            <a href="[SERVICES_LINK]" class="cta-button" style="background-color: #94AF9F; color: white;">Explore Our Services</a>
        </p>

        <p style="margin-top: 30px; font-style: italic; color: #666;">Welcome to the journey,<br>
        The Expat Eats Team</p>

        <p style="font-size: 14px; color: #999; margin-top: 20px;">Questions? Reply to this email and we'll be happy to help.</p>
    </div>

    <div class="footer">
        <p>© 2024 Expat Eats. All rights reserved.</p>
    </div>
</body>
</html>
                `,
            };

            await sgMail.send(customerMsg);

            // Send notification to admin
            const adminMsg = {
                to: "admin@expateatsguide.com",
                from: "noreply@expateatsguide.com",
                subject: "New Guide Purchase - Before You Go",
                text: `
New "What to Know Before You Go" guide purchase:

Customer: ${user.name || user.username}
Email: ${email}
User ID: ${userId}
Price: €25

Please ensure the download link is sent to the customer.
                `,
                html: `
<h2>New Guide Purchase</h2>
<p><strong>Guide:</strong> What to Know Before You Go</p>
<p><strong>Price:</strong> €25</p>
<p><strong>Customer:</strong> ${user.name || user.username}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>User ID:</strong> ${userId}</p>
<p>Please ensure the download link is sent to the customer.</p>
                `,
            };

            await sgMail.send(adminMsg);

            res.status(200).json({
                message: "Purchase successful! Check your email for the download link.",
                success: true,
            });
        } catch (error) {
            console.error("Error processing guide purchase:", error);
            res.status(500).json({ message: "Failed to process purchase" });
        }
    });

    // Meal plan purchase endpoint
    app.post("/api/meal-plans/purchase", requireAuth, CsrfService.middleware(), async (req: AuthenticatedRequest, res) => {
        try {
            const purchaseSchema = z.object({
                planType: z.string(),
                price: z.number(),
                email: z.string().email(),
            });

            const { planType, price, email } = purchaseSchema.parse(req.body);
            const userId = req.session.userId!;
            const user = await AuthService.getUserById(userId);

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Send email to customer using SendGrid
            const sgMail = require("@sendgrid/mail");

            if (!process.env.SENDGRID_API_KEY) {
                return res
                    .status(500)
                    .json({ message: "Email service not configured" });
            }

            sgMail.setApiKey(process.env.SENDGRID_API_KEY);

            const planName = planType === "weekly" ? "7-Day Plan" : "Monthly Plan";

            const customerMsg = {
                to: email,
                from: "noreply@expateatsguide.com",
                subject: "Your personalized meal plan is on its way!",
                text: `
Way to go, you're about to fall in love with cooking again.

You've taken a huge step toward simplifying your new life in Portugal. No more standing in front of the fridge wondering what to make—your personalized meal plan is designed to remove the daily stress of "what's for dinner?" and help you eat well, feel energized, and settle into your new home with confidence.

Whether you're navigating new grocery stores, adjusting to unfamiliar ingredients, or just too busy to meal plan every week, this guide will lift a big burden off your shoulders.

Here's what to do next:

1. Book your discovery call (required before your plan is delivered):
   Schedule your 20-minute call here: [BOOKING_LINK]

2. Complete your intake form so we can tailor your plan to your lifestyle and goals:
   Complete your intake form: [FORM_LINK]

Once your call is complete, your 7-day PDF plan will be delivered within 3–5 business days. It will include recipes, shopping lists, and optional product links to make your next market trip a breeze.

Thanks for letting us be part of your Expat Eats journey. You're not just meal planning—you're building a life that nourishes you.

Warmly,
Michaele & the Expat Eats Team
                `,
                html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Montserrat', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #94AF9F;
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 300;
        }
        .content {
            background-color: #F9F5F0;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .highlight {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #E07A5F;
        }
        .cta-button {
            display: inline-block;
            background-color: #94AF9F;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 25px;
            margin: 10px 0;
            font-weight: 600;
        }
        .steps {
            margin: 20px 0;
        }
        .step {
            background-color: white;
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            border-left: 4px solid #DDB892;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Your personalized meal plan is on its way!</h1>
    </div>

    <div class="content">
        <p style="font-size: 18px; font-weight: 600; color: #94AF9F;">Way to go, you're about to fall in love with cooking again.</p>

        <p>You've taken a huge step toward simplifying your new life in Portugal. No more standing in front of the fridge wondering what to make—your personalized meal plan is designed to remove the daily stress of "what's for dinner?" and help you eat well, feel energized, and settle into your new home with confidence.</p>

        <p>Whether you're navigating new grocery stores, adjusting to unfamiliar ingredients, or just too busy to meal plan every week, this guide will lift a big burden off your shoulders.</p>

        <div class="highlight">
            <h2 style="color: #94AF9F; margin-top: 0;">Here's what to do next:</h2>

            <div class="steps">
                <div class="step">
                    <h3 style="margin-top: 0; color: #E07A5F;">1. Book your discovery call</h3>
                    <p>Required before your plan is delivered. Schedule your 20-minute call here:</p>
                    <a href="[BOOKING_LINK]" class="cta-button">Schedule Your Call</a>
                </div>

                <div class="step">
                    <h3 style="margin-top: 0; color: #E07A5F;">2. Complete your intake form</h3>
                    <p>Tell us about your lifestyle and goals so we can tailor your plan:</p>
                    <a href="[FORM_LINK]" class="cta-button">Complete Intake Form</a>
                </div>
            </div>
        </div>

        <p>Once your call is complete, your 7-day PDF plan will be delivered within <strong>3–5 business days</strong>. It will include recipes, shopping lists, and optional product links to make your next market trip a breeze.</p>

        <p style="margin-top: 30px;">Thanks for letting us be part of your Expat Eats journey. You're not just meal planning—you're building a life that nourishes you.</p>

        <p style="font-style: italic; color: #666;">Warmly,<br>
        Michaele & the Expat Eats Team</p>
    </div>

    <div class="footer">
        <p>© 2024 Expat Eats. All rights reserved.</p>
    </div>
</body>
</html>
                `,
            };

            await sgMail.send(customerMsg);

            // Send notification to admin
            const adminMsg = {
                to: "admin@expateatsguide.com",
                from: "noreply@expateatsguide.com",
                subject: `New Meal Plan Purchase - ${planName}`,
                text: `
New meal plan purchase received:

Plan: ${planName}
Price: €${price}
Customer: ${user.name || user.username}
Email: ${email}
User ID: ${userId}

Please follow up with the customer to schedule their discovery call.
                `,
                html: `
<h2>New Meal Plan Purchase</h2>
<p><strong>Plan:</strong> ${planName}</p>
<p><strong>Price:</strong> €${price}</p>
<p><strong>Customer:</strong> ${user.name || user.username}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>User ID:</strong> ${userId}</p>
<p>Please follow up with the customer to schedule their discovery call.</p>
                `,
            };

            await sgMail.send(adminMsg);

            res.status(200).json({
                message: "Purchase successful! Check your email for next steps.",
                success: true,
            });
        } catch (error) {
            console.error("Error processing meal plan purchase:", error);
            res.status(500).json({ message: "Failed to process purchase" });
        }
    });



    // Update food source images with better URLs
    app.post("/api/update-food-source-images", async (req, res) => {
        try {
            const result = await updateFoodSourcesImages();
            if (result.success) {
                res.status(200).json({
                    message: `Successfully updated images for ${result.count} food sources`,
                });
            } else {
                res.status(500).json({
                    message: "Failed to update food source images",
                    error: result.error,
                });
            }
        } catch (error) {
            console.error("Error updating food source images:", error);
            res.status(500).json({
                message: "Failed to update food source images",
            });
        }
    });

    // Get categories
    app.get("/api/categories", async (req, res) => {
        try {
            const categories = [
                {
                    id: 1,
                    name: "International Markets",
                    icon: "ri-store-2-line",
                    description: "Find specialty ingredients",
                },
                {
                    id: 2,
                    name: "Restaurants",
                    icon: "ri-restaurant-line",
                    description: "Authentic dining experiences",
                },
                {
                    id: 3,
                    name: "Grocery Stores",
                    icon: "ri-shopping-basket-line",
                    description: "Stock your pantry",
                },
                {
                    id: 4,
                    name: "Expat Groups",
                    icon: "ri-community-line",
                    description: "Connect with fellow foodies",
                },
            ];
            res.json(categories);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch categories" });
        }
    });

    // Saved stores endpoints
    app.get("/api/user/saved-stores", requireAuth, async (req: AuthenticatedRequest, res) => {
        try {
            const userId = req.session.userId!;
            const savedPlaces = await storage.getSavedStoresByUserId(userId);
            res.json(savedPlaces);
        } catch (error) {
            console.error("Get saved stores error:", error);
            res.status(500).json({ message: "Failed to fetch saved stores" });
        }
    });

    app.post("/api/user/saved-stores", requireAuth, CsrfService.middleware(), async (req: AuthenticatedRequest, res) => {
        try {
            const userId = req.session.userId!;
            const { storeId, action } = req.body;
            
            if (!storeId || !action) {
                return res.status(400).json({ message: "storeId and action are required" });
            }

            if (action === "save") {
                await storage.saveStore(userId, storeId);
                res.json({ message: "Store saved successfully" });
            } else if (action === "unsave") {
                await storage.unsaveStore(userId, storeId);
                res.json({ message: "Store removed successfully" });
            } else {
                res.status(400).json({ message: "Invalid action. Use 'save' or 'unsave'" });
            }
        } catch (error) {
            console.error("Save/unsave store error:", error);
            if (error instanceof Error && error.message.includes("already saved")) {
                res.status(409).json({ message: "Store is already in favorites" });
            } else {
                res.status(500).json({ message: "Failed to save/unsave store" });
            }
        }
    });

    app.delete("/api/user/saved-stores/:placeId", requireAuth, CsrfService.middleware(), async (req: AuthenticatedRequest, res) => {
        try {
            const userId = req.session.userId!;
            const placeId = parseInt(req.params.placeId);
            
            if (!placeId) {
                return res.status(400).json({ message: "Invalid place ID" });
            }

            await storage.unsaveStore(userId, placeId);
            res.json({ message: "Store removed from favorites" });
        } catch (error) {
            console.error("Remove saved store error:", error);
            res.status(500).json({ message: "Failed to remove store from favorites" });
        }
    });

    // Get testimonials
    app.get("/api/testimonials", async (req, res) => {
        try {
            const testimonials = [
                {
                    id: 1,
                    text: "ExpatEats helped me find authentic ingredients for my home country's dishes. The visual search is amazing - I just took a photo of a spice mix and it found the exact product at a local international market!",
                    author: "Sarah L.",
                    location: "American in Lisbon",
                    rating: 5,
                },
                {
                    id: 2,
                    text: "The meal planning feature is a game-changer. It suggests recipes based on what's available locally, but with flavors that remind me of home. The nutritionist helped me adapt my diet to local ingredients.",
                    author: "Miguel R.",
                    location: "Brazilian in Barcelona",
                    rating: 4,
                },
                {
                    id: 3,
                    text: "I've met amazing friends through the ExpatEats community events. We share recipes, cooking tips, and explore new restaurants together. It's made my transition to a new country so much easier.",
                    author: "Akiko T.",
                    location: "Japanese in Berlin",
                    rating: 5,
                },
            ];
            res.json(testimonials);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch testimonials" });
        }
    });

    // ================================================================================
    // EVENT ROUTES
    // ================================================================================

    // Public event routes
    app.get("/api/events", async (req, res) => {
        try {
            const { city, category, includePast } = req.query;

            const events = await storage.getEvents({
                city: city as string,
                category: category as string,
                status: "approved",
                includePast: includePast === "true",
            });

            res.json(events);
        } catch (error) {
            console.error("Error fetching events:", error);
            res.status(500).json({ message: "Failed to fetch events" });
        }
    });

    app.get("/api/events/upcoming", async (req, res) => {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
            const events = await storage.getUpcomingEvents(limit);

            res.json(events);
        } catch (error) {
            console.error("Error fetching upcoming events:", error);
            res.status(500).json({ message: "Failed to fetch upcoming events" });
        }
    });

    app.get("/api/events/:id", async (req, res) => {
        try {
            const eventId = parseInt(req.params.id);

            if (isNaN(eventId)) {
                return res.status(400).json({ message: "Invalid event ID" });
            }

            const event = await storage.getEventById(eventId);

            if (!event) {
                return res.status(404).json({ message: "Event not found" });
            }

            // Only show approved events to public (unless admin)
            if (event.status !== "approved" && !(req as any).session?.isAdmin) {
                return res.status(404).json({ message: "Event not found" });
            }

            res.json(event);
        } catch (error) {
            console.error("Error fetching event:", error);
            res.status(500).json({ message: "Failed to fetch event" });
        }
    });

    // Event submission route
    app.post("/api/events", CsrfService.middleware(), async (req, res) => {
        try {
            const {
                title,
                description,
                date,
                time,
                location,
                venueName,
                city,
                country,
                organizerName,
                organizerRole,
                organizerEmail,
                category,
                imageUrl,
                website,
                eventCost,
                eventLanguage,
                languageOther,
                featuredInterest,
                maxAttendees,
                submittedBy,
                submitterEmail,
            } = req.body;

            // Validate required fields
            if (!title || !description || !date || !time || !location || !city || !submittedBy || !submitterEmail) {
                return res.status(400).json({
                    message: "Missing required fields: title, description, date, time, location, city, submittedBy, and submitterEmail are required"
                });
            }

            // Get userId if user is authenticated
            const userId = (req as any).session?.userId || null;

            const newEvent = await storage.createEvent({
                title,
                description,
                date: new Date(date),
                time,
                location,
                venueName: venueName || null,
                city,
                country: country || "Portugal",
                organizerName: organizerName || null,
                organizerRole: organizerRole || null,
                organizerEmail: organizerEmail || null,
                category: category || null,
                imageUrl: imageUrl || null,
                website: website || null,
                eventCost: eventCost || null,
                eventLanguage: eventLanguage || null,
                languageOther: languageOther || null,
                featuredInterest: featuredInterest || false,
                maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
                currentAttendees: 0,
                submittedBy,
                submitterEmail,
                userId,
                status: "pending",
                adminNotes: null,
                reviewedAt: null,
                reviewedBy: null,
            });

            res.status(201).json({
                message: "Event submitted successfully and is pending approval",
                eventId: newEvent.id,
            });
        } catch (error) {
            console.error("Error creating event:", error);
            res.status(500).json({ message: "Failed to submit event" });
        }
    });

    // Admin event routes
    app.get("/api/admin/pending-events", requireAdmin, async (req: AuthenticatedRequest, res) => {
        try {
            const pendingEvents = await storage.getPendingEvents();
            res.json(pendingEvents);
        } catch (error) {
            console.error("Error fetching pending events:", error);
            res.status(500).json({ message: "Failed to fetch pending events" });
        }
    });

    app.post("/api/admin/approve-event/:id", CsrfService.middleware(), requireAdmin, async (req: AuthenticatedRequest, res) => {
        try {
            const eventId = parseInt(req.params.id);
            const { adminNotes } = req.body;
            const adminId = req.session!.userId;

            await storage.approveEvent(eventId, adminId, adminNotes);

            res.json({ message: "Event approved successfully" });
        } catch (error) {
            console.error("Error approving event:", error);
            res.status(500).json({ message: "Failed to approve event" });
        }
    });

    app.post("/api/admin/reject-event/:id", CsrfService.middleware(), requireAdmin, async (req: AuthenticatedRequest, res) => {
        try {
            const eventId = parseInt(req.params.id);
            const { adminNotes } = req.body;
            const adminId = req.session!.userId;

            if (!adminNotes) {
                return res.status(400).json({ message: "Admin notes are required for rejection" });
            }

            await storage.rejectEvent(eventId, adminId, adminNotes);

            res.json({ message: "Event rejected successfully" });
        } catch (error) {
            console.error("Error rejecting event:", error);
            res.status(500).json({ message: "Failed to reject event" });
        }
    });

    app.put("/api/admin/events/:id", CsrfService.middleware(), requireAdmin, async (req: AuthenticatedRequest, res) => {
        try {
            const eventId = parseInt(req.params.id);
            const eventData = req.body;

            // Remove fields that shouldn't be updated directly
            delete eventData.id;
            delete eventData.createdAt;
            delete eventData.reviewedAt;
            delete eventData.reviewedBy;

            const updatedEvent = await storage.updateEvent(eventId, eventData);

            res.json({ message: "Event updated successfully", event: updatedEvent });
        } catch (error) {
            console.error("Error updating event:", error);
            res.status(500).json({ message: "Failed to update event" });
        }
    });

    app.delete("/api/admin/events/:id", CsrfService.middleware(), requireAdmin, async (req: AuthenticatedRequest, res) => {
        try {
            const eventId = parseInt(req.params.id);

            await storage.deleteEvent(eventId);

            res.json({ message: "Event deleted successfully" });
        } catch (error) {
            console.error("Error deleting event:", error);
            res.status(500).json({ message: "Failed to delete event" });
        }
    });

    // Register community routes
    registerCommunityRoutes(app);

    const httpServer = createServer(app);
    return httpServer;
}
