import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import NutritionForm from "@/components/forms/NutritionForm";
import {
    Calendar,
    Clock,
    UserCheck,
    Salad,
    ShoppingBag,
    Heart,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Nutrition: React.FC = () => {
    const { toast } = useToast();

    const handleGenerateMealPlan = () => {
        toast({
            title: "Meal Plan Generated",
            description: "Your personalized meal plan has been created!",
            variant: "default",
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="font-montserrat text-3xl font-bold mb-4">
                        Nutrition & Meal Planning
                    </h1>
                    <p className="text-lg max-w-3xl mx-auto">
                        Get personalized nutrition advice and meal plans that
                        incorporate local ingredients while accommodating your
                        dietary preferences and needs.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {/* Meal Planning Card */}
                    <Card className="overflow-hidden">
                        <div className="relative h-64 w-full">
                            <img
                                src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500"
                                alt="Organized meal prep with healthy food containers"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </div>

                        <CardHeader>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="bg-[#F5A623] bg-opacity-10 p-3 rounded-full">
                                    <Calendar className="text-[#F5A623] h-5 w-5" />
                                </div>
                                <CardTitle className="text-xl">
                                    Personalized Meal Planning
                                </CardTitle>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <p className="mb-4">
                                Get customized meal plans that incorporate local
                                ingredients while meeting your dietary needs and
                                preferences.
                            </p>

                            <ul className="space-y-2 mb-6">
                                <li className="flex items-start">
                                    <div className="text-[#F5A623] mr-2 pt-0.5">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <span>
                                        Weekly meal plans based on your
                                        preferences
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <div className="text-[#F5A623] mr-2 pt-0.5">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <span>
                                        Shopping lists with local store
                                        availability
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <div className="text-[#F5A623] mr-2 pt-0.5">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <span>
                                        Recipe adaptations using available
                                        ingredients
                                    </span>
                                </li>
                            </ul>

                            <Button
                                className="w-full bg-[#F5A623] hover:bg-[#F5A623]/90 text-white rounded-full font-medium"
                                onClick={handleGenerateMealPlan}
                            >
                                Generate Meal Plan
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Nutrition Consultation Card */}
                    <Card className="overflow-hidden">
                        <div className="relative h-64 w-full">
                            <img
                                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500"
                                alt="Nutrition consultation session"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </div>

                        <CardHeader>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="bg-[#D64545] bg-opacity-10 p-3 rounded-full">
                                    <UserCheck className="text-[#D64545] h-5 w-5" />
                                </div>
                                <CardTitle className="text-xl">
                                    Nutrition Consultation
                                </CardTitle>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <p className="mb-4">
                                Connect with certified nutritionists who
                                understand the challenges of maintaining healthy
                                eating habits while living abroad.
                            </p>

                            <NutritionForm />
                        </CardContent>
                    </Card>
                </div>

                <div className="mb-12">
                    <h2 className="font-montserrat text-2xl font-bold mb-6 text-center">
                        Our Nutrition Services
                    </h2>

                    <Tabs defaultValue="services">
                        <TabsList className="w-full justify-center mb-6">
                            <TabsTrigger value="services">Services</TabsTrigger>
                            <TabsTrigger value="approach">
                                Our Approach
                            </TabsTrigger>
                            <TabsTrigger value="testimonials">
                                Testimonials
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="services">
                            <div className="grid md:grid-cols-3 gap-6">
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="bg-[#5A8D3B] bg-opacity-10 p-3 rounded-full">
                                                <Salad className="text-[#5A8D3B] h-5 w-5" />
                                            </div>
                                            <h3 className="font-semibold text-lg">
                                                Dietary Assessment
                                            </h3>
                                        </div>
                                        <p className="text-gray-600">
                                            Comprehensive analysis of your
                                            current eating habits, nutritional
                                            needs, and health goals, with
                                            specific recommendations for your
                                            expat lifestyle.
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="bg-[#F5A623] bg-opacity-10 p-3 rounded-full">
                                                <ShoppingBag className="text-[#F5A623] h-5 w-5" />
                                            </div>
                                            <h3 className="font-semibold text-lg">
                                                Grocery Shopping Tours
                                            </h3>
                                        </div>
                                        <p className="text-gray-600">
                                            Guided tours of local markets and
                                            stores to help you identify healthy
                                            options and find international
                                            ingredients in your new city.
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="bg-[#D64545] bg-opacity-10 p-3 rounded-full">
                                                <Heart className="text-[#D64545] h-5 w-5" />
                                            </div>
                                            <h3 className="font-semibold text-lg">
                                                Holistic Wellness
                                            </h3>
                                        </div>
                                        <p className="text-gray-600">
                                            Beyond nutrition, we address
                                            lifestyle factors like stress
                                            management and sleep, which affect
                                            overall health during international
                                            transitions.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="mt-8 text-center">
                                <Button
                                    className="bg-[#5A8D3B] hover:bg-[#5A8D3B]/90 rounded-full"
                                    onClick={() => {
                                        document
                                            .getElementById(
                                                "nutrition-consultation",
                                            )
                                            ?.scrollIntoView({
                                                behavior: "smooth",
                                            });
                                    }}
                                >
                                    Book a Service
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="approach">
                            <Card>
                                <CardContent className="pt-6">
                                    <h3 className="font-montserrat text-xl font-semibold mb-4">
                                        Our Holistic Nutrition Approach
                                    </h3>

                                    <p className="mb-4">
                                        At ExpatEats, we understand that
                                        maintaining healthy eating habits while
                                        living abroad presents unique
                                        challenges. Our approach combines
                                        evidence-based nutrition science with
                                        practical solutions for expatriates:
                                    </p>

                                    <div className="space-y-6 mt-6">
                                        <div>
                                            <h4 className="font-semibold mb-2 flex items-center">
                                                <div className="bg-[#5A8D3B] bg-opacity-10 p-2 rounded-full mr-2">
                                                    <span className="text-[#5A8D3B]">
                                                        1
                                                    </span>
                                                </div>
                                                Culturally Adaptive Nutrition
                                            </h4>
                                            <p className="text-gray-600 pl-10">
                                                We help you maintain your
                                                cultural food traditions while
                                                incorporating healthy local
                                                options from your new country of
                                                residence.
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold mb-2 flex items-center">
                                                <div className="bg-[#5A8D3B] bg-opacity-10 p-2 rounded-full mr-2">
                                                    <span className="text-[#5A8D3B]">
                                                        2
                                                    </span>
                                                </div>
                                                Ingredient Substitution
                                                Expertise
                                            </h4>
                                            <p className="text-gray-600 pl-10">
                                                Our nutritionists are skilled at
                                                helping you find suitable local
                                                alternatives when ingredients
                                                from home aren't available.
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold mb-2 flex items-center">
                                                <div className="bg-[#5A8D3B] bg-opacity-10 p-2 rounded-full mr-2">
                                                    <span className="text-[#5A8D3B]">
                                                        3
                                                    </span>
                                                </div>
                                                Stress-Reduction Focus
                                            </h4>
                                            <p className="text-gray-600 pl-10">
                                                We recognize that relocation
                                                stress can impact eating habits,
                                                and provide strategies to
                                                maintain nutritional balance
                                                during transition periods.
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold mb-2 flex items-center">
                                                <div className="bg-[#5A8D3B] bg-opacity-10 p-2 rounded-full mr-2">
                                                    <span className="text-[#5A8D3B]">
                                                        4
                                                    </span>
                                                </div>
                                                Community Connection
                                            </h4>
                                            <p className="text-gray-600 pl-10">
                                                We believe in the power of
                                                community for sustainable
                                                healthy habits, and connect you
                                                with like-minded expats who
                                                share your nutrition goals.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="testimonials">
                            <div className="grid md:grid-cols-2 gap-6">
                                <Card className="bg-[#F9F5F0]">
                                    <CardContent className="pt-6">
                                        <p className="italic mb-4">
                                            "The nutritionist helped me adapt my
                                            Mediterranean diet to use locally
                                            available ingredients in Lisbon. My
                                            energy levels have improved, and
                                            I've discovered amazing Portuguese
                                            superfoods!"
                                        </p>
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-gray-300 rounded-full mr-3 flex items-center justify-center">
                                                M
                                            </div>
                                            <div>
                                                <h4 className="font-medium">
                                                    Marco D.
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    Italian in Portugal
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-[#F9F5F0]">
                                    <CardContent className="pt-6">
                                        <p className="italic mb-4">
                                            "The meal planning service was
                                            lifechanging! As a busy
                                            professional, having weekly plans
                                            that account for my dietary
                                            restrictions while using local
                                            ingredients has saved me so much
                                            time and stress."
                                        </p>
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-gray-300 rounded-full mr-3 flex items-center justify-center">
                                                S
                                            </div>
                                            <div>
                                                <h4 className="font-medium">
                                                    Sophia K.
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    American in Germany
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <div
                    id="nutrition-consultation"
                    className="bg-white rounded-xl card-shadow p-8"
                >
                    <div className="text-center mb-8">
                        <h2 className="font-montserrat text-2xl font-bold mb-3">
                            Get Personalized Nutrition Support
                        </h2>
                        <p className="text-gray-600 max-w-3xl mx-auto">
                            Our team of certified nutritionists specializes in
                            helping expatriates maintain healthy eating habits
                            while embracing local food cultures.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-semibold text-lg mb-4">
                                How It Works
                            </h3>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-[#5A8D3B] bg-opacity-10 p-3 rounded-full">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="text-[#5A8D3B] h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-medium">
                                            Submit Your Request
                                        </h4>
                                        <p className="text-gray-600">
                                            Fill out our consultation form with
                                            your details and nutrition goals.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-[#5A8D3B] bg-opacity-10 p-3 rounded-full">
                                        <Clock className="text-[#5A8D3B] h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium">
                                            Schedule a Session
                                        </h4>
                                        <p className="text-gray-600">
                                            We'll contact you within 24 hours to
                                            arrange your consultation.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-[#5A8D3B] bg-opacity-10 p-3 rounded-full">
                                        <UserCheck className="text-[#5A8D3B] h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium">
                                            Meet Your Nutritionist
                                        </h4>
                                        <p className="text-gray-600">
                                            Have a one-on-one session in person
                                            or via video call.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-[#5A8D3B] bg-opacity-10 p-3 rounded-full">
                                        <Salad className="text-[#5A8D3B] h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium">
                                            Receive Your Plan
                                        </h4>
                                        <p className="text-gray-600">
                                            Get a customized nutrition plan
                                            tailored to your needs and location.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator className="my-6" />

                            <div>
                                <h3 className="font-semibold text-lg mb-3">
                                    Our Nutritionists
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Our team includes certified nutritionists
                                    with experience working with expatriate
                                    communities in multiple countries. Many are
                                    expats themselves who understand the unique
                                    challenges of maintaining healthy eating
                                    habits abroad.
                                </p>
                                <Button className="bg-[#5A8D3B] hover:bg-[#5A8D3B]/90 rounded-full">
                                    Meet Our Team
                                </Button>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-4">
                                Request a Consultation
                            </h3>
                            <Card>
                                <CardContent className="pt-6">
                                    <NutritionForm />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Nutrition;
