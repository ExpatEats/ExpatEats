import React from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ArrowLeft, Mail } from "lucide-react";

export default function StockPantry() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link href="/services">
                <Button variant="ghost" className="mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Services
                </Button>
            </Link>

            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#94AF9F]/10 text-[#94AF9F] mb-4">
                    <Package className="h-10 w-10" />
                </div>
                <h1 className="font-montserrat text-3xl md:text-4xl font-bold mb-3">
                    Stock Your Pantry
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Essential pantry items guide to help you stock up with sustainable, local, and healthy ingredients
                </p>
            </div>

            <Card className="border-2 border-[#94AF9F]/20">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Coming Soon!</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                    <p className="text-gray-600 text-lg">
                        We're working hard to bring you a comprehensive pantry stocking guide tailored to Portugal's local markets and healthy living.
                    </p>

                    <div className="bg-[#94AF9F]/5 rounded-lg p-6 space-y-3">
                        <h3 className="font-semibold text-lg">What to expect:</h3>
                        <ul className="text-left space-y-2 max-w-md mx-auto">
                            <li className="flex items-start">
                                <span className="text-[#94AF9F] mr-2">✓</span>
                                <span>Curated list of essential pantry staples</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-[#94AF9F] mr-2">✓</span>
                                <span>Local Portuguese brands and products</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-[#94AF9F] mr-2">✓</span>
                                <span>Sustainable and organic options</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-[#94AF9F] mr-2">✓</span>
                                <span>Shopping lists by dietary preference</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-[#94AF9F] mr-2">✓</span>
                                <span>Where to find specialty items</span>
                            </li>
                        </ul>
                    </div>

                    <div className="pt-4">
                        <p className="text-gray-600 mb-4">
                            Want to be notified when this service launches?
                        </p>
                        <Link href="/contact">
                            <Button className="bg-[#94AF9F] hover:bg-[#94AF9F]/90 text-white">
                                <Mail className="h-4 w-4 mr-2" />
                                Contact Us
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-8 text-center">
                <p className="text-gray-500 mb-4">
                    In the meantime, explore our other services:
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                    <Link href="/meal-plans">
                        <Button variant="outline">Personalized Meal Plans</Button>
                    </Link>
                    <Link href="/services/arrival-packages">
                        <Button variant="outline">Arrival Packages</Button>
                    </Link>
                    <Link href="/before-you-go">
                        <Button variant="outline">Before You Go Guide</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
