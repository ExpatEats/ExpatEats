import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    MapPin,
    Search as SearchIcon,
    Filter,
    ShoppingBag,
    Carrot,
    Store,
    Egg,
    Users,
    ArrowRight,
    ExternalLink,
    Award,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { Place } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const Search = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredSources, setFilteredSources] = useState<Place[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [savedPreferences, setSavedPreferences] = useState<string[]>([]);

    // Fetch all food sources from the database
    const {
        data: foodSources = [],
        isLoading,
        error,
    } = useQuery<Place[]>({
        queryKey: ["/api/places"],
    });

    // Get saved preferences from localStorage on mount
    useEffect(() => {
        const preferences = localStorage.getItem("dietaryPreferences");
        if (preferences) {
            const parsedPreferences = JSON.parse(preferences);
            setSavedPreferences(parsedPreferences);
        }
    }, []);

    // Filter sources whenever search term, filters, preferences or data changes
    useEffect(() => {
        if (foodSources) {
            filterSources();
        }
    }, [searchTerm, selectedCategories, savedPreferences, foodSources]);

    const filterSources = () => {
        if (!foodSources) return;

        let results = [...foodSources];

        // Filter by search term
        if (searchTerm) {
            const searchTermLower = searchTerm.toLowerCase();
            results = results.filter(
                (source) =>
                    source.name.toLowerCase().includes(searchTermLower) ||
                    (source.description &&
                        source.description
                            .toLowerCase()
                            .includes(searchTermLower)) ||
                    (source.address &&
                        source.address
                            .toLowerCase()
                            .includes(searchTermLower)) ||
                    (source.category &&
                        source.category
                            .toLowerCase()
                            .includes(searchTermLower)),
            );
        }

        // Filter by selected categories with more flexible matching for all category types
        if (selectedCategories.length > 0) {
            results = results.filter((source) => {
                // Check if the category matches exactly
                if (
                    source.category &&
                    selectedCategories.includes(source.category)
                ) {
                    return true;
                }

                for (const selectedCategory of selectedCategories) {
                    // Farm-related category matching
                    if (selectedCategory.includes("farm")) {
                        // Check if any farm-related tags are present
                        const hasFarmTag =
                            source.tags &&
                            source.tags.some(
                                (tag) =>
                                    tag.includes("farm") ||
                                    tag.includes("direct purchase") ||
                                    tag === "csa" ||
                                    tag === "local" ||
                                    tag === "farm-direct" ||
                                    tag === "farm-raised-meat",
                            );

                        // Check if category name contains farm
                        const hasFarmCategory =
                            source.category &&
                            (source.category.includes("farm") ||
                                source.category === "csa" ||
                                source.category === "farmers network");

                        if (hasFarmTag || hasFarmCategory) return true;
                    }

                    // Zero waste / bulk store matching
                    else if (
                        selectedCategory === "zero waste shop" ||
                        selectedCategory === "bulk store"
                    ) {
                        const hasZeroWasteTag =
                            source.tags &&
                            source.tags.some(
                                (tag) =>
                                    tag.includes("zero-waste") ||
                                    tag.includes("bulk") ||
                                    tag.includes("low-waste"),
                            );

                        const hasMatchingCategory =
                            source.category &&
                            (source.category.includes("bulk") ||
                                source.category.includes("zero waste"));

                        if (hasZeroWasteTag || hasMatchingCategory) return true;
                    }

                    // Health food store matching
                    else if (selectedCategory === "health food store") {
                        const hasHealthFoodTag =
                            source.tags &&
                            source.tags.some(
                                (tag) =>
                                    tag === "organic" ||
                                    tag === "gluten-free" ||
                                    tag === "vegan" ||
                                    tag === "dairy-free",
                            );

                        if (
                            hasHealthFoodTag &&
                            source.category &&
                            (source.category.includes("store") ||
                                source.category.includes("market"))
                        ) {
                            return true;
                        }
                    }

                    // Market related matching
                    else if (selectedCategory.includes("market")) {
                        const isMarketRelated =
                            source.category &&
                            (source.category.includes("market") ||
                                source.category.includes("store") ||
                                source.category.includes("supermarket"));

                        if (isMarketRelated) return true;
                    }
                }

                return false;
            });
        }

        // Filter by dietary preferences
        if (savedPreferences.length > 0) {
            results = results.filter((source) => {
                if (!source.tags) return false;

                return savedPreferences.some((pref) => {
                    // Handle special case for 'bio/organic' preference
                    if (
                        pref === "bio/organic" &&
                        (source.tags.includes("organic") ||
                            source.tags.includes("bio") ||
                            (source.category &&
                                source.category
                                    .toLowerCase()
                                    .includes("organic")))
                    ) {
                        return true;
                    }

                    // Handle special case for other known preferences that might have different naming
                    if (
                        pref === "gluten-free" &&
                        source.tags.some(
                            (tag) =>
                                tag.includes("gluten-free") ||
                                tag.includes("gluten free"),
                        )
                    ) {
                        return true;
                    }

                    if (
                        pref === "dairy-free" &&
                        source.tags.some(
                            (tag) =>
                                tag.includes("dairy-free") ||
                                tag.includes("dairy free") ||
                                tag.includes("lactose-free"),
                        )
                    ) {
                        return true;
                    }

                    // Handle exact matching
                    if (source.tags.includes(pref)) {
                        return true;
                    }

                    // Handle partial matching for complex tags
                    return source.tags.some(
                        (tag) =>
                            tag.includes(pref) ||
                            pref.includes(tag) ||
                            tag.replace("-", " ").includes(pref) ||
                            pref.replace("/", "-").includes(tag),
                    );
                });
            });
        }

        setFilteredSources(results);
    };

    const toggleCategory = (category: string) => {
        setSelectedCategories((prev) =>
            prev.includes(category)
                ? prev.filter((c) => c !== category)
                : [...prev, category],
        );
    };

    const clearFilters = () => {
        setSelectedCategories([]);
    };

    const categories = [
        { id: "organic supermarket", label: "Organic Supermarket" },
        { id: "organic farm", label: "Organic Farm" },
        { id: "health food store", label: "Health Food Store" },
        { id: "market stall", label: "Market Stall" },
        { id: "farmers network", label: "Farmers Network" },
        { id: "specialty store", label: "Specialty Store" },
        { id: "bulk store", label: "Bulk Store" },
        { id: "zero waste shop", label: "Zero Waste Shop" },
        { id: "farmers market", label: "Farmers Market" },
        { id: "csa", label: "CSA" },
        { id: "sustainable farm", label: "Sustainable Farm" },
    ];

    const getCategoryIcon = (category: string = "") => {
        switch (category.toLowerCase()) {
            case "organic supermarket":
            case "health food store":
            case "specialty store":
                return <Store className="h-5 w-5 text-primary" />;
            case "zero waste shop":
            case "bulk store":
                return <ShoppingBag className="h-5 w-5 text-primary" />;
            case "organic farm":
            case "sustainable farm":
                return <Carrot className="h-5 w-5 text-primary" />;
            case "farmers market":
            case "market stall":
            case "farmers network":
                return <Users className="h-5 w-5 text-primary" />;
            case "csa":
                return <Egg className="h-5 w-5 text-primary" />;
            default:
                return <Store className="h-5 w-5 text-primary" />;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col items-center mb-4 sm:flex-row sm:justify-between sm:items-center">
                    <h1 className="font-montserrat text-3xl font-bold">
                        Find Local Food Sources
                    </h1>
                    <div className="inline-flex items-center bg-[#6D9075] text-white px-3 py-1 rounded-full text-sm font-semibold mt-2 sm:mt-0">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                        <span>PORTUGAL</span>
                    </div>
                </div>

                {/* Search box */}
                <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="Search by name, description or location..."
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <SearchIcon className="absolute left-3 top-3.5 text-gray-400" />

                        <Button
                            variant="outline"
                            className="absolute right-2 top-2 flex items-center gap-2"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="h-4 w-4" />
                            Filters
                        </Button>
                    </div>

                    {/* Filters panel */}
                    {showFilters && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold mb-3">
                                Filter by Location Type
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {categories.map((category) => (
                                    <Badge
                                        key={category.id}
                                        variant={
                                            selectedCategories.includes(
                                                category.id,
                                            )
                                                ? "default"
                                                : "outline"
                                        }
                                        className="cursor-pointer"
                                        onClick={() =>
                                            toggleCategory(category.id)
                                        }
                                    >
                                        {category.label}
                                    </Badge>
                                ))}
                            </div>

                            <h3 className="font-semibold mb-3">
                                Your Dietary Preferences
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {savedPreferences.map((pref) => (
                                    <Badge
                                        key={pref}
                                        variant="secondary"
                                        className="bg-primary/10 text-primary"
                                    >
                                        {pref
                                            .split("-")
                                            .map(
                                                (word) =>
                                                    word
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                    word.slice(1),
                                            )
                                            .join(" ")}
                                    </Badge>
                                ))}
                                {savedPreferences.length === 0 && (
                                    <p className="text-gray-500 text-sm">
                                        No preferences saved.{" "}
                                        <Link
                                            to="/"
                                            className="text-primary underline"
                                        >
                                            Set up your profile
                                        </Link>
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results count */}
                <p className="text-gray-600 mb-6">
                    {filteredSources.length}{" "}
                    {filteredSources.length === 1 ? "place" : "places"} found in
                    Lisbon
                </p>

                {/* Loading state */}
                {isLoading && (
                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="overflow-hidden">
                                <div className="flex flex-col md:flex-row">
                                    <div className="md:w-1/3 h-48 md:h-auto relative">
                                        <Skeleton className="h-full w-full" />
                                    </div>
                                    <CardContent className="md:w-2/3 p-6">
                                        <Skeleton className="h-8 w-3/4 mb-3" />
                                        <Skeleton className="h-4 w-1/2 mb-4" />
                                        <Skeleton className="h-16 w-full mb-4" />
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <Skeleton className="h-6 w-20" />
                                            <Skeleton className="h-6 w-24" />
                                            <Skeleton className="h-6 w-16" />
                                        </div>
                                    </CardContent>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Results */}
                {!isLoading && (
                    <div className="space-y-6">
                        {filteredSources.length > 0 ? (
                            filteredSources.map((source) => (
                                <Card
                                    key={source.id}
                                    className="overflow-hidden"
                                >
                                    <div className="flex flex-col md:flex-row">
                                        <div className="md:w-1/3 h-48 md:h-auto relative">
                                            {/* Use a different image based on the store name */}
                                            {(() => {
                                                // Map specific stores to their images
                                                switch (source.name) {
                                                    case "Continente":
                                                        return (
                                                            <img
                                                                src="https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                                                                alt={
                                                                    source.name
                                                                }
                                                                className="absolute inset-0 w-full h-full object-cover"
                                                            />
                                                        );
                                                    case "Pingo Doce":
                                                        return (
                                                            <img
                                                                src="https://images.unsplash.com/photo-1534723452862-4c874018d66d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                                                                alt={
                                                                    source.name
                                                                }
                                                                className="absolute inset-0 w-full h-full object-cover"
                                                            />
                                                        );
                                                    case "Lidl":
                                                        return (
                                                            <img
                                                                src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                                                                alt={
                                                                    source.name
                                                                }
                                                                className="absolute inset-0 w-full h-full object-cover"
                                                            />
                                                        );
                                                    case "Auchan":
                                                        return (
                                                            <img
                                                                src="https://images.unsplash.com/photo-1604719312566-8912e9c8a213?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                                                                alt={
                                                                    source.name
                                                                }
                                                                className="absolute inset-0 w-full h-full object-cover"
                                                            />
                                                        );
                                                    case "El Corte Inglés":
                                                        return (
                                                            <img
                                                                src="https://images.unsplash.com/photo-1578916171728-46686eac8d58?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                                                                alt={
                                                                    source.name
                                                                }
                                                                className="absolute inset-0 w-full h-full object-cover"
                                                            />
                                                        );
                                                    case "Celeiro":
                                                    case "Biomercado":
                                                    case "Mercearia Bio":
                                                        return (
                                                            <img
                                                                src="https://images.unsplash.com/photo-1579113800032-c38bd7635818?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                                                                alt={
                                                                    source.name
                                                                }
                                                                className="absolute inset-0 w-full h-full object-cover"
                                                            />
                                                        );
                                                    case "Maria Granel":
                                                    case "GreenBeans":
                                                        return (
                                                            <img
                                                                src="https://images.unsplash.com/photo-1584473457406-6240486418e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                                                                alt={
                                                                    source.name
                                                                }
                                                                className="absolute inset-0 w-full h-full object-cover"
                                                            />
                                                        );
                                                    case "Mercado de Campo de Ourique":
                                                    case "Time Out Market Lisboa":
                                                        return (
                                                            <img
                                                                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                                                                alt={
                                                                    source.name
                                                                }
                                                                className="absolute inset-0 w-full h-full object-cover"
                                                            />
                                                        );
                                                    case "Sam Pastelaria Saudável":
                                                    case "Despensa No.6":
                                                    case "Saludê Pastelaria Fit":
                                                    case "Batardas":
                                                        return (
                                                            <img
                                                                src="https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                                                                alt={
                                                                    source.name
                                                                }
                                                                className="absolute inset-0 w-full h-full object-cover"
                                                            />
                                                        );
                                                    default:
                                                        // Default images based on category
                                                        if (
                                                            source.category
                                                                ?.toLowerCase()
                                                                .includes(
                                                                    "supermarket",
                                                                )
                                                        ) {
                                                            return (
                                                                <img
                                                                    src="https://images.unsplash.com/photo-1534723452862-4c874018d66d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                                                                    alt={
                                                                        source.name
                                                                    }
                                                                    className="absolute inset-0 w-full h-full object-cover"
                                                                />
                                                            );
                                                        } else if (
                                                            source.category
                                                                ?.toLowerCase()
                                                                .includes(
                                                                    "health",
                                                                )
                                                        ) {
                                                            return (
                                                                <img
                                                                    src="https://images.unsplash.com/photo-1550989460-0adf9ea622e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                                                                    alt={
                                                                        source.name
                                                                    }
                                                                    className="absolute inset-0 w-full h-full object-cover"
                                                                />
                                                            );
                                                        } else if (
                                                            source.category
                                                                ?.toLowerCase()
                                                                .includes(
                                                                    "bakery",
                                                                )
                                                        ) {
                                                            return (
                                                                <img
                                                                    src="https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                                                                    alt={
                                                                        source.name
                                                                    }
                                                                    className="absolute inset-0 w-full h-full object-cover"
                                                                />
                                                            );
                                                        } else if (
                                                            source.category
                                                                ?.toLowerCase()
                                                                .includes(
                                                                    "market",
                                                                )
                                                        ) {
                                                            return (
                                                                <img
                                                                    src="https://images.unsplash.com/photo-1533900298318-6b8da08a523e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                                                                    alt={
                                                                        source.name
                                                                    }
                                                                    className="absolute inset-0 w-full h-full object-cover"
                                                                />
                                                            );
                                                        } else if (
                                                            source.category
                                                                ?.toLowerCase()
                                                                .includes(
                                                                    "bulk",
                                                                ) ||
                                                            source.tags?.includes(
                                                                "zero-waste",
                                                            )
                                                        ) {
                                                            return (
                                                                <img
                                                                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                                                                    alt={
                                                                        source.name
                                                                    }
                                                                    className="absolute inset-0 w-full h-full object-cover"
                                                                />
                                                            );
                                                        } else {
                                                            return (
                                                                <img
                                                                    src="https://images.unsplash.com/photo-1601600576337-c1d8a0d4f549?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                                                                    alt={
                                                                        source.name
                                                                    }
                                                                    className="absolute inset-0 w-full h-full object-cover"
                                                                />
                                                            );
                                                        }
                                                }
                                            })()}
                                        </div>

                                        <CardContent className="md:w-2/3 p-6">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h2 className="text-xl font-bold font-montserrat mb-1">
                                                        {source.name}
                                                    </h2>
                                                    <div className="flex items-center text-gray-500 mb-3">
                                                        <Badge className="mr-2 flex items-center gap-1">
                                                            {getCategoryIcon(
                                                                source.category,
                                                            )}
                                                            <span>
                                                                {source.category
                                                                    ? source.category
                                                                          .split(
                                                                              " ",
                                                                          )
                                                                          .map(
                                                                              (
                                                                                  word,
                                                                              ) =>
                                                                                  word
                                                                                      .charAt(
                                                                                          0,
                                                                                      )
                                                                                      .toUpperCase() +
                                                                                  word.slice(
                                                                                      1,
                                                                                  ),
                                                                          )
                                                                          .join(
                                                                              " ",
                                                                          )
                                                                    : "Food Source"}
                                                            </span>
                                                        </Badge>
                                                        {source.softRating && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1"
                                                            >
                                                                <Award className="h-3 w-3" />
                                                                {source.softRating}
                                                            </Badge>
                                                        )}
                                                        <div className="flex items-center text-sm">
                                                            <MapPin className="h-4 w-4 mr-1" />
                                                            <span>
                                                                {source.address}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {source.website && (
                                                    <a
                                                        href={source.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary hover:underline flex items-center gap-1"
                                                    >
                                                        <ExternalLink
                                                            size={14}
                                                        />
                                                        Website
                                                    </a>
                                                )}
                                            </div>

                                            <p className="text-gray-600 mb-4">
                                                {source.description}
                                            </p>

                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {source.tags &&
                                                    source.tags.map((tag) => (
                                                        <Badge
                                                            key={tag}
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            {tag
                                                                .split("-")
                                                                .map(
                                                                    (word) =>
                                                                        word
                                                                            .charAt(
                                                                                0,
                                                                            )
                                                                            .toUpperCase() +
                                                                        word.slice(
                                                                            1,
                                                                        ),
                                                                )
                                                                .join(" ")}
                                                        </Badge>
                                                    ))}
                                            </div>

                                            <Separator className="my-4" />

                                            <div className="flex justify-between gap-2">
                                                <Link to="/contact">
                                                    <Button
                                                        variant="outline"
                                                        className="flex items-center border-accent text-accent hover:bg-accent/5"
                                                    >
                                                        I want help shopping
                                                        here{" "}
                                                        <ArrowRight className="h-4 w-4 ml-2" />
                                                    </Button>
                                                </Link>
                                                <Link to="/contact">
                                                    <Button className="bg-accent text-white hover:bg-accent/90">
                                                        I want help meal
                                                        planning{" "}
                                                        <ArrowRight className="h-4 w-4 ml-2" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-10 bg-gray-50 rounded-lg">
                                <p className="text-gray-600 mb-4">
                                    No food sources match your criteria.
                                </p>
                                <Button onClick={clearFilters}>
                                    Clear All Filters
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
