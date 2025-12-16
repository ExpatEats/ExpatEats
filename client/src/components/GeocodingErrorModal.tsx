import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, MapPinOff, Edit, Trash } from "lucide-react";
import type { Place } from "@shared/schema";

interface GeocodingErrorModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    error: string;
    place: Place | null;
    onApproveWithoutCoords: () => void;
    onEditAndRetry: () => void;
    onRemoveFromPending: () => void;
    isLoading?: boolean;
}

export const GeocodingErrorModal = ({
    open,
    onOpenChange,
    error,
    place,
    onApproveWithoutCoords,
    onEditAndRetry,
    onRemoveFromPending,
    isLoading = false,
}: GeocodingErrorModalProps) => {
    if (!place) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Geocoding Failed
                    </DialogTitle>
                    <DialogDescription>
                        Unable to find coordinates for this location
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <Alert variant="destructive" className="bg-orange-50 border-orange-200">
                        <AlertDescription className="text-orange-900">
                            {error}
                        </AlertDescription>
                    </Alert>

                    <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                        <p className="text-sm font-semibold text-gray-900">
                            {place.name}
                        </p>
                        <p className="text-sm text-gray-600">{place.address}</p>
                        <p className="text-sm text-gray-600">
                            {place.city}
                            {place.region && `, ${place.region}`}
                            {place.country && `, ${place.country}`}
                        </p>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                        <p className="font-medium">What would you like to do?</p>
                        <p className="text-xs">
                            You can approve without coordinates, edit the address and try
                            again, or cancel the approval.
                        </p>
                    </div>
                </div>

                <DialogFooter className="flex-col gap-2 sm:flex-col">
                    <Button
                        onClick={onApproveWithoutCoords}
                        variant="outline"
                        className="w-full justify-start"
                        disabled={isLoading}
                    >
                        <MapPinOff className="mr-2 h-4 w-4" />
                        Approve Without Coordinates
                    </Button>

                    <Button
                        onClick={onEditAndRetry}
                        className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                        disabled={isLoading}
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Location & Retry Geocoding
                    </Button>

                    <Button
                        onClick={onRemoveFromPending}
                        variant="destructive"
                        className="w-full justify-start"
                        disabled={isLoading}
                    >
                        <Trash className="mr-2 h-4 w-4" />
                        Don't Approve (Cancel)
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
