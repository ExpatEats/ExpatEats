import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { NotificationDialog } from "@/components/NotificationDialog";
import { InputDialog } from "@/components/InputDialog";
import { ApprovalDialog } from "@/components/ApprovalDialog";
import { GeocodingErrorModal } from "@/components/GeocodingErrorModal";
import { EditLocationModal } from "@/components/EditLocationModal";
import { CoordinateMapPreview } from "@/components/CoordinateMapPreview";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    LogOut,
    Clock,
    CheckCircle,
    XCircle,
    Database,
    FileCheck,
    LayoutDashboard,
    Calendar,
    Map,
    MapPin,
    Loader2,
} from "lucide-react";

const foodSourceSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    description: z
        .string()
        .min(10, { message: "Description must be at least 10 characters" }),
    address: z.string().min(5, { message: "Address is required" }),
    city: z.string().min(2, { message: "City is required" }),
    country: z.string().min(2, { message: "Country is required" }),
    type: z.string({ required_error: "Please select a type" }),
    tags: z.array(z.string()).optional(),
    imageUrl: z.string().optional(),
    softRating: z.string().optional(),
    michaelesNotes: z.string().optional(),
});

type FoodSourceFormValues = z.infer<typeof foodSourceSchema>;

const citySchema = z.object({
    name: z.string().min(2, { message: "City name must be at least 2 characters" }),
    country: z.string().min(2, { message: "Country is required" }),
    region: z.string().optional(),
});

type CityFormValues = z.infer<typeof citySchema>;

const dietaryPreferences = [
    { id: "gluten-free", label: "Gluten Free" },
    { id: "dairy-free", label: "Dairy Free" },
    { id: "vegan", label: "Vegan" },
    { id: "vegetarian", label: "Vegetarian" },
    { id: "organic", label: "Organic" },
    { id: "local", label: "Local" },
    { id: "sustainable", label: "Sustainable" },
    { id: "zero-waste", label: "Zero Waste" },
];

const ADMIN_SECTIONS = [
    {
        id: "overview",
        name: "Overview",
        description: "Dashboard and statistics",
        icon: LayoutDashboard
    },
    {
        id: "data-admin",
        name: "Data Admin",
        description: "Add food sources and cities",
        icon: Database
    },
    {
        id: "pending-approvals",
        name: "Pending Locations",
        description: "Review submitted locations",
        icon: FileCheck
    },
    {
        id: "pending-events",
        name: "Pending Events",
        description: "Review submitted events",
        icon: Calendar
    },
    {
        id: "batch-geocode",
        name: "Batch Geocode",
        description: "Add coordinates to existing locations",
        icon: Map
    }
] as const;

export default function Admin() {
    // All hooks must be declared first
    const [, setLocation] = useLocation();
    const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
    const [selectedCountry, setSelectedCountry] = React.useState<string>("");
    const [activeSection, setActiveSection] = React.useState<string>("data-admin");
    const { user, isAuthenticated, logout, isLoading } = useAuth();
    const [notificationOpen, setNotificationOpen] = React.useState(false);
    const [notificationConfig, setNotificationConfig] = React.useState<{
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

    // Input dialog state for rejection reason
    const [inputDialogOpen, setInputDialogOpen] = React.useState(false);
    const [placeToReject, setPlaceToReject] = React.useState<number | null>(null);
    const [eventToReject, setEventToReject] = React.useState<number | null>(null);

    // Approval dialog state
    const [approvalDialogOpen, setApprovalDialogOpen] = React.useState(false);
    const [placeToApprove, setPlaceToApprove] = React.useState<number | null>(null);

    // Geocoding state
    const [geocodingError, setGeocodingError] = React.useState<{ error: string; place: any } | null>(null);
    const [geocodingErrorModalOpen, setGeocodingErrorModalOpen] = React.useState(false);
    const [editLocationModalOpen, setEditLocationModalOpen] = React.useState(false);
    const [mapPreviewOpen, setMapPreviewOpen] = React.useState(false);
    const [geocodedCoordinates, setGeocodedCoordinates] = React.useState<{ latitude: string; longitude: string } | null>(null);
    const [pendingApprovalData, setPendingApprovalData] = React.useState<{ softRating?: string; michaelesNotes?: string } | null>(null);
    const [currentPlaceForPreview, setCurrentPlaceForPreview] = React.useState<any>(null);

    // Batch geocoding state
    const [batchGeocodeResults, setBatchGeocodeResults] = React.useState<any>(null);

    const form = useForm<FoodSourceFormValues>({
        resolver: zodResolver(foodSourceSchema),
        defaultValues: {
            name: "",
            description: "",
            address: "",
            city: "",
            country: "",
            type: "",
            tags: [],
            imageUrl: "",
            softRating: "none",
            michaelesNotes: "",
        },
    });

    const cityForm = useForm<CityFormValues>({
        resolver: zodResolver(citySchema),
        defaultValues: {
            name: "",
            country: "Portugal",
            region: "",
        },
    });


    const { data: pendingPlaces = [], refetch: refetchPending } = useQuery({
        queryKey: ["/api/admin/pending-places"],
        enabled: isAuthenticated && user?.role === "admin",
    });

    const { data: pendingEvents = [], refetch: refetchPendingEvents } = useQuery({
        queryKey: ["/api/admin/pending-events"],
        enabled: isAuthenticated && user?.role === "admin",
    });

    const { data: cities = [], isLoading: citiesLoading } = useQuery<{id: number, name: string, slug: string, country: string}[]>({
        queryKey: ["/api/cities"],
        enabled: isAuthenticated && user?.role === "admin",
    });

    // Get unique countries from cities
    const countries = React.useMemo(() => {
        const uniqueCountries = [...new Set(cities.map(city => city.country))];
        return uniqueCountries.sort();
    }, [cities]);

    // Filter cities by selected country
    const filteredCities = React.useMemo(() => {
        if (!selectedCountry) return [];
        return cities.filter(city => city.country === selectedCountry);
    }, [cities, selectedCountry]);

    const addFoodSourceMutation = useMutation({
        mutationFn: async (values: FoodSourceFormValues) => {
            // Format values to match API expectations
            const formattedValues = {
                name: values.name,
                description: values.description,
                address: values.address,
                city: values.city,
                country: values.country,
                category: values.type,
                tags: values.tags || [],
                imageUrl: values.imageUrl || null,
                softRating: values.softRating === "none" ? "" : values.softRating || null,
                michaelesNotes: values.michaelesNotes || null,
            };

            const response = await fetch("/api/places", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formattedValues),
            });

            if (!response.ok) {
                throw new Error("Failed to add food source");
            }

            return response.json();
        },
        onSuccess: () => {
            showNotification("Food source added", "Your submission has been added successfully", "success");
            form.reset();
            setSelectedTags([]);
            queryClient.invalidateQueries({ queryKey: ["/api/places"] });
        },
        onError: (error) => {
            showNotification("Error", "Failed to add food source. Please try again.", "error");
        },
    });

    const approvePlaceMutation = useMutation({
        mutationFn: async ({
            placeId,
            adminNotes,
            softRating,
            michaelesNotes,
            skipGeocode,
            coordinates,
        }: {
            placeId: number;
            adminNotes?: string;
            softRating?: string;
            michaelesNotes?: string;
            skipGeocode?: boolean;
            coordinates?: { latitude: string; longitude: string };
        }) => {
            const response = await apiRequest(
                "POST",
                `/api/admin/approve-place/${placeId}`,
                { adminNotes, softRating, michaelesNotes, skipGeocode, coordinates },
            );
            return await response.json();
        },
        onSuccess: (data) => {
            if (data.coordinates) {
                // Show map preview for confirmation
                setGeocodedCoordinates(data.coordinates);
                setMapPreviewOpen(true);
            } else {
                // Direct approval (skipped geocoding)
                showNotification("Success", "Location approved successfully", "success");
                refetchPending();
                setApprovalDialogOpen(false);
            }
        },
        onError: async (error: any) => {
            // Check for 422 geocoding error
            if (error.message && error.message.includes("422")) {
                try {
                    const errorText = error.message.split(": ").slice(1).join(": ");
                    const errorData = JSON.parse(errorText);
                    if (errorData.geocodingError) {
                        setGeocodingError({
                            error: errorData.message,
                            place: errorData.place
                        });
                        setGeocodingErrorModalOpen(true);
                        setApprovalDialogOpen(false);
                        return;
                    }
                } catch (parseError) {
                    console.error("Failed to parse geocoding error:", parseError);
                }
            }
            // Generic error
            showNotification("Error", `Failed to approve location: ${error.message}`, "error");
        },
    });

    const rejectPlaceMutation = useMutation({
        mutationFn: async ({
            placeId,
            adminNotes,
        }: {
            placeId: number;
            adminNotes: string;
        }) => {
            return await apiRequest(
                "POST",
                `/api/admin/reject-place/${placeId}`,
                { adminNotes },
            );
        },
        onSuccess: () => {
            showNotification("Success", "Location rejected successfully", "success");
            refetchPending();
        },
        onError: (error) => {
            showNotification("Error", `Failed to reject location: ${error.message}`, "error");
        },
    });

    const approveEventMutation = useMutation({
        mutationFn: async ({
            eventId,
            adminNotes,
        }: {
            eventId: number;
            adminNotes?: string;
        }) => {
            return await apiRequest(
                "POST",
                `/api/admin/approve-event/${eventId}`,
                { adminNotes },
            );
        },
        onSuccess: () => {
            showNotification("Success", "Event approved successfully", "success");
            refetchPendingEvents();
        },
        onError: (error) => {
            showNotification("Error", `Failed to approve event: ${error.message}`, "error");
        },
    });

    const rejectEventMutation = useMutation({
        mutationFn: async ({
            eventId,
            adminNotes,
        }: {
            eventId: number;
            adminNotes: string;
        }) => {
            return await apiRequest(
                "POST",
                `/api/admin/reject-event/${eventId}`,
                { adminNotes },
            );
        },
        onSuccess: () => {
            showNotification("Success", "Event rejected successfully", "success");
            refetchPendingEvents();
        },
        onError: (error) => {
            showNotification("Error", `Failed to reject event: ${error.message}`, "error");
        },
    });

    const addCityMutation = useMutation({
        mutationFn: async (values: CityFormValues) => {
            return await apiRequest("POST", "/api/admin/cities", values);
        },
        onSuccess: () => {
            showNotification("Success", "City added successfully", "success");
            cityForm.reset();
            queryClient.invalidateQueries({ queryKey: ["/api/cities"] });
        },
        onError: (error) => {
            showNotification("Error", `Failed to add city: ${error.message}`, "error");
        },
    });

    // Batch geocoding mutation
    const batchGeocodeMutation = useMutation({
        mutationFn: async () => {
            const response = await apiRequest("POST", "/api/admin/batch-geocode", {});
            return await response.json();
        },
        onSuccess: (data) => {
            setBatchGeocodeResults(data);
            showNotification("Success", data.message, "success");
        },
        onError: (error) => {
            showNotification("Error", `Batch geocoding failed: ${error.message}`, "error");
        },
    });

    // Geocoding handlers
    const handleApproveWithoutCoords = () => {
        if (!geocodingError || !pendingApprovalData) return;

        approvePlaceMutation.mutate({
            placeId: geocodingError.place.id,
            ...pendingApprovalData,
            skipGeocode: true
        });

        setGeocodingErrorModalOpen(false);
        setGeocodingError(null);
        setPendingApprovalData(null);
    };

    const handleEditAndRetry = () => {
        setGeocodingErrorModalOpen(false);
        setEditLocationModalOpen(true);
    };

    const handleSaveAndRetryGeocode = async (updatedData: any) => {
        if (!geocodingError || !pendingApprovalData) return;

        try {
            await apiRequest(
                "PATCH",
                `/api/admin/update-place/${geocodingError.place.id}`,
                updatedData
            );

            // Retry approval (will trigger geocoding again)
            approvePlaceMutation.mutate({
                placeId: geocodingError.place.id,
                ...pendingApprovalData
            });

            setEditLocationModalOpen(false);
            setGeocodingError(null);
        } catch (error: any) {
            showNotification("Error", `Failed to update location: ${error.message}`, "error");
        }
    };

    const handleRemoveFromPending = () => {
        setGeocodingErrorModalOpen(false);
        setGeocodingError(null);
        setPendingApprovalData(null);
        showNotification("Info", "Location not approved", "info");
    };

    const handleMapPreviewConfirm = () => {
        setMapPreviewOpen(false);
        setGeocodedCoordinates(null);
        setPendingApprovalData(null);
        showNotification("Success", "Location approved successfully", "success");
        refetchPending();
        setApprovalDialogOpen(false);
    };

    const handleMapPreviewCancel = () => {
        setMapPreviewOpen(false);
        setEditLocationModalOpen(true);
    };

    // Effects and handlers
    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                setLocation("/register");
                return;
            }
            if (user?.role !== "admin") {
                setLocation("/");
                showNotification("Access Denied", "Admin privileges required to access this page.", "error");
                return;
            }
        }
    }, [isAuthenticated, user, isLoading, setLocation]);

    const handleLogout = async () => {
        try {
            await logout();
            setLocation("/");
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const onSubmit = (values: FoodSourceFormValues) => {
        values.tags = selectedTags;
        addFoodSourceMutation.mutate(values);
    };

    const handleTagToggle = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
        );
    };

    const onCitySubmit = (values: CityFormValues) => {
        addCityMutation.mutate(values);
    };

    const handleApprovePlace = (softRating: string, michaelesNotes: string) => {
        if (placeToApprove !== null) {
            // Save approval data for potential retry
            setPendingApprovalData({ softRating, michaelesNotes });

            // Save current place for map preview
            const currentPlace = pendingPlaces.find(p => p.id === placeToApprove);
            setCurrentPlaceForPreview(currentPlace);

            approvePlaceMutation.mutate({
                placeId: placeToApprove,
                softRating,
                michaelesNotes,
            });
            setPlaceToApprove(null);
        }
    };

    const handleRejectPlace = (reason: string) => {
        if (placeToReject !== null) {
            rejectPlaceMutation.mutate({
                placeId: placeToReject,
                adminNotes: reason,
            });
            setPlaceToReject(null);
        }
    };

    const handleRejectEvent = (reason: string) => {
        if (eventToReject !== null) {
            rejectEventMutation.mutate({
                eventId: eventToReject,
                adminNotes: reason,
            });
            setEventToReject(null);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E07A5F] mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== "admin") {
        return null; // useEffect will handle redirect
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="font-montserrat text-3xl font-bold mb-2">
                                Admin Panel
                            </h1>
                            <p className="text-gray-600">
                                Manage food sources, cities, and review submissions.
                            </p>
                        </div>
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="border-[#E07A5F] text-[#E07A5F] hover:bg-[#E07A5F] hover:text-white"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-4">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold">Admin Sections</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {ADMIN_SECTIONS.map((section) => (
                                        <button
                                            key={section.id}
                                            onClick={() => setActiveSection(section.id)}
                                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                                                activeSection === section.id
                                                    ? "bg-primary/10 text-primary border border-primary/20"
                                                    : "hover:bg-gray-100 text-gray-700"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 font-medium">
                                                <section.icon className="h-4 w-4" />
                                                {section.name}
                                            </div>
                                            <div className="text-sm text-gray-500 mt-1">
                                                {section.description}
                                            </div>
                                        </button>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            {activeSection === "overview" && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <LayoutDashboard className="h-5 w-5" />
                                            Dashboard Overview
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center py-8 text-gray-500">
                                            <p>Dashboard statistics and overview coming soon...</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {activeSection === "data-admin" && (
                                <div className="space-y-6">
                                    {/* Add Food Source Form */}
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Add New Food Source</CardTitle>
                    <CardDescription>
                        Enter details about a local food source that might be
                        helpful for other expats
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Market name or business name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe what makes this place special and what kind of products they have"
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Address</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Street address"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Country</FormLabel>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    setSelectedCountry(value);
                                                    // Reset city when country changes
                                                    form.setValue("city", "");
                                                }}
                                                defaultValue={field.value}
                                                disabled={citiesLoading}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={citiesLoading ? "Loading..." : "Select country"} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {countries.map((country) => (
                                                        <SelectItem key={country} value={country}>
                                                            {country}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                disabled={!selectedCountry || citiesLoading}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={!selectedCountry ? "Select country first" : citiesLoading ? "Loading cities..." : "Select city"} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {filteredCities.map((city) => (
                                                        <SelectItem key={city.id} value={city.name}>
                                                            {city.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="grocer">
                                                        Grocery Store
                                                    </SelectItem>
                                                    <SelectItem value="market">
                                                        Farmers Market
                                                    </SelectItem>
                                                    <SelectItem value="farm">
                                                        Farm
                                                    </SelectItem>
                                                    <SelectItem value="zerowaste">
                                                        Zero Waste Shop
                                                    </SelectItem>
                                                    <SelectItem value="specialty">
                                                        Specialty Shop
                                                    </SelectItem>
                                                    <SelectItem value="other">
                                                        Other
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="imageUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Image URL (optional)
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Link to an image of this place"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="softRating"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Soft Rating (optional)</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select rating" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                <SelectItem value="Gold Standard">Gold Standard</SelectItem>
                                                <SelectItem value="Great Choice">Great Choice</SelectItem>
                                                <SelectItem value="This Will Do in a Pinch">This Will Do in a Pinch</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="michaelesNotes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Michaele's Notes (optional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Personal notes and observations about this location"
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-3">
                                <FormLabel>
                                    Dietary Preferences Available
                                </FormLabel>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {dietaryPreferences.map((preference) => (
                                        <div
                                            key={preference.id}
                                            className="flex items-center space-x-2"
                                        >
                                            <Checkbox
                                                id={preference.id}
                                                checked={selectedTags.includes(
                                                    preference.id,
                                                )}
                                                onCheckedChange={() =>
                                                    handleTagToggle(
                                                        preference.id,
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor={preference.id}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {preference.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={addFoodSourceMutation.isPending}
                            >
                                {addFoodSourceMutation.isPending
                                    ? "Adding..."
                                    : "Add Food Source"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card className="w-full mt-6">
                <CardHeader>
                    <CardTitle>Add New City/Location</CardTitle>
                    <CardDescription>
                        Add a new city to the system to make it available in dropdown menus
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...cityForm}>
                        <form
                            onSubmit={cityForm.handleSubmit(onCitySubmit)}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={cityForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City Name *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g., Porto"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={cityForm.control}
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Country *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g., Portugal"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={cityForm.control}
                                name="region"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Region (optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., Porto District"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={addCityMutation.isPending}
                            >
                                {addCityMutation.isPending
                                    ? "Adding..."
                                    : "Add City"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
                                </div>
                            )}

                            {activeSection === "pending-approvals" && (
                                <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-[#E07A5F]" />
                        Pending Location Reviews
                        {pendingPlaces.length > 0 && (
                            <Badge variant="destructive" className="ml-2">
                                {pendingPlaces.length}
                            </Badge>
                        )}
                    </CardTitle>
                    <CardDescription>
                        Review and approve user-submitted locations before they
                        appear publicly
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {pendingPlaces.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p>No pending locations to review</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingPlaces.map((place: any) => (
                                <div
                                    key={place.id}
                                    className="border border-gray-200 rounded-lg p-4"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-semibold text-lg">
                                                {place.name}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {place.category}
                                            </p>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className="border-orange-200 text-orange-700"
                                        >
                                            Pending Review
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm">
                                                <strong>Description:</strong>{" "}
                                                {place.description}
                                            </p>
                                            <p className="text-sm mt-2">
                                                <strong>Address:</strong>{" "}
                                                {place.address}
                                            </p>
                                            <p className="text-sm">
                                                <strong>Location:</strong>{" "}
                                                {place.city}, {place.country}
                                            </p>
                                        </div>
                                        <div>
                                            {place.tags &&
                                                place.tags.length > 0 && (
                                                    <div>
                                                        <p className="text-sm font-medium mb-1">
                                                            Tags:
                                                        </p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {place.tags.map(
                                                                (
                                                                    tag: string,
                                                                    index: number,
                                                                ) => (
                                                                    <Badge
                                                                        key={
                                                                            index
                                                                        }
                                                                        variant="secondary"
                                                                        className="text-xs"
                                                                    >
                                                                        {tag}
                                                                    </Badge>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            {place.website && (
                                                <p className="text-sm mt-2">
                                                    <strong>Website:</strong>{" "}
                                                    {place.website}
                                                </p>
                                            )}
                                            <p className="text-sm mt-2">
                                                <strong>Submitted:</strong>{" "}
                                                {new Date(
                                                    place.createdAt,
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-3 border-t">
                                        <Button
                                            onClick={() => {
                                                setPlaceToApprove(place.id);
                                                setApprovalDialogOpen(true);
                                            }}
                                            disabled={
                                                approvePlaceMutation.isPending ||
                                                rejectPlaceMutation.isPending
                                            }
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                            size="sm"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Approve
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setPlaceToReject(place.id);
                                                setInputDialogOpen(true);
                                            }}
                                            disabled={
                                                approvePlaceMutation.isPending ||
                                                rejectPlaceMutation.isPending
                                            }
                                            variant="destructive"
                                            size="sm"
                                        >
                                            <XCircle className="h-4 w-4 mr-1" />
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
                            )}

                            {/* Pending Events Section */}
                            {activeSection === "pending-events" && (
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-2xl font-bold">
                                Pending Event Reviews
                                {pendingEvents.length > 0 && (
                                    <Badge className="ml-2" variant="secondary">
                                        {pendingEvents.length}
                                    </Badge>
                                )}
                            </CardTitle>
                            <CardDescription>
                                Review and approve or reject event submissions
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {pendingEvents.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                            <p>No pending events to review</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingEvents.map((event: any) => (
                                <Card key={event.id} className="border-l-4 border-l-orange-500">
                                    <CardContent className="pt-6">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-lg">{event.title}</h3>
                                                    {event.category && (
                                                        <Badge className="mt-1 bg-[#6D9075]">{event.category}</Badge>
                                                    )}
                                                </div>
                                                <Badge className="bg-orange-500">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    Pending Review
                                                </Badge>
                                            </div>

                                            <p className="text-gray-700">{event.description}</p>

                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-500 font-medium">Date & Time</p>
                                                    <p className="text-gray-900">
                                                        {new Date(event.date).toLocaleDateString()} at {event.time}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 font-medium">Location</p>
                                                    <p className="text-gray-900">{event.location}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 font-medium">City</p>
                                                    <p className="text-gray-900">{event.city}</p>
                                                </div>
                                                {event.organizerName && (
                                                    <div>
                                                        <p className="text-gray-500 font-medium">Organizer</p>
                                                        <p className="text-gray-900">
                                                            {event.organizerName}
                                                            {event.organizerRole && ` · ${event.organizerRole}`}
                                                        </p>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-gray-500 font-medium">Submitted By</p>
                                                    <p className="text-gray-900">{event.submittedBy}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 font-medium">Contact Email</p>
                                                    <p className="text-gray-900">{event.submitterEmail}</p>
                                                </div>
                                                {event.website && (
                                                    <div>
                                                        <p className="text-gray-500 font-medium">Website</p>
                                                        <a
                                                            href={event.website}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            {event.website}
                                                        </a>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-2 pt-4">
                                                <Button
                                                    onClick={() =>
                                                        approveEventMutation.mutate({
                                                            eventId: event.id,
                                                        })
                                                    }
                                                    disabled={
                                                        approveEventMutation.isPending ||
                                                        rejectEventMutation.isPending
                                                    }
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                    size="sm"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        setEventToReject(event.id);
                                                        setInputDialogOpen(true);
                                                    }}
                                                    disabled={
                                                        approveEventMutation.isPending ||
                                                        rejectEventMutation.isPending
                                                    }
                                                    variant="destructive"
                                                    size="sm"
                                                >
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
                            )}

                            {/* Batch Geocoding Section */}
                            {activeSection === "batch-geocode" && (
                                <Card className="w-full">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Map className="h-5 w-5 text-[#E07A5F]" />
                                            Batch Geocode Locations
                                        </CardTitle>
                                        <CardDescription>
                                            Add coordinates to approved locations that don't have them
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <Alert className="bg-blue-50 border-blue-200">
                                                <AlertDescription className="text-blue-900">
                                                    This will geocode all approved locations without coordinates.
                                                    The process may take several minutes due to rate limiting
                                                    (200ms delay between requests).
                                                </AlertDescription>
                                            </Alert>

                                            <Button
                                                onClick={() => batchGeocodeMutation.mutate()}
                                                disabled={batchGeocodeMutation.isPending}
                                                className="w-full"
                                                size="lg"
                                            >
                                                {batchGeocodeMutation.isPending ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Geocoding...
                                                    </>
                                                ) : (
                                                    <>
                                                        <MapPin className="h-4 w-4 mr-2" />
                                                        Start Batch Geocoding
                                                    </>
                                                )}
                                            </Button>

                                            {batchGeocodeResults && (
                                                <div className="mt-6 p-4 bg-gray-50 rounded-lg space-y-3">
                                                    <h4 className="font-semibold text-lg">Results:</h4>
                                                    <div className="grid grid-cols-3 gap-4 text-center">
                                                        <div className="bg-white p-3 rounded border">
                                                            <p className="text-2xl font-bold text-gray-900">
                                                                {batchGeocodeResults.summary.total}
                                                            </p>
                                                            <p className="text-sm text-gray-600">Total</p>
                                                        </div>
                                                        <div className="bg-green-50 p-3 rounded border border-green-200">
                                                            <p className="text-2xl font-bold text-green-700">
                                                                {batchGeocodeResults.summary.successful}
                                                            </p>
                                                            <p className="text-sm text-green-600">Successful</p>
                                                        </div>
                                                        <div className="bg-red-50 p-3 rounded border border-red-200">
                                                            <p className="text-2xl font-bold text-red-700">
                                                                {batchGeocodeResults.summary.failed}
                                                            </p>
                                                            <p className="text-sm text-red-600">Failed</p>
                                                        </div>
                                                    </div>

                                                    {batchGeocodeResults.results && batchGeocodeResults.results.length > 0 && (
                                                        <div className="mt-4">
                                                            <details className="cursor-pointer">
                                                                <summary className="font-medium text-sm text-gray-700 hover:text-gray-900">
                                                                    View Detailed Results ({batchGeocodeResults.results.length} locations)
                                                                </summary>
                                                                <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
                                                                    {batchGeocodeResults.results.map((result: any, index: number) => (
                                                                        <div
                                                                            key={index}
                                                                            className={`p-3 rounded text-sm ${
                                                                                result.success
                                                                                    ? 'bg-green-50 border border-green-200'
                                                                                    : 'bg-red-50 border border-red-200'
                                                                            }`}
                                                                        >
                                                                            <p className="font-medium">
                                                                                {result.placeName}
                                                                            </p>
                                                                            {result.success ? (
                                                                                <p className="text-green-700 text-xs mt-1">
                                                                                    ✓ Coordinates: {result.coordinates.latitude}, {result.coordinates.longitude}
                                                                                </p>
                                                                            ) : (
                                                                                <p className="text-red-700 text-xs mt-1">
                                                                                    ✗ {result.error}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </details>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <NotificationDialog
                open={notificationOpen}
                onOpenChange={setNotificationOpen}
                title={notificationConfig.title}
                description={notificationConfig.description}
                variant={notificationConfig.variant}
            />

            <InputDialog
                open={inputDialogOpen}
                onOpenChange={setInputDialogOpen}
                title={eventToReject !== null ? "Reject Event" : "Reject Location"}
                description={eventToReject !== null ? "Please provide a reason for rejecting this event submission." : "Please provide a reason for rejecting this location submission."}
                placeholder="Enter rejection reason..."
                confirmText="Reject"
                cancelText="Cancel"
                onConfirm={eventToReject !== null ? handleRejectEvent : handleRejectPlace}
                multiline={true}
                required={true}
                isLoading={eventToReject !== null ? rejectEventMutation.isPending : rejectPlaceMutation.isPending}
            />

            <ApprovalDialog
                open={approvalDialogOpen}
                onOpenChange={setApprovalDialogOpen}
                title="Approve Location"
                description="Add optional rating and notes before approving this location."
                onConfirm={handleApprovePlace}
                isLoading={approvePlaceMutation.isPending}
            />

            {/* Geocoding Error Modal */}
            <GeocodingErrorModal
                open={geocodingErrorModalOpen}
                onOpenChange={setGeocodingErrorModalOpen}
                error={geocodingError?.error || ""}
                place={geocodingError?.place || null}
                onApproveWithoutCoords={handleApproveWithoutCoords}
                onEditAndRetry={handleEditAndRetry}
                onRemoveFromPending={handleRemoveFromPending}
                isLoading={approvePlaceMutation.isPending}
            />

            {/* Edit Location Modal */}
            <EditLocationModal
                open={editLocationModalOpen}
                onOpenChange={setEditLocationModalOpen}
                place={geocodingError?.place || null}
                onSaveAndRetry={handleSaveAndRetryGeocode}
                isLoading={approvePlaceMutation.isPending}
            />

            {/* Map Preview Dialog */}
            <Dialog open={mapPreviewOpen} onOpenChange={setMapPreviewOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Verify Location Coordinates</DialogTitle>
                        <DialogDescription>
                            Confirm the geocoded location is accurate before approving
                        </DialogDescription>
                    </DialogHeader>
                    {geocodedCoordinates && currentPlaceForPreview && (
                        <CoordinateMapPreview
                            latitude={geocodedCoordinates.latitude}
                            longitude={geocodedCoordinates.longitude}
                            placeName={currentPlaceForPreview.name || ""}
                            address={currentPlaceForPreview.address || ""}
                            onConfirm={handleMapPreviewConfirm}
                            onCancel={handleMapPreviewCancel}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
