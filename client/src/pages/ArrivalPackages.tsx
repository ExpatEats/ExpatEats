import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Check,
    Package,
    MapPin,
    Home,
    ShoppingBag,
    MessageCircle,
    Calendar,
    Mail,
    Users,
    Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

interface ContactData {
    packageType: string;
    email: string;
    message?: string;
}

const ArrivalPackages: React.FC = () => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [selectedPackage, setSelectedPackage] = useState<string>("");
    const [formData, setFormData] = useState({
        email: user?.email || "",
        message: "",
    });

    const contactMutation = useMutation({
        mutationFn: async (data: ContactData) => {
            const csrfResponse = await fetch("/api/csrf-token", {
                method: "GET",
                credentials: "include",
            });

            if (!csrfResponse.ok) {
                throw new Error("Failed to get security token");
            }

            const { csrfToken } = await csrfResponse.json();

            const response = await fetch("/api/arrival-packages/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": csrfToken,
                },
                credentials: "include",
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Failed to send request");
            }

            return response.json();
        },
        onSuccess: () => {
            toast({
                title: "Request Sent!",
                description:
                    "We'll contact you within 24 hours to schedule your welcome call.",
            });
            setSelectedPackage("");
            setFormData({ email: user?.email || "", message: "" });
        },
        onError: () => {
            toast({
                title: "Request Failed",
                description: "Please try again or contact support directly.",
                variant: "destructive",
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPackage) {
            toast({
                title: "Please Select a Package",
                description: "Choose a package option before submitting.",
                variant: "destructive",
            });
            return;
        }

        contactMutation.mutate({
            packageType: selectedPackage,
            email: formData.email,
            message: formData.message,
        });
    };

    const allPackagesInclude = [
        "Curated pantry starter kit based on your lifestyle/diet preferences",
        "Local grocery products and organic staples",
        "Wellness-focused home goods (filtered water pitcher, clean personal care items, local herbal teas, etc.)",
        "Welcome guide with Expat Eats' favorite local vendors, restaurants, and delivery options",
        "Printed map of local markets and organic stores",
        "Free access to the Expat Eats App",
        "WhatsApp support for 1 week after arrival",
    ];

    const packages = [
        {
            id: "essential",
            name: "Essential Package",
            price: 295,
            tagline: "A fresh, functional start for your new life",
            features: [
                "Pantry Starter Kit (basic dry goods, oils, snacks & breakfast staples)",
                "Printed Welcome Guide & Local Market Map",
                "1-month Expat Eats Membership (App Access & Directory)",
                "Recommendations for clean shopping, local delivery, and functional food brands",
            ],
            idealFor:
                "Solo movers, digital nomads, or couples who want a thoughtfully stocked start without the overwhelm",
        },
        {
            id: "lifestyle",
            name: "Lifestyle Package",
            price: 495,
            tagline: "Your lifestyle and your values from day one",
            features: [
                "Everything in the Essential Package",
                "Organic Personal Care Products (soap, dish soap, laundry detergent, etc.)",
                "Herbal Teas & Functional Food Gifts",
                "1-Week WhatsApp Support for questions about products, stores, and settling in",
                "3-month Expat Eats Membership",
            ],
            idealFor:
                "Families or wellness-minded individuals looking for clean, conscious products from the moment they land",
            popular: true,
        },
        {
            id: "full-support",
            name: "Full Support Package",
            price: 695,
            tagline:
                "Everything handled; your kitchen, your confidence, your community",
            features: [
                "Everything in the Lifestyle Package",
                "Local Grocery Delivery stocked directly into your kitchen on arrival day",
                "One Virtual Grocery Store Tour or Pantry Walkthrough",
                "€25 Credit Toward a Personalized Meal Plan",
                "6-month Expat Eats Membership",
                "Surprise gifts and goodies from favorite local vendors",
            ],
            idealFor:
                "Busy families, professionals, or anyone who wants maximum support and zero stress upon arrival",
        },
    ];

    return (
        <>
            {/* Hero Section */}
            <section className="relative py-12 md:py-24 overflow-hidden">
                <div
                    className="absolute inset-0 z-0 bg-center bg-cover opacity-20"
                    style={{
                        backgroundImage:
                            'url("https://images.unsplash.com/photo-1464207687429-7505649dae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080")',
                    }}
                />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center justify-center p-3 bg-[#94AF9F] bg-opacity-10 rounded-full mb-6">
                            <Package className="h-8 w-8 text-[#94AF9F]" />
                        </div>
                        <h1 className="font-montserrat text-4xl md:text-5xl lg:text-6xl font-light tracking-wide mb-4 text-neutral-dark">
                            Arrival Packages & Assistance
                        </h1>
                        <p className="text-lg md:text-xl mb-8 text-neutral-dark">
                            Complete support to help you land smoothly, settle in
                            confidently, and start living your healthiest life in
                            Portugal
                        </p>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="font-montserrat text-3xl font-bold mb-8 text-center text-neutral-dark">
                        How It Works
                    </h2>
                    <div className="max-w-4xl mx-auto">
                        <Card className="shadow-lg border-t-4 border-[#94AF9F]">
                            <CardContent className="pt-6">
                                <p className="text-lg text-neutral-dark leading-relaxed mb-4">
                                    Relocating is exciting but also overwhelming. Our{" "}
                                    <span className="font-semibold">
                                        Arrival Packages
                                    </span>{" "}
                                    are curated to help you hit the ground running
                                    with healthy food, essential items, and local
                                    guidance tailored to your lifestyle.
                                </p>
                                <p className="text-lg text-neutral-dark leading-relaxed">
                                    Whether you're moving solo or with a family,
                                    you'll have a trusted partner to support you from
                                    day one. We'll stock your kitchen, provide clean
                                    and local products, share insider resources, and
                                    answer your "where do I find..." questions so you
                                    can focus on what matters:{" "}
                                    <span className="font-semibold">
                                        making yourself at home
                                    </span>
                                    .
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* What's Included - All Packages */}
            <section className="py-12 bg-[#F9F5F0]">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="font-montserrat text-3xl font-bold mb-8 text-center text-neutral-dark">
                            All Arrival Packages Include
                        </h2>
                        <Card className="shadow-lg">
                            <CardContent className="pt-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    {allPackagesInclude.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start"
                                        >
                                            <Check className="text-[#94AF9F] mr-3 h-5 w-5 mt-1 flex-shrink-0" />
                                            <span className="text-gray-700">
                                                {item}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Package Options & Pricing */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="font-montserrat text-3xl font-bold mb-4 text-center text-neutral-dark">
                        Choose Your Package
                    </h2>
                    <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                        Complete arrival support to help you settle into your new
                        life in Portugal - effortlessly. Each package includes
                        tailored essentials for a healthy, low-tox start.
                    </p>

                    <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {packages.map((pkg) => (
                            <Card
                                key={pkg.id}
                                className={`shadow-lg hover:shadow-xl transition-all ${
                                    pkg.popular
                                        ? "border-2 border-[#94AF9F] relative"
                                        : ""
                                }`}
                            >
                                {pkg.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-[#94AF9F] text-white px-4 py-1 rounded-full text-sm font-semibold">
                                            Most Popular
                                        </span>
                                    </div>
                                )}
                                <CardHeader className="text-center pb-4">
                                    <CardTitle className="text-2xl font-montserrat mb-2">
                                        {pkg.name}
                                    </CardTitle>
                                    <p className="text-gray-600 text-sm mb-4 italic">
                                        {pkg.tagline}
                                    </p>
                                    <div className="flex items-center justify-center gap-1">
                                        <span className="text-2xl text-gray-600">€</span>
                                        <span className="text-5xl font-bold text-neutral-dark">
                                            {pkg.price}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3 mb-6">
                                        {pkg.features.map((feature, index) => (
                                            <li
                                                key={index}
                                                className="flex items-start"
                                            >
                                                <Check className="text-[#94AF9F] mr-3 h-5 w-5 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-700 text-sm">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="bg-[#F9F5F0] p-3 rounded-lg mb-4">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-semibold">
                                                Perfect for:
                                            </span>{" "}
                                            {pkg.idealFor}
                                        </p>
                                    </div>

                                    <Button
                                        onClick={() => {
                                            setSelectedPackage(pkg.id);
                                            window.scrollTo({
                                                top: document.body.scrollHeight,
                                                behavior: "smooth",
                                            });
                                        }}
                                        className={`w-full py-6 text-lg font-semibold rounded-full transition transform hover:scale-105 ${
                                            pkg.popular
                                                ? "bg-[#94AF9F] hover:bg-opacity-90 text-white"
                                                : "bg-[#E07A5F] hover:bg-opacity-90 text-white"
                                        }`}
                                    >
                                        Select Package
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* How to Get Started Section */}
            <section className="py-12 bg-[#F9F5F0]">
                <div className="container mx-auto px-4">
                    <h2 className="font-montserrat text-3xl font-bold mb-8 text-center text-neutral-dark">
                        How to Get Started
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
                        <Card className="shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-[#94AF9F] bg-opacity-10 p-3 rounded-full">
                                        <Package className="h-6 w-6 text-[#94AF9F]" />
                                    </div>
                                    <div>
                                        <h3 className="font-montserrat font-semibold text-lg mb-2">
                                            Step 1: Choose
                                        </h3>
                                        <p className="text-gray-600">
                                            Select the package that fits your needs
                                            and lifestyle
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-[#E07A5F] bg-opacity-10 p-3 rounded-full">
                                        <Mail className="h-6 w-6 text-[#E07A5F]" />
                                    </div>
                                    <div>
                                        <h3 className="font-montserrat font-semibold text-lg mb-2">
                                            Step 2: Connect
                                        </h3>
                                        <p className="text-gray-600">
                                            Complete the form below and we'll
                                            schedule your welcome call
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg hover:shadow-xl transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-[#DDB892] bg-opacity-30 p-3 rounded-full">
                                        <Home className="h-6 w-6 text-[#94AF9F]" />
                                    </div>
                                    <div>
                                        <h3 className="font-montserrat font-semibold text-lg mb-2">
                                            Step 3: Relax
                                        </h3>
                                        <p className="text-gray-600">
                                            We handle the rest and coordinate
                                            delivery for your arrival
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Contact Form Section */}
            <section className="py-16 bg-gradient-to-br from-[#94AF9F]/10 to-[#DDB892]/10">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto">
                        <Card className="shadow-2xl border-2 border-[#94AF9F]">
                            <CardHeader className="text-center pb-4 bg-[#94AF9F] text-white rounded-t-lg">
                                <CardTitle className="text-3xl font-montserrat mb-2">
                                    Request Your Package
                                </CardTitle>
                                <p className="text-white/90 text-lg">
                                    Fill out the form and we'll schedule your free
                                    20-minute welcome call
                                </p>
                            </CardHeader>
                            <CardContent className="pt-8 pb-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">
                                            Select Your Package *
                                        </label>
                                        <div className="space-y-2">
                                            {packages.map((pkg) => (
                                                <label
                                                    key={pkg.id}
                                                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                                                        selectedPackage === pkg.id
                                                            ? "border-[#94AF9F] bg-[#94AF9F]/10"
                                                            : "border-gray-200 hover:border-[#94AF9F]/50"
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="package"
                                                        value={pkg.id}
                                                        checked={
                                                            selectedPackage ===
                                                            pkg.id
                                                        }
                                                        onChange={(e) =>
                                                            setSelectedPackage(
                                                                e.target.value
                                                            )
                                                        }
                                                        className="mr-3"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="font-semibold">
                                                            {pkg.name}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            €{pkg.price}
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold mb-2">
                                            Email Address *
                                        </label>
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    email: e.target.value,
                                                })
                                            }
                                            placeholder="your.email@example.com"
                                            required
                                            className="w-full"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold mb-2">
                                            Additional Information (Optional)
                                        </label>
                                        <Textarea
                                            value={formData.message}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    message: e.target.value,
                                                })
                                            }
                                            placeholder="Tell us about your arrival date, household size, dietary preferences, or any special requests..."
                                            rows={4}
                                            className="w-full"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={contactMutation.isPending}
                                        className="w-full py-6 text-lg font-semibold rounded-full transition transform hover:scale-105 bg-[#E07A5F] hover:bg-opacity-90 text-white shadow-lg"
                                    >
                                        {contactMutation.isPending ? (
                                            "Sending..."
                                        ) : (
                                            <>
                                                <Mail className="mr-2 h-5 w-5" />
                                                Request Package
                                            </>
                                        )}
                                    </Button>

                                    <p className="text-center text-sm text-gray-500">
                                        You'll receive a welcome email within 24 hours
                                        to schedule your call
                                    </p>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Community Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="bg-gradient-to-r from-[#94AF9F]/10 via-[#DDB892]/10 to-[#E07A5F]/10 rounded-2xl p-8 md:p-12">
                            <Sparkles className="h-12 w-12 text-[#E07A5F] mx-auto mb-6" />
                            <h2 className="font-montserrat text-3xl font-bold mb-4 text-neutral-dark">
                                What Happens Next?
                            </h2>
                            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                                After you submit your request, we'll send you a{" "}
                                <span className="font-semibold">
                                    welcome email
                                </span>{" "}
                                with a link to schedule your free 20-minute call.
                                During this call, we'll finalize your package
                                details, discuss your preferences, and coordinate
                                delivery for your arrival.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar className="h-5 w-5 text-[#94AF9F]" />
                                    <span>Schedule your welcome call</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <MessageCircle className="h-5 w-5 text-[#E07A5F]" />
                                    <span>Get WhatsApp support</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-[#94AF9F] text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="font-montserrat text-3xl font-bold mb-4">
                        Ready to Start Your New Life in Portugal?
                    </h2>
                    <p className="text-lg mb-8 max-w-2xl mx-auto">
                        Let us handle the details so you can focus on what
                        matters: settling in and feeling at home.
                    </p>
                    <Button
                        onClick={() =>
                            window.scrollTo({
                                top: document.body.scrollHeight,
                                behavior: "smooth",
                            })
                        }
                        className="bg-white text-[#94AF9F] hover:bg-gray-100 font-bold py-3 px-8 rounded-full text-lg shadow-lg transition transform hover:scale-105"
                    >
                        <Package className="mr-2 h-5 w-5" />
                        Request Your Package
                    </Button>
                </div>
            </section>
        </>
    );
};

export default ArrivalPackages;
