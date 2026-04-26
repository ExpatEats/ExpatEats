import type { Express } from "express";
import { eq, and } from "drizzle-orm";
import { guides, guidePurchases } from "@shared/schema";
import { requireAuth } from "../middleware/auth";
import { AuthenticatedRequest } from "../types/session";
import { storage } from "../storage";
import { generateSignedUrl, verifySignedUrl } from "../utils/signedUrl";
import { RateLimitService } from "../services/rateLimitService";
import { CsrfService } from "../services/csrfService";
import { StripeService } from "../services/stripeService";
import { AuthService } from "../services/authService";
import type Stripe from "stripe";
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
     * GET /api/guides/available
     * Get all available guides for purchase with user's purchase status
     * Shows all guides and indicates which ones the user has purchased
     */
    app.get("/api/guides/available", async (req, res) => {
        try {
            const userId = req.session?.userId;

            // Get all guides
            const allGuides = await storage.getAllGuides();

            // If user is logged in, get their purchases
            let purchasedGuideIds: number[] = [];
            if (userId) {
                const userGuides = await storage.getUserGuides(userId);
                purchasedGuideIds = userGuides.map(g => g.id);
            }

            // Map guides with purchase status
            const guidesWithStatus = allGuides.map(guide => ({
                id: guide.id,
                slug: guide.slug,
                name: guide.slug
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' '),
                description: `ExpatEats Digital Guide - ${guide.slug}`,
                price: parseFloat(process.env.STRIPE_GUIDE_PRICE || "2500") / 100, // Convert cents to euros
                currency: "EUR",
                isPurchased: purchasedGuideIds.includes(guide.id),
                previewImage: `/api/guides/${guide.slug}/preview`, // Preview endpoint we'll create
                createdAt: guide.createdAt,
            }));

            res.json({
                guides: guidesWithStatus,
                isAuthenticated: !!userId,
            });
        } catch (error) {
            console.error("Error fetching available guides:", error);
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
     * GET /api/guides/:slug/preview
     * Serve preview image for a guide (first page)
     * Public endpoint - no authentication required
     */
    app.get("/api/guides/:slug/preview", async (req, res) => {
        try {
            const { slug } = req.params;

            // Get guide by slug
            const guide = await storage.getGuideBySlug(slug);

            if (!guide) {
                return res.status(404).json({ message: "Guide not found" });
            }

            // Look for preview image in /guides/previews/
            // Try SVG first, then JPG
            let previewPath = path.join(process.cwd(), 'guides', 'previews', `${slug}.svg`);
            let contentType = 'image/svg+xml';

            if (!fs.existsSync(previewPath)) {
                previewPath = path.join(process.cwd(), 'guides', 'previews', `${slug}.jpg`);
                contentType = 'image/jpeg';
            }

            // Check if preview exists
            if (!fs.existsSync(previewPath)) {
                // Return a placeholder if preview doesn't exist
                return res.status(404).json({ message: "Preview not available" });
            }

            // Serve the preview image
            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day

            const imageStream = fs.createReadStream(previewPath);
            imageStream.pipe(res);

            imageStream.on('error', (error) => {
                console.error('Error streaming preview:', error);
                if (!res.headersSent) {
                    res.status(500).json({ message: 'Failed to stream preview' });
                }
            });

        } catch (error) {
            console.error("Error serving guide preview:", error);
            if (!res.headersSent) {
                res.status(500).json({ message: "Failed to serve preview" });
            }
        }
    });

    /**
     * POST /api/guides/:id/purchase
     * Create Stripe Checkout session for guide purchase
     */
    app.post(
        "/api/guides/:id/purchase",
        requireAuth,
        RateLimitService.generalLimiter,
        CsrfService.middleware(),
        async (req: AuthenticatedRequest, res) => {
            try {
                const guideId = parseInt(req.params.id);
                const userId = req.session.userId!;

                if (isNaN(guideId)) {
                    return res.status(400).json({ message: "Invalid guide ID" });
                }

                // Check if Stripe is configured
                if (!StripeService.isConfigured()) {
                    return res.status(503).json({
                        message: "Payment system is currently unavailable. Please try again later."
                    });
                }

                // Get guide details
                const guide = await storage.getGuideById(guideId);
                if (!guide) {
                    return res.status(404).json({ message: "Guide not found" });
                }

                // Get user details
                const user = await AuthService.getUserById(userId);
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }

                // Check if already purchased (completed purchases only)
                const existingPurchase = await storage.getUserGuidePurchase(userId, guideId);
                if (existingPurchase && existingPurchase.purchaseStatus === 'completed') {
                    return res.status(409).json({
                        message: "You have already purchased this guide",
                        alreadyPurchased: true
                    });
                }

                // Create Stripe Checkout session
                const result = await StripeService.createCheckoutSession({
                    userId,
                    guideId,
                    userEmail: user.email,
                    guideName: `ExpatEats Guide - ${guide.slug}`,
                });

                if ('error' in result) {
                    return res.status(500).json({
                        message: result.error
                    });
                }

                res.status(200).json({
                    sessionId: result.sessionId,
                    checkoutUrl: result.url,
                    message: "Checkout session created successfully"
                });
            } catch (error) {
                console.error("Error creating checkout session:", error);
                res.status(500).json({ message: "Failed to initiate purchase" });
            }
        }
    );

    /**
     * POST /api/webhooks/stripe
     * Handle Stripe webhook events
     *
     * IMPORTANT: This endpoint must use raw body, not JSON parsed body
     * Configure in server/index.ts to skip JSON parsing for this route
     */
    app.post(
        "/api/webhooks/stripe",
        async (req, res) => {
            try {
                const signature = req.headers['stripe-signature'] as string;

                if (!signature) {
                    console.error("❌ Missing Stripe signature header");
                    return res.status(400).json({ error: "Missing signature" });
                }

                // Verify webhook signature
                const event = StripeService.verifyWebhookSignature(
                    req.body,
                    signature
                );

                if (!event) {
                    console.error("❌ Invalid webhook signature");
                    return res.status(401).json({ error: "Invalid signature" });
                }

                console.log(`📥 Webhook received: ${event.type}`);

                // Handle different event types
                switch (event.type) {
                    case 'payment_intent.succeeded':
                        const paymentIntent = event.data.object as Stripe.PaymentIntent;
                        await StripeService.handlePaymentSuccess(paymentIntent);
                        break;

                    case 'payment_intent.payment_failed':
                        const failedPayment = event.data.object as Stripe.PaymentIntent;
                        await StripeService.handlePaymentFailure(failedPayment);
                        break;

                    case 'checkout.session.completed':
                        const session = event.data.object as Stripe.Checkout.Session;
                        console.log(`✅ Checkout completed: ${session.id}`);
                        // Payment intent will handle the actual purchase creation
                        break;

                    case 'checkout.session.expired':
                        const expiredSession = event.data.object as Stripe.Checkout.Session;
                        console.log(`⏰ Checkout expired: ${expiredSession.id}`);
                        break;

                    default:
                        console.log(`ℹ️  Unhandled event type: ${event.type}`);
                }

                // Return 200 to acknowledge receipt
                res.json({ received: true });
            } catch (error) {
                console.error("❌ Webhook processing error:", error);
                res.status(500).json({ error: "Webhook processing failed" });
            }
        }
    );

    /**
     * GET /api/guides/purchase-status/:sessionId
     * Get purchase status after checkout
     */
    app.get(
        "/api/guides/purchase-status/:sessionId",
        requireAuth,
        async (req: AuthenticatedRequest, res) => {
            try {
                const { sessionId } = req.params;
                const userId = req.session.userId!;

                // Retrieve checkout session from Stripe
                const session = await StripeService.retrieveCheckoutSession(sessionId);

                if (!session) {
                    return res.status(404).json({ message: "Session not found" });
                }

                // Verify session belongs to this user
                const sessionUserId = parseInt(session.metadata?.userId || "0");
                if (sessionUserId !== userId) {
                    return res.status(403).json({ message: "Unauthorized" });
                }

                // Get payment details
                const payment = await storage.getPaymentByStripeIntentId(
                    session.payment_intent as string
                );

                res.json({
                    status: session.payment_status,
                    paymentStatus: payment?.status || 'pending',
                    guideSlug: session.metadata?.guideSlug,
                    amountTotal: session.amount_total ? session.amount_total / 100 : 0,
                    currency: session.currency,
                });
            } catch (error) {
                console.error("Error fetching purchase status:", error);
                res.status(500).json({ message: "Failed to fetch purchase status" });
            }
        }
    );
}
