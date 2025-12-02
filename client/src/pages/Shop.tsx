import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { NotificationDialog } from "@/components/NotificationDialog";
import {
    MapPin,
    ShoppingCart,
    Leaf,
    Heart,
    Home,
    Shirt,
    Sparkles,
} from "lucide-react";

const Shop = () => {
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
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

    const locations = [
        { id: "lisbon", name: "Lisbon" },
        { id: "oeires", name: "Oeiras" },
        { id: "cascais", name: "Cascais" },
    ];

    const categories = [
        {
            id: "food-nutrition",
            name: "Food and Nutrition",
            icon: <ShoppingCart className="h-6 w-6" />,
            subcategories: [
                { id: "grocery-market", name: "Grocery and Market Guide" },
                { id: "supplements", name: "Supplements Guide" },
            ],
        },
        {
            id: "lifestyle",
            name: "Lifestyle",
            icon: <Heart className="h-6 w-6" />,
            subcategories: [
                { id: "beauty", name: "Beauty Guide" },
                { id: "cleaning", name: "Cleaning Guide" },
                { id: "housewares", name: "Housewares and Homegoods Guide" },
                { id: "clothing", name: "Clothing Guide" },
                { id: "wellness", name: "Wellness Guide" },
            ],
        },
    ];

    const toggleLocation = (locationId: string) => {
        setSelectedLocations((prev) =>
            prev.includes(locationId)
                ? prev.filter((id) => id !== locationId)
                : [...prev, locationId],
        );
    };

    const handleCategorySelect = (categoryId: string) => {
        setSelectedCategory(categoryId);
        setSelectedSubcategory(""); // Reset subcategory when category changes
    };

    const handleSearch = () => {
        if (selectedLocations.length === 0) {
            showNotification("Location Required", "Please select at least one location", "warning");
            return;
        }
        if (!selectedSubcategory) {
            showNotification("Category Required", "Please select a guide category", "warning");
            return;
        }

        // Navigate to results based on selections
        const params = new URLSearchParams({
            locations: selectedLocations.join(","),
            category: selectedCategory,
            subcategory: selectedSubcategory,
        });

        window.location.href = `/results?${params.toString()}`;
    };

    const selectedCategoryData = categories.find(
        (cat) => cat.id === selectedCategory,
    );

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="text-center mb-8">
                <div className="inline-flex items-center bg-[#94AF9F] text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
                    <MapPin className="h-4 w-4 mr-1.5" />
                    <span>LISBON METRO AREA</span>
                </div>
                <h1 className="font-montserrat text-3xl md:text-4xl font-bold mb-3">
                    Shop Sustainably
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Find sustainable, organic, and local options in the Lisbon
                    metropolitan area
                </p>
            </div>

            {/* Step 1: Location Selection */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-[#94AF9F]" />
                        Step 1: Select Your Location(s)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600 mb-4">
                        Choose one or multiple locations in the Lisbon area:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {locations.map((location) => (
                            <div
                                key={location.id}
                                className={`
                  flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer
                  ${
                      selectedLocations.includes(location.id)
                          ? "border-[#94AF9F] bg-[#94AF9F]/5"
                          : "border-gray-200 hover:border-[#94AF9F]/50"
                  }
                `}
                                onClick={() => toggleLocation(location.id)}
                            >
                                <Checkbox
                                    id={location.id}
                                    checked={selectedLocations.includes(
                                        location.id,
                                    )}
                                    onChange={() => toggleLocation(location.id)}
                                />
                                <Label
                                    htmlFor={location.id}
                                    className="font-medium cursor-pointer"
                                >
                                    {location.name}
                                </Label>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Step 2: Category Selection */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-[#94AF9F]" />
                        Step 2: Choose Shopping Category
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className={`
                  p-6 rounded-lg border transition-all cursor-pointer
                  ${
                      selectedCategory === category.id
                          ? "border-[#94AF9F] bg-[#94AF9F]/10 shadow-md"
                          : "border-gray-200 hover:border-[#94AF9F]/50 hover:shadow-sm"
                  }
                `}
                                onClick={() =>
                                    handleCategorySelect(category.id)
                                }
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="text-[#94AF9F]">
                                        {category.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold">
                                        {category.name}
                                    </h3>
                                </div>
                                <p className="text-gray-600 text-sm">
                                    {category.id === "food-nutrition"
                                        ? "Organic, local, grass-fed, alternative diet friendly, sustainable food options and quality supplements"
                                        : "Sustainable stores offering organic clothing, non-toxic cleaners, furniture, and wellness products"}
                                </p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Step 3: Subcategory Selection */}
            {selectedCategoryData && (
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {selectedCategoryData.icon}
                            Step 3: Select Guide Type
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {selectedCategoryData.subcategories.map(
                                (subcategory) => (
                                    <div
                                        key={subcategory.id}
                                        className={`
                    p-4 rounded-lg border transition-all cursor-pointer
                    ${
                        selectedSubcategory === subcategory.id
                            ? "border-[#E07A5F] bg-[#E07A5F]/10"
                            : "border-gray-200 hover:border-[#E07A5F]/50"
                    }
                  `}
                                        onClick={() =>
                                            setSelectedSubcategory(
                                                subcategory.id,
                                            )
                                        }
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            {subcategory.id ===
                                                "grocery-market" && (
                                                <ShoppingCart className="h-4 w-4 text-[#E07A5F]" />
                                            )}
                                            {subcategory.id ===
                                                "supplements" && (
                                                <Leaf className="h-4 w-4 text-[#E07A5F]" />
                                            )}
                                            {subcategory.id === "beauty" && (
                                                <Sparkles className="h-4 w-4 text-[#E07A5F]" />
                                            )}
                                            {subcategory.id === "cleaning" && (
                                                <Home className="h-4 w-4 text-[#E07A5F]" />
                                            )}
                                            {subcategory.id ===
                                                "housewares" && (
                                                <Home className="h-4 w-4 text-[#E07A5F]" />
                                            )}
                                            {subcategory.id === "clothing" && (
                                                <Shirt className="h-4 w-4 text-[#E07A5F]" />
                                            )}
                                            {subcategory.id === "wellness" && (
                                                <Heart className="h-4 w-4 text-[#E07A5F]" />
                                            )}
                                            <h4 className="font-medium">
                                                {subcategory.name}
                                            </h4>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {subcategory.id === "supplements" &&
                                                "Quality supplements including online resources that ship to Portugal"}
                                            {subcategory.id ===
                                                "grocery-market" &&
                                                "Stores, markets, and private sellers with organic, local, sustainable options"}
                                            {subcategory.id === "beauty" &&
                                                "Organic and non-toxic beauty products"}
                                            {subcategory.id === "cleaning" &&
                                                "Non-toxic cleaning products and solutions"}
                                            {subcategory.id === "housewares" &&
                                                "Non-toxic furniture and filtered water systems"}
                                            {subcategory.id === "clothing" &&
                                                "Sustainable and organic clothing options"}
                                            {subcategory.id === "wellness" &&
                                                "Wellness services and products"}
                                        </p>
                                    </div>
                                ),
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Search Button */}
            <div className="text-center">
                <Button
                    onClick={handleSearch}
                    disabled={
                        selectedLocations.length === 0 || !selectedSubcategory
                    }
                    className="bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white px-8 py-3 text-lg font-medium"
                >
                    Find{" "}
                    {selectedSubcategory
                        ? selectedCategoryData?.subcategories.find(
                              (s) => s.id === selectedSubcategory,
                          )?.name
                        : "Options"}
                </Button>

                {selectedLocations.length > 0 && selectedSubcategory && (
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {selectedLocations.map((locationId) => {
                            const location = locations.find(
                                (l) => l.id === locationId,
                            );
                            return (
                                <Badge key={locationId} variant="secondary">
                                    {location?.name}
                                </Badge>
                            );
                        })}
                        <Badge variant="outline">
                            {
                                selectedCategoryData?.subcategories.find(
                                    (s) => s.id === selectedSubcategory,
                                )?.name
                            }
                        </Badge>
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
};

export default Shop;
