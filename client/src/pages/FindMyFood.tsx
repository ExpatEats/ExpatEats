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
        const preferences = [
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
            { id: "world-cuisine", name: "World Cuisine", icon: <Apple className="h-5 w-5 text-bark" /> },
        ];
        // Sort alphabetically by name
        return preferences.sort((a, b) => a.name.localeCompare(b.name));
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
            <CardContent className="pt-6 pb-24 md:pb-6">
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

                <div className="mt-8 flex justify-end md:relative fixed bottom-0 left-0 right-0 md:p-0 p-4 bg-white md:bg-transparent border-t md:border-t-0 border-gray-200 z-10">
                    <Button
                        onClick={onNext}
                        size="lg"
                        className="min-w-[120px] md:w-auto w-full max-w-md mx-auto"
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
            <CardContent className="pt-6 pb-24 md:pb-6">
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

                <div className="mt-8 flex justify-between md:relative fixed bottom-0 left-0 right-0 md:p-0 p-4 bg-white md:bg-transparent border-t md:border-t-0 border-gray-200 z-10">
                    <Button
                        onClick={onBack}
                        variant="outline"
                        size="lg"
                        className="md:flex-none flex-1 mr-2"
                    >
                        Back
                    </Button>
                    <Button
                        onClick={onSearch}
                        disabled={!isValid}
                        size="lg"
                        className="min-w-[120px] md:flex-none flex-1"
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
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const goToPreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => (prev - 1) as 1 | 2);
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
                        <div className="inline-flex items-center bg-sage text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
                            <MapPin className="h-4 w-4 mr-1.5" />
                            <span>PORTUGAL</span>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900">
                            {currentStep === 1 ? "Select Your Dietary Preferences" : "Select Your Locations"}
                        </h1>
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

                </div>
            </div>
        </div>
    );
}
