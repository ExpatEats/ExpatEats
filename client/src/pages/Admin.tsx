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
import { useToast } from "@/hooks/use-toast";
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
import {
    Users,
    Mail,
    MapPin,
    User,
    LogOut,
    Clock,
    CheckCircle,
    XCircle,
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
});

type FoodSourceFormValues = z.infer<typeof foodSourceSchema>;

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

interface User {
    id: number;
    username: string;
    email: string;
    name?: string;
    city?: string;
    country?: string;
    bio?: string;
}

export default function Admin() {
    // All hooks must be declared first
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
    const { user, isAuthenticated, logout, isLoading } = useAuth();

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
        },
    });

    const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
        queryKey: ["/api/users"],
        enabled: isAuthenticated && user?.role === "admin",
    });

    const { data: pendingPlaces = [], refetch: refetchPending } = useQuery({
        queryKey: ["/api/admin/pending-places"],
        enabled: isAuthenticated && user?.role === "admin",
    });

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
            toast({
                title: "Food source added",
                description: "Your submission has been added successfully",
            });
            form.reset();
            setSelectedTags([]);
            queryClient.invalidateQueries({ queryKey: ["/api/places"] });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: "Failed to add food source. Please try again.",
                variant: "destructive",
            });
        },
    });

    const approvePlaceMutation = useMutation({
        mutationFn: async ({
            placeId,
            adminNotes,
        }: {
            placeId: number;
            adminNotes?: string;
        }) => {
            return await apiRequest(
                "POST",
                `/api/admin/approve-place/${placeId}`,
                { adminNotes },
            );
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Location approved successfully",
            });
            refetchPending();
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: `Failed to approve location: ${error.message}`,
                variant: "destructive",
            });
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
            toast({
                title: "Success",
                description: "Location rejected successfully",
            });
            refetchPending();
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: `Failed to reject location: ${error.message}`,
                variant: "destructive",
            });
        },
    });

    // Effects and handlers
    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                setLocation("/register");
                return;
            }
            if (user?.role !== "admin") {
                setLocation("/find-my-food");
                toast({
                    title: "Access Denied",
                    description: "Admin privileges required to access this page.",
                    variant: "destructive",
                });
                return;
            }
        }
    }, [isAuthenticated, user, isLoading, setLocation, toast]);

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
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    Admin Panel
                </h1>
                <p className="text-gray-600 mb-4">
                    Manage food sources and view registered users.
                </p>
                <div className="flex justify-center">
                    <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="border-[#E07A5F] text-[#E07A5F] hover:bg-[#E07A5F] hover:text-white"
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </div>

            {/* Pending Location Reviews */}
            <Card className="w-full mb-8">
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
                                            onClick={() =>
                                                approvePlaceMutation.mutate({
                                                    placeId: place.id,
                                                })
                                            }
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
                                                const reason = prompt(
                                                    "Please provide a reason for rejection:",
                                                );
                                                if (reason) {
                                                    rejectPlaceMutation.mutate({
                                                        placeId: place.id,
                                                        adminNotes: reason,
                                                    });
                                                }
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

            {/* User Management Section */}
            <Card className="w-full mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-[#E07A5F]" />
                        User Management
                    </CardTitle>
                    <CardDescription>
                        View all registered users and their information
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {usersLoading ? (
                        <div className="text-center py-4">Loading users...</div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                            No users registered yet
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {users.map((user) => (
                                <div
                                    key={user.id}
                                    className="border border-gray-200 rounded-lg p-4"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-[#94AF9F]" />
                                            <span className="font-medium text-gray-900">
                                                {user.username}
                                            </span>
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className="text-xs"
                                        >
                                            ID: {user.id}
                                        </Badge>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        {user.name && (
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-700">
                                                    Name:
                                                </span>
                                                <span className="text-gray-600">
                                                    {user.name}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2">
                                            <Mail className="h-3 w-3 text-gray-400" />
                                            <span className="text-gray-600 text-xs">
                                                {user.email}
                                            </span>
                                        </div>

                                        {(user.city || user.country) && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-3 w-3 text-gray-400" />
                                                <span className="text-gray-600 text-xs">
                                                    {[user.city, user.country]
                                                        .filter(Boolean)
                                                        .join(", ")}
                                                </span>
                                            </div>
                                        )}

                                        {user.bio && (
                                            <div className="pt-2">
                                                <span className="text-xs text-gray-500 line-clamp-2">
                                                    {user.bio}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="w-full max-w-3xl mx-auto">
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
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="City"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Country</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Country"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

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
        </div>
    );
}
