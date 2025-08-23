import React, { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

type ServiceItem = {
    id: number;
    name: string;
    description: string;
    address: string;
    tags: string[];
    website: string;
};

type ServicesData = {
    cleaning: ServiceItem[];
    kitchenware: ServiceItem[];
    textiles: ServiceItem[];
    clothing: ServiceItem[];
    beauty: ServiceItem[];
    [key: string]: ServiceItem[];
};

export default function Services() {
    const [activeTab, setActiveTab] = useState("cleaning");

    const services: ServicesData = {
        cleaning: [
            {
                id: 1,
                name: "Spic and Span",
                description:
                    "Offers English-speaking, background-checked cleaners. Utilizes natural cleaning products, ensuring a chemical-free environment.",
                address: "Lisbon & Surrounding Areas",
                tags: [
                    "Residential",
                    "Commercial",
                    "Natural Products",
                    "English-Speaking",
                ],
                website: "https://spicandspan.pt",
            },
            {
                id: 2,
                name: "Romen Cleaning Service",
                description:
                    "Provides English-speaking professionals using eco-friendly products, ensuring safety for children and pets.",
                address: "Lisbon",
                tags: ["Residential", "Airbnb", "Move-Out", "Eco-Friendly"],
                website: "https://romencleaningservice.com",
            },
            {
                id: 3,
                name: "Cleann.pt",
                description:
                    "Applies non-toxic, environmentally friendly products safe for children and pets. Offers deep cleaning services.",
                address: "Lisbon",
                tags: ["Residential", "Deep Cleaning", "Non-Toxic", "Pet-Safe"],
                website: "https://cleann.pt",
            },
            {
                id: 4,
                name: "The Cleaning Aid",
                description:
                    "Provides affordable, reliable, and eco-friendly cleaning services for homes and offices.",
                address: "Lisbon",
                tags: ["Residential", "Office", "Eco-Friendly", "Affordable"],
                website: "https://thecleaningaid.com",
            },
            {
                id: 5,
                name: "Cleaner Wave",
                description:
                    "Specializes in general and post-renovation cleaning using eco-friendly products. Also offers handyman services.",
                address: "Lisbon, Cascais, and other cities in Portugal",
                tags: [
                    "Residential",
                    "Post-Renovation",
                    "Handyman",
                    "Eco-Friendly",
                ],
                website: "https://cleanerwave.com",
            },
            {
                id: 6,
                name: "Cleaners In Europe (CiE)",
                description:
                    "Offers green cleaning services incorporating eco-conscious solutions like ultraviolet light sanitation and low-humidity steam purification.",
                address: "Lisbon",
                tags: [
                    "Commercial",
                    "Specialist",
                    "UV Sanitation",
                    "Green Cleaning",
                ],
                website: "https://cleanersineurope.com",
            },
            {
                id: 7,
                name: "CleaningServices.pt",
                description:
                    "Provides reliable, affordable, and high-quality cleaning using biodegradable products.",
                address: "Nationwide (Including Lisbon)",
                tags: ["Domestic", "Commercial", "Biodegradable", "Nationwide"],
                website: "https://cleaningservices.pt",
            },
            {
                id: 8,
                name: "EcoClean Lisboa",
                description:
                    "Eco-friendly and non-toxic cleaning products made with natural ingredients.",
                address: "Rua Augusta 23, Lisboa",
                tags: ["Non-Toxic", "Refill Station", "Plastic-Free"],
                website: "https://ecoclean-example.pt",
            },
            {
                id: 9,
                name: "Zero Waste Lab",
                description:
                    "DIY workshop for making your own cleaning products from natural ingredients.",
                address: "Rua do Carmo 56, Lisboa",
                tags: ["Zero Waste", "Workshop", "Sustainable"],
                website: "https://zerowaste-example.pt",
            },
        ],
        kitchenware: [
            {
                id: 1,
                name: "Green Kitchen",
                description:
                    "Non-toxic cookware, including cast iron, ceramic, and stainless steel options.",
                address: "Praça do Comércio 35, Lisboa",
                tags: ["Non-Toxic", "PFOA-Free", "Sustainable"],
                website: "https://greenkitchen-example.pt",
            },
            {
                id: 2,
                name: "EcoHome",
                description:
                    "Eco-friendly kitchen essentials, from non-toxic pots and pans to wooden utensils.",
                address: "Rua Garrett 88, Lisboa",
                tags: ["Plastic-Free", "Sustainable", "Handmade"],
                website: "https://ecohome-example.pt",
            },
        ],
        textiles: [
            {
                id: 1,
                name: "Organic Textiles",
                description:
                    "GOTS-certified organic cotton sheets, towels, and home textiles.",
                address: "Avenida da República 46, Lisboa",
                tags: ["Organic", "GOTS-Certified", "Chemical-Free"],
                website: "https://organictextiles-example.pt",
            },
            {
                id: 2,
                name: "Natural Bedding",
                description:
                    "Organic cotton, linen, and hemp bedding without harmful dyes or chemicals.",
                address: "Rua Nova do Almada 25, Lisboa",
                tags: ["Organic", "Hypoallergenic", "Sustainable"],
                website: "https://naturalbedding-example.pt",
            },
        ],
        clothing: [
            {
                id: 1,
                name: "Eco Fashion",
                description:
                    "Sustainable and organic clothing brands for adults and children.",
                address: "Centro Comercial Colombo, Lisboa",
                tags: ["Organic", "Fair Trade", "Vegan"],
                website: "https://ecofashion-example.pt",
            },
            {
                id: 2,
                name: "Green Wardrobe",
                description:
                    "Ethical and sustainable clothing made from organic materials.",
                address: "Avenida Roma 15, Lisboa",
                tags: ["Organic", "Sustainable", "Local Designers"],
                website: "https://greenwardrobe-example.pt",
            },
        ],
        beauty: [
            {
                id: 1,
                name: "Natural Beauty Lisboa",
                description:
                    "Organic and non-toxic beauty products and treatments.",
                address: "Rua do Alecrim 12, Lisboa",
                tags: ["Organic", "Cruelty-Free", "Paraben-Free"],
                website: "https://naturalbeauty-example.pt",
            },
            {
                id: 2,
                name: "Eco Salon",
                description:
                    "Hair salon using natural and non-toxic hair products and dyes.",
                address: "Praça das Flores 3, Lisboa",
                tags: ["Ammonia-Free", "Organic", "Vegan"],
                website: "https://ecosalon-example.pt",
            },
            {
                id: 3,
                name: "Clean Beauty Store",
                description:
                    "Curated selection of clean beauty brands free from harmful chemicals.",
                address: "Avenida 5 de Outubro 78, Lisboa",
                tags: ["Non-Toxic", "Sustainable Packaging", "Natural"],
                website: "https://cleanbeauty-example.pt",
            },
        ],
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">
                Non-Toxic Household & Personal Care
            </h1>
            <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
                Discover local businesses offering non-toxic alternatives for
                household and personal care products to create a healthier
                living environment.
            </p>

            <Tabs
                defaultValue="cleaning"
                className="w-full"
                onValueChange={setActiveTab}
            >
                <div className="flex justify-center mb-6 overflow-x-auto">
                    <TabsList className="grid grid-cols-5 w-full max-w-4xl min-w-fit">
                        <TabsTrigger
                            value="cleaning"
                            className="text-xs md:text-sm px-2 md:px-3 whitespace-nowrap"
                        >
                            Cleaning
                        </TabsTrigger>
                        <TabsTrigger
                            value="kitchenware"
                            className="text-xs md:text-sm px-2 md:px-3 whitespace-nowrap"
                        >
                            Kitchenware
                        </TabsTrigger>
                        <TabsTrigger
                            value="textiles"
                            className="text-xs md:text-sm px-2 md:px-3 whitespace-nowrap"
                        >
                            Textiles
                        </TabsTrigger>
                        <TabsTrigger
                            value="clothing"
                            className="text-xs md:text-sm px-2 md:px-3 whitespace-nowrap"
                        >
                            Clothing
                        </TabsTrigger>
                        <TabsTrigger
                            value="beauty"
                            className="text-xs md:text-sm px-2 md:px-3 whitespace-nowrap"
                        >
                            Beauty
                        </TabsTrigger>
                    </TabsList>
                </div>

                {Object.keys(services).map((category) => (
                    <TabsContent
                        key={category}
                        value={category}
                        className="mt-6"
                    >
                        <h2 className="text-2xl font-semibold mb-6 capitalize">
                            {category} Services
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {services[category as keyof ServicesData].map(
                                (service: ServiceItem) => (
                                    <Card key={service.id} className="h-full">
                                        <CardHeader>
                                            <CardTitle className="text-lg">
                                                {service.name}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex flex-col h-full">
                                            <p className="text-gray-600 mb-4 flex-grow">
                                                {service.description}
                                            </p>
                                            <p className="text-sm text-gray-700 mb-4">
                                                📍 {service.address}
                                            </p>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {service.tags.map(
                                                    (tag: string) => (
                                                        <Badge
                                                            key={tag}
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            {tag}
                                                        </Badge>
                                                    ),
                                                )}
                                            </div>
                                            <a
                                                href={service.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline text-sm flex items-center mt-auto"
                                            >
                                                Visit Website
                                            </a>
                                        </CardContent>
                                    </Card>
                                ),
                            )}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>

            <div className="mt-8 pt-4 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400">
                    Copyright Cerejaperaltada Unipessoal 2025 all rights
                    reserved
                </p>
            </div>
        </div>
    );
}
