import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    MapPin, 
    ArrowLeft, 
    Heart, 
    Share2, 
    Clock,
    Apple,
    Leaf,
    Wheat,
    Cherry,
    Carrot,
    Egg,
    Baby,
    Package2,
    Truck,
    ShoppingBag,
    Search,
    ExternalLink
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { MapView } from "@/components/MapView";
import { apiRequest } from "@/lib/queryClient";

interface Place {
    id: number;
    uniqueId?: string;
    name: string;
    description: string;
    address: string;
    city: string;
    region?: string;
    country: string;
    category: string;
    tags: string[];
    latitude?: string;
    longitude?: string;

    // Contact Information
    phone?: string;
    email?: string;

    // Social Media
    instagram?: string;
    website?: string;

    imageUrl?: string;
    averageRating?: number;
    createdAt?: string;
}

// Function to get icon for a tag
const getTagIcon = (tagId: string) => {
    const iconMap: Record<string, JSX.Element> = {
        // Grocery tags
        "gluten-free": <Wheat className="h-4 w-4 text-[#E07A5F]" />,
        "dairy-free": <Cherry className="h-4 w-4 text-[#E07A5F]" />,
        "nut-free": <Apple className="h-4 w-4 text-[#E07A5F]" />,
        "vegan": <Leaf className="h-4 w-4 text-[#94AF9F]" />,
        "organic": <Apple className="h-4 w-4 text-[#94AF9F]" />,
        "local-farms": <Truck className="h-4 w-4 text-[#94AF9F]" />,
        "fresh-vegetables": <Carrot className="h-4 w-4 text-[#E07A5F]" />,
        "farm-raised-meat": <Egg className="h-4 w-4 text-[#E07A5F]" />,
        "no-processed": <Package2 className="h-4 w-4 text-[#94AF9F]" />,
        "kid-friendly": <Baby className="h-4 w-4 text-[#E07A5F]" />,
        "bulk-buying": <ShoppingBag className="h-4 w-4 text-[#94AF9F]" />,
        "zero-waste": <Leaf className="h-4 w-4 text-[#E07A5F]" />,
        
        // Supplement tags
        "supplements": <Package2 className="h-4 w-4 text-[#E07A5F]" />,
        "vitamins": <Apple className="h-4 w-4 text-[#E07A5F]" />,
        "sports-nutrition": <Truck className="h-4 w-4 text-[#94AF9F]" />,
        "omega-3": <Cherry className="h-4 w-4 text-[#E07A5F]" />,
        "herbal-remedies": <Leaf className="h-4 w-4 text-[#94AF9F]" />,
        "practitioner-grade": <Search className="h-4 w-4 text-[#E07A5F]" />,
        "hypoallergenic": <Wheat className="h-4 w-4 text-[#E07A5F]" />,
        "online": <ShoppingBag className="h-4 w-4 text-[#94AF9F]" />,
    };
    
    return iconMap[tagId] || null;
};

// Function to generate Google Maps URL
const generateGoogleMapsUrl = (address: string, city: string, country: string) => {
    const fullAddress = `${address}, ${city}, ${country}`;
    const encodedAddress = encodeURIComponent(fullAddress);
    return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
};

export default function Store() {
    const [, params] = useRoute("/store/:id");
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isSaved, setIsSaved] = useState(false);

    const storeId = params?.id ? parseInt(params.id) : null;

    // Fetch store details
    const {
        data: store,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["/api/places", storeId],
        queryFn: async () => {
            const response = await fetch(`/api/places/${storeId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch store");
            }
            return response.json() as Promise<Place>;
        },
        enabled: !!storeId,
    });

    // Check if store is saved (for logged-in users)
    const { data: savedStores } = useQuery({
        queryKey: ["/api/user/saved-stores"],
        queryFn: async () => {
            const response = await fetch("/api/user/saved-stores");
            if (!response.ok) {
                throw new Error("Failed to fetch saved stores");
            }
            return response.json();
        },
        enabled: !!storeId, // Enable when we have a storeId
    });

    // Check if current store is in saved stores
    useEffect(() => {
        if (savedStores && storeId) {
            const isCurrentStoreSaved = savedStores.some((savedStore: any) => savedStore.id === storeId);
            setIsSaved(isCurrentStoreSaved);
        }
    }, [savedStores, storeId]);

    // Save/unsave store mutation
    const saveMutation = useMutation({
        mutationFn: async (action: "save" | "unsave") => {
            return await apiRequest("POST", `/api/user/saved-stores`, {
                storeId: storeId,
                action,
            });
        },
        onSuccess: (data, action) => {
            setIsSaved(action === "save");
            toast({
                title: action === "save" ? "Store Saved" : "Store Removed",
                description:
                    action === "save"
                        ? "Added to your favorites"
                        : "Removed from your favorites",
            });
            queryClient.invalidateQueries({
                queryKey: ["/api/user/saved-stores"],
            });
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Please log in to save stores",
                variant: "destructive",
            });
        },
    });

    const handleSave = () => {
        saveMutation.mutate(isSaved ? "unsave" : "save");
    };

    const handleShare = async () => {
        if (navigator.share && store) {
            try {
                await navigator.share({
                    title: store.name,
                    text: `Check out ${store.name} on Expat Eats`,
                    url: window.location.href,
                });
            } catch (error) {
                // Fallback to clipboard
                navigator.clipboard.writeText(window.location.href);
                toast({
                    title: "Link Copied",
                    description: "Store link copied to clipboard",
                });
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast({
                title: "Link Copied",
                description: "Store link copied to clipboard",
            });
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="h-64 bg-gray-200 rounded mb-6"></div>
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !store) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-2xl font-bold mb-4">Store Not Found</h1>
                    <p className="text-gray-600 mb-4">
                        The store you're looking for doesn't exist or has been
                        removed.
                    </p>
                    <Button
                        onClick={() => setLocation("/search")}
                        className="bg-[#E07A5F] hover:bg-[#d06851] text-white"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Search
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Header with Back Button */}
                <div className="flex items-center justify-between mb-6">
                    <Button
                        onClick={() => window.history.back()}
                        variant="outline"
                        className="border-[#E07A5F] text-[#E07A5F] hover:bg-[#E07A5F] hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Results
                    </Button>

                    <div className="flex gap-2">
                        <Button
                            onClick={handleSave}
                            variant="outline"
                            size="sm"
                            className={`border-[#E07A5F] ${
                                isSaved
                                    ? "bg-[#E07A5F] text-white"
                                    : "text-[#E07A5F] hover:bg-[#E07A5F] hover:text-white"
                            }`}
                            disabled={saveMutation.isPending}
                        >
                            <Heart
                                className={`h-4 w-4 mr-1 ${isSaved ? "fill-current" : ""}`}
                            />
                            {isSaved ? "Favorited" : "Add to Favorites"}
                        </Button>

                        <Button
                            onClick={handleShare}
                            variant="outline"
                            size="sm"
                            className="border-[#E07A5F] text-[#E07A5F] hover:bg-[#E07A5F] hover:text-white"
                        >
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                        </Button>
                    </div>
                </div>

                {/* Store Header */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">
                                {store.name}
                            </h1>
                            <p className="text-lg text-gray-600 mb-3">
                                {store.category}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {store.tags.map((tag, index) => {
                                    const tagIcon = getTagIcon(tag);
                                    return (
                                        <Badge
                                            key={index}
                                            variant="secondary"
                                            className="bg-[#E8F4F0] text-[#94AF9F] border-[#94AF9F]/20 flex items-center gap-1.5 px-3 py-1.5"
                                        >
                                            {tagIcon}
                                            {tag
                                                .replace(/-/g, " ")
                                                .replace(/\b\w/g, (l) =>
                                                    l.toUpperCase(),
                                                )}
                                        </Badge>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Store Image Placeholder */}
                        {store.imageUrl ? (
                            <img
                                src={store.imageUrl}
                                alt={store.name}
                                className="w-full md:w-64 h-48 object-cover rounded-lg"
                            />
                        ) : (
                            <div className="w-full md:w-64 h-48 bg-gradient-to-br from-[#E8F4F0] to-[#94AF9F] rounded-lg flex items-center justify-center">
                                <div className="text-center text-white">
                                    <MapPin className="h-8 w-8 mx-auto mb-2" />
                                    <p className="text-sm font-medium">
                                        {store.category}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Store Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Description and Details */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-3">
                                About This Store
                            </h3>
                            <p className="text-gray-700 mb-4 leading-relaxed">
                                {store.description}
                            </p>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-[#E07A5F] mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium">Address</p>
                                            <a
                                                href={generateGoogleMapsUrl(store.address, store.city, store.country)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[#E07A5F] hover:text-[#d06851] transition-colors"
                                                title="Open in Google Maps"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </div>
                                        <p className="text-gray-600">
                                            {store.address}
                                        </p>
                                        <p className="text-gray-600">
                                            {store.city}, {store.country}
                                        </p>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                {(store.phone || store.email) && (
                                    <div className="flex items-start gap-3">
                                        <div className="h-5 w-5 text-[#E07A5F] mt-0.5 flex-shrink-0 flex items-center justify-center text-sm">
                                            📞
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                Contact
                                            </p>
                                            {store.phone && (
                                                <p className="text-gray-600">
                                                    {store.phone}
                                                </p>
                                            )}
                                            {store.email && (
                                                <p className="text-gray-600">
                                                    {store.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Instagram Link */}
                                {store.instagram && (
                                    <div className="flex items-start gap-3">
                                        <div className="h-5 w-5 text-[#E07A5F] mt-0.5 flex-shrink-0 flex items-center justify-center text-sm">
                                            📷
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                Instagram
                                            </p>
                                            <a
                                                href={
                                                    store.instagram.startsWith(
                                                        "http",
                                                    )
                                                        ? store.instagram
                                                        : `https://instagram.com/${store.instagram.replace("@", "")}`
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[#E07A5F] hover:text-[#d06851] font-medium"
                                            >
                                                {store.instagram.startsWith("@")
                                                    ? store.instagram
                                                    : `@${store.instagram}`}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {store.createdAt && (
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-[#E07A5F]" />
                                        <div>
                                            <p className="font-medium">
                                                Added to Expat Eats
                                            </p>
                                            <p className="text-gray-600">
                                                {new Date(
                                                    store.createdAt,
                                                ).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Map */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-3">
                                Location
                            </h3>
                            <div className="h-64 rounded-lg overflow-hidden">
                                <MapView
                                    places={[store]}
                                    onPlaceClick={() => {}}
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                {store.address
                                    ? "Exact location based on provided address"
                                    : "Approximate location - exact address not available"}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Contact Info Note */}
                <Card className="bg-[#E8F4F0] border-[#94AF9F]/20">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-2 text-[#94AF9F]">
                            Visit This Store
                        </h3>
                        <p className="text-gray-700">
                            Use the address above to visit this location. For
                            the most up-to-date hours and contact information,
                            we recommend calling ahead or checking their social
                            media pages.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
