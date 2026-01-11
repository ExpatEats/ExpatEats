import React from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ChefHat,
    ShoppingCart,
    FileText,
    MapPin,
    Package,
    Info,
} from "lucide-react";

export default function NewServices() {
    const services = [
        {
            id: "meal-planning",
            name: "Personalized Meal Plans",
            description:
                "Customized Meal Plans based on your dietary needs, lifestyle, and locally available ingredients in Portugal.",
            icon: <ChefHat className="h-8 w-8" />,
            path: "/meal-plans",
        },
        {
            id: "stock-pantry",
            name: "Stock Your Pantry",
            description:
                "A guided pantry essentials list to help you stock your kitchen with healthy, sustainable, and locally sourced food.",
            icon: <Package className="h-8 w-8" />,
            path: "/services/stock-pantry",
        },
        {
            id: "grocery-tour",
            name: "Grocery Store and Personal Shopping Tour",
            description:
                "Guided tours of local markets and grocery stores to help you shop confidently in Portugal.",
            icon: <ShoppingCart className="h-8 w-8" />,
            path: "/services/grocery-tour",
        },
        {
            id: "arrival-packages",
            name: "Arrival Packages",
            description:
                "High touch arrival services designed to help you settle into daily life in Portugal with ease.",
            icon: <MapPin className="h-8 w-8" />,
            path: "/services/arrival-packages",
        },
        {
            id: "before-you-go",
            name: "Moving to Portugal: A Healthy Living Guide",
            description:
                "A practical preparation guide that includes food, lifestyle, and everyday essentials to know before you move to Portugal.",
            icon: <Info className="h-8 w-8" />,
            path: "/before-you-go",
        },
    ];

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="text-center mb-12">
                <h1 className="font-montserrat text-3xl md:text-4xl font-bold mb-3">
                    Our Services
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Personalized support for healthy, sustainable living as an expat in
                    Portugal.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                    <Link key={service.id} href={service.path}>
                        <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                            <CardHeader className="text-center">
                                <div className="mx-auto mb-4 p-4 bg-[#94AF9F]/10 rounded-full text-[#94AF9F] group-hover:bg-[#94AF9F] group-hover:text-white transition-colors">
                                    {service.icon}
                                </div>
                                <CardTitle className="text-xl">
                                    {service.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">
                                    {service.description}
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="mt-16 text-center">
                <div className="bg-[#94AF9F]/10 rounded-lg p-8">
                    <h3 className="text-2xl font-semibold mb-4">
                        Need Personalized Help?
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                        Can't find exactly what you're looking for? Get
                        personalized assistance from Michaele, our nutrition
                        expert based in Lisbon.
                    </p>
                    <Link href="/contact">
                        <Button className="bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white px-8 py-3">
                            Get Personal Consultation
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
