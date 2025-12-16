import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink } from "lucide-react";

export default function Resources() {
    const [activeTab, setActiveTab] = useState("lifestyle");

    const lifestyleGuides = [
        {
            id: 1,
            title: "Beauty Guide",
            description: "Organic and non-toxic beauty products",
            buttonText: "Explore",
        },
        {
            id: 2,
            title: "Cleaning Guide",
            description: "Non-toxic cleaning products and solutions",
            buttonText: "Explore",
        },
        {
            id: 3,
            title: "Housewares and Homegoods Guide",
            description: "Non-toxic furniture and filtered water systems",
            buttonText: "Explore",
        },
        {
            id: 4,
            title: "Clothing Guide",
            description: "Sustainable and organic clothing options",
            buttonText: "Explore",
        },
        {
            id: 5,
            title: "Wellness Guide",
            description: "Wellness services and products",
            buttonText: "Explore",
        },
    ];

    const apps = [
        {
            id: 1,
            name: "Yuka",
            icon: "🔍",
            description:
                "Scan food products to evaluate their health impact based on nutritional quality and additives.",
            link: "https://yuka.io/en/",
        },
        {
            id: 2,
            name: "Open Food Facts",
            icon: "🌐",
            description:
                "Global database of food products with ingredient analysis and nutrition facts.",
            link: "https://world.openfoodfacts.org/",
        },
        {
            id: 3,
            name: "INCI Beauty",
            icon: "✨",
            description:
                "Analyzes cosmetic ingredients to identify potential allergens and harmful substances.",
            link: "https://incibeauty.com/en",
        },
        {
            id: 4,
            name: "GoodGuide",
            icon: "🌿",
            description:
                "Provides ratings for products based on health, environmental and social impacts.",
            link: "https://www.goodguide.com/",
        },
    ];

    const videos = [
        {
            id: 1,
            title: "Reading Portuguese Food Labels",
            description:
                "Learn how to identify ingredients and nutritional information on Portuguese food products.",
            videoUrl: "https://www.youtube.com/embed/emHsk5VLleY",
        },
        {
            id: 2,
            title: "Yuka App Tutorial",
            description:
                "Scan products to analyze their health impacts and find better alternatives.",
            videoUrl: "https://www.youtube.com/embed/F_ZPJGx1nnc",
        },
        {
            id: 3,
            title: "Open Food Facts Guide",
            description:
                "How to use this open database to check product ingredients and nutritional quality.",
            videoUrl: "https://www.youtube.com/embed/5D--XJL2OzI",
        },
        {
            id: 4,
            title: "Decoding Organic Certifications",
            description:
                "Understanding EU organic labels and Portuguese local certifications.",
            videoUrl: "https://www.youtube.com/embed/UbafJafU6sA",
        },
    ];

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="text-center mb-8">
                <h1 className="font-montserrat text-3xl md:text-4xl font-bold mb-3">
                    Resources
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Essential guides, apps, and video tutorials for sustainable
                    living in Portugal
                </p>
            </div>

            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
            >
                <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-100 p-2 rounded-lg gap-2">
                    <TabsTrigger
                        value="lifestyle"
                        className="text-sm font-medium bg-[#E07A5F] text-white data-[state=active]:bg-[#E07A5F] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 rounded-md"
                    >
                        Lifestyle Guides
                    </TabsTrigger>
                    <TabsTrigger
                        value="apps"
                        className="text-sm font-medium bg-[#E07A5F] text-white data-[state=active]:bg-[#E07A5F] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 rounded-md"
                    >
                        Apps
                    </TabsTrigger>
                    <TabsTrigger
                        value="videos"
                        className="text-sm font-medium bg-[#E07A5F] text-white data-[state=active]:bg-[#E07A5F] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 rounded-md"
                    >
                        Videos
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="lifestyle" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lifestyleGuides.map((guide) => (
                            <Card
                                key={guide.id}
                                className="h-full hover:shadow-lg transition-shadow cursor-pointer group"
                            >
                                <CardHeader>
                                    <CardTitle className="text-xl">
                                        {guide.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600">
                                        {guide.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="apps" className="space-y-6">
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold mb-4">
                            Helpful Food Scanner Apps
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {apps.map((app) => (
                            <Card
                                key={app.id}
                                className="h-full hover:shadow-lg transition-shadow"
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="text-3xl">
                                            {app.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold mb-2">
                                                {app.name}
                                            </h3>
                                            <p className="text-gray-600 mb-4">
                                                {app.description}
                                            </p>
                                            <a
                                                href={app.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Button className="bg-[#94AF9F] hover:bg-[#94AF9F]/90 text-white">
                                                    <ExternalLink className="mr-2 h-4 w-4" />
                                                    Visit Website
                                                </Button>
                                            </a>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="videos" className="space-y-6">
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold mb-4">
                            Video Guides: Reading Portuguese Labels
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {videos.map((video) => (
                            <Card key={video.id} className="h-full">
                                <CardContent className="p-6">
                                    <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
                                        <iframe
                                            src={video.videoUrl}
                                            title={video.title}
                                            className="w-full h-full"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">
                                        {video.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {video.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            <div className="mt-12 text-center">
                <div className="bg-[#94AF9F]/10 rounded-lg p-8">
                    <h3 className="text-2xl font-semibold mb-4">
                        Need More Resources?
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                        Can't find what you're looking for? Contact us for
                        personalized guidance on sustainable living in Portugal.
                    </p>
                    <Button className="bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white px-8 py-3">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Get Personal Help
                    </Button>
                </div>
            </div>
        </div>
    );
}
