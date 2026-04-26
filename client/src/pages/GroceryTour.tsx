import React from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft, Mail } from "lucide-react";

export default function GroceryTour() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link href="/services">
                <Button variant="ghost" className="mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Services
                </Button>
            </Link>

            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-sage/10 text-sage mb-4">
                    <ShoppingCart className="h-10 w-10" />
                </div>
                <h1 className="font-cormorant text-3xl md:text-4xl font-bold mb-3">
                    Grocery Store & Personal Shopping Tour
                </h1>
                <p className="text-xl text-t2 font-outfit max-w-2xl mx-auto">
                    Guided tours of local markets and grocery stores with personalized shopping assistance
                </p>
            </div>

            <Card className="border-2 border-sage/20">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Coming Soon!</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                    <p className="text-t2 font-outfit text-lg">
                        We're developing personalized grocery tours to help you navigate Portuguese markets like a local.
                    </p>

                    <div className="bg-sage/5 rounded-lg p-6 space-y-3">
                        <h3 className="font-semibold text-lg">What to expect:</h3>
                        <ul className="text-left space-y-2 max-w-md mx-auto">
                            <li className="flex items-start">
                                <span className="text-sage mr-2">✓</span>
                                <span>Guided tours of local markets and supermarkets</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-sage mr-2">✓</span>
                                <span>Learn to identify local and organic products</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-sage mr-2">✓</span>
                                <span>Portuguese product label translation help</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-sage mr-2">✓</span>
                                <span>Personalized shopping assistance</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-sage mr-2">✓</span>
                                <span>Tips for budget-friendly healthy shopping</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-sage mr-2">✓</span>
                                <span>Best stores for specific dietary needs</span>
                            </li>
                        </ul>
                    </div>

                    <div className="pt-4">
                        <p className="text-t2 font-outfit mb-4">
                            Interested in a personalized grocery tour?
                        </p>
                        <Link href="/contact">
                            <Button className="bg-sage hover:bg-sage/90 text-white">
                                <Mail className="h-4 w-4 mr-2" />
                                Contact Us
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-8 text-center">
                <p className="text-t3 font-outfit mb-4">
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
