import { useState } from "react";

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqs = [
        {
            question: "What is ExpatEats?",
            answer: "A discovery platform built for expats in Portugal. Find healthy grocery stores, supplement shops, and conscious living resources, filtered by your dietary needs and location. Everything is community-curated and vetted, so the guide gets better every time a member adds a spot."
        },
        {
            question: "I just arrived in Portugal — where do I start?",
            answer: "Head to the Food Discovery guide, choose your location, and filter by what matters to you: organic, gluten-free, vegan, and more. You'll get a curated list of vetted spots instantly. If you want a more guided experience, our Arrival Packages and Personal Consultation are designed exactly for this moment."
        },
        {
            question: "Do I need to already be living in Portugal?",
            answer: "Not at all. Many members start exploring before they move. It's a great way to understand what your healthy lifestyle will look like on the ground, and arrive feeling prepared rather than overwhelmed."
        },
        {
            question: "Which areas are covered?",
            answer: "ExpatEats currently has 180+ verified listings in the greater Lisbon area. Porto and the Algarve are coming next. You can help us get there faster by submitting locations we've missed."
        },
        {
            question: "Does it cover supplements?",
            answer: "Yes, and it's one of our most-used features. The Supplement Finder covers both local retailers and trusted online suppliers, so you never have to compromise on quality just because you've moved countries."
        },
        {
            question: "How do listings get verified and stay accurate?",
            answer: "Every listing is verified by a local ambassador who lives and shops there. Many of our spots are the kind of places you'd only discover if you knew someone; small, hard-to-find businesses with no marketing budget but exceptional quality. That's exactly why they're here."
        },
        {
            question: "Can I add a location?",
            answer: "Yes, and it's one of the most valuable things you can do. If you know a great spot that isn't listed yet, submit it via the Add Location tab. Our team reviews every submission before it goes live, so quality stays high while the community keeps growing."
        },
        {
            question: "Is it free?",
            answer: "Browsing the guide is completely free. For expats who want more hands-on support, we offer paid services including Personalized Meal Plans, Grocery and Shopping Tours, and our VIP Arrival Package, which includes a curated pantry setup. You can also book personal consultations directly with our nutrition experts based in Lisbon."
        },
        {
            question: "What dietary needs do you cover?",
            answer: "Gluten-free, dairy-free, vegan, vegetarian, organic, low-tox, zero-waste, farm-raised, and kid-friendly, with more being added as the community grows."
        },
        {
            question: "I own a health-conscious business in Portugal — can I be listed?",
            answer: "We'd love to hear about you. Head to Add a Location in the top menu and tell us about your business. Our team reviews every submission personally. We're always looking for the kind of hidden gems our community can't find anywhere else."
        },
        {
            question: "Who is behind ExpatEats?",
            answer: "ExpatEats was founded by a clinician and expat who experienced firsthand how disorienting it is to maintain a health-conscious lifestyle after relocating. Everything we build reflects that lived experience: practical, honest, and designed for people who actually care about what they put in their bodies."
        }
    ];

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="bg-white py-[88px] px-11 border-t border-mist" id="faq">
            <div className="max-w-[800px] mx-auto">
                {/* Eyebrow badge */}
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-2 h-2 rounded-full bg-sage"></div>
                    <span className="text-[11px] font-outfit font-medium tracking-[2px] uppercase text-bark">
                        Questions & answers
                    </span>
                </div>

                {/* Section heading */}
                <h2 className="font-cormorant text-[clamp(36px,4.5vw,54px)] font-light leading-[1.1] text-soil mb-[44px]">
                    The things everyone
                    <br />
                    <em className="italic text-bark">wants to know</em>
                </h2>

                {/* FAQ list */}
                <div className="space-y-3">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-cream rounded-xl border border-mist overflow-hidden transition-all"
                        >
                            <button
                                onClick={() => toggleFaq(index)}
                                className="w-full flex items-center justify-between p-[20px_24px] text-left cursor-pointer transition-colors hover:bg-white"
                            >
                                <span className="text-[15px] font-outfit font-medium text-soil pr-4">
                                    {faq.question}
                                </span>
                                <span
                                    className={`text-[24px] font-light text-bark transition-transform flex-shrink-0 ${
                                        openIndex === index ? "rotate-45" : ""
                                    }`}
                                >
                                    +
                                </span>
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-300 ${
                                    openIndex === index ? "max-h-96" : "max-h-0"
                                }`}
                            >
                                <div className="p-[12px_24px_20px_24px] text-[14px] font-outfit font-light text-t2 leading-[1.7]">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
