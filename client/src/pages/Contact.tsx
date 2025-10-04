import { useState, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Apple, Users, Calendar } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const contactFormSchema = z.object({
    name: z.string().min(2, { message: "Name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    preferences: z.array(z.string()).optional(),
    message: z
        .string()
        .min(10, { message: "Please describe your dietary goals" }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const Contact = () => {
    const [submitted, setSubmitted] = useState(false);
    const [savedPreferences, setSavedPreferences] = useState<string[]>([]);

    // Get saved preferences from localStorage on mount
    useEffect(() => {
        const preferences = localStorage.getItem("dietaryPreferences");
        if (preferences) {
            const parsedPreferences = JSON.parse(preferences);
            setSavedPreferences(parsedPreferences);
        }
    }, []);

    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            name: "",
            email: "",
            preferences: [],
            message: "",
        },
    });

    // Update form preferences when saved preferences are loaded
    useEffect(() => {
        if (savedPreferences.length > 0) {
            form.setValue("preferences", savedPreferences);
        }
    }, [savedPreferences, form]);

    const onSubmit = (values: ContactFormValues) => {
        console.log("Form submitted:", values);
        // In a real app, this would send the data to a backend
        setSubmitted(true);
    };

    // Available preferences list
    const dietaryPreferences = [
        { id: "gluten-free", label: "Gluten-Free" },
        { id: "dairy-free", label: "Dairy-Free" },
        { id: "nut-free", label: "Nut-Free" },
        { id: "vegan", label: "Vegan" },
        { id: "bio-organic", label: "Bio/Organic" },
        { id: "local-farms", label: "Local Farms" },
        { id: "fresh-vegetables", label: "Fresh Vegetables" },
        { id: "farm-raised-meat", label: "Farm-Raised Meat" },
        { id: "no-processed-foods", label: "No Processed Foods" },
        { id: "kid-friendly-snacks", label: "Kid-Friendly Snacks" },
        { id: "bulk-buying-options", label: "Bulk Buying Options" },
        { id: "zero-waste-packaging", label: "Zero Waste Packaging" },
    ];

    if (submitted) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <Card className="border shadow-lg">
                    <CardContent className="pt-8 pb-8 px-6 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-green-100 rounded-full">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold font-montserrat mb-4">
                            Thank You!
                        </h2>
                        <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                            Your meal planning consultation request has been
                            submitted. Our holistic nutritionist will contact
                            you shortly to help you build a pantry and plan
                            meals aligned with your dietary preferences.
                        </p>
                        <Button
                            onClick={() => setSubmitted(false)}
                            className="bg-primary hover:bg-primary/90 text-white rounded-full"
                        >
                            Submit Another Request
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="text-center mb-8">
                <h1 className="font-montserrat text-3xl md:text-4xl font-bold mb-3">
                    Holistic Pantry & Meal Planning Support
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    We know how hard it is to eat well when you relocate. Let
                    our in-house holistic nutritionist help you build a pantry
                    and plan meals aligned with your diet.
                </p>
            </div>

            <div className="grid md:grid-cols-12 gap-8">
                <div className="md:col-span-5">
                    <Card className="h-full">
                        <CardContent className="p-6">
                            <h2 className="text-xl font-bold font-montserrat mb-4">
                                Our Services Include:
                            </h2>

                            <div className="space-y-6 mb-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 p-3 rounded-full">
                                        <Apple className="text-primary h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium mb-1">
                                            Pantry Setup Guide
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            Personalized recommendations for
                                            stocking your kitchen based on your
                                            dietary needs and local
                                            availability.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 p-3 rounded-full">
                                        <Calendar className="text-primary h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium mb-1">
                                            Weekly Meal Plans
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            Customized meal plans that
                                            incorporate local ingredients while
                                            meeting your family's dietary
                                            preferences.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 p-3 rounded-full">
                                        <Users className="text-primary h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium mb-1">
                                            Shopping Guidance
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            Virtual or in-person shopping
                                            assistance to help you navigate
                                            local markets and stores
                                            effectively.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator className="my-6" />

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-medium mb-2">
                                    Why Choose Our Service?
                                </h3>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li className="flex items-start">
                                        <span className="text-primary mr-2">
                                            •
                                        </span>
                                        <span>
                                            Specialized knowledge of local food
                                            options in Lisbon
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-primary mr-2">
                                            •
                                        </span>
                                        <span>
                                            Experience helping expat families
                                            adjust to new food environments
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-primary mr-2">
                                            •
                                        </span>
                                        <span>
                                            Holistic approach that considers
                                            nutrition, budget, and lifestyle
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-7">
                    <Card>
                        <CardHeader className="bg-primary/10 border-b">
                            <CardTitle className="text-xl">
                                Contact Our Nutritionist
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
                                                <FormLabel>
                                                    Email Address
                                                </FormLabel>
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

                                    <div>
                                        <h3 className="text-sm font-medium mb-3">
                                            Dietary Preferences
                                        </h3>
                                        <p className="text-gray-500 text-sm mb-3">
                                            {savedPreferences.length > 0
                                                ? "These are based on your profile. Adjust if needed."
                                                : "Select all that apply:"}
                                        </p>

                                        <div className="grid grid-cols-2 gap-3">
                                            {dietaryPreferences.map(
                                                (preference) => (
                                                    <div
                                                        key={preference.id}
                                                        className="flex items-center space-x-2"
                                                    >
                                                        <Checkbox
                                                            id={`form-${preference.id}`}
                                                            checked={form
                                                                .watch(
                                                                    "preferences",
                                                                )
                                                                ?.includes(
                                                                    preference.id,
                                                                )}
                                                            onCheckedChange={(
                                                                checked,
                                                            ) => {
                                                                const currentPrefs =
                                                                    form.watch(
                                                                        "preferences",
                                                                    ) || [];
                                                                if (checked) {
                                                                    form.setValue(
                                                                        "preferences",
                                                                        [
                                                                            ...currentPrefs,
                                                                            preference.id,
                                                                        ],
                                                                    );
                                                                } else {
                                                                    form.setValue(
                                                                        "preferences",
                                                                        currentPrefs.filter(
                                                                            (
                                                                                p,
                                                                            ) =>
                                                                                p !==
                                                                                preference.id,
                                                                        ),
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        <Label
                                                            htmlFor={`form-${preference.id}`}
                                                            className="text-sm"
                                                        >
                                                            {preference.label}
                                                        </Label>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium mb-3">
                                            Services Needed
                                        </h3>
                                        <p className="text-gray-500 text-sm mb-3">
                                            Select the services you're
                                            interested in:
                                        </p>

                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="service-pantry"
                                                    onCheckedChange={() => {}}
                                                />
                                                <Label
                                                    htmlFor="service-pantry"
                                                    className="text-sm font-medium"
                                                >
                                                    Pantry Setup Guide
                                                </Label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="service-meal-plans"
                                                    onCheckedChange={() => {}}
                                                />
                                                <Label
                                                    htmlFor="service-meal-plans"
                                                    className="text-sm font-medium"
                                                >
                                                    Weekly Meal Plans
                                                </Label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="service-shopping"
                                                    onCheckedChange={() => {}}
                                                />
                                                <Label
                                                    htmlFor="service-shopping"
                                                    className="text-sm font-medium"
                                                >
                                                    Shopping Guidance
                                                </Label>
                                            </div>
                                        </div>
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="message"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Your Message
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Tell us about your specific needs and challenges..."
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
                                        Submit Request
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Nutritionist Profile Section */}
            <div className="mt-16 mb-10">
                <div className="text-center mb-8">
                    <h2 className="font-montserrat text-2xl md:text-3xl font-bold mb-3">
                        Meet Our Lisbon-Based Holistic Nutritionist
                    </h2>
                    <div className="w-24 h-1 bg-primary mx-auto mb-4"></div>
                </div>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="md:flex">
                        <div className="md:w-1/3">
                            <img
                                src="https://www.michaelekruger.com/wp-content/uploads/2023/08/logo_michaela_kruger.png"
                                alt="Michaele Kruger - Holistic Nutritionist"
                                className="w-full object-cover p-8"
                            />
                        </div>
                        <div className="md:w-2/3 p-8">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                Michaele Kruger
                            </h3>
                            <p className="text-primary font-semibold mb-4">
                                Holistic Nutritionist based in Lisbon
                            </p>

                            <p className="text-gray-600 mb-4">
                                Michaele is a holistic nutritionist who
                                specializes in helping expats adapt to the local
                                food environment. With extensive knowledge of
                                Portuguese markets and food sources, she
                                provides personalized guidance for nutrition
                                plans that work with your lifestyle and dietary
                                requirements.
                            </p>

                            <p className="text-gray-600 mb-6">
                                Her holistic approach focuses on overall
                                wellness, connecting nutritional choices with
                                physical health and emotional wellbeing.
                                Michaele helps you find the right balance for
                                your specific nutritional needs in your new
                                home.
                            </p>

                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <span className="font-semibold w-32">
                                        Specialties:
                                    </span>
                                    <span className="text-gray-600">
                                        Holistic Nutrition, Food Intolerances,
                                        Digestive Health
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <span className="font-semibold w-32">
                                        Languages:
                                    </span>
                                    <span className="text-gray-600">
                                        English
                                    </span>
                                </div>
                            </div>

                            <a
                                href="https://www.michaelekruger.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mt-6 bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-6 rounded-full"
                            >
                                Visit Michaele's Website
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
