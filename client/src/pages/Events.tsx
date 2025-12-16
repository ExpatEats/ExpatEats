import React, { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
    Calendar,
    MapPin,
    Clock,
    Users,
    Share2,
    Mail,
    Check,
    Loader2,
} from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { SubmissionForm } from "@/components/SubmissionForm";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ShareDialogProps {
    eventTitle: string;
}

const ShareDialog: React.FC<ShareDialogProps> = ({ eventTitle }) => {
    const [email, setEmail] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const { toast } = useToast();

    const handleShare = () => {
        if (!email) return;

        setIsSending(true);

        // Simulate API call to send invitation
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
                <Button variant="outline" size="sm" className="gap-1">
                    <Share2 className="h-4 w-4" />
                    Share
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share This Event</DialogTitle>
                    <DialogDescription>
                        Invite a friend to "{eventTitle}"
                    </DialogDescription>
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
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 9.99 9.99 0 01-3.127 1.195A4.92 4.92 0 0011.78 8.288a13.94 13.94 0 01-10.12-5.128 4.92 4.92 0 001.526 6.57 4.92 4.92 0 01-2.225-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.92 4.92 0 01-2.215.084 4.92 4.92 0 004.6 3.419A9.9 9.9 0 010 19.54a13.94 13.94 0 007.548 2.212c9.142 0 14.307-7.721 13.995-14.646A10.025 10.025 0 0024 4.557z" />
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
                                    <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4c0 3.2-2.6 5.8-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8C2 4.6 4.6 2 7.8 2zm-.2 2C5.61 4 4 5.61 4.02 7.8v8.4c0 2.18 1.62 3.8 3.6 3.8h8.4c1.98 0 3.6-1.62 3.6-3.8V7.8C19.58 5.61 17.97 4 16 4H7.6zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7c2.76 0 5 2.24 5 5s-2.24 5-5 5-5-2.24-5-5 2.24-5 5-5zm0 2c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
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
                        onClick={handleShare}
                        disabled={!email || isSending || isSent}
                        className="gap-1"
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

const EventCard: React.FC<{ event: any }> = ({ event }) => {
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const formattedTime = eventDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    return (
        <Card className="overflow-hidden">
            <div className="h-48 overflow-hidden relative">
                <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                />
                <div className="absolute top-3 right-3 bg-[#6D9075] text-white px-3 py-1 rounded-full text-xs font-medium">
                    {event.category}
                </div>
            </div>

            <CardHeader className="pb-2">
                <CardTitle className="text-xl">{event.title}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 pb-3">
                <p className="text-gray-600 line-clamp-2">
                    {event.description}
                </p>

                <div className="flex flex-col space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{formattedDate}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{formattedTime}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="line-clamp-1">{event.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>
                            {event.organizerName} · {event.organizerRole}
                        </span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="flex justify-between border-t pt-4">
                <Button variant="outline" size="sm">
                    Learn More
                </Button>
                <ShareDialog eventTitle={event.title} />
            </CardFooter>
        </Card>
    );
};

const Events = () => {
    // Fetch events from API
    const { data: events = [], isLoading, error } = useQuery({
        queryKey: ["/api/events"],
    });

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
                    <div>
                        <h1 className="font-montserrat text-3xl font-bold">
                            Community Events
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Connect with other expats and learn about food in
                            Lisbon
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <SubmissionForm
                            type="event"
                            buttonClassName="bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white"
                        />
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center items-center py-16">
                        <Loader2 className="h-12 w-12 animate-spin text-[#6D9075]" />
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center py-16">
                        <p className="text-red-600 mb-4">
                            Failed to load events. Please try again later.
                        </p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && events.length === 0 && (
                    <div className="text-center py-16">
                        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            No Events Yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Be the first to add an event to the community!
                        </p>
                        <SubmissionForm
                            type="event"
                            buttonText="Submit First Event"
                            buttonClassName="bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white"
                        />
                    </div>
                )}

                {/* Events Grid */}
                {!isLoading && !error && events.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event: any) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                )}

                {!isLoading && !error && events.length > 0 && (
                    <div className="mt-10 text-center">
                        <p className="text-lg font-medium text-gray-600 mb-4">
                            Want to contribute to our community?
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <SubmissionForm
                                type="event"
                                buttonText="Submit An Event"
                                buttonClassName="bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white font-medium text-base px-8 py-6"
                            />
                            <Link href="/contact">
                                <Button
                                    size="lg"
                                    className="bg-[#6D9075] hover:bg-[#6D9075]/90"
                                >
                                    Contact Us
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Events;
