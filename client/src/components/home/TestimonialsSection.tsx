import { useState } from "react";

export function TestimonialsSection() {
    const [activeSlide, setActiveSlide] = useState(0);

    const testimonials = [
        {
            quote: "I moved to Cascais six months ago and spent weeks trying to find a good organic grocer. Found Celeiro in five minutes with this guide. Wish I had it on day one.",
            name: "Mara K.",
            location: "Berlin → Lisbon · 6 months",
            flag: "🇩🇪",
            theme: "light"
        },
        {
            quote: "Finally – a guide made by people who actually live this lifestyle, not a generic tourist list. The gluten-free filter alone saved me so much confusion at the supermarket.",
            name: "James & Priya L.",
            location: "San Francisco → Lisbon · 1 year",
            flag: "🇺🇸",
            theme: "dark"
        },
        {
            quote: "As a vegan, I was terrified of moving here. Expat Eats showed me there's actually a vibrant community of like-minded people and shops. Total game changer.",
            name: "Sophie T.",
            location: "London → Lisbon · 3 months",
            flag: "🇬🇧",
            theme: "light"
        }
    ];

    const handlePrev = () => {
        setActiveSlide((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setActiveSlide((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    };

    return (
        <section className="bg-white py-[88px] px-11">
            <div className="max-w-[1100px] mx-auto">
                {/* Eyebrow badge */}
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-2 h-2 rounded-full bg-sage"></div>
                    <span className="text-[11px] font-outfit font-medium tracking-[2px] uppercase text-bark">
                        Real expats, real results
                    </span>
                </div>

                {/* Section heading */}
                <h2 className="font-cormorant text-[clamp(36px,4.5vw,54px)] font-light leading-[1.1] text-soil">
                    They moved.
                    <br />
                    <em className="italic text-bark">They didn't settle.</em>
                </h2>

                {/* Description */}
                <p className="text-[15px] font-outfit font-light leading-[1.8] text-t2 max-w-[420px] mt-5 mb-0">
                    From day-one arrivals to long-timers still refining their routine – this is what finding your footing actually feels like.
                </p>

                {/* Carousel wrapper */}
                <div className="mt-[44px] relative">
                    {/* Slides track */}
                    <div className="overflow-hidden">
                        <div
                            className="flex transition-transform duration-500 ease-in-out"
                            style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                        >
                            {testimonials.map((testimonial, index) => (
                                <div
                                    key={index}
                                    className="min-w-full flex-shrink-0"
                                >
                                    <div
                                        className={`rounded-2xl p-[44px_48px] max-w-[720px] mx-auto ${
                                            testimonial.theme === "light"
                                                ? "bg-cream border border-mist"
                                                : "bg-soil border border-bark"
                                        }`}
                                    >
                                        {/* Quote */}
                                        <div
                                            className={`text-[18px] font-outfit font-light leading-[1.7] mb-7 ${
                                                testimonial.theme === "light"
                                                    ? "text-t1"
                                                    : "text-white/80"
                                            }`}
                                        >
                                            "{testimonial.quote.split(/(<strong>.*?<\/strong>)/).map((part, i) =>
                                                part.startsWith("<strong>") ? (
                                                    <strong
                                                        key={i}
                                                        className={testimonial.theme === "light" ? "font-medium text-soil" : "font-medium text-white"}
                                                    >
                                                        {part.replace(/<\/?strong>/g, "")}
                                                    </strong>
                                                ) : (
                                                    part
                                                )
                                            )}"
                                        </div>

                                        {/* Person */}
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-12 h-12 rounded-full flex items-center justify-center text-[20px] flex-shrink-0 ${
                                                    testimonial.theme === "light"
                                                        ? "bg-white border border-mist"
                                                        : "bg-bark"
                                                }`}
                                            >
                                                {testimonial.flag}
                                            </div>
                                            <div>
                                                <div
                                                    className={`text-[14px] font-outfit font-medium ${
                                                        testimonial.theme === "light"
                                                            ? "text-soil"
                                                            : "text-white"
                                                    }`}
                                                >
                                                    {testimonial.name}
                                                </div>
                                                <div
                                                    className={`text-[12px] font-outfit ${
                                                        testimonial.theme === "light"
                                                            ? "text-t3"
                                                            : "text-white/40"
                                                    }`}
                                                >
                                                    {testimonial.location}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-center gap-6 mt-8">
                        <button
                            onClick={handlePrev}
                            className="w-10 h-10 rounded-full border border-mist bg-white text-bark text-[20px] flex items-center justify-center cursor-pointer transition-all hover:border-bark hover:bg-cream"
                        >
                            ‹
                        </button>
                        <div className="flex gap-2">
                            {testimonials.map((_, index) => (
                                <div
                                    key={index}
                                    onClick={() => setActiveSlide(index)}
                                    className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                                        index === activeSlide
                                            ? "bg-bark w-6"
                                            : "bg-mist hover:bg-bark/30"
                                    }`}
                                ></div>
                            ))}
                        </div>
                        <button
                            onClick={handleNext}
                            className="w-10 h-10 rounded-full border border-mist bg-white text-bark text-[20px] flex items-center justify-center cursor-pointer transition-all hover:border-bark hover:bg-cream"
                        >
                            ›
                        </button>
                    </div>
                </div>

                {/* Quote bar */}
                <div className="flex items-center gap-8 bg-bark-pale border border-mist rounded-xl p-[24px_28px] mt-[44px] max-w-[720px] mx-auto">
                    <div className="text-[64px] font-cormorant font-light text-bark leading-none flex-shrink-0">
                        "
                    </div>
                    <div>
                        <div className="text-[15px] font-outfit font-light text-t1 leading-[1.7] mb-2">
                            The Facebook group questions stopped on day one. I didn't even know I could feel this relieved{" "}
                            <em className="italic">about a grocery run.</em>
                        </div>
                        <div className="text-[12px] font-outfit text-t3">
                            – Léa M., Amsterdam → Lisbon · Founding member
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="flex justify-center mt-[44px]">
                    <a
                        href="#about"
                        className="font-outfit text-[14px] font-medium text-bark border-2 border-bark rounded-lg px-[28px] py-[13px] transition-all hover:bg-bark hover:text-white"
                    >
                        Read our story →
                    </a>
                </div>
            </div>
        </section>
    );
}
