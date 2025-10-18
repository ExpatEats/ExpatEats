import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    MapPin, 
    ArrowLeft,
    Heart,
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
    Trash2
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NotificationDialog } from "@/components/NotificationDialog";
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
    phone?: string;
    email?: string;
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

export default function Favorites() {
    const [, setLocation] = useLocation();
    const queryClient = useQueryClient();
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [notificationConfig, setNotificationConfig] = useState<{
        title: string;
        description?: string;
        variant: "success" | "error" | "warning" | "info";
    }>({
        title: "",
        variant: "success"
    });

    const showNotification = (title: string, description?: string, variant: "success" | "error" | "warning" | "info" = "success") => {
        setNotificationConfig({ title, description, variant });
        setNotificationOpen(true);
    };

    // Fetch user's saved stores
    const { data: favoriteStores = [], isLoading, error } = useQuery<Place[]>({
        queryKey: ["/api/user/saved-stores"],
        // queryFn will be provided by the default queryClient configuration
    });

    // Remove from favorites mutation
    const removeFavoriteMutation = useMutation({
        mutationFn: async (storeId: number) => {
            return await apiRequest("POST", `/api/user/saved-stores`, {
                storeId,
                action: "unsave",
            });
        },
        onSuccess: () => {
            showNotification("Removed from Favorites", "Store has been removed from your favorites", "success");
            queryClient.invalidateQueries({
                queryKey: ["/api/user/saved-stores"],
            });
        },
        onError: () => {
            showNotification("Error", "Failed to remove store from favorites", "error");
        },
    });

    const handlePlaceClick = (place: Place) => {
        setLocation(`/store/${place.id}`);
    };

    const handleRemoveFavorite = (storeId: number, event: React.MouseEvent) => {
        event.stopPropagation();
        removeFavoriteMutation.mutate(storeId);
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4 mx-auto"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-64 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-2xl font-bold mb-4">Unable to Load Favorites</h1>
                    <p className="text-gray-600 mb-4">
                        Please log in to view your favorite stores.
                    </p>
                    <Button
                        onClick={() => setLocation("/")}
                        className="bg-[#E07A5F] hover:bg-[#d06851] text-white"
                    >
                        Go to Login
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">

                {/* Page Title */}
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Heart className="h-8 w-8 text-[#E07A5F] fill-current" />
                        <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
                    </div>
                    <p className="text-gray-600">
                        {favoriteStores.length === 0 
                            ? "You haven't saved any stores yet" 
                            : `${favoriteStores.length} saved ${favoriteStores.length === 1 ? 'store' : 'stores'}`
                        }
                    </p>
                </div>

                {/* Favorites List */}
                {favoriteStores.length === 0 ? (
                    <div className="text-center py-12">
                        <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            No Favorites Yet
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Explore stores and add them to your favorites by clicking the heart icon on store detail pages.
                        </p>
                        <Button
                            onClick={() => setLocation("/")}
                            className="bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white"
                        >
                            Find Stores
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favoriteStores.map((place) => (
                            <Card
                                key={place.id}
                                className="hover:shadow-lg transition-shadow cursor-pointer relative"
                                onClick={() => handlePlaceClick(place)}
                            >
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg font-semibold text-gray-900">
                                                {place.name}
                                            </CardTitle>
                                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                                <MapPin className="h-4 w-4 mr-1" />
                                                {place.city}
                                            </div>
                                        </div>

                                        {/* Remove Button */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => handleRemoveFavorite(place.id, e)}
                                            className="p-1 hover:bg-red-100 text-gray-400 hover:text-red-500"
                                            disabled={removeFavoriteMutation.isPending}
                                            title="Remove from favorites"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                        {place.description}
                                    </p>

                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">
                                                Category
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {place.category}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium text-gray-700">
                                                Address
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {place.address}
                                            </p>
                                        </div>

                                        {place.tags && place.tags.length > 0 && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 mb-2">
                                                    Features
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {place.tags
                                                        .slice(0, 4)
                                                        .map(
                                                            (tag: string, index: number) => {
                                                                const tagIcon = getTagIcon(tag);
                                                                return (
                                                                    <Badge
                                                                        key={index}
                                                                        variant="secondary"
                                                                        className="text-xs bg-[#94AF9F]/10 text-[#94AF9F] hover:bg-[#94AF9F]/20 flex items-center gap-1"
                                                                    >
                                                                        {tagIcon}
                                                                        {tag
                                                                            .replace(/-/g, " ")
                                                                            .replace(/\b\w/g, (l) =>
                                                                                l.toUpperCase(),
                                                                            )}
                                                                    </Badge>
                                                                );
                                                            },
                                                        )}
                                                    {place.tags.length > 4 && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            +{place.tags.length - 4} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-2">
                                            <p className="text-sm text-[#E07A5F] font-medium text-center">
                                                Click to view details →
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
            <NotificationDialog
                open={notificationOpen}
                onOpenChange={setNotificationOpen}
                title={notificationConfig.title}
                description={notificationConfig.description}
                variant={notificationConfig.variant}
            />
        </div>
    );
}