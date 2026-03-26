import Stripe from "stripe";
import { db } from "../db";
import { payments, guides, guidePurchases, users } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { EmailService } from "./emailService";

// Initialize Stripe
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5000";
const GUIDE_PRICE = parseInt(process.env.STRIPE_GUIDE_PRICE || "2500"); // €25.00 in cents

let stripe: Stripe | null = null;

if (STRIPE_SECRET_KEY) {
    stripe = new Stripe(STRIPE_SECRET_KEY, {
        apiVersion: "2024-12-18.acacia",
        typescript: true,
    });
    console.log("✅ Stripe initialized successfully");
} else {
    console.warn("⚠️  STRIPE_SECRET_KEY not set - Stripe functionality will be disabled");
}

export class StripeService {
    /**
     * Check if Stripe is properly configured
     */
    static isConfigured(): boolean {
        return !!stripe && !!STRIPE_WEBHOOK_SECRET;
    }

    /**
     * Create a Stripe Checkout session for guide purchase
     */
    static async createCheckoutSession(params: {
        userId: number;
        guideId: number;
        userEmail: string;
        guideName: string;
    }): Promise<{ sessionId: string; url: string } | { error: string }> {
        try {
            if (!stripe) {
                return { error: "Stripe is not configured" };
            }

            const { userId, guideId, userEmail, guideName } = params;

            // Check if guide exists
            const [guide] = await db
                .select()
                .from(guides)
                .where(eq(guides.id, guideId))
                .limit(1);

            if (!guide) {
                return { error: "Guide not found" };
            }

            // Check if user already purchased this guide
            const [existingPurchase] = await db
                .select()
                .from(guidePurchases)
                .where(
                    and(
                        eq(guidePurchases.userId, userId),
                        eq(guidePurchases.guideId, guideId),
                        eq(guidePurchases.purchaseStatus, "completed")
                    )
                )
                .limit(1);

            if (existingPurchase) {
                return { error: "Guide already purchased" };
            }

            // Create Stripe Checkout Session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [
                    {
                        price_data: {
                            currency: "eur",
                            product_data: {
                                name: guideName,
                                description: `ExpatEats Digital Guide - ${guideName}`,
                            },
                            unit_amount: GUIDE_PRICE,
                        },
                        quantity: 1,
                    },
                ],
                mode: "payment",
                customer_email: userEmail,
                metadata: {
                    userId: userId.toString(),
                    guideId: guideId.toString(),
                    guideSlug: guide.slug,
                },
                success_url: `${FRONTEND_URL}/guides/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${FRONTEND_URL}/guides/${guide.slug}?purchase=cancelled`,
                payment_intent_data: {
                    metadata: {
                        userId: userId.toString(),
                        guideId: guideId.toString(),
                        guideSlug: guide.slug,
                    },
                },
            });

            console.log(`✅ Stripe Checkout session created: ${session.id}`);

            // Create pending payment record
            await db.insert(payments).values({
                stripePaymentIntentId: session.payment_intent as string,
                stripeCheckoutSessionId: session.id,
                userId,
                guideId,
                amount: GUIDE_PRICE,
                currency: "eur",
                status: "pending",
                receiptEmail: userEmail,
            });

            return {
                sessionId: session.id,
                url: session.url as string,
            };
        } catch (error: any) {
            console.error("❌ Stripe Checkout session creation failed:", error);
            return { error: error.message || "Failed to create checkout session" };
        }
    }

    /**
     * Verify Stripe webhook signature
     */
    static verifyWebhookSignature(
        payload: string | Buffer,
        signature: string
    ): Stripe.Event | null {
        try {
            if (!stripe || !STRIPE_WEBHOOK_SECRET) {
                throw new Error("Stripe webhook secret not configured");
            }

            const event = stripe.webhooks.constructEvent(
                payload,
                signature,
                STRIPE_WEBHOOK_SECRET
            );

            console.log(`✅ Webhook signature verified: ${event.type}`);
            return event;
        } catch (error: any) {
            console.error("❌ Webhook signature verification failed:", error.message);
            return null;
        }
    }

    /**
     * Handle successful payment (called from webhook)
     */
    static async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
        try {
            const userId = parseInt(paymentIntent.metadata.userId);
            const guideId = parseInt(paymentIntent.metadata.guideId);

            console.log(`💰 Processing successful payment for User ${userId}, Guide ${guideId}`);

            // Use transaction to ensure atomic operations
            await db.transaction(async (tx) => {
                // Check if purchase already exists (idempotency)
                const [existingPurchase] = await tx
                    .select()
                    .from(guidePurchases)
                    .where(eq(guidePurchases.stripePaymentIntentId, paymentIntent.id))
                    .limit(1);

                if (existingPurchase) {
                    console.log(`⚠️  Purchase already exists for payment intent: ${paymentIntent.id}`);
                    return;
                }

                // Create guide purchase record
                const [purchase] = await tx
                    .insert(guidePurchases)
                    .values({
                        userId,
                        guideId,
                        paymentProvider: "stripe",
                        stripePaymentIntentId: paymentIntent.id,
                        purchaseStatus: "completed",
                    })
                    .returning();

                // Update payment record
                await tx
                    .update(payments)
                    .set({
                        status: "succeeded",
                        succeededAt: new Date(),
                        guidePurchaseId: purchase.id,
                        stripeCustomerId: paymentIntent.customer as string,
                        paymentMethod: paymentIntent.payment_method_types[0],
                        updatedAt: new Date(),
                    })
                    .where(eq(payments.stripePaymentIntentId, paymentIntent.id));

                console.log(`✅ Guide purchase completed: ${purchase.id}`);
            });

            // Send confirmation email (outside transaction to avoid rollback on email failure)
            const [user] = await db
                .select()
                .from(users)
                .where(eq(users.id, userId))
                .limit(1);

            const [guide] = await db
                .select()
                .from(guides)
                .where(eq(guides.id, guideId))
                .limit(1);

            if (user && guide) {
                await EmailService.sendGuidePurchaseConfirmation(
                    user.email,
                    user.name || user.username || "there",
                    guide.slug
                );
            }
        } catch (error) {
            console.error("❌ Error handling payment success:", error);
            throw error; // Re-throw to mark webhook as failed
        }
    }

    /**
     * Handle failed payment (called from webhook)
     */
    static async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
        try {
            console.log(`❌ Payment failed: ${paymentIntent.id}`);

            await db
                .update(payments)
                .set({
                    status: "failed",
                    errorMessage: paymentIntent.last_payment_error?.message || "Payment failed",
                    updatedAt: new Date(),
                })
                .where(eq(payments.stripePaymentIntentId, paymentIntent.id));
        } catch (error) {
            console.error("❌ Error handling payment failure:", error);
            throw error;
        }
    }

    /**
     * Retrieve checkout session (for success page)
     */
    static async retrieveCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session | null> {
        try {
            if (!stripe) {
                return null;
            }

            const session = await stripe.checkout.sessions.retrieve(sessionId, {
                expand: ["payment_intent"],
            });

            return session;
        } catch (error: any) {
            console.error("❌ Error retrieving checkout session:", error);
            return null;
        }
    }

    /**
     * Get payment details by payment intent ID
     */
    static async getPaymentByIntentId(paymentIntentId: string) {
        const [payment] = await db
            .select()
            .from(payments)
            .where(eq(payments.stripePaymentIntentId, paymentIntentId))
            .limit(1);

        return payment || null;
    }
}
