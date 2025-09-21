import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    MapPin, 
    ArrowLeft, 
    Map, 
    List,
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
    Search
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

    // Boolean Filters
    glutenFree?: boolean;
    dairyFree?: boolean;
    nutFree?: boolean;
    vegan?: boolean;
    organic?: boolean;
    localFarms?: boolean;
    freshVegetables?: boolean;
    farmRaisedMeat?: boolean;
    noProcessed?: boolean;
    kidFriendly?: boolean;
    bulkBuying?: boolean;
    zeroWaste?: boolean;

    imageUrl?: string;
    averageRating?: number;
    createdAt?: string;
}

const Results = () => {
    const [location, setLocation] = useLocation();
    const [searchParams, setSearchParams] = useState<URLSearchParams | null>(
        null,
    );
    const [viewMode, setViewMode] = useState<"list" | "map">("list");
    const { toast } = useToast();
    const queryClient = useQueryClient();

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

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setSearchParams(params);
    }, [location]);

    const city = searchParams?.get("city") || "";
    const category = searchParams?.get("category") || "";
    const tags = searchParams?.get("tags") || "";

    const buildQueryUrl = () => {
        const params = new URLSearchParams();
        if (city) {
            params.append("city", city);
        }
        if (category) {
            params.append("category", category);
        }
        if (tags) {
            params.append("tags", tags);
        }
        return `/api/places?${params.toString()}`;
    };

    const { data: results = [], isLoading } = useQuery<Place[]>({
        queryKey: [buildQueryUrl()],
        enabled: !!searchParams && !!city,
    });


    const handlePlaceClick = (place: Place) => {
        setLocation(`/store/${place.id}`);
    };

    // Listen for navigation events from map popups
    useEffect(() => {
        const handleNavigateToStore = (event: any) => {
            setLocation(`/store/${event.detail.storeId}`);
        };

        window.addEventListener("navigate-to-store", handleNavigateToStore);
        return () => {
            window.removeEventListener(
                "navigate-to-store",
                handleNavigateToStore,
            );
        };
    }, [setLocation]);

    const getCategoryTitle = () => {
        if (category && category.includes("Health Food Store"))
            return "Supplements Guide";
        return "Food Sources Guide";
    };

    const getLocationName = () => {
        if (city === "lisbon") return "Lisbon";
        if (city === "oeiras") return "Oeiras";
        if (city === "cascais") return "Cascais";
        if (city === "sintra") return "Sintra";
        return city.charAt(0).toUpperCase() + city.slice(1);
    };

    const getResultsDescription = () => {
        const location = getLocationName();
        const isSupplements =
            category && category.includes("Health Food Store");

        if (tags && tags.length > 0) {
            const tagList = tags
                .split(",")
                .map((tag) => tag.trim())
                .join(", ");
            if (isSupplements) {
                return `${results.length} supplement stores found in ${location} with ${tagList} options`;
            } else {
                return `${results.length} food sources found in ${location} offering ${tagList} options`;
            }
        } else if (isSupplements) {
            return `${results.length} supplement stores found in ${location}`;
        } else {
            return `${results.length} sustainable food sources found in ${location}`;
        }
    };

    if (!searchParams) return null;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => window.history.back()}
                        className="mb-4 text-[#E07A5F] hover:text-[#E07A5F]/80"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Modify Search
                    </Button>

                    <div className="text-center">
                        <div className="flex justify-center items-center gap-2 mb-4">
                            <div className="bg-[#94AF9F] text-white px-3 py-1 rounded-full text-sm font-medium">
                                {getLocationName()}
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                            Results
                        </h1>
                        <p className="text-gray-600">
                            {isLoading ? "Searching..." : getResultsDescription()}
                        </p>
                    </div>

                    {/* View Toggle */}
                    {results.length > 0 && (
                        <div className="flex justify-center mt-4">
                            <div className="bg-gray-100 rounded-lg p-1 inline-flex">
                                <Button
                                    variant={
                                        viewMode === "list" ? "default" : "ghost"
                                    }
                                    size="sm"
                                    onClick={() => setViewMode("list")}
                                    className={`${
                                        viewMode === "list"
                                            ? "bg-[#E07A5F] text-white hover:bg-[#d06851]"
                                            : "text-gray-600 hover:text-gray-900"
                                    }`}
                                >
                                    <List className="h-4 w-4 mr-1" />
                                    List View
                                </Button>
                                <Button
                                    variant={
                                        viewMode === "map" ? "default" : "ghost"
                                    }
                                    size="sm"
                                    onClick={() => setViewMode("map")}
                                    className={`${
                                        viewMode === "map"
                                            ? "bg-[#E07A5F] text-white hover:bg-[#d06851]"
                                            : "text-gray-600 hover:text-gray-900"
                                    }`}
                                    >
                                        <Map className="h-4 w-4 mr-1" />
                                        Map View
                                    </Button>
                                </div>
                            </div>
                        )}
                </div>

                {/* Results */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <CardHeader>
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="h-3 bg-gray-200 rounded"></div>
                                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : results.length === 0 ? (
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            No results found
                        </h2>
                        <p className="text-gray-600 mb-6">
                            We couldn't find any businesses matching your criteria.
                            <br />
                            Try adjusting your search parameters.
                        </p>
                        <Button
                            onClick={() => window.history.back()}
                            className="bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white"
                        >
                            Modify Search
                        </Button>
                    </div>
                ) : (
                    <>
                        {viewMode === "map" ? (
                            <div className="w-full">
                                <MapView
                                    places={results}
                                    onPlaceClick={handlePlaceClick}
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {results.map((place) => (
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

                                            {/* Contact Information */}
                                            {(place.phone || place.email) && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">
                                                        Contact
                                                    </p>
                                                    <div className="space-y-1">
                                                        {place.phone && (
                                                            <p className="text-sm text-gray-600">
                                                                📞 {place.phone}
                                                            </p>
                                                        )}
                                                        {place.email && (
                                                            <p className="text-sm text-gray-600">
                                                                ✉️ {place.email}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Instagram Link - Opens in New Tab */}
                                            {place.instagram && (
                                                <div>
                                                    <a
                                                        href={
                                                            place.instagram.startsWith(
                                                                "http",
                                                            )
                                                                ? place.instagram
                                                                : `https://instagram.com/${place.instagram.replace("@", "")}`
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                        className="inline-flex items-center text-sm text-[#E07A5F] hover:text-[#d06851] font-medium"
                                                    >
                                                        📷 Instagram
                                                    </a>
                                                </div>
                                            )}

                                            {place.tags &&
                                                place.tags.length > 0 && (
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700 mb-2">
                                                            Features
                                                        </p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {place.tags
                                                                .slice(0, 4)
                                                                .map(
                                                                    (
                                                                        tag: string,
                                                                        index: number,
                                                                    ) => {
                                                                        const tagIcon = getTagIcon(tag);
                                                                        return (
                                                                            <Badge
                                                                                key={
                                                                                    index
                                                                                }
                                                                                variant="secondary"
                                                                                className="text-xs bg-[#94AF9F]/10 text-[#94AF9F] hover:bg-[#94AF9F]/20 flex items-center gap-1"
                                                                            >
                                                                                {tagIcon}
                                                                                {tag
                                                                                    .replace(
                                                                                        /-/g,
                                                                                        " ",
                                                                                    )
                                                                                    .replace(
                                                                                        /\b\w/g,
                                                                                        (
                                                                                            l,
                                                                                        ) =>
                                                                                            l.toUpperCase(),
                                                                                    )}
                                                                            </Badge>
                                                                        );
                                                                    },
                                                                )}
                                                            {place.tags.length >
                                                                4 && (
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="text-xs"
                                                                >
                                                                    +
                                                                    {place.tags
                                                                        .length -
                                                                        4}{" "}
                                                                    more
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
                    </>
                )}
            </div>
        </div>
    );
};

export default Results;
