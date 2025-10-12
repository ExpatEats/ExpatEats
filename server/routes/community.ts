import { Express } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { CsrfService } from "../services/csrfService";
import { RateLimitService } from "../services/rateLimitService";
import { AuthenticatedRequest } from "../types/session";
import { db } from "../db";
import { posts, comments, postLikes, users } from "@shared/schema";
import { eq, desc, asc, and, sql, count } from "drizzle-orm";

// Validation schemas
const createPostSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title too long"),
    body: z.string().min(1, "Body is required").max(5000, "Body too long"),
    section: z.enum(["general", "where-to-find", "product-swaps"], {
        errorMap: () => ({ message: "Invalid section" })
    })
});

const createCommentSchema = z.object({
    body: z.string().min(1, "Comment cannot be empty").max(1000, "Comment too long")
});

const paginationSchema = z.object({
    limit: z.coerce.number().min(1).max(50).default(20),
    offset: z.coerce.number().min(0).default(0),
    section: z.enum(["general", "where-to-find", "product-swaps"]).optional()
});

// Types for API responses
interface PostWithUserAndLikes {
    id: number;
    title: string;
    body: string;
    userId: number;
    username: string;
    section: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    likesCount: number;
    commentsCount: number;
    isLikedByUser: boolean;
}

interface CommentWithUser {
    id: number;
    postId: number;
    userId: number;
    username: string;
    body: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export function registerCommunityRoutes(app: Express) {
    // Get posts with pagination, user info, like counts, and current user's like status
    app.get("/api/community/posts", async (req, res) => {
        try {
            const { limit, offset, section } = paginationSchema.parse(req.query);
            const userId = req.session?.userId; // Optional auth for like status

            // Build base query
            let query = db
                .select({
                    id: posts.id,
                    title: posts.title,
                    body: posts.body,
                    userId: posts.userId,
                    username: users.username,
                    section: posts.section,
                    status: posts.status,
                    createdAt: posts.createdAt,
                    updatedAt: posts.updatedAt,
                    likesCount: sql<number>`COALESCE(likes_count.count, 0)`,
                    commentsCount: sql<number>`COALESCE(comments_count.count, 0)`,
                    isLikedByUser: userId ?
                        sql<boolean>`CASE WHEN user_likes.post_id IS NOT NULL THEN true ELSE false END` :
                        sql<boolean>`false`
                })
                .from(posts)
                .innerJoin(users, eq(posts.userId, users.id))
                .leftJoin(
                    sql`(SELECT post_id, COUNT(*) as count FROM post_likes GROUP BY post_id) as likes_count`,
                    sql`likes_count.post_id = ${posts.id}`
                )
                .leftJoin(
                    sql`(SELECT post_id, COUNT(*) as count FROM comments WHERE status = 'active' GROUP BY post_id) as comments_count`,
                    sql`comments_count.post_id = ${posts.id}`
                );

            // Add user's like status if authenticated
            if (userId) {
                query = query.leftJoin(
                    sql`(SELECT post_id FROM post_likes WHERE user_id = ${userId}) as user_likes`,
                    sql`user_likes.post_id = ${posts.id}`
                );
            }

            // Add filters
            const conditions = [eq(posts.status, "active")];
            if (section) {
                conditions.push(eq(posts.section, section));
            }

            const postsData = await query
                .where(and(...conditions))
                .orderBy(desc(posts.createdAt))
                .limit(limit)
                .offset(offset);

            // Get total count for pagination
            let countQuery = db
                .select({ count: count() })
                .from(posts)
                .where(and(...conditions));

            const [{ count: totalCount }] = await countQuery;

            res.json({
                posts: postsData,
                pagination: {
                    limit,
                    offset,
                    total: totalCount,
                    hasMore: offset + limit < totalCount
                }
            });
        } catch (error) {
            console.error("Get posts error:", error);
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    message: "Invalid query parameters",
                    errors: error.errors
                });
            } else {
                res.status(500).json({ message: "Failed to fetch posts" });
            }
        }
    });

    // Get single post with all comments
    app.get("/api/community/posts/:id", async (req, res) => {
        try {
            const postId = parseInt(req.params.id);
            const userId = req.session?.userId;

            if (!postId || isNaN(postId)) {
                return res.status(400).json({ message: "Invalid post ID" });
            }

            // Get post with user info and like status
            const [postData] = await db
                .select({
                    id: posts.id,
                    title: posts.title,
                    body: posts.body,
                    userId: posts.userId,
                    username: users.username,
                    section: posts.section,
                    status: posts.status,
                    createdAt: posts.createdAt,
                    updatedAt: posts.updatedAt,
                    likesCount: sql<number>`COALESCE(likes_count.count, 0)`,
                    isLikedByUser: userId ?
                        sql<boolean>`CASE WHEN user_likes.post_id IS NOT NULL THEN true ELSE false END` :
                        sql<boolean>`false`
                })
                .from(posts)
                .innerJoin(users, eq(posts.userId, users.id))
                .leftJoin(
                    sql`(SELECT post_id, COUNT(*) as count FROM post_likes WHERE post_id = ${postId} GROUP BY post_id) as likes_count`,
                    sql`likes_count.post_id = ${posts.id}`
                )
                .leftJoin(
                    userId ? sql`(SELECT post_id FROM post_likes WHERE user_id = ${userId} AND post_id = ${postId}) as user_likes` : sql`(SELECT NULL as post_id) as user_likes`,
                    sql`user_likes.post_id = ${posts.id}`
                )
                .where(and(eq(posts.id, postId), eq(posts.status, "active")));

            if (!postData) {
                return res.status(404).json({ message: "Post not found" });
            }

            // Get all comments for this post
            const commentsData = await db
                .select({
                    id: comments.id,
                    postId: comments.postId,
                    userId: comments.userId,
                    username: users.username,
                    body: comments.body,
                    status: comments.status,
                    createdAt: comments.createdAt,
                    updatedAt: comments.updatedAt
                })
                .from(comments)
                .innerJoin(users, eq(comments.userId, users.id))
                .where(and(eq(comments.postId, postId), eq(comments.status, "active")))
                .orderBy(asc(comments.createdAt)); // Oldest comments first

            res.json({
                post: postData,
                comments: commentsData
            });
        } catch (error) {
            console.error("Get post error:", error);
            res.status(500).json({ message: "Failed to fetch post" });
        }
    });

    // Create new post (auth required)
    app.post("/api/community/posts", requireAuth, CsrfService.middleware(), RateLimitService.generalLimiter, async (req: AuthenticatedRequest, res) => {
        try {
            const postData = createPostSchema.parse(req.body);
            const userId = req.session.userId!;

            const [newPost] = await db
                .insert(posts)
                .values({
                    title: postData.title,
                    body: postData.body,
                    userId: userId,
                    section: postData.section,
                    status: "active"
                })
                .returning();

            // Get the post with user info for response
            const [postWithUser] = await db
                .select({
                    id: posts.id,
                    title: posts.title,
                    body: posts.body,
                    userId: posts.userId,
                    username: users.username,
                    section: posts.section,
                    status: posts.status,
                    createdAt: posts.createdAt,
                    updatedAt: posts.updatedAt,
                    likesCount: sql<number>`0`,
                    commentsCount: sql<number>`0`,
                    isLikedByUser: sql<boolean>`false`
                })
                .from(posts)
                .innerJoin(users, eq(posts.userId, users.id))
                .where(eq(posts.id, newPost.id));

            res.status(201).json(postWithUser);
        } catch (error) {
            console.error("Create post error:", error);
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    message: "Invalid post data",
                    errors: error.errors
                });
            } else {
                res.status(500).json({ message: "Failed to create post" });
            }
        }
    });

    // Update post (auth required, owner only)
    app.put("/api/community/posts/:id", requireAuth, CsrfService.middleware(), async (req: AuthenticatedRequest, res) => {
        try {
            const postId = parseInt(req.params.id);
            const userId = req.session.userId!;
            const updateData = createPostSchema.parse(req.body);

            if (!postId || isNaN(postId)) {
                return res.status(400).json({ message: "Invalid post ID" });
            }

            // Check if post exists and user owns it
            const [existingPost] = await db
                .select({ userId: posts.userId })
                .from(posts)
                .where(and(eq(posts.id, postId), eq(posts.status, "active")));

            if (!existingPost) {
                return res.status(404).json({ message: "Post not found" });
            }

            if (existingPost.userId !== userId) {
                return res.status(403).json({ message: "Not authorized to edit this post" });
            }

            // Update post
            await db
                .update(posts)
                .set({
                    title: updateData.title,
                    body: updateData.body,
                    section: updateData.section,
                    updatedAt: new Date()
                })
                .where(eq(posts.id, postId));

            res.json({ message: "Post updated successfully" });
        } catch (error) {
            console.error("Update post error:", error);
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    message: "Invalid post data",
                    errors: error.errors
                });
            } else {
                res.status(500).json({ message: "Failed to update post" });
            }
        }
    });

    // Delete post (auth required, owner or admin)
    app.delete("/api/community/posts/:id", requireAuth, CsrfService.middleware(), async (req: AuthenticatedRequest, res) => {
        try {
            const postId = parseInt(req.params.id);
            const userId = req.session.userId!;
            const isAdmin = req.session.isAdmin || false;

            if (!postId || isNaN(postId)) {
                return res.status(400).json({ message: "Invalid post ID" });
            }

            // Check if post exists and user owns it or is admin
            const [existingPost] = await db
                .select({ userId: posts.userId })
                .from(posts)
                .where(and(eq(posts.id, postId), eq(posts.status, "active")));

            if (!existingPost) {
                return res.status(404).json({ message: "Post not found" });
            }

            // Allow deletion if user owns the post OR is an admin
            if (existingPost.userId !== userId && !isAdmin) {
                return res.status(403).json({ message: "Not authorized to delete this post" });
            }

            // Soft delete the post and all associated data
            await db.transaction(async (tx) => {
                // First, delete all likes associated with this post
                await tx
                    .delete(postLikes)
                    .where(eq(postLikes.postId, postId));

                // Then, soft delete all comments associated with this post
                await tx
                    .update(comments)
                    .set({ status: "deleted" })
                    .where(eq(comments.postId, postId));

                // Finally, soft delete the post itself
                await tx
                    .update(posts)
                    .set({ status: "deleted" })
                    .where(eq(posts.id, postId));
            });

            res.json({ message: "Post and all associated comments deleted successfully" });
        } catch (error) {
            console.error("Delete post error:", error);
            res.status(500).json({ message: "Failed to delete post" });
        }
    });

    // Add comment to post (auth required)
    app.post("/api/community/posts/:postId/comments", requireAuth, CsrfService.middleware(), RateLimitService.generalLimiter, async (req: AuthenticatedRequest, res) => {
        try {
            const postId = parseInt(req.params.postId);
            const userId = req.session.userId!;
            const commentData = createCommentSchema.parse(req.body);

            if (!postId || isNaN(postId)) {
                return res.status(400).json({ message: "Invalid post ID" });
            }

            // Check if post exists and is active
            const [existingPost] = await db
                .select({ id: posts.id })
                .from(posts)
                .where(and(eq(posts.id, postId), eq(posts.status, "active")));

            if (!existingPost) {
                return res.status(404).json({ message: "Post not found" });
            }

            // Create comment
            const [newComment] = await db
                .insert(comments)
                .values({
                    postId: postId,
                    userId: userId,
                    body: commentData.body,
                    status: "active"
                })
                .returning();

            // Get comment with user info for response
            const [commentWithUser] = await db
                .select({
                    id: comments.id,
                    postId: comments.postId,
                    userId: comments.userId,
                    username: users.username,
                    body: comments.body,
                    status: comments.status,
                    createdAt: comments.createdAt,
                    updatedAt: comments.updatedAt
                })
                .from(comments)
                .innerJoin(users, eq(comments.userId, users.id))
                .where(eq(comments.id, newComment.id));

            res.status(201).json(commentWithUser);
        } catch (error) {
            console.error("Create comment error:", error);
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    message: "Invalid comment data",
                    errors: error.errors
                });
            } else {
                res.status(500).json({ message: "Failed to create comment" });
            }
        }
    });

    // Update comment (auth required, owner only)
    app.put("/api/community/comments/:id", requireAuth, CsrfService.middleware(), async (req: AuthenticatedRequest, res) => {
        try {
            const commentId = parseInt(req.params.id);
            const userId = req.session.userId!;
            const updateData = createCommentSchema.parse(req.body);

            if (!commentId || isNaN(commentId)) {
                return res.status(400).json({ message: "Invalid comment ID" });
            }

            // Check if comment exists and user owns it
            const [existingComment] = await db
                .select({ userId: comments.userId })
                .from(comments)
                .where(and(eq(comments.id, commentId), eq(comments.status, "active")));

            if (!existingComment) {
                return res.status(404).json({ message: "Comment not found" });
            }

            if (existingComment.userId !== userId) {
                return res.status(403).json({ message: "Not authorized to edit this comment" });
            }

            // Update comment
            await db
                .update(comments)
                .set({
                    body: updateData.body,
                    updatedAt: new Date()
                })
                .where(eq(comments.id, commentId));

            res.json({ message: "Comment updated successfully" });
        } catch (error) {
            console.error("Update comment error:", error);
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    message: "Invalid comment data",
                    errors: error.errors
                });
            } else {
                res.status(500).json({ message: "Failed to update comment" });
            }
        }
    });

    // Delete comment (auth required, owner or admin)
    app.delete("/api/community/comments/:id", requireAuth, CsrfService.middleware(), async (req: AuthenticatedRequest, res) => {
        try {
            const commentId = parseInt(req.params.id);
            const userId = req.session.userId!;
            const isAdmin = req.session.isAdmin || false;

            if (!commentId || isNaN(commentId)) {
                return res.status(400).json({ message: "Invalid comment ID" });
            }

            // Check if comment exists and user owns it or is admin
            const [existingComment] = await db
                .select({ userId: comments.userId })
                .from(comments)
                .where(and(eq(comments.id, commentId), eq(comments.status, "active")));

            if (!existingComment) {
                return res.status(404).json({ message: "Comment not found" });
            }

            // Allow deletion if user owns the comment OR is an admin
            if (existingComment.userId !== userId && !isAdmin) {
                return res.status(403).json({ message: "Not authorized to delete this comment" });
            }

            // Soft delete by updating status
            await db
                .update(comments)
                .set({ status: "deleted" })
                .where(eq(comments.id, commentId));

            res.json({ message: "Comment deleted successfully" });
        } catch (error) {
            console.error("Delete comment error:", error);
            res.status(500).json({ message: "Failed to delete comment" });
        }
    });

    // Toggle like on post (auth required)
    app.post("/api/community/posts/:postId/like", requireAuth, CsrfService.middleware(), async (req: AuthenticatedRequest, res) => {
        try {
            const postId = parseInt(req.params.postId);
            const userId = req.session.userId!;

            if (!postId || isNaN(postId)) {
                return res.status(400).json({ message: "Invalid post ID" });
            }

            // Check if post exists and is active
            const [existingPost] = await db
                .select({ id: posts.id })
                .from(posts)
                .where(and(eq(posts.id, postId), eq(posts.status, "active")));

            if (!existingPost) {
                return res.status(404).json({ message: "Post not found" });
            }

            // Check if user already liked this post
            const [existingLike] = await db
                .select({ id: postLikes.id })
                .from(postLikes)
                .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));

            let isLiked: boolean;
            if (existingLike) {
                // Unlike the post
                await db
                    .delete(postLikes)
                    .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
                isLiked = false;
            } else {
                // Like the post
                await db
                    .insert(postLikes)
                    .values({
                        postId: postId,
                        userId: userId
                    });
                isLiked = true;
            }

            // Get updated like count
            const [{ count: likesCount }] = await db
                .select({ count: count() })
                .from(postLikes)
                .where(eq(postLikes.postId, postId));

            res.json({
                isLiked,
                likesCount,
                message: isLiked ? "Post liked" : "Post unliked"
            });
        } catch (error) {
            console.error("Toggle like error:", error);
            res.status(500).json({ message: "Failed to toggle like" });
        }
    });

    // Get like status and count for a post
    app.get("/api/community/posts/:postId/likes", async (req, res) => {
        try {
            const postId = parseInt(req.params.postId);
            const userId = req.session?.userId;

            if (!postId || isNaN(postId)) {
                return res.status(400).json({ message: "Invalid post ID" });
            }

            // Get like count
            const [{ count: likesCount }] = await db
                .select({ count: count() })
                .from(postLikes)
                .where(eq(postLikes.postId, postId));

            // Check if current user liked the post (if authenticated)
            let isLikedByUser = false;
            if (userId) {
                const [existingLike] = await db
                    .select({ id: postLikes.id })
                    .from(postLikes)
                    .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
                isLikedByUser = !!existingLike;
            }

            res.json({
                postId,
                likesCount,
                isLikedByUser
            });
        } catch (error) {
            console.error("Get likes error:", error);
            res.status(500).json({ message: "Failed to get like status" });
        }
    });
}