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
    username: text("username").notNull().unique(),
    password: text("password").notNull(),
    email: text("email").notNull().unique(),
    name: text("name"),
    city: text("city"),
    country: text("country"),
    bio: text("bio"),
    role: text("role").default("user"),
    emailVerified: boolean("email_verified").default(false),
    emailVerificationToken: text("email_verification_token"),
    passwordResetToken: text("password_reset_token"),
    passwordResetExpires: timestamp("password_reset_expires"),
    failedLoginAttempts: integer("failed_login_attempts").default(0),
    accountLockedUntil: timestamp("account_locked_until"),
    lastLoginAt: timestamp("last_login_at"),
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

    // Boolean Filters
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

    userId: integer("user_id").references(() => users.id),
    imageUrl: text("image_url"),
    averageRating: integer("average_rating"),
    status: text("status").default("pending"), // 'pending', 'approved', 'rejected'
    submittedBy: text("submitted_by"), // Name/email of submitter for non-authenticated users
    adminNotes: text("admin_notes"),
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

