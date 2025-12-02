import { useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

interface NotificationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    variant?: "success" | "error" | "warning" | "info";
    autoClose?: number; // Auto-close after X milliseconds
}

export const NotificationDialog = ({
    open,
    onOpenChange,
    title,
    description,
    variant = "success",
    autoClose = 2000,
}: NotificationDialogProps) => {
    useEffect(() => {
        if (open && autoClose) {
            const timer = setTimeout(() => {
                onOpenChange(false);
            }, autoClose);

            return () => clearTimeout(timer);
        }
    }, [open, autoClose, onOpenChange]);

    const getIcon = () => {
        switch (variant) {
            case "success":
                return <CheckCircle className="h-12 w-12 text-[#6D9075] mx-auto mb-4" />;
            case "error":
                return <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />;
            case "warning":
                return <AlertCircle className="h-12 w-12 text-[#E07A5F] mx-auto mb-4" />;
            case "info":
                return <Info className="h-12 w-12 text-blue-600 mx-auto mb-4" />;
        }
    };

    const getTitleColor = () => {
        switch (variant) {
            case "success":
                return "text-[#6D9075]";
            case "error":
                return "text-red-600";
            case "warning":
                return "text-[#E07A5F]";
            case "info":
                return "text-blue-600";
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center">
                    {getIcon()}
                    <DialogTitle className={`text-center text-xl ${getTitleColor()}`}>
                        {title}
                    </DialogTitle>
                    {description && (
                        <DialogDescription className="text-center pt-2">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};
