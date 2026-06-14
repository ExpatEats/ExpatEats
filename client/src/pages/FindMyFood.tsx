import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/components/StepIndicator";
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

// Step component interfaces
interface DietaryPreferencesStepProps {
    selectedPreferences: string[];
    setSelectedPreferences: (prefs: string[]) => void;
    onNext: () => void;
}

interface LocationStepProps {
    selectedLocations: string[];
    setSelectedLocations: (locs: string[]) => void;
    cities: Array<{id: number, name: string}>;
    citiesLoading: boolean;
    onBack: () => void;
    onSearch: () => void;
    isValid: boolean;
}

// Step 1: Dietary Preferences Selection
function DietaryPreferencesStep({
    selectedPreferences,
    setSelectedPreferences,
    onNext
}: DietaryPreferencesStepProps) {
    const getDietaryPreferences = () => {
        return [
            { id: "gluten-free", name: "Gluten-Free", icon: <Wheat className="h-5 w-5 text-bark" /> },
            { id: "dairy-free", name: "Dairy-Free", icon: <Cherry className="h-5 w-5 text-bark" /> },
            { id: "nut-free", name: "Nut-Free", icon: <Apple className="h-5 w-5 text-bark" /> },
            { id: "vegan", name: "Vegan", icon: <Leaf className="h-5 w-5 text-sage" /> },
            { id: "organic", name: "Bio/Organic", icon: <Apple className="h-5 w-5 text-sage" /> },
            { id: "local-farms", name: "Local Farms", icon: <Truck className="h-5 w-5 text-sage" /> },
            { id: "fresh-vegetables", name: "Fresh Vegetables", icon: <Carrot className="h-5 w-5 text-bark" /> },
            { id: "farm-raised-meat", name: "Farm-Raised Meat", icon: <Egg className="h-5 w-5 text-bark" /> },
            { id: "no-processed", name: "No Processed Foods", icon: <Package2 className="h-5 w-5 text-sage" /> },
            { id: "kid-friendly", name: "Kid-Friendly Snacks", icon: <Baby className="h-5 w-5 text-bark" /> },
            { id: "bulk-buying", name: "Bulk Buying Options", icon: <ShoppingBag className="h-5 w-5 text-sage" /> },
            { id: "zero-waste", name: "Zero Waste Packaging", icon: <Leaf className="h-5 w-5 text-bark" /> },
            { id: "supplements", name: "Supplements & Vitamins", icon: <Package2 className="h-5 w-5 text-bark" /> },
        ];
    };

    const togglePreference = (prefId: string) => {
        if (selectedPreferences.includes(prefId)) {
            setSelectedPreferences(selectedPreferences.filter(p => p !== prefId));
        } else {
            setSelectedPreferences([...selectedPreferences, prefId]);
        }
    };

    const preferences = getDietaryPreferences();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-cormorant text-2xl">
                    Select Your Dietary Preferences
                    <span className="block text-sm font-outfit font-normal text-t2 mt-2">
                        Optional - Skip this step if you want to see all options
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {preferences.map((pref) => (
                        <div
                            key={pref.id}
                            onClick={() => togglePreference(pref.id)}
                            className={`
                                p-4 rounded-lg border-2 cursor-pointer transition-all
                                ${selectedPreferences.includes(pref.id)
                                    ? 'border-bark bg-bark/5'
                                    : 'border-gray-200 hover:border-bark/50'}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                {pref.icon}
                                <span className="font-outfit font-medium">{pref.name}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex justify-end">
                    <Button
                        onClick={onNext}
                        size="lg"
                        className="min-w-[120px]"
                    >
                        Next
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

// Step 2: Location Selection
function LocationStep({
    selectedLocations,
    setSelectedLocations,
    cities,
    citiesLoading,
    onBack,
    onSearch,
    isValid
}: LocationStepProps) {
    const toggleLocation = (cityName: string) => {
        if (selectedLocations.includes(cityName)) {
            setSelectedLocations(selectedLocations.filter(c => c !== cityName));
        } else {
            setSelectedLocations([...selectedLocations, cityName]);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-cormorant text-2xl">
                    Choose Your Locations
                </CardTitle>
            </CardHeader>
            <CardContent>
                {citiesLoading ? (
                    <div className="text-center py-8">Loading locations...</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {cities.map((city) => (
                            <div
                                key={city.id}
                                onClick={() => toggleLocation(city.name)}
                                className={`
                                    p-4 rounded-lg border-2 cursor-pointer transition-all
                                    ${selectedLocations.includes(city.name)
                                        ? 'border-bark bg-bark/5'
                                        : 'border-gray-200 hover:border-bark/50'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-bark" />
                                    <span className="font-outfit font-medium">{city.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-8 flex justify-between">
                    <Button
                        onClick={onBack}
                        variant="outline"
                        size="lg"
                    >
                        Back
                    </Button>
                    <Button
                        onClick={onSearch}
                        disabled={!isValid}
                        size="lg"
                        className="min-w-[120px]"
                    >
                        <Search className="h-5 w-5 mr-2" />
                        Search
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

// Main Component
export default function FindMyFood() {
    const [, setLocation] = useLocation();
    const [currentStep, setCurrentStep] = useState<1 | 2>(1);
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

    // Fetch cities from API
    const { data: cities = [], isLoading: citiesLoading } = useQuery<{id: number, name: string, slug: string, country: string}[]>({
        queryKey: ["/api/cities"],
    });

    // Step navigation functions
    const goToNextStep = () => {
        if (currentStep < 2) {
            setCurrentStep((prev) => (prev + 1) as 1 | 2);
        }
    };

    const goToPreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => (prev - 1) as 1 | 2);
        }
    };

    // Step validation functions
    const isStep2Valid = () => selectedLocations.length > 0;

    const handleFindFood = () => {
        if (!isStep2Valid()) return;

        let citiesToSearch = selectedLocations.map(loc => loc.toLowerCase());
        const hasSupplements = selectedPreferences.includes("supplements");
        const otherPreferences = selectedPreferences.filter(p => p !== "supplements");

        // SCENARIO 1: No supplements - Grocery only
        if (!hasSupplements) {
            const params = new URLSearchParams();
            params.set("city", citiesToSearch.join(","));
            if (otherPreferences.length > 0) {
                params.set("tags", otherPreferences.join(","));
            }
            const url = `/results?${params.toString()}`;
            setLocation(url);
            return;
        }

        // SCENARIO 2: ONLY supplements (no other preferences)
        if (hasSupplements && otherPreferences.length === 0) {
            if (!citiesToSearch.includes("online")) {
                citiesToSearch.push("online");
            }
            const params = new URLSearchParams();
            params.set("city", citiesToSearch.join(","));
            params.set("category", "Health Food Store,Online Store,Department Store");
            const url = `/results?${params.toString()}`;
            setLocation(url);
            return;
        }

        // SCENARIO 3: Supplements + Other preferences - Dual search
        if (!citiesToSearch.includes("online")) {
            citiesToSearch.push("online");
        }
        const params = new URLSearchParams();
        params.set("city", citiesToSearch.join(","));
        params.set("tags", otherPreferences.join(","));
        params.set("includeSupplements", "true");
        const url = `/results?${params.toString()}`;
        setLocation(url);
    };

    return (
        <div className="min-h-screen mx-auto">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center bg-sage text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
                            <MapPin className="h-4 w-4 mr-1.5" />
                            <span>PORTUGAL</span>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Find My Food
                        </h1>
                        <p className="text-lg text-t2 font-outfit">
                            Discover healthy, organic grocery stores and supplements near you,
                            curated for your diet and location in Portugal.
                        </p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="mb-8">
                        <StepIndicator currentStep={currentStep} />
                    </div>

                    {/* Step Content */}
                    <div className="max-w-4xl mx-auto">
                        {currentStep === 1 && (
                            <DietaryPreferencesStep
                                selectedPreferences={selectedPreferences}
                                setSelectedPreferences={setSelectedPreferences}
                                onNext={goToNextStep}
                            />
                        )}

                        {currentStep === 2 && (
                            <LocationStep
                                selectedLocations={selectedLocations}
                                setSelectedLocations={setSelectedLocations}
                                cities={cities}
                                citiesLoading={citiesLoading}
                                onBack={goToPreviousStep}
                                onSearch={handleFindFood}
                                isValid={isStep2Valid()}
                            />
                        )}
                    </div>

                    {/* Help Button */}
                    <div className="mt-8 max-w-4xl mx-auto">
                        <Button
                            variant="outline"
                            asChild
                            className="w-full border-sage text-sage hover:bg-sage/10 py-3 text-base sm:text-lg font-medium"
                        >
                            <Link href="/contact" className="flex items-center justify-center">
                                <MessageCircle className="mr-2 h-5 w-5 flex-shrink-0" />
                                <span className="text-center">I want someone to figure this out for me</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
