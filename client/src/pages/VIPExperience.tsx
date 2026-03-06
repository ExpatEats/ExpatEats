import React from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Check,
    Star,
    ShoppingBag,
    Home,
    Gift,
    Phone,
    Map,
    Users,
    Mail,
    Info,
    ArrowLeft,
    Euro
} from "lucide-react";

const VIPExperience: React.FC = () => {
    return (
        <>
            {/* Back Button */}
            <div className="container mx-auto px-4 pt-8">
                <Link href="/services">
                    <Button variant="ghost" className="mb-6">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Services
                    </Button>
                </Link>
            </div>

            {/* Hero Section */}
            <section className="relative py-12 md:py-24 overflow-hidden">
                <div
                    className="absolute inset-0 z-0 bg-center bg-cover opacity-20"
                    style={{
                        backgroundImage:
                            'url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080")',
                    }}
                />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center justify-center p-3 bg-[#E07A5F] bg-opacity-10 rounded-full mb-6">
                            <Star className="h-8 w-8 text-[#E07A5F]" />
                        </div>
                        <h1 className="font-montserrat text-4xl md:text-5xl lg:text-6xl font-light tracking-wide mb-4 text-neutral-dark">
                            VIP Experience
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-neutral-dark font-light">
                            For those who want it all, without the overwhelm.
                        </p>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Our VIP Experience is the most comprehensive service we offer, designed for individuals and families who want seamless support before, during, and after their move to Portugal.
                        </p>
                    </div>
                </div>
            </section>

            {/* What's Included Section */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="font-montserrat text-3xl font-bold mb-8 text-center text-neutral-dark">
                        What's Included
                    </h2>
                    <div className="max-w-5xl mx-auto">
                        <Card className="mb-8 shadow-lg border-t-4 border-[#E07A5F]">
                            <CardContent className="pt-6">
                                <p className="text-lg text-neutral-dark leading-relaxed mb-8">
                                    This premium package includes everything from personalized pantry setup to wellness-curated household essentials, all delivered and stocked before you arrive. You'll also receive a one-year membership to the Expat Eats community, which includes ongoing support, insider resources, wellness perks, and exclusive discounts.
                                </p>
                                <p className="text-lg text-neutral-dark leading-relaxed">
                                    We'll even surprise you with handpicked goodies from some of our favorite local vendors — think clean beauty, functional snacks, herbal teas, and home comforts to ease your transition.
                                </p>
                            </CardContent>
                        </Card>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="shadow-lg hover:shadow-xl transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-[#94AF9F] bg-opacity-10 p-3 rounded-full flex-shrink-0">
                                            <ShoppingBag className="h-6 w-6 text-[#94AF9F]" />
                                        </div>
                                        <div>
                                            <h3 className="font-montserrat font-semibold text-lg mb-2">
                                                Curated Pantry & Personal Care
                                            </h3>
                                            <p className="text-gray-600">
                                                All clean, high-quality items tailored to your preferences
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg hover:shadow-xl transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-[#E07A5F] bg-opacity-10 p-3 rounded-full flex-shrink-0">
                                            <Home className="h-6 w-6 text-[#E07A5F]" />
                                        </div>
                                        <div>
                                            <h3 className="font-montserrat font-semibold text-lg mb-2">
                                                Full Home Setup
                                            </h3>
                                            <p className="text-gray-600">
                                                Local delivery and complete kitchen/home setup on arrival day
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg hover:shadow-xl transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-[#DDB892] bg-opacity-30 p-3 rounded-full flex-shrink-0">
                                            <Gift className="h-6 w-6 text-[#94AF9F]" />
                                        </div>
                                        <div>
                                            <h3 className="font-montserrat font-semibold text-lg mb-2">
                                                Organic Wellness Gifts
                                            </h3>
                                            <p className="text-gray-600">
                                                Handpicked items from our favorite Portuguese brands
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg hover:shadow-xl transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-[#94AF9F] bg-opacity-10 p-3 rounded-full flex-shrink-0">
                                            <Phone className="h-6 w-6 text-[#94AF9F]" />
                                        </div>
                                        <div>
                                            <h3 className="font-montserrat font-semibold text-lg mb-2">
                                                Personalized Support
                                            </h3>
                                            <p className="text-gray-600">
                                                Virtual welcome call and WhatsApp support during your first week
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg hover:shadow-xl transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-[#E07A5F] bg-opacity-10 p-3 rounded-full flex-shrink-0">
                                            <Map className="h-6 w-6 text-[#E07A5F]" />
                                        </div>
                                        <div>
                                            <h3 className="font-montserrat font-semibold text-lg mb-2">
                                                Relocation Resources
                                            </h3>
                                            <p className="text-gray-600">
                                                Printed market map and relocation-friendly resources
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-lg hover:shadow-xl transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-[#DDB892] bg-opacity-30 p-3 rounded-full flex-shrink-0">
                                            <Users className="h-6 w-6 text-[#94AF9F]" />
                                        </div>
                                        <div>
                                            <h3 className="font-montserrat font-semibold text-lg mb-2">
                                                1-Year Community Membership
                                            </h3>
                                            <p className="text-gray-600">
                                                Ongoing support, insider resources, wellness perks, and exclusive discounts
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="mt-6 shadow-lg bg-gradient-to-r from-[#94AF9F]/5 to-[#E07A5F]/5 border-2 border-[#E07A5F]">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-[#E07A5F] bg-opacity-10 p-3 rounded-full flex-shrink-0">
                                        <Gift className="h-6 w-6 text-[#E07A5F]" />
                                    </div>
                                    <div>
                                        <h3 className="font-montserrat font-semibold text-lg mb-2 text-neutral-dark">
                                            Bonus: €25 Credit
                                        </h3>
                                        <p className="text-gray-700">
                                            Receive €25 credit toward a custom meal plan to help you settle in
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Perfect For Section */}
            <section className="py-12 bg-[#F9F5F0]">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="font-montserrat text-3xl font-bold mb-8 text-center text-neutral-dark">
                            Perfect For
                        </h2>
                        <Card className="shadow-lg">
                            <CardContent className="pt-6">
                                <div className="grid md:grid-cols-3 gap-6 text-center">
                                    <div>
                                        <div className="bg-[#94AF9F] bg-opacity-10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                            <Users className="h-8 w-8 text-[#94AF9F]" />
                                        </div>
                                        <h3 className="font-semibold text-lg mb-2">Families</h3>
                                        <p className="text-gray-600 text-sm">
                                            Everything your family needs to feel at home instantly
                                        </p>
                                    </div>
                                    <div>
                                        <div className="bg-[#E07A5F] bg-opacity-10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                            <Star className="h-8 w-8 text-[#E07A5F]" />
                                        </div>
                                        <h3 className="font-semibold text-lg mb-2">Wellness-Conscious Individuals</h3>
                                        <p className="text-gray-600 text-sm">
                                            Premium, curated items aligned with your lifestyle
                                        </p>
                                    </div>
                                    <div>
                                        <div className="bg-[#DDB892] bg-opacity-30 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                            <ShoppingBag className="h-8 w-8 text-[#94AF9F]" />
                                        </div>
                                        <h3 className="font-semibold text-lg mb-2">Busy Professionals</h3>
                                        <p className="text-gray-600 text-sm">
                                            Let us handle everything while you focus on your move
                                        </p>
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
                        Investment
                    </h2>
                    <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
                        A premium, all-inclusive arrival experience designed to make your transition to Portugal seamless and stress-free.
                    </p>

                    {/* Coming Soon Banner */}
                    <div className="max-w-4xl mx-auto mb-8">
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
                                            We're preparing to launch our VIP Experience service. This comprehensive package will be available soon for those who want the ultimate white-glove arrival experience in Portugal.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="max-w-2xl mx-auto">
                        <Card className="shadow-xl border-2 border-[#E07A5F] relative">
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                <span className="bg-[#E07A5F] text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                                    <Star className="h-4 w-4" />
                                    Premium Service
                                    <Star className="h-4 w-4" />
                                </span>
                            </div>
                            <CardHeader className="text-center pb-4 pt-8">
                                <CardTitle className="text-3xl font-montserrat mb-2">
                                    VIP Experience Package
                                </CardTitle>
                                <p className="text-gray-600 text-sm mb-6">
                                    Comprehensive arrival support tailored to your needs
                                </p>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-gray-600 text-lg">Starting at</span>
                                    <Euro className="h-10 w-10 text-[#E07A5F]" />
                                    <span className="text-6xl font-bold text-neutral-dark">
                                        795
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    Final cost includes pantry + personal care item sourcing, delivery, and 1:1 onboarding
                                </p>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-start">
                                        <Check className="text-[#94AF9F] mr-3 h-5 w-5 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700">
                                            Curated pantry and personal care items (clean, high-quality)
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="text-[#94AF9F] mr-3 h-5 w-5 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700">
                                            Local delivery and full kitchen/home setup on arrival day
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="text-[#94AF9F] mr-3 h-5 w-5 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700">
                                            Organic wellness gifts from favorite Portuguese brands
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="text-[#94AF9F] mr-3 h-5 w-5 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700">
                                            Personalized virtual welcome call and WhatsApp support
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="text-[#94AF9F] mr-3 h-5 w-5 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700">
                                            Printed market map + relocation-friendly resources
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="text-[#94AF9F] mr-3 h-5 w-5 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700">
                                            One-year Expat Eats Community Membership
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="text-[#E07A5F] mr-3 h-5 w-5 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700 font-semibold">
                                            Bonus: €25 credit toward a custom meal plan
                                        </span>
                                    </li>
                                </ul>

                                <div className="bg-[#F9F5F0] rounded-lg p-4 mb-6">
                                    <p className="text-sm text-gray-600 text-center">
                                        <strong>Note:</strong> Pricing varies depending on household size and preferences.
                                    </p>
                                </div>

                                <Button
                                    disabled={true}
                                    className="w-full py-6 text-lg font-semibold rounded-full bg-[#E07A5F] text-white opacity-50 cursor-not-allowed"
                                >
                                    Coming Soon
                                </Button>

                                <p className="text-center text-gray-600 mt-6 text-sm">
                                    Interested in the VIP Experience? Contact us to be notified when it launches.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="text-center mt-8">
                        <p className="text-gray-600 mb-4">
                            Have questions about the VIP Experience?
                        </p>
                        <Link href="/contact-us">
                            <Button
                                variant="outline"
                                className="border-2 border-[#94AF9F] text-[#94AF9F] hover:bg-[#94AF9F] hover:text-white py-3 px-8 rounded-full font-semibold transition"
                            >
                                <Mail className="h-4 w-4 mr-2" />
                                Contact Us
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* How to Reserve Section */}
            <section className="py-12 bg-[#F9F5F0]">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="font-montserrat text-3xl font-bold mb-8 text-center text-neutral-dark">
                            How to Reserve Your Spot
                        </h2>
                        <Card className="shadow-lg">
                            <CardContent className="pt-6">
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-[#E07A5F] text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                                            1
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg mb-2">Send Us an Email</h3>
                                            <p className="text-gray-600">
                                                Email us with "VIP" in the subject line. We'll personally be in touch to discuss your needs.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="bg-[#94AF9F] text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                                            2
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg mb-2">Schedule Your Free Call</h3>
                                            <p className="text-gray-600">
                                                Book a free 20-minute call with our team to discuss dietary needs, household preferences, and arrival details.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="bg-[#DDB892] text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                                            3
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg mb-2">Confirm with Deposit</h3>
                                            <p className="text-gray-600">
                                                A €50 deposit is required 24 hours prior to your call to confirm your spot. This deposit goes toward your total.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="bg-[#E07A5F] text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                                            4
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg mb-2">Relax & Let Us Handle the Rest</h3>
                                            <p className="text-gray-600">
                                                We'll take care of everything so you can focus on your move and arrive to a fully stocked, welcoming home.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-[#94AF9F] to-[#E07A5F] text-white">
                <div className="container mx-auto px-4 text-center">
                    <Star className="h-12 w-12 mx-auto mb-4" />
                    <h2 className="font-montserrat text-3xl font-bold mb-4">
                        Ready for the VIP Treatment?
                    </h2>
                    <p className="text-lg mb-8 max-w-2xl mx-auto">
                        Let us take care of the details so you can focus on what matters most — settling into your new life in Portugal with ease and confidence.
                    </p>
                    <Link href="/contact-us">
                        <Button
                            className="bg-white text-[#94AF9F] hover:bg-gray-100 font-bold py-3 px-8 rounded-full text-lg shadow-lg transition transform hover:scale-105"
                        >
                            <Mail className="h-5 w-5 mr-2" />
                            Get Started Today
                        </Button>
                    </Link>
                </div>
            </section>
        </>
    );
};

export default VIPExperience;
