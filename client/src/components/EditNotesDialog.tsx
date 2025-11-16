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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface EditNotesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    initialSoftRating?: string;
    initialMichaelesNotes?: string;
    onConfirm: (softRating: string, michaelesNotes: string) => void;
    isLoading?: boolean;
}

export const EditNotesDialog = ({
    open,
    onOpenChange,
    title,
    description,
    initialSoftRating = "",
    initialMichaelesNotes = "",
    onConfirm,
    isLoading = false,
}: EditNotesDialogProps) => {
    const [softRating, setSoftRating] = useState(initialSoftRating || "none");
    const [michaelesNotes, setMichaelesNotes] = useState(initialMichaelesNotes || "");

    // Update state when initial values change (e.g., when dialog opens with new data)
    useEffect(() => {
        if (open) {
            setSoftRating(initialSoftRating || "none");
            setMichaelesNotes(initialMichaelesNotes || "");
        }
    }, [open, initialSoftRating, initialMichaelesNotes]);

    const handleConfirm = () => {
        // Convert "none" to empty string for database
        const ratingValue = softRating === "none" ? "" : softRating;
        onConfirm(ratingValue, michaelesNotes);
    };

    const handleCancel = () => {
        onOpenChange(false);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(newOpen) => {
                if (!newOpen) {
                    handleCancel();
                } else {
                    onOpenChange(newOpen);
                }
            }}
        >
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && (
                        <DialogDescription>{description}</DialogDescription>
                    )}
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="soft-rating">Soft Rating</Label>
                        <Select
                            value={softRating}
                            onValueChange={setSoftRating}
                        >
                            <SelectTrigger id="soft-rating">
                                <SelectValue placeholder="Select a rating" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="Gold Standard">Gold Standard</SelectItem>
                                <SelectItem value="Great Choice">Great Choice</SelectItem>
                                <SelectItem value="This Will Do in a Pinch">This Will Do in a Pinch</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="michaeles-notes">Michaele's Notes</Label>
                        <Textarea
                            id="michaeles-notes"
                            value={michaelesNotes}
                            onChange={(e) => setMichaelesNotes(e.target.value)}
                            placeholder="Enter any personal notes or observations about this location..."
                            rows={5}
                            className="resize-none"
                        />
                    </div>
                </div>
                <DialogFooter className="flex-row gap-2 justify-center sm:justify-center">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Updating...
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
