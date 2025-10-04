import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
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

// Define dietary preferences array
const dietaryPreferences = [
    {
        id: "gluten-free",
        label: "Gluten-Free",
        icon: <Wheat className="h-5 w-5 text-accent" />,
    },
    {
        id: "dairy-free",
        label: "Dairy-Free",
        icon: <Cherry className="h-5 w-5 text-accent" />,
    },
    {
        id: "nut-free",
        label: "Nut-Free",
        icon: (
            <div className="h-5 w-5 text-accent flex items-center justify-center">
                🥜
            </div>
        ),
    },
    {
        id: "vegan",
        label: "Vegan",
        icon: <Leaf className="h-5 w-5 text-primary" />,
    },
    {
        id: "bio-organic",
        label: "Bio/Organic",
        icon: <Apple className="h-5 w-5 text-primary" />,
    },
    {
        id: "local-farms",
        label: "Local Farms",
        icon: <Truck className="h-5 w-5 text-primary" />,
    },
    {
        id: "fresh-vegetables",
        label: "Fresh Vegetables",
        icon: <Carrot className="h-5 w-5 text-accent" />,
    },
    {
        id: "farm-raised-meat",
        label: "Farm-Raised Meat",
        icon: (
            <div className="h-5 w-5 text-accent flex items-center justify-center">
                🐄
            </div>
        ),
    },
    {
        id: "no-processed-foods",
        label: "No Processed Foods",
        icon: <Package2 className="h-5 w-5 text-primary" />,
    },
    {
        id: "kid-friendly-snacks",
        label: "Kid-Friendly Snacks",
        icon: <Baby className="h-5 w-5 text-accent" />,
    },
    {
        id: "bulk-buying-options",
        label: "Bulk Buying Options",
        icon: <ShoppingBag className="h-5 w-5 text-primary" />,
    },
    {
        id: "zero-waste-packaging",
        label: "Zero Waste Packaging",
        icon: <Leaf className="h-5 w-5 text-accent" />,
    },
];

const Preferences = () => {
    const [, navigate] = useLocation();
    const [selectedPreferences, setSelectedPreferences] = useState<string[]>(
        [],
    );

    // Check if user is registered
    useEffect(() => {
        const userProfile = localStorage.getItem("userProfile");
        if (!userProfile) {
            // Redirect to registration if not registered
            navigate("/");
        }

        // Check if preferences already exist in localStorage
        const savedPreferences = localStorage.getItem("dietaryPreferences");
        if (savedPreferences) {
            setSelectedPreferences(JSON.parse(savedPreferences));
        }
    }, [navigate]);

    const togglePreference = (id: string) => {
        setSelectedPreferences((prev) =>
            prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
        );
    };

    const savePreferences = () => {
        localStorage.setItem(
            "dietaryPreferences",
            JSON.stringify(selectedPreferences),
        );
        navigate("/search");
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="text-center mb-6">
                <div className="inline-flex items-center bg-[#6D9075] text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1.5"
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
                <h1 className="font-montserrat text-3xl md:text-4xl font-bold mb-3">
                    Set Your Preferences
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Your Guide to Sustainable Living Abroad
                </p>
            </div>

            <Card className="border shadow-lg">
                <CardHeader className="bg-primary/10 border-b">
                    <CardTitle className="text-2xl text-center">
                        Set Up Your Diet Profile
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-6">
                    <p className="mb-6 text-center text-gray-600">
                        Select your dietary preferences to help us find the
                        perfect local food sources for your needs.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        {dietaryPreferences.map((preference) => (
                            <div
                                key={preference.id}
                                className={`
                  flex items-start space-x-3 p-4 rounded-lg border transition-colors
                  ${
                      selectedPreferences.includes(preference.id)
                          ? "border-primary/50 bg-primary/5"
                          : "border-gray-200 hover:border-primary/30 hover:bg-gray-50"
                  }
                `}
                            >
                                <Checkbox
                                    id={preference.id}
                                    checked={selectedPreferences.includes(
                                        preference.id,
                                    )}
                                    onCheckedChange={() =>
                                        togglePreference(preference.id)
                                    }
                                    className="mt-1"
                                />
                                <div>
                                    <Label
                                        htmlFor={preference.id}
                                        className="flex items-center text-base font-medium cursor-pointer"
                                    >
                                        <span className="mr-2">
                                            {preference.icon}
                                        </span>
                                        {preference.label}
                                    </Label>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Separator className="my-6" />

                    <div className="flex flex-col items-center gap-4">
                        <Button
                            onClick={savePreferences}
                            className="bg-[#6D9075] hover:bg-[#6D9075]/90 text-white text-lg px-8 py-6 rounded-full font-medium"
                            size="lg"
                        >
                            Save My Profile & Find Food
                        </Button>

                        <div className="mt-4">
                            <Button
                                onClick={() => navigate("/contact")}
                                className="bg-[#F5A623] hover:bg-[#F5A623]/90 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transition transform hover:scale-105"
                            >
                                I want someone to figure this all out for me
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Preferences;
