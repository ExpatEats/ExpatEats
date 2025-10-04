import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Share2, Check, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareDialogProps {
    buttonVariant?: "default" | "outline" | "ghost";
    buttonSize?: "default" | "sm" | "lg" | "icon";
    buttonText?: string;
    dialogTitle?: string;
    dialogDescription?: string;
}

export const ShareDialog = ({
    buttonVariant = "outline",
    buttonSize = "default",
    buttonText = "Share ExpatEats",
    dialogTitle = "Share ExpatEats",
    dialogDescription = "Invite friends to discover Lisbon's food sources",
}: ShareDialogProps) => {
    const [email, setEmail] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const { toast } = useToast();

    const handleShare = () => {
        if (!email) return;

        setIsSending(true);

        // In a real app, this would call a server endpoint to send the invitation
        setTimeout(() => {
            setIsSending(false);
            setIsSent(true);

            toast({
                title: "Invitation Sent!",
                description: `We've sent an invitation to ${email}`,
            });

            setTimeout(() => {
                setIsSent(false);
                setEmail("");
            }, 2000);
        }, 1000);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant={buttonVariant}
                    size={buttonSize}
                    className="gap-1"
                >
                    <Share2 className="h-4 w-4" />
                    {buttonText}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{dialogTitle}</DialogTitle>
                    <DialogDescription>{dialogDescription}</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                    <div className="flex items-center gap-4">
                        <Mail className="h-5 w-5 text-gray-500" />
                        <Input
                            placeholder="friend@example.com"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1"
                        />
                    </div>
                    <div className="bg-[#F7F4EF] p-4 rounded-md text-sm">
                        <p className="text-gray-700">
                            Your friend will receive an invitation to join
                            ExpatEats and discover food sources in Lisbon that
                            match their dietary preferences.
                        </p>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-500">
                            Or share via:
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() =>
                                    window.open(
                                        `https://wa.me/?text=${encodeURIComponent(`Check out ExpatEats - Your guide to sustainable living in Portugal! ${window.location.origin}`)}`,
                                    )
                                }
                            >
                                <svg
                                    className="h-4 w-4"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                            >
                                <svg
                                    className="h-4 w-4"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                            >
                                <svg
                                    className="h-4 w-4"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                            >
                                <svg
                                    className="h-4 w-4"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109S10 7.388 10 8c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0V16h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548V16z" />
                                </svg>
                            </Button>
                        </div>
                    </div>
                </div>
                <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        type="button"
                        variant="default"
                        onClick={handleShare}
                        disabled={!email || isSending || isSent}
                        className="bg-[#6D9075] hover:bg-[#6D9075]/90 gap-1"
                    >
                        {isSending ? (
                            <>Sending...</>
                        ) : isSent ? (
                            <>
                                <Check className="h-4 w-4" /> Sent!
                            </>
                        ) : (
                            <>Send Invitation</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
