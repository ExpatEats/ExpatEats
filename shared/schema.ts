import {
    pgTable,
    text,
    serial,
    integer,
    boolean,
    jsonb,
    timestamp,
    unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const cities = pgTable("cities", {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique(),
    slug: text("slug").notNull().unique(),
    country: text("country").notNull(),
    region: text("region"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    username: text("username").unique(), // Nullable for OAuth-only users
    password: text("password"), // Nullable for OAuth-only users
    email: text("email").notNull().unique(),
    name: text("name"),
    city: text("city"),
    country: text("country"),
    bio: text("bio"),
    role: text("role").default("user"),

    // OAuth fields
    googleId: text("google_id").unique(), // Google OAuth unique identifier
    authProvider: text("auth_provider").default("local"), // 'local', 'google', 'hybrid'
    profilePicture: text("profile_picture"), // Profile picture URL from Google or uploaded
    googleEmail: text("google_email"), // Email from Google OAuth (may differ from primary)

    // Email verification
    emailVerified: boolean("email_verified").default(false),
    emailVerificationToken: text("email_verification_token"),

    // Password reset
    passwordResetToken: text("password_reset_token"),
    passwordResetExpires: timestamp("password_reset_expires"),

    // Security
    failedLoginAttempts: integer("failed_login_attempts").default(0),
    accountLockedUntil: timestamp("account_locked_until"),
    lastLoginAt: timestamp("last_login_at"),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const places = pgTable("places", {
    id: serial("id").primaryKey(),
    uniqueId: text("unique_id"), // Unique ID from Excel
    name: text("name").notNull(),
    description: text("description").notNull(),
    address: text("address").notNull(),
    city: text("city").notNull(),
    region: text("region"), // Region field from Excel
    country: text("country").notNull(),
    category: text("category").notNull(), // 'market', 'restaurant', 'grocery', 'community'
    tags: text("tags").array(), // dietary preferences and tags
    latitude: text("latitude"),
    longitude: text("longitude"),

    // Contact Information
    phone: text("phone"),
    email: text("email"),

    // Social Media
    instagram: text("instagram"),
    website: text("website"),

    // Category Filters
    groceryAndMarket: boolean("grocery_and_market").default(false),
    supplements: boolean("supplements").default(false),

    // Additional Text Fields
    cityTags: text("city_tags"),
    badges: text("badges"),

    // Grocery & Market Boolean Filters
    glutenFree: boolean("gluten_free").default(false),
    dairyFree: boolean("dairy_free").default(false),
    nutFree: boolean("nut_free").default(false),
    vegan: boolean("vegan").default(false),
    organic: boolean("organic").default(false),
    localFarms: boolean("local_farms").default(false),
    freshVegetables: boolean("fresh_vegetables").default(false),
    farmRaisedMeat: boolean("farm_raised_meat").default(false),
    noProcessed: boolean("no_processed").default(false),
    kidFriendly: boolean("kid_friendly").default(false),
    bulkBuying: boolean("bulk_buying").default(false),
    zeroWaste: boolean("zero_waste").default(false),

    // Supplement Boolean Filters
    generalSupplements: boolean("general_supplements").default(false),
    omega3: boolean("omega3").default(false),
    veganSupplements: boolean("vegan_supplements").default(false),
    onlineRetailer: boolean("online_retailer").default(false),
    vitamins: boolean("vitamins").default(false),
    herbalRemedies: boolean("herbal_remedies").default(false),
    organicSupplements: boolean("organic_supplements").default(false),
    sportsNutrition: boolean("sports_nutrition").default(false),
    practitionerGrade: boolean("practitioner_grade").default(false),
    hypoallergenic: boolean("hypoallergenic").default(false),

    userId: integer("user_id").references(() => users.id),
    imageUrl: text("image_url"),
    averageRating: integer("average_rating"),
    status: text("status").default("pending"), // 'pending', 'approved', 'rejected'
    submittedBy: text("submitted_by"), // Name/email of submitter for non-authenticated users
    adminNotes: text("admin_notes"),
    softRating: text("soft_rating"), // 'Gold Standard', 'Great Choice', 'This Will Do in a Pinch', or empty string
    michaelesNotes: text("michaeles_notes"), // Michaele's personal notes about the location
    reviewedAt: timestamp("reviewed_at"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
    id: serial("id").primaryKey(),
    placeId: integer("place_id")
        .references(() => places.id)
        .notNull(),
    userId: integer("user_id")
        .references(() => users.id)
        .notNull(),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const nutrition = pgTable("nutrition", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    goals: text("goals").notNull(),
    userId: integer("user_id").references(() => users.id),
    status: text("status").default("pending"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const savedStores = pgTable("saved_stores", {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
        .references(() => users.id)
        .notNull(),
    placeId: integer("place_id")
        .references(() => places.id)
        .notNull(),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
    // Unique constraint to prevent duplicate favorites
    uniqueUserPlace: unique().on(table.userId, table.placeId),
}));

export const posts = pgTable("posts", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    userId: integer("user_id")
        .references(() => users.id)
        .notNull(),
    section: text("section").notNull(), // 'general', 'where-to-find', 'product-swaps'
    status: text("status").default("active"), // 'active', 'hidden', 'deleted'
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const comments = pgTable("comments", {
    id: serial("id").primaryKey(),
    postId: integer("post_id")
        .references(() => posts.id)
        .notNull(),
    userId: integer("user_id")
        .references(() => users.id)
        .notNull(),
    body: text("body").notNull(),
    status: text("status").default("active"), // 'active', 'hidden', 'deleted'
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const postLikes = pgTable("post_likes", {
    id: serial("id").primaryKey(),
    postId: integer("post_id")
        .references(() => posts.id)
        .notNull(),
    userId: integer("user_id")
        .references(() => users.id)
        .notNull(),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
    // Unique constraint to prevent duplicate likes
    uniqueUserPost: unique().on(table.userId, table.postId),
}));

export const events = pgTable("events", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    date: timestamp("date").notNull(),
    time: text("time").notNull(),
    location: text("location").notNull(),
    venueName: text("venue_name"),
    city: text("city").notNull(),
    country: text("country").default("Portugal"),
    organizerName: text("organizer_name"),
    organizerRole: text("organizer_role"),
    organizerEmail: text("organizer_email"),
    category: text("category"), // 'Food & Nutrition', 'Cooking & Culinary', 'Wellness & Self-Care', 'Movement & Fitness', 'Outdoor & Nature', 'Sustainable or Low-Tox Living', 'Community & Social', 'Workshops & Talks'
    imageUrl: text("image_url"),
    website: text("website"),
    eventCost: text("event_cost"), // 'Free', 'Paid', 'Donation-based'
    eventLanguage: text("event_language"), // 'English', 'Portuguese', 'Bilingual', 'Other'
    languageOther: text("language_other"),
    featuredInterest: boolean("featured_interest").default(false),
    maxAttendees: integer("max_attendees"),
    currentAttendees: integer("current_attendees").default(0),
    submittedBy: text("submitted_by").notNull(),
    submitterEmail: text("submitter_email").notNull(),
    userId: integer("user_id").references(() => users.id),
    status: text("status").default("pending"), // 'pending', 'approved', 'rejected'
    adminNotes: text("admin_notes"),
    reviewedAt: timestamp("reviewed_at"),
    reviewedBy: integer("reviewed_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const emailLogs = pgTable("email_logs", {
    id: serial("id").primaryKey(),
    toEmail: text("to_email").notNull(),
    fromEmail: text("from_email"),
    subject: text("subject").notNull(),
    emailType: text("email_type"), // 'password-reset', 'verification', 'welcome', 'newsletter', 'purchase'
    status: text("status").notNull(), // 'sent', 'failed', 'bounced', 'delivered', 'opened', 'clicked'
    messageId: text("message_id"), // SendGrid message ID for tracking
    errorMessage: text("error_message"),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    name: text("name"),
    status: text("status").default("subscribed"), // 'subscribed', 'unsubscribed', 'bounced'
    subscriptionSource: text("subscription_source"), // 'website', 'registration', 'import', 'admin'
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    subscribedAt: timestamp("subscribed_at").defaultNow(),
    unsubscribedAt: timestamp("unsubscribed_at"),
    unsubscribeToken: text("unsubscribe_token").unique(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const guides = pgTable("guides", {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(), // URL-friendly identifier (e.g., 'lisbon-food-guide')
    url: text("url").notNull(), // Full path to PDF file (e.g., '/guides/full/lisbon-food-guide.pdf')
    createdAt: timestamp("created_at").defaultNow(),
});

export const guidePurchases = pgTable("guide_purchases", {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
        .references(() => users.id)
        .notNull(),
    guideId: integer("guide_id")
        .references(() => guides.id)
        .notNull(),
    paymentProvider: text("payment_provider").notNull(), // 'stripe', 'paypal', 'manual'
    stripePaymentIntentId: text("stripe_payment_intent_id").unique(), // Link to Stripe payment
    purchaseStatus: text("purchase_status").default("pending"), // 'pending', 'completed', 'failed'
    purchasedAt: timestamp("purchased_at").defaultNow(),
}, (table) => ({
    // Unique constraint to prevent duplicate purchases
    uniqueUserGuide: unique().on(table.userId, table.guideId),
}));

export const payments = pgTable("payments", {
    id: serial("id").primaryKey(),

    // Stripe identifiers
    stripePaymentIntentId: text("stripe_payment_intent_id").unique().notNull(),
    stripeCheckoutSessionId: text("stripe_checkout_session_id").unique(),
    stripeCustomerId: text("stripe_customer_id"),

    // ExpatEats associations
    userId: integer("user_id")
        .references(() => users.id)
        .notNull(),
    guideId: integer("guide_id")
        .references(() => guides.id)
        .notNull(),
    guidePurchaseId: integer("guide_purchase_id")
        .references(() => guidePurchases.id),

    // Payment details
    amount: integer("amount").notNull(), // Amount in cents (e.g., 2500 for €25.00)
    currency: text("currency").notNull().default("eur"),
    status: text("status").notNull(), // 'pending', 'succeeded', 'failed', 'refunded'

    // Metadata
    paymentMethod: text("payment_method"), // 'card', 'ideal', etc.
    receiptEmail: text("receipt_email"),
    errorMessage: text("error_message"), // Store error if payment failed
    refundReason: text("refund_reason"), // If manually refunded via Stripe dashboard

    // Timestamps
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    succeededAt: timestamp("succeeded_at"), // When payment succeeded
    refundedAt: timestamp("refunded_at"), // If refunded
});


// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
    username: true,
    password: true,
    email: true,
    name: true,
    city: true,
    country: true,
    bio: true,
});

export const insertPlaceSchema = createInsertSchema(places).omit({
    id: true,
    createdAt: true,
    averageRating: true,
    reviewedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
    id: true,
    createdAt: true,
});

export const insertNutritionSchema = createInsertSchema(nutrition).omit({
    id: true,
    status: true,
    createdAt: true,
});

export const insertSavedStoreSchema = createInsertSchema(savedStores).omit({
    id: true,
    createdAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export const insertPostLikeSchema = createInsertSchema(postLikes).omit({
    id: true,
    createdAt: true,
});

export const insertCitySchema = createInsertSchema(cities).omit({
    id: true,
    createdAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    reviewedAt: true,
    reviewedBy: true,
});

export const insertEmailLogSchema = createInsertSchema(emailLogs).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export const insertGuideSchema = createInsertSchema(guides).omit({
    id: true,
    createdAt: true,
});

export const insertGuidePurchaseSchema = createInsertSchema(guidePurchases).omit({
    id: true,
    purchasedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});


// Types
export type InsertCity = z.infer<typeof insertCitySchema>;
export type City = typeof cities.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPlace = z.infer<typeof insertPlaceSchema>;
export type Place = typeof places.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type InsertNutrition = z.infer<typeof insertNutritionSchema>;
export type Nutrition = typeof nutrition.$inferSelect;

export type InsertSavedStore = z.infer<typeof insertSavedStoreSchema>;
export type SavedStore = typeof savedStores.$inferSelect;

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

export type InsertPostLike = z.infer<typeof insertPostLikeSchema>;
export type PostLike = typeof postLikes.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertEmailLog = z.infer<typeof insertEmailLogSchema>;
export type EmailLog = typeof emailLogs.$inferSelect;

export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;

export type InsertGuide = z.infer<typeof insertGuideSchema>;
export type Guide = typeof guides.$inferSelect;

export type InsertGuidePurchase = z.infer<typeof insertGuidePurchaseSchema>;
export type GuidePurchase = typeof guidePurchases.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

