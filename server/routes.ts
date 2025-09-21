import type { Express } from "express";
import { createServer, type Server } from "http";
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
            const { adminNotes } = req.body;
            await storage.approvePlace(placeId, adminNotes);
            res.json({ success: true, message: "Place approved successfully" });
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

    // Import Lisbon food sources
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

    // Import additional specialized food sources
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

    // Import location guides (Sintra, Cascais, Oeiras)
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

    // Import supplements data
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

    // Import enhanced store data with contact info and social media
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

    // Register community routes
    registerCommunityRoutes(app);

    const httpServer = createServer(app);
    return httpServer;
}
