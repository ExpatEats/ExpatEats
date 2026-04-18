import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, AlertCircle, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface PurchaseStatus {
    status: string;
    paymentStatus: string;
    guideSlug: string;
    amountTotal: number;
    currency: string;
}

export default function PurchaseSuccess() {
    const [, setLocation] = useLocation();
    const { isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);
    const [purchaseStatus, setPurchaseStatus] = useState<PurchaseStatus | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            setLocation("/");
            return;
        }

        // Get session_id from URL
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get("session_id");

        if (!sessionId) {
            setError("No session ID found");
            setLoading(false);
            return;
        }

        fetchPurchaseStatus(sessionId);
    }, [isAuthenticated, setLocation]);

    const fetchPurchaseStatus = async (sessionId: string) => {
        try {
            const response = await fetch(`/api/guides/purchase-status/${sessionId}`, {
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to fetch purchase status");
            }

            const data: PurchaseStatus = await response.json();
            setPurchaseStatus(data);
        } catch (err) {
            console.error("Error fetching purchase status:", err);
            setError("Failed to verify purchase. Please contact support if your card was charged.");
        } finally {
            setLoading(false);
        }
    };

    const handleViewGuide = () => {
        if (purchaseStatus?.guideSlug) {
            setLocation(`/guides/${purchaseStatus.guideSlug}`);
        }
    };

    const handleViewAllGuides = () => {
        setLocation("/purchases");
    };

    if (!isAuthenticated) {
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F9F5F0] flex items-center justify-center">
                <Card className="border-[#DDB892]/20 max-w-md w-full mx-4">
                    <CardContent className="pt-12 pb-12">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <Loader2 className="h-16 w-16 animate-spin text-[#94AF9F]" />
                            <h2 className="text-2xl font-semibold text-gray-800">
                                Verifying your purchase...
                            </h2>
                            <p className="text-gray-600">
                                Please wait while we confirm your order.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !purchaseStatus) {
        return (
            <div className="min-h-screen bg-[#F9F5F0] py-12">
                <div className="max-w-2xl mx-auto px-4">
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="pt-12 pb-12">
                            <div className="flex flex-col items-center text-center gap-4">
                                <AlertCircle className="h-16 w-16 text-red-500" />
                                <h2 className="text-2xl font-semibold text-red-800">
                                    Error Verifying Purchase
                                </h2>
                                <p className="text-red-600 mb-6">
                                    {error || "Unable to verify your purchase"}
                                </p>
                                <div className="flex gap-4">
                                    <Button
                                        onClick={() => setLocation("/resources")}
                                        variant="outline"
                                    >
                                        Back to Resources
                                    </Button>
                                    <Button
                                        onClick={() => setLocation("/purchases")}
                                        className="bg-[#94AF9F] hover:bg-[#94AF9F]/90 text-white"
                                    >
                                        View My Guides
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const isPaid = purchaseStatus.status === "paid" || purchaseStatus.paymentStatus === "succeeded";

    return (
        <div className="min-h-screen bg-[#F9F5F0] py-12">
            <div className="max-w-2xl mx-auto px-4">
                <Card className="border-[#94AF9F]/20">
                    <CardContent className="pt-12 pb-12">
                        <div className="flex flex-col items-center text-center gap-6">
                            {isPaid ? (
                                <>
                                    <div className="relative">
                                        <CheckCircle className="h-24 w-24 text-green-500" />
                                        <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                                    </div>

                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                            Purchase Successful!
                                        </h1>
                                        <p className="text-lg text-gray-600">
                                            Thank you for your purchase
                                        </p>
                                    </div>

                                    <div className="bg-[#94AF9F]/10 rounded-lg p-6 w-full max-w-md">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Guide:</span>
                                                <span className="font-semibold text-gray-800 capitalize">
                                                    {purchaseStatus.guideSlug.replace(/-/g, ' ')}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Amount:</span>
                                                <span className="font-semibold text-gray-800">
                                                    €{purchaseStatus.amountTotal.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Status:</span>
                                                <span className="font-semibold text-green-600">
                                                    Paid
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 w-full max-w-md">
                                        <p className="text-sm text-gray-600">
                                            Your guide is now available to view. A confirmation email has been sent to your registered email address.
                                        </p>

                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <Button
                                                onClick={handleViewGuide}
                                                className="flex-1 bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white"
                                            >
                                                <BookOpen className="mr-2 h-4 w-4" />
                                                View Guide Now
                                            </Button>
                                            <Button
                                                onClick={handleViewAllGuides}
                                                variant="outline"
                                                className="flex-1"
                                            >
                                                View All My Guides
                                            </Button>
                                        </div>

                                        <Button
                                            onClick={() => setLocation("/resources")}
                                            variant="ghost"
                                            className="w-full text-gray-600"
                                        >
                                            Browse More Guides
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="h-16 w-16 text-yellow-500" />
                                    <div>
                                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                                            Payment Pending
                                        </h2>
                                        <p className="text-gray-600">
                                            Your payment is being processed. Please check back in a few moments.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={handleViewAllGuides}
                                        className="bg-[#94AF9F] hover:bg-[#94AF9F]/90 text-white"
                                    >
                                        View My Guides
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
