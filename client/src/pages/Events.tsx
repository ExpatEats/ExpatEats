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
    X,
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

// Example event data - in a real app this would come from the backend
const events = [
    {
        id: 1,
        title: "Organic Market Tour in Principe Real",
        description:
            "Join us for a guided tour of the Mercado Biológico do Principe Real. Learn how to select the best organic produce and meet local farmers.",
        date: "2025-06-01T10:00:00",
        location: "Principe Real Garden, Lisbon",
        organizerName: "Maria Santos",
        organizerRole: "Local Food Guide",
        category: "Market Tour",
        imageUrl:
            "https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    },
    {
        id: 2,
        title: "Zero Waste Shopping Workshop",
        description:
            "Learn practical tips for shopping without plastic and reducing food waste. We'll visit Maria Granel and other zero waste shops in central Lisbon.",
        date: "2025-06-15T14:00:00",
        location: "Maria Granel, Rua da Assunção 7, Lisbon",
        organizerName: "João Silva",
        organizerRole: "Zero Waste Advocate",
        category: "Workshop",
        imageUrl:
            "https://images.unsplash.com/photo-1579113800032-c38bd7635818?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    },
    {
        id: 3,
        title: "Expat Dinner: Portuguese Cuisine with Dietary Adaptations",
        description:
            "Join fellow expats for a community dinner featuring traditional Portuguese dishes adapted for various dietary needs (gluten-free, vegan, etc.).",
        date: "2025-06-20T19:00:00",
        location: "Community Kitchen, Av. Almirante Reis 45, Lisbon",
        organizerName: "ExpatEats Community",
        organizerRole: "Community Organization",
        category: "Social",
        imageUrl:
            "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    },
];

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
    const [showAddEventForm, setShowAddEventForm] = useState(false);
    const [eventForm, setEventForm] = useState({
        name: "",
        location: "",
        date: "",
        time: "",
        description: "",
        infoLink: "",
    });
    const { toast } = useToast();

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setEventForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmitEvent = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would call an API to save the event
        toast({
            title: "Event Submitted",
            description: "Your event has been submitted for review.",
        });
        setShowAddEventForm(false);
        setEventForm({
            name: "",
            location: "",
            date: "",
            time: "",
            description: "",
            infoLink: "",
        });
    };

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
                        <div className="inline-flex items-center bg-[#6D9075] text-white px-3 py-1 rounded-full text-sm font-semibold">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>PORTUGAL</span>
                        </div>
                    </div>
                </div>

                {showAddEventForm && (
                    <Card className="mb-8 shadow-md">
                        <CardHeader className="bg-gray-50 border-b">
                            <CardTitle className="text-xl">
                                Add New Community Event
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form
                                onSubmit={handleSubmitEvent}
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label
                                            htmlFor="name"
                                            className="block text-sm font-medium"
                                        >
                                            Event Name
                                        </label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={eventForm.name}
                                            onChange={handleInputChange}
                                            placeholder="E.g., Organic Market Tour"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            htmlFor="location"
                                            className="block text-sm font-medium"
                                        >
                                            Location
                                        </label>
                                        <Input
                                            id="location"
                                            name="location"
                                            value={eventForm.location}
                                            onChange={handleInputChange}
                                            placeholder="E.g., Mercado Biológico, Principe Real"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            htmlFor="date"
                                            className="block text-sm font-medium"
                                        >
                                            Date
                                        </label>
                                        <Input
                                            id="date"
                                            name="date"
                                            type="date"
                                            value={eventForm.date}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            htmlFor="time"
                                            className="block text-sm font-medium"
                                        >
                                            Time
                                        </label>
                                        <Input
                                            id="time"
                                            name="time"
                                            type="time"
                                            value={eventForm.time}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="description"
                                        className="block text-sm font-medium"
                                    >
                                        Short Description
                                    </label>
                                    <Input
                                        id="description"
                                        name="description"
                                        value={eventForm.description}
                                        onChange={handleInputChange}
                                        placeholder="A brief description of the event"
                                        className="h-20"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="infoLink"
                                        className="block text-sm font-medium"
                                    >
                                        Link to More Info (Optional)
                                    </label>
                                    <Input
                                        id="infoLink"
                                        name="infoLink"
                                        type="url"
                                        value={eventForm.infoLink}
                                        onChange={handleInputChange}
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setShowAddEventForm(false)
                                        }
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-[#6D9075] hover:bg-[#6D9075]/90 text-white"
                                    >
                                        Submit Event
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>

                <div className="mt-10 text-center">
                    <p className="text-lg font-medium text-gray-600 mb-4">
                        Want to contribute to our community?
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button
                            onClick={() => setShowAddEventForm(true)}
                            size="lg"
                            className="bg-[#F5A623] hover:bg-[#F5A623]/90 text-white font-medium"
                        >
                            Add Event
                        </Button>
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
            </div>
        </div>
    );
};

export default Events;
