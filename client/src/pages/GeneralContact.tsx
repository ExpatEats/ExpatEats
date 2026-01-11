import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Mail, MessageSquare } from "lucide-react";

const contactFormSchema = z.object({
    name: z.string().min(2, { message: "Name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    subject: z.string().min(3, { message: "Subject is required" }),
    message: z.string().min(10, { message: "Message must be at least 10 characters" }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const GeneralContact = () => {
    const [submitted, setSubmitted] = useState(false);

    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            name: "",
            email: "",
            subject: "",
            message: "",
        },
    });

    const onSubmit = (values: ContactFormValues) => {
        console.log("Form submitted:", values);
        // In a real app, this would send the data to a backend
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-2xl">
                <Card className="border shadow-lg">
                    <CardContent className="pt-8 pb-8 px-6 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-green-100 rounded-full">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold font-montserrat mb-4">
                            Thank You!
                        </h2>
                        <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                            Your message has been sent successfully. We'll get back to you as soon as possible.
                        </p>
                        <Button
                            onClick={() => setSubmitted(false)}
                            className="bg-primary hover:bg-primary/90 text-white rounded-full"
                        >
                            Send Another Message
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-primary/10 rounded-full">
                    <Mail className="h-8 w-8 text-primary" />
                </div>
                <h1 className="font-montserrat text-3xl md:text-4xl font-bold mb-3">
                    Contact Us
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Have a question or feedback? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                </p>
            </div>

            <Card className="shadow-lg">
                <CardHeader className="bg-primary/5 border-b">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Send us a message
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-6">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Your Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter your name"
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
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="Enter your email"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="subject"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subject</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="What is this about?"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="message"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Your Message</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Tell us what's on your mind..."
                                                className="min-h-32 resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6 text-lg"
                            >
                                Send Message
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <div className="mt-8 text-center">
                <p className="text-gray-600 text-sm">
                    Looking for meal planning services?{" "}
                    <a href="/contact" className="text-primary hover:underline font-medium">
                        Visit our Meal Planning & Support page
                    </a>
                </p>
            </div>
        </div>
    );
};

export default GeneralContact;
