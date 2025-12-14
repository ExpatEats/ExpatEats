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
import { Label } from "@/components/ui/label";
import type { Place } from "@shared/schema";

interface EditLocationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    place: Place | null;
    onSaveAndRetry: (updatedPlace: Partial<Place>) => void;
    isLoading?: boolean;
}

export const EditLocationModal = ({
    open,
    onOpenChange,
    place,
    onSaveAndRetry,
    isLoading = false,
}: EditLocationModalProps) => {
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [region, setRegion] = useState("");
    const [country, setCountry] = useState("");

    // Initialize form fields when place changes
    useEffect(() => {
        if (place) {
            setAddress(place.address || "");
            setCity(place.city || "");
            setRegion(place.region || "");
            setCountry(place.country || "Portugal");
        }
    }, [place]);

    const handleSave = () => {
        if (!address.trim() || !city.trim() || !country.trim()) {
            return; // Basic validation
        }

        onSaveAndRetry({
            address: address.trim(),
            city: city.trim(),
            region: region.trim() || undefined,
            country: country.trim(),
        });
    };

    const handleCancel = () => {
        // Reset to original values
        if (place) {
            setAddress(place.address || "");
            setCity(place.city || "");
            setRegion(place.region || "");
            setCountry(place.country || "Portugal");
        }
        onOpenChange(false);
    };

    if (!place) return null;

    const isFormValid = address.trim() && city.trim() && country.trim();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit Location Details</DialogTitle>
                    <DialogDescription>
                        Update the address information and try geocoding again
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
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
                            autoFocus
                        />
                    </div>

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

                    <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
                        <p className="font-medium text-blue-900 mb-1">Tip:</p>
                        <p className="text-blue-800">
                            Be as specific as possible with the address. Include street
                            name, building number, and any other relevant details to
                            improve geocoding accuracy.
                        </p>
                    </div>
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
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                            </>
                        ) : (
                            "Save & Retry Geocoding"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
