import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, ShoppingCart, Check, Loader2, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

interface Guide {
    id: number;
    slug: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    isPurchased: boolean;
    previewImage: string;
    createdAt: string;
}

interface GuidesResponse {
    guides: Guide[];
    isAuthenticated: boolean;
}

export default function Resources() {
    const [activeTab, setActiveTab] = useState("lifestyle");
    const [guides, setGuides] = useState<Guide[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [purchasingGuideId, setPurchasingGuideId] = useState<number | null>(null);
    const { isAuthenticated } = useAuth();
    const [, setLocation] = useLocation();

    useEffect(() => {
        fetchGuides();
    }, []);

    const fetchGuides = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/guides/available", {
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to fetch guides");
            }

            const data: GuidesResponse = await response.json();
            setGuides(data.guides);
        } catch (err) {
            console.error("Error fetching guides:", err);
            setError("Failed to load guides. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (guideId: number) => {
        if (!isAuthenticated) {
            setLocation("/");
            return;
        }

        try {
            setPurchasingGuideId(guideId);

            // Get CSRF token
            const csrfResponse = await fetch("/api/csrf-token", {
                credentials: "include",
            });
            const { token: csrfToken } = await csrfResponse.json();

            // Create checkout session
            const response = await fetch(`/api/guides/${guideId}/purchase`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": csrfToken,
                },
                credentials: "include",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to initiate purchase");
            }

            const { checkoutUrl } = await response.json();

            // Redirect to Stripe Checkout
            window.location.href = checkoutUrl;
        } catch (err: any) {
            console.error("Error purchasing guide:", err);
            alert(err.message || "Failed to start checkout. Please try again.");
            setPurchasingGuideId(null);
        }
    };

    const handleViewGuide = (slug: string) => {
        setLocation(`/guides/${slug}`);
    };

    const apps = [
        {
            id: 1,
            name: "Yuka",
            icon: "🔍",
            description:
                "Scan food products to evaluate their health impact based on nutritional quality and additives.",
            link: "https://yuka.io/en/",
        },
        {
            id: 2,
            name: "Open Food Facts",
            icon: "🌐",
            description:
                "Global database of food products with ingredient analysis and nutrition facts.",
            link: "https://world.openfoodfacts.org/",
        },
        {
            id: 3,
            name: "INCI Beauty",
            icon: "✨",
            description:
                "Analyzes cosmetic ingredients to identify potential allergens and harmful substances.",
            link: "https://incibeauty.com/en",
        },
        {
            id: 4,
            name: "GoodGuide",
            icon: "🌿",
            description:
                "Provides ratings for products based on health, environmental and social impacts.",
            link: "https://www.goodguide.com/",
        },
    ];

    const videos = [
        {
            id: 1,
            title: "Reading Portuguese Food Labels",
            description:
                "Learn how to identify ingredients and nutritional information on Portuguese food products.",
            videoUrl: "https://www.youtube.com/embed/emHsk5VLleY",
        },
        {
            id: 2,
            title: "Yuka App Tutorial",
            description:
                "Scan products to analyze their health impacts and find better alternatives.",
            videoUrl: "https://www.youtube.com/embed/F_ZPJGx1nnc",
        },
        {
            id: 3,
            title: "Open Food Facts Guide",
            description:
                "How to use this open database to check product ingredients and nutritional quality.",
            videoUrl: "https://www.youtube.com/embed/5D--XJL2OzI",
        },
        {
            id: 4,
            title: "Decoding Organic Certifications",
            description:
                "Understanding EU organic labels and Portuguese local certifications.",
            videoUrl: "https://www.youtube.com/embed/UbafJafU6sA",
        },
    ];

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="text-center mb-8">
                <h1 className="font-cormorant text-3xl md:text-4xl font-medium mb-3 text-soil">
                    Resources
                </h1>
                <p className="text-xl text-t2 font-outfit max-w-2xl mx-auto">
                    Curated guides, apps, and videos to support healthy, sustainable living in Portugal.
                </p>
            </div>

            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
            >
                <TabsList className="grid w-full grid-cols-3 mb-8 bg-cream-mid p-2 rounded-lg gap-2">
                    <TabsTrigger
                        value="lifestyle"
                        className="text-sm font-outfit font-medium bg-bark-lt text-white data-[state=active]:bg-bark data-[state=active]:text-white data-[state=active]:shadow-sm transition-elegant rounded-md"
                    >
                        Lifestyle Guides
                    </TabsTrigger>
                    <TabsTrigger
                        value="apps"
                        className="text-sm font-outfit font-medium bg-bark-lt text-white data-[state=active]:bg-bark data-[state=active]:text-white data-[state=active]:shadow-sm transition-elegant rounded-md"
                    >
                        Apps
                    </TabsTrigger>
                    <TabsTrigger
                        value="videos"
                        className="text-sm font-outfit font-medium bg-bark-lt text-white data-[state=active]:bg-bark data-[state=active]:text-white data-[state=active]:shadow-sm transition-elegant rounded-md"
                    >
                        Videos
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="lifestyle" className="space-y-6">
                    <div className="text-center mb-6">
                        <p className="text-xl text-t2 font-outfit">
                            Downloadable PDF guides focused on wellness and sustainable living in Portugal.
                        </p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <Card key={i} className="h-full">
                                    <Skeleton className="h-48 w-full rounded-t-lg" />
                                    <CardHeader>
                                        <Skeleton className="h-6 w-3/4 mb-2" />
                                        <Skeleton className="h-4 w-full mb-1" />
                                        <Skeleton className="h-4 w-2/3" />
                                    </CardHeader>
                                    <CardContent>
                                        <Skeleton className="h-10 w-full" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-600 py-8">
                            <p>{error}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {guides.map((guide) => (
                                <Card
                                    key={guide.id}
                                    className="h-full hover:shadow-lg transition-shadow flex flex-col"
                                >
                                    {/* Preview Image */}
                                    <div className="w-full h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                                        <img
                                            src={guide.previewImage}
                                            alt={guide.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                // Fallback if image fails to load
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    </div>

                                    <CardHeader className="flex-grow">
                                        <CardTitle className="text-xl text-sage">
                                            {guide.name}
                                        </CardTitle>
                                        <p className="text-sm text-t2 font-outfit mt-2">
                                            {guide.description}
                                        </p>
                                        <div className="mt-3">
                                            <span className="text-2xl font-cormorant font-medium text-bark">
                                                €{guide.price.toFixed(2)}
                                            </span>
                                            <span className="text-sm text-t3 font-outfit ml-2">
                                                Digital PDF
                                            </span>
                                        </div>
                                    </CardHeader>

                                    <CardContent>
                                        {guide.isPurchased ? (
                                            <div className="space-y-2">
                                                <Button
                                                    onClick={() => handleViewGuide(guide.slug)}
                                                    className="w-full bg-sage hover:bg-sage/90 text-white"
                                                >
                                                    <BookOpen className="mr-2 h-4 w-4" />
                                                    View Guide
                                                </Button>
                                                <div className="flex items-center justify-center text-sm text-green-600 font-outfit">
                                                    <Check className="h-4 w-4 mr-1" />
                                                    Purchased
                                                </div>
                                            </div>
                                        ) : (
                                            <Button
                                                onClick={() => handlePurchase(guide.id)}
                                                disabled={purchasingGuideId === guide.id || !isAuthenticated}
                                                className="w-full bg-bark-lt hover:bg-bark text-white disabled:opacity-50"
                                            >
                                                {purchasingGuideId === guide.id ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                                        {isAuthenticated ? `Purchase - €${guide.price.toFixed(2)}` : 'Login to Purchase'}
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-6">
                        <p className="text-sm text-t3 font-outfit">
                            Carefully curated guides to help you choose safer products and services. All purchases are secure and instant.
                        </p>
                    </div>
                </TabsContent>

                <TabsContent value="apps" className="space-y-6">
                    <div className="text-center mb-6">
                        <p className="text-xl text-t2 font-outfit">
                            Helpful apps for grocery shopping, wellness, and daily life in Portugal.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {apps.map((app) => (
                            <Card
                                key={app.id}
                                className="h-full hover:shadow-lg transition-shadow"
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="text-3xl">
                                            {app.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-outfit font-semibold mb-2 text-soil">
                                                {app.name}
                                            </h3>
                                            <p className="text-t2 font-outfit mb-4">
                                                {app.description}
                                            </p>
                                            <a
                                                href={app.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Button className="bg-sage hover:bg-sage/90 text-white">
                                                    <ExternalLink className="mr-2 h-4 w-4" />
                                                    Visit Website
                                                </Button>
                                            </a>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="videos" className="space-y-6">
                    <div className="text-center mb-6">
                        <p className="text-xl text-t2 font-outfit">
                            Short tutorials and walkthroughs covering food, shopping, and wellness basics in Portugal.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {videos.map((video) => (
                            <Card key={video.id} className="h-full">
                                <CardContent className="p-6">
                                    <div className="aspect-video bg-cream-mid rounded-lg mb-4 overflow-hidden">
                                        <iframe
                                            src={video.videoUrl}
                                            title={video.title}
                                            className="w-full h-full"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                    <h3 className="text-xl font-outfit font-semibold mb-2 text-soil">
                                        {video.title}
                                    </h3>
                                    <p className="text-t2 font-outfit text-sm">
                                        {video.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            <div className="mt-12 text-center">
                <div className="bg-sage/10 rounded-lg p-8">
                    <h3 className="text-2xl font-cormorant font-medium mb-4 text-soil">
                        Need More Resources?
                    </h3>
                    <p className="text-t2 font-outfit mb-6 max-w-2xl mx-auto">
                        Can't find what you're looking for? Contact us for
                        personalized guidance on sustainable living in Portugal.
                    </p>
                    <Button className="bg-bark-lt hover:bg-bark text-white px-8 py-3">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Get Personal Help
                    </Button>
                </div>
            </div>

            <div className="mt-8 text-center">
                <p className="text-t2 font-outfit">
                    A growing library of trusted resources for expats focused on food, wellness, and sustainable living across Portugal.
                </p>
            </div>
        </div>
    );
}
