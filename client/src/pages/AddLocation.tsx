import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    MapPin,
    Plus,
    Wheat,
    Cherry,
    Apple,
    Leaf,
    Truck,
    Carrot,
    Egg,
    Package2,
    Baby,
    ShoppingBag,
} from "lucide-react";

const locationSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    description: z
        .string()
        .min(10, { message: "Description must be at least 10 characters" }),
    address: z
        .string()
        .min(5, { message: "Address must be at least 5 characters" }),
    city: z.string().min(2, { message: "City is required" }),
    country: z.string().min(2, { message: "Country is required" }),
    type: z.string().min(1, { message: "Please select a type" }),
    tags: z.array(z.string()).default([]),
    imageUrl: z.string().url().optional().or(z.literal("")),
});

type LocationFormValues = z.infer<typeof locationSchema>;

const availableTags = [
    { id: "gluten-free", label: "Gluten-Free", icon: Wheat },
    { id: "dairy-free", label: "Dairy-Free", icon: Cherry },
    { id: "nut-free", label: "Nut-Free", icon: Apple },
    { id: "vegan", label: "Vegan", icon: Leaf },
    { id: "organic", label: "Bio/Organic", icon: Apple },
    { id: "local-farms", label: "Local Farms", icon: Truck },
    { id: "fresh-vegetables", label: "Fresh Vegetables", icon: Carrot },
    { id: "farm-raised-meat", label: "Farm-Raised Meat", icon: Egg },
    { id: "no-processed", label: "No Processed Foods", icon: Package2 },
    { id: "kid-friendly", label: "Kid-Friendly Snacks", icon: Baby },
    { id: "bulk-buying", label: "Bulk Buying Options", icon: ShoppingBag },
    { id: "zero-waste", label: "Zero Waste Packaging", icon: Leaf },
];

export default function AddLocation() {
    const { toast } = useToast();
    const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
    const [selectedCountry, setSelectedCountry] = React.useState<string>("");

    // Fetch cities from API
    const { data: cities = [], isLoading: citiesLoading } = useQuery<{id: number, name: string, slug: string, country: string}[]>({
        queryKey: ["/api/cities"],
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

    const form = useForm<LocationFormValues>({
        resolver: zodResolver(locationSchema),
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

    const addLocationMutation = useMutation({
        mutationFn: async (values: LocationFormValues) => {
            // Format values to match API expectations
            const { type, ...restValues } = values;
            const formattedValues = {
                ...restValues,
                category: type,
                tags: selectedTags,
            };

            console.log("Submitting location data:", formattedValues);
            return await apiRequest("POST", "/api/places", formattedValues);
        },
        onSuccess: () => {
            toast({
                title: "Submission Received!",
                description: "Your location has been submitted for admin approval. It will appear on the site once reviewed.",
            });
            form.reset();
            setSelectedTags([]);
            queryClient.invalidateQueries({ queryKey: ["/api/places"] });
        },
        onError: (error) => {
            console.error("Location submission error:", error);
            toast({
                title: "Error",
                description: `Failed to add location: ${error.message}`,
                variant: "destructive",
            });
        },
    });

    const onSubmit = (values: LocationFormValues) => {
        addLocationMutation.mutate(values);
    };

    const handleTagChange = (tag: string, checked: boolean) => {
        setSelectedTags((prev) =>
            checked ? [...prev, tag] : prev.filter((t) => t !== tag),
        );
    };

    React.useEffect(() => {
        form.setValue("tags", selectedTags);
    }, [selectedTags, form]);

    return (
        <div className="container mx-auto py-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#E07A5F]/10 mb-4">
                        <Plus className="h-6 w-6 text-[#E07A5F]" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        Add a Location
                    </h1>
                    <p className="text-gray-600">
                        Help other expats by sharing a great food source or
                        location you've discovered
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-[#E07A5F]" />
                            Location Details
                        </CardTitle>
                        <CardDescription>
                            Enter information about a food source, market, or
                            helpful location
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g., Celeiro Dieta"
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
                                                <FormLabel>Type *</FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Supermarket">
                                                            Supermarket
                                                        </SelectItem>
                                                        <SelectItem value="Health Food Store">
                                                            Health Food Store
                                                        </SelectItem>
                                                        <SelectItem value="Market">
                                                            Market
                                                        </SelectItem>
                                                        <SelectItem value="Pharmacy">
                                                            Pharmacy
                                                        </SelectItem>
                                                        <SelectItem value="Specialty Store">
                                                            Specialty Store
                                                        </SelectItem>
                                                        <SelectItem value="Restaurant">
                                                            Restaurant
                                                        </SelectItem>
                                                        <SelectItem value="Cafe">
                                                            Cafe
                                                        </SelectItem>
                                                        <SelectItem value="Farm">
                                                            Farm
                                                        </SelectItem>
                                                        <SelectItem value="Other">
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
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description *</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Describe what makes this place special, what they offer, etc."
                                                    className="min-h-[100px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Address *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Full address"
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
                                        name="country"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Country *</FormLabel>
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
                                                <FormLabel>City *</FormLabel>
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
                                                    placeholder="https://example.com/image.jpg"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div>
                                    <FormLabel className="text-base font-medium">
                                        Tags
                                    </FormLabel>
                                    <p className="text-sm text-gray-600 mb-3">
                                        Select all that apply to help others
                                        find this location
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {availableTags.map((tag) => {
                                            const IconComponent = tag.icon;
                                            return (
                                                <div
                                                    key={tag.id}
                                                    className="flex items-center space-x-2"
                                                >
                                                    <Checkbox
                                                        id={tag.id}
                                                        checked={selectedTags.includes(
                                                            tag.id,
                                                        )}
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            handleTagChange(
                                                                tag.id,
                                                                checked as boolean,
                                                            )
                                                        }
                                                    />
                                                    <label
                                                        htmlFor={tag.id}
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <IconComponent className="h-4 w-4 text-[#E07A5F]" />
                                                        {tag.label}
                                                    </label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white"
                                    disabled={addLocationMutation.isPending}
                                >
                                    {addLocationMutation.isPending
                                        ? "Adding Location..."
                                        : "Add Location"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
