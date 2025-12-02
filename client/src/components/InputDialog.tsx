import { useState } from "react";
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

interface InputDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    placeholder?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: (value: string) => void;
    multiline?: boolean;
    required?: boolean;
    isLoading?: boolean;
}

export const InputDialog = ({
    open,
    onOpenChange,
    title,
    description,
    placeholder = "Enter text...",
    confirmText = "Submit",
    cancelText = "Cancel",
    onConfirm,
    multiline = false,
    required = true,
    isLoading = false,
}: InputDialogProps) => {
    const [value, setValue] = useState("");

    const handleConfirm = () => {
        if (required && !value.trim()) {
            return;
        }
        onConfirm(value.trim());
        setValue("");
        onOpenChange(false);
    };

    const handleCancel = () => {
        setValue("");
        onOpenChange(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !multiline && !e.shiftKey) {
            e.preventDefault();
            handleConfirm();
        }
    };

    return (
        <Dialog open={open} onOpenChange={(newOpen) => {
            if (!newOpen) {
                handleCancel();
            } else {
                onOpenChange(newOpen);
            }
        }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && (
                        <DialogDescription>{description}</DialogDescription>
                    )}
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="input-field">
                            {required && <span className="text-red-600">* </span>}
                            {multiline ? "Message" : "Input"}
                        </Label>
                        {multiline ? (
                            <Textarea
                                id="input-field"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder={placeholder}
                                rows={4}
                                autoFocus
                            />
                        ) : (
                            <Input
                                id="input-field"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={placeholder}
                                autoFocus
                            />
                        )}
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
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isLoading || (required && !value.trim())}
                        className="flex-1"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Processing...
                            </>
                        ) : (
                            confirmText
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
