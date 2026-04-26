import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NotificationDialog } from "@/components/NotificationDialog";
import { Loader2, Heart } from "lucide-react";

const interestFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    interest: z.enum(
        ["healthy-food", "supplements", "both", "exploring"],
        {
            required_error: "Please select an option",
        }
    ),
    comments: z.string().optional(),
});

type InterestFormValues = z.infer<typeof interestFormSchema>;

export default function Interest() {
    const [, navigate] = useLocation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [notificationConfig, setNotificationConfig] = useState<{
        title: string;
        description?: string;
        variant: "success" | "error" | "warning" | "info";
    }>({
        title: "",
        variant: "success"
    });

    const showNotification = (
        title: string,
        description?: string,
        variant: "success" | "error" | "warning" | "info" = "success"
    ) => {
        setNotificationConfig({ title, description, variant });
        setNotificationOpen(true);
    };

    const form = useForm<InterestFormValues>({
        resolver: zodResolver(interestFormSchema),
        defaultValues: {
            name: "",
            email: "",
            interest: undefined,
            comments: "",
        },
    });

    const onSubmit = async (data: InterestFormValues) => {
        setIsSubmitting(true);

        try {
            // Get CSRF token
            const csrfResponse = await fetch("/api/csrf-token", {
                credentials: "include"
            });
            if (!csrfResponse.ok) {
                throw new Error("Failed to get CSRF token");
            }
            const { csrfToken } = await csrfResponse.json();

            // Submit interest form
            const response = await fetch("/api/interest", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": csrfToken
                },
                credentials: "include",
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to submit interest form");
            }

            // Success
            setSubmitSuccess(true);
            showNotification(
                "Thank You!",
                "We've received your interest. We'll be in touch soon!",
                "success"
            );

            // Redirect to home after 3 seconds
            setTimeout(() => {
                navigate("/");
            }, 3000);
        } catch (error) {
            console.error("Interest form submission error:", error);
            showNotification(
                "Submission Failed",
                error instanceof Error ? error.message : "Failed to submit interest form. Please try again.",
                "error"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const interestOptions = [
        {
            value: "healthy-food",
            label: "Healthy food and groceries",
            description: "I'm looking for quality food sources and grocery options"
        },
        {
            value: "supplements",
            label: "Quality supplements",
            description: "I need help finding reliable supplement sources"
        },
        {
            value: "both",
            label: "Both",
            description: "I'm interested in both food and supplement resources"
        },
        {
            value: "exploring",
            label: "Just exploring",
            description: "I'm browsing to see what's available"
        }
    ];

    // Success state
    if (submitSuccess) {
        return (
            <div className="container mx-auto px-4 pt-24 pb-16 max-w-2xl">
                <Card>
                    <CardHeader>
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-sage/10 mb-4">
                            <Heart className="h-8 w-8 text-sage" />
                        </div>
                        <CardTitle className="text-3xl font-cormorant font-light text-center text-soil">
                            Thank You!
                        </CardTitle>
                        <CardDescription className="text-center text-lg font-outfit">
                            We've received your interest and will be in touch soon.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <p className="text-t2 font-outfit text-center">
                                We're excited to help you find the resources you need in Portugal.
                            </p>
                            <p className="text-sm text-t3 text-center font-outfit">
                                Redirecting you to the homepage...
                            </p>
                            <Button
                                className="w-full bg-bark-lt hover:bg-bark text-white"
                                onClick={() => navigate("/")}
                            >
                                Go to Home
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Interest form
    return (
        <div className="container mx-auto px-4 pt-24 pb-16 max-w-2xl">
            <div className="text-center mb-8">
                <h1 className="font-cormorant text-4xl font-light mb-3 text-soil">
                    Share Your Interest
                </h1>
                <p className="text-xl text-t2 font-outfit max-w-xl mx-auto">
                    Let us know what you're looking for, and we'll help you find the best resources in Portugal.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-cormorant font-light text-soil">
                        Tell Us About Your Needs
                    </CardTitle>
                    <CardDescription className="font-outfit">
                        Fill out this quick form so we can better assist you.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-outfit">Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Your name"
                                                {...field}
                                                className="font-outfit"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-outfit">Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="your.email@example.com"
                                                {...field}
                                                className="font-outfit"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="interest"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="font-outfit text-base">
                                            What are you struggling to find?
                                        </FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className="space-y-3"
                                            >
                                                {interestOptions.map((option) => (
                                                    <div
                                                        key={option.value}
                                                        className="flex items-start space-x-3 border border-mist rounded-lg p-4 hover:border-sage/50 transition-colors"
                                                    >
                                                        <RadioGroupItem
                                                            value={option.value}
                                                            id={option.value}
                                                            className="mt-1"
                                                        />
                                                        <div className="flex-1">
                                                            <Label
                                                                htmlFor={option.value}
                                                                className="font-outfit font-medium cursor-pointer block mb-1"
                                                            >
                                                                {option.label}
                                                            </Label>
                                                            <p className="text-sm text-t2 font-outfit">
                                                                {option.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="comments"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-outfit">
                                            Additional Comments <span className="text-t3 font-normal">(Optional)</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Tell us more about what you're looking for..."
                                                className="font-outfit resize-none"
                                                rows={4}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    className="w-full bg-bark-lt hover:bg-bark text-white font-outfit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit Interest"
                                    )}
                                </Button>
                            </div>

                            <div className="text-center">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="text-sm text-t2 font-outfit hover:text-soil"
                                    onClick={() => navigate("/")}
                                    disabled={isSubmitting}
                                >
                                    Cancel and return to home
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <NotificationDialog
                open={notificationOpen}
                onOpenChange={setNotificationOpen}
                title={notificationConfig.title}
                description={notificationConfig.description}
                variant={notificationConfig.variant}
            />
        </div>
    );
}
