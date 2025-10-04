import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import SearchForm from "@/components/forms/SearchForm";
import CategoryCard from "@/components/places/CategoryCard";
import TestimonialCard from "@/components/places/TestimonialCard";
import { Category, Testimonial } from "@/lib/types";
import { Camera, Users, Check } from "lucide-react";

const Home: React.FC = () => {
    // Fetch categories
    const { data: categories = [] } = useQuery<Category[]>({
        queryKey: ["/api/categories"],
    });

    // Fetch testimonials
    const { data: testimonials = [] } = useQuery<Testimonial[]>({
        queryKey: ["/api/testimonials"],
    });

    const handleSearch = (city: string) => {
        window.location.href = `/discover?city=${encodeURIComponent(city)}`;
    };

    return (
        <>
            {/* Hero Section */}
            <section className="relative py-12 md:py-24 overflow-hidden">
                <div
                    className="absolute inset-0 z-0 bg-center bg-cover opacity-20"
                    style={{
                        backgroundImage:
                            'url("https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080")',
                    }}
                />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="mb-6">
                            <Link href="/contact">
                                <Button className="bg-[#E07A5F] hover:bg-opacity-90 text-white font-light py-3 px-8 rounded-full text-lg shadow-lg transition transform hover:scale-105">
                                    I want someone to figure this all out for me
                                </Button>
                            </Link>
                        </div>

                        <h1 className="font-montserrat text-4xl md:text-5xl lg:text-6xl font-light tracking-wide mb-4 text-neutral-dark">
                            Your Guide to Sustainable Living Abroad
                        </h1>
                        <p className="text-lg md:text-xl mb-8 text-neutral-dark">
                            Register to access our comprehensive guides to
                            sustainable shopping in the Lisbon area and join our
                            community of expats.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/discover">
                                <Button className="bg-[#5A8D3B] hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transition transform hover:scale-105 w-full sm:w-auto">
                                    <Camera className="mr-2" />
                                    Visual Search
                                </Button>
                            </Link>
                            <Link href="/community">
                                <Button className="bg-[#F5A623] hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transition transform hover:scale-105 w-full sm:w-auto">
                                    <Users className="mr-2" />
                                    Join Community
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Visual Search Intro */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="md:w-1/2">
                            <h2 className="font-montserrat text-3xl font-bold mb-4 text-neutral-dark">
                                Search With Your Eyes, Not Just Words
                            </h2>
                            <p className="mb-4 text-neutral-dark">
                                Upload an image of food you're craving, and
                                we'll find the closest match in your area. No
                                more struggling to describe that special dish
                                from home.
                            </p>
                            <ul className="space-y-2 mb-6">
                                <li className="flex items-start">
                                    <Check className="text-[#5A8D3B] mr-2 h-5 w-5" />
                                    <span>
                                        Find international ingredients by image
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <Check className="text-[#5A8D3B] mr-2 h-5 w-5" />
                                    <span>
                                        Discover restaurants serving your
                                        favorite dishes
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <Check className="text-[#5A8D3B] mr-2 h-5 w-5" />
                                    <span>
                                        Connect with others who share your food
                                        interests
                                    </span>
                                </li>
                            </ul>
                            <Link href="/discover">
                                <Button className="bg-[#5A8D3B] hover:bg-opacity-90 text-white py-2 px-6 rounded-full font-medium flex items-center">
                                    <Camera className="mr-2 h-4 w-4" />
                                    Upload Food Image
                                </Button>
                            </Link>
                        </div>
                        <div className="md:w-1/2 grid grid-cols-2 gap-4">
                            {/* Images */}
                            <img
                                src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600"
                                alt="Organic grocery store with fresh produce"
                                className="rounded-lg shadow-lg w-full object-cover h-48"
                            />

                            <img
                                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600"
                                alt="Healthy food restaurant interior"
                                className="rounded-lg shadow-lg w-full object-cover h-48"
                            />

                            <img
                                src="https://images.unsplash.com/photo-1533792344354-ed5e8fc12494?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600"
                                alt="International food market with spices"
                                className="rounded-lg shadow-lg w-full object-cover h-48"
                            />

                            <img
                                src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600"
                                alt="Person shopping at local farmer's market"
                                className="rounded-lg shadow-lg w-full object-cover h-48"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Categories */}
            <section className="py-12 bg-[#F9F5F0]">
                <div className="container mx-auto px-4">
                    <h2 className="font-montserrat text-3xl font-bold mb-8 text-center text-neutral-dark">
                        Find What You're Looking For
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {categories.map((category) => (
                            <CategoryCard
                                key={category.id}
                                category={category}
                                onClick={() =>
                                    (window.location.href = `/discover?category=${category.name.toLowerCase()}`)
                                }
                            />
                        ))}
                    </div>

                    <SearchForm onSearch={handleSearch} />
                </div>
            </section>

            {/* Community Section */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="md:w-1/2">
                            <img
                                src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                                alt="Expat community gathering around food"
                                className="rounded-xl shadow-lg w-full"
                            />
                        </div>
                        <div className="md:w-1/2">
                            <h2 className="font-montserrat text-3xl font-bold mb-4 text-neutral-dark">
                                Join Our Community
                            </h2>
                            <p className="mb-6 text-neutral-dark">
                                Register to access our comprehensive guides to
                                sustainable shopping in the Lisbon area and join
                                our community of expats.
                            </p>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-[#5A8D3B] bg-opacity-10 p-3 rounded-full">
                                        <Users className="text-[#5A8D3B] h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-montserrat font-semibold text-lg">
                                            Join Food Meetups
                                        </h3>
                                        <p className="text-gray-600">
                                            Connect with others who share your
                                            culinary interests
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-[#5A8D3B] bg-opacity-10 p-3 rounded-full">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="text-[#5A8D3B] h-5 w-5"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-montserrat font-semibold text-lg">
                                            Share Tips & Recipes
                                        </h3>
                                        <p className="text-gray-600">
                                            Exchange cooking advice and favorite
                                            recipes
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-[#5A8D3B] bg-opacity-10 p-3 rounded-full">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="text-[#5A8D3B] h-5 w-5"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                            <circle
                                                cx="12"
                                                cy="10"
                                                r="3"
                                            ></circle>
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-montserrat font-semibold text-lg">
                                            Contribute Locations
                                        </h3>
                                        <p className="text-gray-600">
                                            Add your discoveries to help other
                                            expats
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Link href="/community">
                                <Button className="bg-[#F5A623] hover:bg-opacity-90 text-white py-2 px-6 rounded-full font-medium flex items-center">
                                    <Users className="mr-2 h-4 w-4" />
                                    Join Community
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="font-montserrat text-3xl font-bold mb-8 text-center text-neutral-dark">
                        What Our Community Says
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((testimonial) => (
                            <TestimonialCard
                                key={testimonial.id}
                                testimonial={testimonial}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-[#5A8D3B] text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="font-montserrat text-3xl font-bold mb-4">
                        Ready to Find Your Favorite Foods?
                    </h2>
                    <p className="text-lg mb-8 max-w-2xl mx-auto">
                        Join thousands of expats who have discovered local
                        sources for their favorite foods from back home.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/discover">
                            <Button className="bg-white text-[#5A8D3B] hover:bg-gray-100 font-bold py-3 px-8 rounded-full text-lg shadow-lg transition w-full sm:w-auto">
                                Get Started Free
                            </Button>
                        </Link>
                        <Link href="/nutrition">
                            <Button
                                variant="outline"
                                className="border-2 border-white hover:bg-white hover:bg-opacity-10 text-white font-bold py-3 px-8 rounded-full text-lg transition w-full sm:w-auto"
                            >
                                Learn More
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Home;
