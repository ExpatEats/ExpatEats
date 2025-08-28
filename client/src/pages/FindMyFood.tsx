import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    MapPin,
    Search,
    MessageCircle,
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
} from "lucide-react";

export default function FindMyFood() {
    const [, setLocation] = useLocation();
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [selectedGuideType, setSelectedGuideType] = useState<string>("");
    const [selectedPreferences, setSelectedPreferences] = useState<string[]>(
        [],
    );

    // Fetch locations from API
    const { data: locations = [], isLoading: locationsLoading } = useQuery<{id: string, name: string}[]>({
        queryKey: ["locations"],
        queryFn: async () => {
            const response = await fetch("/api/locations");
            if (!response.ok) {
                throw new Error("Failed to fetch locations");
            }
            return response.json();
        },
    });

    const guideTypes = [
        {
            id: "grocery",
            name: "Grocery and Market Guide",
            description:
                "Stores, markets, and private sellers with organic, local, sustainable options",
        },
        {
            id: "supplements",
            name: "Supplements Guide",
            description:
                "Quality supplements including online resources that ship to Portugal",
        },
    ];

    const getDietaryPreferences = () => {
        if (selectedGuideType === "supplements") {
            return [
                {
                    id: "supplements",
                    name: "General Supplements",
                    icon: <Package2 className="h-5 w-5 text-[#E07A5F]" />,
                },
                {
                    id: "vitamins",
                    name: "Vitamins",
                    icon: <Apple className="h-5 w-5 text-[#E07A5F]" />,
                },
                {
                    id: "sports-nutrition",
                    name: "Sports Nutrition",
                    icon: <Truck className="h-5 w-5 text-[#94AF9F]" />,
                },
                {
                    id: "omega-3",
                    name: "Omega-3 & Fish Oil",
                    icon: <Cherry className="h-5 w-5 text-[#E07A5F]" />,
                },
                {
                    id: "herbal-remedies",
                    name: "Herbal Remedies",
                    icon: <Leaf className="h-5 w-5 text-[#94AF9F]" />,
                },
                {
                    id: "practitioner-grade",
                    name: "Practitioner Grade",
                    icon: <Search className="h-5 w-5 text-[#E07A5F]" />,
                },
                {
                    id: "vegan",
                    name: "Vegan Supplements",
                    icon: <Leaf className="h-5 w-5 text-[#94AF9F]" />,
                },
                {
                    id: "organic",
                    name: "Organic Supplements",
                    icon: <Apple className="h-5 w-5 text-[#94AF9F]" />,
                },
                {
                    id: "hypoallergenic",
                    name: "Hypoallergenic",
                    icon: <Wheat className="h-5 w-5 text-[#E07A5F]" />,
                },
                {
                    id: "online",
                    name: "Online Retailers",
                    icon: <ShoppingBag className="h-5 w-5 text-[#94AF9F]" />,
                },
            ];
        } else {
            return [
                {
                    id: "gluten-free",
                    name: "Gluten-Free",
                    icon: <Wheat className="h-5 w-5 text-[#E07A5F]" />,
                },
                {
                    id: "dairy-free",
                    name: "Dairy-Free",
                    icon: <Cherry className="h-5 w-5 text-[#E07A5F]" />,
                },
                {
                    id: "nut-free",
                    name: "Nut-Free",
                    icon: <Apple className="h-5 w-5 text-[#E07A5F]" />,
                },
                {
                    id: "vegan",
                    name: "Vegan",
                    icon: <Leaf className="h-5 w-5 text-[#94AF9F]" />,
                },
                {
                    id: "organic",
                    name: "Bio/Organic",
                    icon: <Apple className="h-5 w-5 text-[#94AF9F]" />,
                },
                {
                    id: "local-farms",
                    name: "Local Farms",
                    icon: <Truck className="h-5 w-5 text-[#94AF9F]" />,
                },
                {
                    id: "fresh-vegetables",
                    name: "Fresh Vegetables",
                    icon: <Carrot className="h-5 w-5 text-[#E07A5F]" />,
                },
                {
                    id: "farm-raised-meat",
                    name: "Farm-Raised Meat",
                    icon: <Egg className="h-5 w-5 text-[#E07A5F]" />,
                },
                {
                    id: "no-processed",
                    name: "No Processed Foods",
                    icon: <Package2 className="h-5 w-5 text-[#94AF9F]" />,
                },
                {
                    id: "kid-friendly",
                    name: "Kid-Friendly Snacks",
                    icon: <Baby className="h-5 w-5 text-[#E07A5F]" />,
                },
                {
                    id: "bulk-buying",
                    name: "Bulk Buying Options",
                    icon: <ShoppingBag className="h-5 w-5 text-[#94AF9F]" />,
                },
                {
                    id: "zero-waste",
                    name: "Zero Waste Packaging",
                    icon: <Leaf className="h-5 w-5 text-[#E07A5F]" />,
                },
            ];
        }
    };

    const toggleLocation = (locationId: string) => {
        setSelectedLocations((prev) =>
            prev.includes(locationId)
                ? prev.filter((id) => id !== locationId)
                : [...prev, locationId],
        );
    };

    const toggleGuideType = (guideId: string) => {
        setSelectedGuideType((prev) => (prev === guideId ? "" : guideId));
    };

    const togglePreference = (preferenceId: string) => {
        setSelectedPreferences((prev) =>
            prev.includes(preferenceId)
                ? prev.filter((id) => id !== preferenceId)
                : [...prev, preferenceId],
        );
    };

    const isFormValid = () => {
        return selectedLocations.length > 0 && selectedGuideType;
    };

    const handleFindFood = () => {
        if (!isFormValid()) return;

        const params = new URLSearchParams();

        // Set the primary city for filtering
        params.set("city", selectedLocations[0].toLowerCase());

        // For supplements, add category filter
        if (selectedGuideType === "supplements") {
            params.set(
                "category",
                "Health Food Store,Online Store,Department Store",
            );
        }

        // Add preferences as tags
        if (selectedPreferences.length > 0) {
            params.set("tags", selectedPreferences.join(","));
        }

        console.log("Navigating to:", `/results?${params.toString()}`);

        // Force navigation with window.location to ensure proper routing
        const url = `/results?${params.toString()}`;
        setLocation(url);

        // Fallback navigation if wouter fails
        setTimeout(() => {
            if (window.location.pathname !== "/results") {
                window.location.href = url;
            }
        }, 100);
    };

    return (
        <div className="min-h-screen mx-auto bg-white">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center bg-[#94AF9F] text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
                            <MapPin className="h-4 w-4 mr-1.5" />
                            <span>PORTUGAL</span>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Find My Food
                        </h1>
                        <p className="text-lg text-gray-600">
                            Discover sustainable food sources tailored to your
                            location and dietary needs
                        </p>
                    </div>

                    {/* Location Selection */}
                    <Card className="mb-8 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold">
                                Location
                            </CardTitle>
                            <p className="text-gray-600">
                                Select one or more locations:
                            </p>
                        </CardHeader>
                        <CardContent>
                            {locationsLoading ? (
                                <div className="text-center py-4">Loading locations...</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {locations.map((location) => (
                                    <div
                                        key={location.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:border-[#E07A5F]/50 transition-colors"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                id={`location-${location.id}`}
                                                checked={selectedLocations.includes(
                                                    location.id,
                                                )}
                                                onCheckedChange={() =>
                                                    toggleLocation(location.id)
                                                }
                                                className="h-5 w-5"
                                            />
                                            <Label
                                                htmlFor={`location-${location.id}`}
                                                className="text-base font-medium cursor-pointer"
                                            >
                                                {location.name}
                                            </Label>
                                        </div>
                                    </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Guide Type Selection */}
                    <Card className="mb-8 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold">
                                Guide Type
                            </CardTitle>
                            <p className="text-gray-600">
                                Choose one guide type:
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {guideTypes.map((guide) => (
                                    <div
                                        key={guide.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:border-[#E07A5F]/50 transition-colors"
                                    >
                                        <div className="flex items-start space-x-3">
                                            <Checkbox
                                                id={`guide-${guide.id}`}
                                                checked={
                                                    selectedGuideType ===
                                                    guide.id
                                                }
                                                onCheckedChange={() =>
                                                    toggleGuideType(guide.id)
                                                }
                                                className="h-5 w-5 mt-0.5"
                                            />
                                            <div className="flex-1">
                                                <Label
                                                    htmlFor={`guide-${guide.id}`}
                                                    className="text-base font-medium cursor-pointer block mb-1"
                                                >
                                                    {guide.name}
                                                </Label>
                                                <p className="text-sm text-gray-600">
                                                    {guide.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dietary Preferences */}
                    <Card className="mb-8 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold">
                                Dietary Preferences
                            </CardTitle>
                            <p className="text-gray-600">
                                Select any dietary preferences that apply:
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {getDietaryPreferences().map((preference) => (
                                    <div
                                        key={preference.id}
                                        className="border border-gray-200 rounded-lg p-3 hover:border-[#E07A5F]/50 transition-colors"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                id={`pref-${preference.id}`}
                                                checked={selectedPreferences.includes(
                                                    preference.id,
                                                )}
                                                onCheckedChange={() =>
                                                    togglePreference(
                                                        preference.id,
                                                    )
                                                }
                                                className="h-4 w-4"
                                            />
                                            <Label
                                                htmlFor={`pref-${preference.id}`}
                                                className="text-sm font-medium cursor-pointer flex items-center gap-2 flex-1"
                                            >
                                                {preference.icon}
                                                <span className="leading-tight">
                                                    {preference.name}
                                                </span>
                                            </Label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                        <Button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                console.log("Button clicked directly");
                                handleFindFood();
                            }}
                            disabled={!isFormValid()}
                            className="w-full bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Search className="mr-2 h-5 w-5" />
                            Find My Food
                        </Button>

                        <Button
                            variant="outline"
                            asChild
                            className="w-full border-[#94AF9F] text-[#94AF9F] hover:bg-[#94AF9F]/10 py-3 text-lg font-medium"
                        >
                            <Link href="/contact">
                                <MessageCircle className="mr-2 h-5 w-5" />I want
                                someone to figure this all out for me
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
