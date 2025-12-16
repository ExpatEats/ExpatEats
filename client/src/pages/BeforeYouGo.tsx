import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Check,
    Compass,
    Download,
    Globe,
    Heart,
    ShoppingBag,
    Sparkles,
    Users,
    Leaf,
    Home,
    Map,
    Book,
    Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

interface PurchaseData {
    email: string;
}

const BeforeYouGo: React.FC = () => {
    const { toast } = useToast();
    const { user } = useAuth();

    const purchaseMutation = useMutation({
        mutationFn: async (data: PurchaseData) => {
            // Get CSRF token
            const csrfResponse = await fetch("/api/csrf-token", {
                method: "GET",
                credentials: "include",
            });

            if (!csrfResponse.ok) {
                throw new Error("Failed to get security token");
            }

            const { csrfToken } = await csrfResponse.json();

            const response = await fetch("/api/before-you-go/purchase", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": csrfToken,
                },
                credentials: "include",
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Failed to process purchase");
            }

            return response.json();
        },
        onSuccess: () => {
            toast({
                title: "Purchase Successful!",
                description: "Check your email for the download link.",
            });
        },
        onError: () => {
            toast({
                title: "Purchase Failed",
                description: "Please try again or contact support.",
                variant: "destructive",
            });
        },
    });

    const handlePurchase = () => {
        if (!user?.email) {
            toast({
                title: "Error",
                description: "Unable to retrieve your email. Please try logging in again.",
                variant: "destructive",
            });
            return;
        }

        purchaseMutation.mutate({
            email: user.email,
        });
    };

    const guideFeatures = [
        {
            icon: <Check className="h-6 w-6" />,
            title: "Pre-Move Checklist",
            description: "For wellness-minded families and individuals",
        },
        {
            icon: <Leaf className="h-6 w-6" />,
            title: "Clean Living Tips",
            description: "Sourcing clean food, water, and personal care products",
        },
        {
            icon: <ShoppingBag className="h-6 w-6" />,
            title: "Grocery Store Guide",
            description: "Complete guide to grocery store chains and what to expect",
        },
        {
            icon: <Globe className="h-6 w-6" />,
            title: "Cultural Insights",
            description: "Cultural quirks and common phrases for markets and stores",
        },
        {
            icon: <Home className="h-6 w-6" />,
            title: "What to Bring vs. Buy",
            description: "Smart guidance on what to pack and what to source locally",
        },
        {
            icon: <Map className="h-6 w-6" />,
            title: "Local Wellness Spots",
            description: "Markets, vendors, and wellness destinations you'll love",
        },
        {
            icon: <Users className="h-6 w-6" />,
            title: "Community Tips",
            description: "Real insights from Expat Eats members and their favorite finds",
        },
        {
            icon: <Book className="h-6 w-6" />,
            title: "Kitchen Setup Guide",
            description: "Everything you need to set up your new Portuguese kitchen",
        },
    ];

    const idealFor = [
        "Wellness-minded families making the move",
        "Digital nomads seeking sustainable living",
        "Remote workers relocating to Portugal",
        "Anyone wanting an intentional, easeful transition",
    ];

    return (
        <>
            {/* Hero Section */}
            <section className="relative py-12 md:py-24 overflow-hidden">
                <div
                    className="absolute inset-0 z-0 bg-center bg-cover opacity-20"
                    style={{
                        backgroundImage:
                            'url("https://images.unsplash.com/photo-1555881400-74d7acaacd8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080")',
                    }}
                />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center justify-center p-3 bg-[#94AF9F] bg-opacity-10 rounded-full mb-6">
                            <Compass className="h-8 w-8 text-[#94AF9F]" />
                        </div>
                        <h1 className="font-montserrat text-4xl md:text-5xl lg:text-6xl font-light tracking-wide mb-4 text-neutral-dark">
                            What to Know Before You Go
                        </h1>
                        <p className="text-lg md:text-xl mb-8 text-neutral-dark">
                            Your essential preparation guide for moving to Portugal
                        </p>
                    </div>
                </div>
            </section>

            {/* Introduction Section */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <Card className="shadow-lg border-t-4 border-[#94AF9F]">
                            <CardContent className="pt-6">
                                <p className="text-lg text-neutral-dark leading-relaxed mb-6">
                                    Relocating to a new country can be <span className="font-semibold">extremely overwhelming</span>, with nonstop juggling of logistics, emotions, and never-ending to-do lists. That's why we created this <span className="font-semibold">wellness-focused preparation guide</span>. It will help you land in Portugal feeling clear, calm, and more confident.
                                </p>
                                <p className="text-lg text-neutral-dark leading-relaxed">
                                    Whether you're still packing or already en route, this downloadable guide gives you the insights, tools, and tips you need to make your transition smoother and more aligned with your values. From setting up your new kitchen and sourcing clean essentials to navigating systems and finding your new go-to grocery store, we've got you covered.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* What's Inside Section */}
            <section className="py-16 bg-[#F9F5F0]">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 mb-4">
                                <Compass className="h-6 w-6 text-[#94AF9F]" />
                                <h2 className="font-montserrat text-3xl font-bold text-neutral-dark">
                                    Inside the Guide
                                </h2>
                            </div>
                            <p className="text-gray-600 text-lg">
                                Everything you need for a smooth, intentional transition
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {guideFeatures.map((feature, index) => (
                                <Card
                                    key={index}
                                    className="shadow-lg hover:shadow-xl transition-shadow"
                                >
                                    <CardContent className="pt-6">
                                        <div className="bg-[#94AF9F] bg-opacity-10 p-4 rounded-full w-14 h-14 mx-auto mb-4 flex items-center justify-center text-[#94AF9F]">
                                            {feature.icon}
                                        </div>
                                        <h3 className="font-montserrat font-semibold text-lg mb-2 text-center">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm text-center">
                                            {feature.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Ideal For Section */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="font-montserrat text-3xl font-bold mb-8 text-center text-neutral-dark">
                            Designed For You
                        </h2>
                        <Card className="shadow-lg">
                            <CardContent className="pt-6">
                                <p className="text-lg text-neutral-dark mb-6">
                                    This guide is perfect for:
                                </p>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {idealFor.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start"
                                        >
                                            <Check className="text-[#94AF9F] mr-3 h-6 w-6 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-700 text-lg">
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

            {/* Pricing/Purchase Section */}
            <section className="py-16 bg-gradient-to-br from-[#94AF9F]/10 to-[#DDB892]/10">
                <div className="container mx-auto px-4">
                    {/* Coming Soon Banner */}
                    <div className="max-w-2xl mx-auto mb-8">
                        <Card className="border-2 border-[#E07A5F] bg-gradient-to-r from-[#E07A5F]/5 to-[#DDB892]/5">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-[#E07A5F] bg-opacity-10 p-3 rounded-full">
                                        <Info className="h-6 w-6 text-[#E07A5F]" />
                                    </div>
                                    <div>
                                        <h3 className="font-montserrat font-semibold text-lg mb-2 text-neutral-dark">
                                            Coming Soon
                                        </h3>
                                        <p className="text-gray-700 leading-relaxed">
                                            Our comprehensive "What to Know Before You Go" guide is currently being finalized. Check back soon to get all the insights you need for a smooth transition to Portugal!
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="max-w-2xl mx-auto">
                        <Card className="shadow-2xl border-2 border-[#94AF9F]">
                            <CardHeader className="text-center pb-4 bg-[#94AF9F] text-white rounded-t-lg">
                                <CardTitle className="text-3xl font-montserrat mb-2">
                                    Get Your Guide Today
                                </CardTitle>
                                <p className="text-white/90 text-lg">
                                    Land in Portugal with confidence and clarity
                                </p>
                            </CardHeader>
                            <CardContent className="pt-8 pb-8">
                                <div className="text-center mb-8">
                                    <div className="flex items-center justify-center gap-3 mb-4">
                                        <Download className="h-10 w-10 text-[#94AF9F]" />
                                        <div>
                                            <p className="text-gray-600 text-sm uppercase tracking-wide">
                                                One-Time Purchase
                                            </p>
                                            <p className="text-5xl font-bold text-neutral-dark">
                                                €25
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 mb-6">
                                        Instant digital download • PDF format • Lifetime access
                                    </p>
                                </div>

                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-start">
                                        <Check className="text-[#94AF9F] mr-3 h-5 w-5 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700">
                                            Comprehensive 50+ page digital guide
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="text-[#94AF9F] mr-3 h-5 w-5 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700">
                                            Pre-move checklists and planning tools
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="text-[#94AF9F] mr-3 h-5 w-5 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700">
                                            Insider tips from expat community members
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="text-[#94AF9F] mr-3 h-5 w-5 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700">
                                            Local vendor recommendations and maps
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <Sparkles className="text-[#E07A5F] mr-3 h-5 w-5 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700 font-semibold">
                                            Bonus: Special invitation to join the Expat Eats community
                                        </span>
                                    </li>
                                </ul>

                                <Button
                                    disabled={true}
                                    className="w-full py-6 text-lg font-semibold rounded-full opacity-50 cursor-not-allowed bg-[#E07A5F] text-white shadow-lg"
                                >
                                    Coming Soon
                                </Button>

                                <p className="text-center text-sm text-gray-500 mt-4">
                                    Secure checkout • Instant delivery to your email
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Community Invitation Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="bg-gradient-to-r from-[#94AF9F]/10 via-[#DDB892]/10 to-[#E07A5F]/10 rounded-2xl p-8 md:p-12">
                            <Heart className="h-12 w-12 text-[#E07A5F] mx-auto mb-6" />
                            <h2 className="font-montserrat text-3xl font-bold mb-4 text-neutral-dark">
                                Want More?
                            </h2>
                            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                                You'll also get a special invitation to join the{" "}
                                <span className="font-semibold text-[#94AF9F]">
                                    Expat Eats community
                                </span>
                                —the place where wellness meets connection.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Users className="h-5 w-5 text-[#94AF9F]" />
                                    <span>Connect with fellow expats</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Heart className="h-5 w-5 text-[#E07A5F]" />
                                    <span>Share tips and experiences</span>
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
                        Ready to Make Your Move Easier?
                    </h2>
                    <p className="text-lg mb-8 max-w-2xl mx-auto">
                        Get the clarity, confidence, and community support you need for a smooth transition to Portugal.
                    </p>
                    <Button
                        onClick={() =>
                            window.scrollTo({ top: 0, behavior: "smooth" })
                        }
                        className="bg-white text-[#94AF9F] hover:bg-gray-100 font-bold py-3 px-8 rounded-full text-lg shadow-lg transition transform hover:scale-105"
                    >
                        <Download className="mr-2 h-5 w-5" />
                        Get Your Guide Now
                    </Button>
                </div>
            </section>
        </>
    );
};

export default BeforeYouGo;
