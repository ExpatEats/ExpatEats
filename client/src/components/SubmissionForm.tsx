import React from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const submissionSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Please enter a valid email"),
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z
        .string()
        .min(20, "Description must be at least 20 characters"),
    location: z.string().min(3, "Location is required"),
    website: z
        .string()
        .url("Please enter a valid website URL")
        .optional()
        .or(z.literal("")),
});

type SubmissionFormValues = z.infer<typeof submissionSchema>;

interface SubmissionFormProps {
    type: "event" | "location";
    buttonText?: string;
    buttonClassName?: string;
}

export function SubmissionForm({
    type,
    buttonText,
    buttonClassName,
}: SubmissionFormProps) {
    const { toast } = useToast();
    const [open, setOpen] = React.useState(false);

    const form = useForm<SubmissionFormValues>({
        resolver: zodResolver(submissionSchema),
        defaultValues: {
            name: "",
            email: "",
            title: "",
            description: "",
            location: "",
            website: "",
        },
    });

    const submissionMutation = useMutation({
        mutationFn: async (values: SubmissionFormValues) => {
            return await apiRequest(`/api/submissions`, "POST", {
                ...values,
                type,
                submittedAt: new Date().toISOString(),
            });
        },
        onSuccess: () => {
            toast({
                title: "Submission Sent!",
                description: `Your ${type} submission has been sent for review.`,
            });
            setOpen(false);
            form.reset();
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: `Failed to submit ${type}. Please try again.`,
                variant: "destructive",
            });
        },
    });

    function onSubmit(data: SubmissionFormValues) {
        submissionMutation.mutate(data);
    }

    const defaultButtonText = type === "event" ? "Add Event" : "Add Location";
    const dialogTitle =
        type === "event" ? "Submit New Event" : "Submit New Location";
    const dialogDescription =
        type === "event"
            ? "Share an event that would benefit the expat community in Portugal."
            : "Suggest a food source or sustainable business for our directory.";

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className={
                        buttonClassName ||
                        "bg-accent hover:bg-accent/90 text-white"
                    }
                >
                    <Plus className="h-4 w-4 mr-2" />
                    {buttonText || defaultButtonText}
                </Button>
            </DialogTrigger>
            <DialogContent
                className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
                aria-describedby="submission-dialog-description"
            >
                <DialogHeader>
                    <DialogTitle id="submission-dialog-title">
                        {dialogTitle}
                    </DialogTitle>
                    <DialogDescription id="submission-dialog-description">
                        {dialogDescription}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Your Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Your full name"
                                                {...field}
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
                                        <FormLabel>Your Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="your.email@example.com"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {type === "event"
                                            ? "Event Name"
                                            : "Business/Location Name"}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={
                                                type === "event"
                                                    ? "Name of the event"
                                                    : "Name of the business or location"
                                            }
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={
                                                type === "event"
                                                    ? "Describe the event, date, time, and why it would benefit expats..."
                                                    : "Describe what makes this location special, products offered, sustainability practices..."
                                            }
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="City, address, or area"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="website"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Website (Optional)
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="https://website.com"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submissionMutation.isPending}
                                className="bg-accent hover:bg-accent/90 text-white"
                            >
                                {submissionMutation.isPending
                                    ? "Submitting..."
                                    : "Submit"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
