import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, MapPin, CheckCircle2, XCircle } from "lucide-react";
import type { Place } from "@shared/schema";
import { getTagsFromPlace } from "@/lib/tagUtils";

interface EditLocationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    place: Place | null;
    onSaveAndRetry: (updatedPlace: Partial<Place>) => void;
    isLoading?: boolean;
}

const dietaryFeatures = [
    { id: "glutenFree", label: "Gluten Free" },
    { id: "dairyFree", label: "Dairy Free" },
    { id: "nutFree", label: "Nut Free" },
    { id: "vegan", label: "Vegan" },
    { id: "organic", label: "Organic" },
    { id: "localFarms", label: "Local Farms" },
    { id: "freshVegetables", label: "Fresh Vegetables" },
    { id: "farmRaisedMeat", label: "Farm Raised Meat" },
    { id: "noProcessed", label: "No Processed Foods" },
    { id: "kidFriendly", label: "Kid-Friendly" },
    { id: "bulkBuying", label: "Bulk Buying" },
    { id: "zeroWaste", label: "Zero Waste" },
];

export const EditLocationModal = ({
    open,
    onOpenChange,
    place,
    onSaveAndRetry,
    isLoading = false,
}: EditLocationModalProps) => {
    // Basic info state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");

    // Location state
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [region, setRegion] = useState("");
    const [country, setCountry] = useState("");

    // Contact state
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [website, setWebsite] = useState("");
    const [instagram, setInstagram] = useState("");

    // Tags state
    const [tagsInput, setTagsInput] = useState("");

    // Features state
    const [features, setFeatures] = useState<Record<string, boolean>>({});

    // Admin fields state
    const [status, setStatus] = useState("");
    const [softRating, setSoftRating] = useState("");
    const [michaelesNotes, setMichaelesNotes] = useState("");
    const [adminNotes, setAdminNotes] = useState("");

    // Initialize form fields when place changes
    useEffect(() => {
        if (place) {
            // Basic info
            setName(place.name || "");
            setDescription(place.description || "");
            setCategory(place.category || "");

            // Location
            setAddress(place.address || "");
            setCity(place.city || "");
            setRegion(place.region || "");
            setCountry(place.country || "Portugal");

            // Contact
            setPhone(place.phone || "");
            setEmail(place.email || "");
            setWebsite(place.website || "");
            setInstagram(place.instagram || "");

            // Tags
            setTagsInput(getTagsFromPlace(place).join(", ") || "");

            // Features
            const newFeatures: Record<string, boolean> = {};
            dietaryFeatures.forEach(({ id }) => {
                newFeatures[id] = (place as any)[id] || false;
            });
            setFeatures(newFeatures);

            // Admin fields
            setStatus(place.status || "pending");
            setSoftRating(place.softRating || "");
            setMichaelesNotes(place.michaelesNotes || "");
            setAdminNotes(place.adminNotes || "");
        }
    }, [place]);

    const handleFeatureToggle = (featureId: string) => {
        setFeatures((prev) => ({
            ...prev,
            [featureId]: !prev[featureId],
        }));
    };

    const handleSave = () => {
        if (!name.trim() || !description.trim() || !address.trim() || !city.trim() || !country.trim()) {
            return; // Basic validation
        }

        // Parse tags
        const tagsArray = tagsInput
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0);

        // Build update object
        const updateData: Partial<Place> = {
            // Basic info
            name: name.trim(),
            description: description.trim(),
            category: category,
            // Location
            address: address.trim(),
            city: city.trim(),
            region: region.trim() || undefined,
            country: country.trim(),
            // Contact
            phone: phone.trim() || undefined,
            email: email.trim() || undefined,
            website: website.trim() || undefined,
            instagram: instagram.trim() || undefined,
            // Tags
            tags: tagsArray.length > 0 ? tagsArray : undefined,
            // Features
            ...features,
            // Admin fields
            status: status as any,
            softRating: softRating || undefined,
            michaelesNotes: michaelesNotes.trim() || undefined,
            adminNotes: adminNotes.trim() || undefined,
        };

        onSaveAndRetry(updateData);
    };

    const handleCancel = () => {
        // Reset to original values
        if (place) {
            setName(place.name || "");
            setDescription(place.description || "");
            setCategory(place.category || "");
            setAddress(place.address || "");
            setCity(place.city || "");
            setRegion(place.region || "");
            setCountry(place.country || "Portugal");
            setPhone(place.phone || "");
            setEmail(place.email || "");
            setWebsite(place.website || "");
            setInstagram(place.instagram || "");
            setTagsInput(getTagsFromPlace(place).join(", ") || "");
            setStatus(place.status || "pending");
            setSoftRating(place.softRating || "");
            setMichaelesNotes(place.michaelesNotes || "");
            setAdminNotes(place.adminNotes || "");

            const resetFeatures: Record<string, boolean> = {};
            dietaryFeatures.forEach(({ id }) => {
                resetFeatures[id] = (place as any)[id] || false;
            });
            setFeatures(resetFeatures);
        }
        onOpenChange(false);
    };

    if (!place) return null;

    const isFormValid = name.trim() && description.trim() && address.trim() && city.trim() && country.trim() && category;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Location</DialogTitle>
                    <DialogDescription>
                        Update location details. Location changes will trigger automatic re-geocoding.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <Accordion type="multiple" defaultValue={["basic", "location"]} className="w-full">
                        {/* Basic Information */}
                        <AccordionItem value="basic">
                            <AccordionTrigger className="text-lg font-semibold">
                                Basic Information
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        <span className="text-red-600">* </span>
                                        Name
                                    </Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Business or location name"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">
                                        <span className="text-red-600">* </span>
                                        Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe what makes this place special"
                                        className="min-h-[100px]"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">
                                        <span className="text-red-600">* </span>
                                        Category
                                    </Label>
                                    <Select value={category} onValueChange={setCategory} disabled={isLoading}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="market">Market</SelectItem>
                                            <SelectItem value="restaurant">Restaurant</SelectItem>
                                            <SelectItem value="grocery">Grocery Store</SelectItem>
                                            <SelectItem value="community">Community</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Location */}
                        <AccordionItem value="location">
                            <AccordionTrigger className="text-lg font-semibold">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Location
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                                <Alert className="bg-blue-50 border-blue-200">
                                    <Info className="h-4 w-4 text-blue-600" />
                                    <AlertDescription className="text-blue-900 text-sm">
                                        Changing location fields will trigger automatic re-geocoding to update coordinates.
                                    </AlertDescription>
                                </Alert>

                                <div className="space-y-2">
                                    <Label htmlFor="address">
                                        <span className="text-red-600">* </span>
                                        Street Address
                                    </Label>
                                    <Input
                                        id="address"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Rua Example, 123"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="city">
                                            <span className="text-red-600">* </span>
                                            City
                                        </Label>
                                        <Input
                                            id="city"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            placeholder="Lisbon"
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="region">Region (Optional)</Label>
                                        <Input
                                            id="region"
                                            value={region}
                                            onChange={(e) => setRegion(e.target.value)}
                                            placeholder="Lisboa"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="country">
                                        <span className="text-red-600">* </span>
                                        Country
                                    </Label>
                                    <Input
                                        id="country"
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        placeholder="Portugal"
                                        disabled={isLoading}
                                    />
                                </div>

                                {place.latitude && place.longitude && (
                                    <div className="text-xs text-t3 bg-cream-mid p-3 rounded">
                                        <p className="font-medium mb-1">Current Coordinates:</p>
                                        <p>{place.latitude}, {place.longitude}</p>
                                    </div>
                                )}
                            </AccordionContent>
                        </AccordionItem>

                        {/* Contact Information */}
                        <AccordionItem value="contact">
                            <AccordionTrigger className="text-lg font-semibold">
                                Contact Information
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+351 21 123 4567"
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="contact@example.com"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="website">Website</Label>
                                    <Input
                                        id="website"
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        placeholder="https://example.com"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="instagram">Instagram</Label>
                                    <Input
                                        id="instagram"
                                        value={instagram}
                                        onChange={(e) => setInstagram(e.target.value)}
                                        placeholder="@username"
                                        disabled={isLoading}
                                    />
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Tags & Features */}
                        <AccordionItem value="features">
                            <AccordionTrigger className="text-lg font-semibold">
                                Tags & Features
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                                    <Input
                                        id="tags"
                                        value={tagsInput}
                                        onChange={(e) => setTagsInput(e.target.value)}
                                        placeholder="organic, local, sustainable"
                                        disabled={isLoading}
                                    />
                                    <p className="text-xs text-t3">
                                        Separate multiple tags with commas
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <Label>Dietary & Features</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {dietaryFeatures.map(({ id, label }) => (
                                            <div key={id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`feature-${id}`}
                                                    checked={features[id] || false}
                                                    onCheckedChange={() => handleFeatureToggle(id)}
                                                    disabled={isLoading}
                                                />
                                                <label
                                                    htmlFor={`feature-${id}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Admin Fields */}
                        <AccordionItem value="admin">
                            <AccordionTrigger className="text-lg font-semibold">
                                Admin Fields
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={status} onValueChange={setStatus} disabled={isLoading}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                                        Pending
                                                    </Badge>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="approved">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-sage border-sage">
                                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                                        Approved
                                                    </Badge>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="rejected">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-red-600 border-red-600">
                                                        <XCircle className="h-3 w-3 mr-1" />
                                                        Rejected
                                                    </Badge>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="softRating">Soft Rating</Label>
                                    <Select value={softRating} onValueChange={setSoftRating} disabled={isLoading}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select rating (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">None</SelectItem>
                                            <SelectItem value="Gold Standard">Gold Standard</SelectItem>
                                            <SelectItem value="Great Choice">Great Choice</SelectItem>
                                            <SelectItem value="This Will Do in a Pinch">
                                                This Will Do in a Pinch
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="michaelesNotes">Michaele's Notes</Label>
                                    <Textarea
                                        id="michaelesNotes"
                                        value={michaelesNotes}
                                        onChange={(e) => setMichaelesNotes(e.target.value)}
                                        placeholder="Personal notes about this location"
                                        className="min-h-[80px]"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="adminNotes">Admin Notes</Label>
                                    <Textarea
                                        id="adminNotes"
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="Administrative notes (approval/rejection reasons, etc.)"
                                        className="min-h-[80px]"
                                        disabled={isLoading}
                                    />
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={isLoading || !isFormValid}
                        className="bg-bark hover:bg-soil"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
