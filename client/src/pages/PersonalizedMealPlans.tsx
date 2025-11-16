import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ChefHat, Clock, Calendar, Euro, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

interface PurchaseData {
    planType: string;
    price: number;
    email: string;
}

const PersonalizedMealPlans: React.FC = () => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState<string>("");

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

            const response = await fetch("/api/meal-plans/purchase", {
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
                description: "Check your email for next steps.",
            });
            setSelectedPlan("");
        },
        onError: () => {
            toast({
                title: "Purchase Failed",
                description: "Please try again or contact support.",
                variant: "destructive",
            });
        },
    });

    const handlePurchase = (planType: string, price: number) => {
        if (!user?.email) {
            toast({
                title: "Error",
                description: "Unable to retrieve your email. Please try logging in again.",
                variant: "destructive",
            });
            return;
        }

        setSelectedPlan(planType);
        // For now, we'll simulate the purchase. In production, integrate with payment processor
        purchaseMutation.mutate({
            planType,
            price,
            email: user.email,
        });
    };

    const pricingPlans = [
        {
            id: "weekly",
            name: "7-Day Plan",
            price: 25,
            description: "Perfect for trying out the service",
            features: [
                "One-week customized meal plan",
                "20-minute discovery call",
                "Personalized intake form",
                "Local shopping list",
                "Clickable PDF recipes",
                "Ingredient substitutions",
            ],
        },
        {
            id: "monthly",
            name: "Monthly Plan",
            price: 95,
            description: "Best value for committed meal planning",
            features: [
                "Four weeks of meal plans",
                "Initial discovery call",
                "Ongoing plan adjustments",
                "Weekly shopping lists",
                "Recipe collection",
                "Priority support",
            ],
            popular: true,
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
                            'url("https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080")',
                    }}
                />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center justify-center p-3 bg-[#94AF9F] bg-opacity-10 rounded-full mb-6">
                            <ChefHat className="h-8 w-8 text-[#94AF9F]" />
                        </div>
                        <h1 className="font-montserrat text-4xl md:text-5xl lg:text-6xl font-light tracking-wide mb-4 text-neutral-dark">
                            Personalized Meal Plans
                        </h1>
                        <p className="text-lg md:text-xl mb-8 text-neutral-dark">
                            Personalized meal plans tailored to your dietary preferences and local ingredients.
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
                        <Card className="mb-8 shadow-lg border-t-4 border-[#94AF9F]">
                            <CardContent className="pt-6">
                                <p className="text-lg text-neutral-dark leading-relaxed">
                                    This is a <span className="font-semibold">one-on-one service</span> where we craft a completely customized weekly meal plan tailored to your health goals, dietary restrictions, lifestyle, and local ingredient availability. Whether you're looking to eat cleaner, improve digestion, balance hormones, or simply simplify your weekly meals, we take the guesswork out of eating well in Portugal.
                                </p>
                            </CardContent>
                        </Card>

                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            <Card className="shadow-lg hover:shadow-xl transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-[#94AF9F] bg-opacity-10 p-3 rounded-full">
                                            <Mail className="h-6 w-6 text-[#94AF9F]" />
                                        </div>
                                        <div>
                                            <h3 className="font-montserrat font-semibold text-lg mb-2">
                                                Step 1: Purchase
                                            </h3>
                                            <p className="text-gray-600">
                                                Choose your plan and complete purchase. You'll receive an email with your intake form.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg hover:shadow-xl transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-[#E07A5F] bg-opacity-10 p-3 rounded-full">
                                            <Phone className="h-6 w-6 text-[#E07A5F]" />
                                        </div>
                                        <div>
                                            <h3 className="font-montserrat font-semibold text-lg mb-2">
                                                Step 2: Connect
                                            </h3>
                                            <p className="text-gray-600">
                                                Book your 20-minute discovery call with Michaele, our nutrition consultant.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg hover:shadow-xl transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-[#DDB892] bg-opacity-30 p-3 rounded-full">
                                            <ChefHat className="h-6 w-6 text-[#94AF9F]" />
                                        </div>
                                        <div>
                                            <h3 className="font-montserrat font-semibold text-lg mb-2">
                                                Step 3: Receive
                                            </h3>
                                            <p className="text-gray-600">
                                                Get your customized 7-day meal plan within 3-5 business days.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Who It's Good For Section */}
            <section className="py-12 bg-[#F9F5F0]">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="font-montserrat text-3xl font-bold mb-8 text-center text-neutral-dark">
                            Who It's Good For
                        </h2>
                        <Card className="shadow-lg">
                            <CardContent className="pt-6">
                                <p className="text-lg text-neutral-dark leading-relaxed mb-6">
                                    Ideal for individuals or families who are <span className="font-semibold">new to the region</span> and unsure what to buy or how to maintain their eating habits abroad, or anyone wanting to optimize their nutrition using seasonal, local ingredients.
                                </p>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="flex items-start">
                                        <Check className="text-[#94AF9F] mr-3 h-5 w-5 mt-1 flex-shrink-0" />
                                        <span>New expats adjusting to Portugal</span>
                                    </div>
                                    <div className="flex items-start">
                                        <Check className="text-[#94AF9F] mr-3 h-5 w-5 mt-1 flex-shrink-0" />
                                        <span>Families seeking healthier meals</span>
                                    </div>
                                    <div className="flex items-start">
                                        <Check className="text-[#94AF9F] mr-3 h-5 w-5 mt-1 flex-shrink-0" />
                                        <span>People with dietary restrictions</span>
                                    </div>
                                    <div className="flex items-start">
                                        <Check className="text-[#94AF9F] mr-3 h-5 w-5 mt-1 flex-shrink-0" />
                                        <span>Anyone wanting to simplify meal planning</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="font-montserrat text-3xl font-bold mb-4 text-center text-neutral-dark">
                        Choose Your Plan
                    </h2>
                    <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                        Select the plan that works best for you. All plans include a personalized consultation and customized meal planning.
                    </p>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {pricingPlans.map((plan) => (
                            <Card
                                key={plan.id}
                                className={`shadow-lg hover:shadow-xl transition-all ${
                                    plan.popular
                                        ? "border-2 border-[#94AF9F] relative"
                                        : ""
                                }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-[#94AF9F] text-white px-4 py-1 rounded-full text-sm font-semibold">
                                            Most Popular
                                        </span>
                                    </div>
                                )}
                                <CardHeader className="text-center pb-4">
                                    <CardTitle className="text-2xl font-montserrat mb-2">
                                        {plan.name}
                                    </CardTitle>
                                    <p className="text-gray-600 text-sm mb-4">
                                        {plan.description}
                                    </p>
                                    <div className="flex items-center justify-center gap-2">
                                        <Euro className="h-8 w-8 text-[#94AF9F]" />
                                        <span className="text-5xl font-bold text-neutral-dark">
                                            {plan.price}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3 mb-6">
                                        {plan.features.map((feature, index) => (
                                            <li
                                                key={index}
                                                className="flex items-start"
                                            >
                                                <Check className="text-[#94AF9F] mr-3 h-5 w-5 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-700">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Button
                                        onClick={() =>
                                            handlePurchase(plan.id, plan.price)
                                        }
                                        disabled={purchaseMutation.isPending}
                                        className={`w-full py-6 text-lg font-semibold rounded-full transition transform hover:scale-105 ${
                                            plan.popular
                                                ? "bg-[#94AF9F] hover:bg-opacity-90 text-white"
                                                : "bg-[#E07A5F] hover:bg-opacity-90 text-white"
                                        }`}
                                    >
                                        {purchaseMutation.isPending &&
                                        selectedPlan === plan.id
                                            ? "Processing..."
                                            : "Get Started"}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="text-center mt-8">
                        <p className="text-gray-600 mb-2">
                            Need ongoing support or custom plans?
                        </p>
                        <Button
                            variant="outline"
                            className="border-2 border-[#94AF9F] text-[#94AF9F] hover:bg-[#94AF9F] hover:text-white py-3 px-8 rounded-full font-semibold transition"
                        >
                            Contact Us for Custom Monthly Support
                        </Button>
                    </div>
                </div>
            </section>

            {/* What You Get Section */}
            <section className="py-12 bg-[#F9F5F0]">
                <div className="container mx-auto px-4">
                    <h2 className="font-montserrat text-3xl font-bold mb-8 text-center text-neutral-dark">
                        What's Included
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        <Card className="shadow-lg text-center">
                            <CardContent className="pt-6">
                                <div className="bg-[#94AF9F] bg-opacity-10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                    <Calendar className="h-8 w-8 text-[#94AF9F]" />
                                </div>
                                <h3 className="font-montserrat font-semibold text-lg mb-2">
                                    7-Day PDF Plan
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Complete meal plan with breakfast, lunch, and dinner
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg text-center">
                            <CardContent className="pt-6">
                                <div className="bg-[#E07A5F] bg-opacity-10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                    <ChefHat className="h-8 w-8 text-[#E07A5F]" />
                                </div>
                                <h3 className="font-montserrat font-semibold text-lg mb-2">
                                    Clickable Recipes
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Easy-to-follow recipes tailored to your preferences
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg text-center">
                            <CardContent className="pt-6">
                                <div className="bg-[#DDB892] bg-opacity-30 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                    <Mail className="h-8 w-8 text-[#94AF9F]" />
                                </div>
                                <h3 className="font-montserrat font-semibold text-lg mb-2">
                                    Shopping Lists
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Local shopping lists with ingredient substitutions
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg text-center">
                            <CardContent className="pt-6">
                                <div className="bg-[#94AF9F] bg-opacity-10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                    <Clock className="h-8 w-8 text-[#94AF9F]" />
                                </div>
                                <h3 className="font-montserrat font-semibold text-lg mb-2">
                                    Fast Turnaround
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Receive your plan within 3-5 business days
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-[#94AF9F] text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="font-montserrat text-3xl font-bold mb-4">
                        Ready to Simplify Your Meals?
                    </h2>
                    <p className="text-lg mb-8 max-w-2xl mx-auto">
                        Take the stress out of meal planning and start eating well in Portugal today.
                    </p>
                    <Button
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="bg-white text-[#94AF9F] hover:bg-gray-100 font-bold py-3 px-8 rounded-full text-lg shadow-lg transition transform hover:scale-105"
                    >
                        Get Your Meal Plan
                    </Button>
                </div>
            </section>
        </>
    );
};

export default PersonalizedMealPlans;
