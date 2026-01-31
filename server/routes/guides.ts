import type { Express } from "express";
import { eq, and } from "drizzle-orm";
import { guides, guidePurchases } from "@shared/schema";
import { requireAuth } from "../middleware/auth";
import { AuthenticatedRequest } from "../types/session";
import { storage } from "../storage";
import { generateSignedUrl, verifySignedUrl } from "../utils/signedUrl";
import { RateLimitService } from "../services/rateLimitService";
import fs from "fs";
import path from "path";

export function registerGuidesRoutes(app: Express) {
    /**
     * GET /api/user/guides
     * Get all guides accessible to the current user
     * - Returns purchased guides for regular users
     * - Returns ALL guides for admin users
     */
    app.get("/api/user/guides", requireAuth, async (req: AuthenticatedRequest, res) => {
        try {
            const userId = req.session.userId!;
            const isAdmin = req.session.role === "admin" || req.session.role === "superadmin";

            // Get user's purchased guides
            const userGuides = await storage.getUserGuides(userId);

            // If admin, get all guides
            if (isAdmin) {
                const allGuides = await storage.getAllGuides();
                return res.json({
                    guides: allGuides,
                    isAdmin: true,
                    message: "Admin view - showing all guides"
                });
            }

            res.json({
                guides: userGuides,
                isAdmin: false
            });
        } catch (error) {
            console.error("Error fetching user guides:", error);
            res.status(500).json({ message: "Failed to fetch guides" });
        }
    });

    /**
     * GET /api/guides/:slug/access
     * Check if user has access to a specific guide
     * Returns access status and signed URL if accessible
     */
    app.get("/api/guides/:slug/access", requireAuth, async (req: AuthenticatedRequest, res) => {
        try {
            const { slug } = req.params;
            const userId = req.session.userId!;
            const isAdmin = req.session.role === "admin" || req.session.role === "superadmin";

            // Get guide by slug
            const guide = await storage.getGuideBySlug(slug);

            if (!guide) {
                return res.status(404).json({ message: "Guide not found" });
            }

            // Check if user has purchased the guide (admins bypass this check)
            let hasAccess = isAdmin;

            if (!isAdmin) {
                const purchase = await storage.getUserGuidePurchase(userId, guide.id);
                hasAccess = !!purchase;
            }

            if (!hasAccess) {
                return res.status(403).json({
                    message: "You don't have access to this guide",
                    hasAccess: false
                });
            }

            // Generate signed URL for PDF access
            const signedUrl = generateSignedUrl({
                guideId: guide.id,
                userId: userId,
                expiresIn: 900 // 15 minutes
            });

            res.json({
                hasAccess: true,
                guide: {
                    id: guide.id,
                    slug: guide.slug
                },
                viewUrl: `/api/guides/${slug}/view?token=${encodeURIComponent(signedUrl.token)}&signature=${signedUrl.signature}&expires=${signedUrl.expires}`,
                expiresAt: new Date(signedUrl.expires * 1000).toISOString()
            });
        } catch (error) {
            console.error("Error checking guide access:", error);
            res.status(500).json({ message: "Failed to check guide access" });
        }
    });

    /**
     * GET /api/guides/:slug/view
     * Serve the PDF file with authentication and authorization
     * Requires valid signed URL token
     */
    app.get("/api/guides/:slug/view", RateLimitService.pdfViewLimiter, requireAuth, async (req: AuthenticatedRequest, res) => {
        try {
            const { slug } = req.params;
            const { token, signature, expires } = req.query;

            if (!token || !signature) {
                return res.status(400).json({ message: "Missing token or signature" });
            }

            // Verify signed URL
            const verification = verifySignedUrl(token as string, signature as string);

            if (!verification.valid) {
                return res.status(403).json({
                    message: verification.error || "Invalid or expired token"
                });
            }

            const userId = req.session.userId!;
            const isAdmin = req.session.role === "admin" || req.session.role === "superadmin";

            // Verify the token's userId matches the session userId
            if (verification.userId !== userId) {
                return res.status(403).json({ message: "Token user mismatch" });
            }

            // Get guide by slug
            const guide = await storage.getGuideBySlug(slug);

            if (!guide) {
                return res.status(404).json({ message: "Guide not found" });
            }

            // Verify guide ID matches token
            if (verification.guideId !== guide.id) {
                return res.status(403).json({ message: "Token guide mismatch" });
            }

            // Check if user has purchased the guide (admins bypass this check)
            if (!isAdmin) {
                const purchase = await storage.getUserGuidePurchase(userId, guide.id);
                if (!purchase) {
                    return res.status(403).json({ message: "You don't have access to this guide" });
                }
            }

            // Serve the PDF file
            const pdfPath = path.join(process.cwd(), guide.url);

            // Check if file exists
            if (!fs.existsSync(pdfPath)) {
                console.error(`PDF file not found: ${pdfPath}`);
                return res.status(404).json({ message: "Guide file not found" });
            }

            // Get file stats for Content-Length
            const stats = fs.statSync(pdfPath);

            // Set headers for PDF streaming
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Length', stats.size.toString());
            res.setHeader('Content-Disposition', 'inline; filename="' + slug + '.pdf"');
            res.setHeader('Accept-Ranges', 'bytes');

            // CORS headers for blob fetch
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

            // Prevent caching
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');

            // Stream the PDF file
            const fileStream = fs.createReadStream(pdfPath);
            fileStream.pipe(res);

            fileStream.on('error', (error) => {
                console.error('Error streaming PDF:', error);
                if (!res.headersSent) {
                    res.status(500).json({ message: 'Failed to stream PDF' });
                }
            });

        } catch (error) {
            console.error("Error serving guide:", error);
            if (!res.headersSent) {
                res.status(500).json({ message: "Failed to serve guide" });
            }
        }
    });

    /**
     * POST /api/guides/:id/purchase
     * Purchase a guide (placeholder for future payment integration)
     */
    app.post("/api/guides/:id/purchase", requireAuth, async (req: AuthenticatedRequest, res) => {
        try {
            const guideId = parseInt(req.params.id);
            const userId = req.session.userId!;
            const { paymentProvider = 'manual' } = req.body;

            if (isNaN(guideId)) {
                return res.status(400).json({ message: "Invalid guide ID" });
            }

            // Check if guide exists
            const guide = await storage.getGuideById(guideId);
            if (!guide) {
                return res.status(404).json({ message: "Guide not found" });
            }

            // Check if already purchased
            const existingPurchase = await storage.getUserGuidePurchase(userId, guideId);
            if (existingPurchase) {
                return res.status(409).json({ message: "Guide already purchased" });
            }

            // Create purchase record
            const purchase = await storage.createGuidePurchase({
                userId,
                guideId,
                paymentProvider
            });

            res.status(201).json({
                message: "Guide purchased successfully",
                purchase
            });
        } catch (error) {
            console.error("Error purchasing guide:", error);
            res.status(500).json({ message: "Failed to purchase guide" });
        }
    });
}
