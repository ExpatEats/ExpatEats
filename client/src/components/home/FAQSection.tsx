import { useState } from "react";

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqs = [
        {
            question: "Is it free to use?",
            answer: "Browsing the guide is free. Creating an account to save favourites, add listings, or contribute as an ambassador is also free during our early access period. We plan to introduce a premium tier with advanced features – founding members lock in the lowest price it'll ever be."
        },
        {
            question: "How are listings verified?",
            answer: "Every listing is added by a community ambassador – an expat who actually lives in the city, shops at the location regularly, and can vouch for it. We don't accept self-submissions from businesses, and there are no paid placements. Ambassadors can update or remove listings when things change."
        },
        {
            question: "Can I add a place I've discovered?",
            answer: "Yes – that's the whole idea. Create a free account and apply to be an ambassador. Once approved, you can add and manage listings in your city. The guide grows because people like you care enough to contribute."
        },
        {
            question: "Which cities are covered?",
            answer: "Greater Lisbon are live now with 180+ verified listings. Porto and the Algarve are next – we're activating ambassadors in those regions now. If you live somewhere we haven't covered yet and want to help us get there faster, reach out."
        },
        {
            question: "What does \"organic\" or \"gluten-free\" actually mean in your filters?",
            answer: "Our filters reflect what ambassadors have verified in person – meaning the shop stocks a meaningful range of those products, not just one shelf. We don't make health claims or certify businesses. If something changes, ambassadors update the listing. We trust people over algorithms."
        },
        {
            question: "Does it work with Waze and Google Maps?",
            answer: "Yes. Every listing on the map opens directly in Waze or Google Maps with one tap – no address copying, no screenshot chaos. It works on any device, in any browser, without downloading an app."
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
                                <div className="p-[0_24px_20px_24px] text-[14px] font-outfit font-light text-t2 leading-[1.7]">
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
