export function HowItWorksSection() {
    const steps = [
        {
            number: "01",
            label: "Search",
            heading: "Tell us what matters to you",
            description: "Choose Greater Lisbon, then filter by what you won't compromise on – organic, vegan, gluten-free, zero-waste, low-tox, and more. No settling."
        },
        {
            number: "02",
            label: "Discover",
            heading: "Real spots, real people",
            description: "Browse as a list or jump straight to the map. Every listing was put there by someone who actually shops there. Businesses can't pay to appear – ever."
        },
        {
            number: "03",
            label: "Shop & Share",
            heading: "Live your life, leave breadcrumbs",
            description: "Once you find something great, add a photo or leave a note – or just favorite it for later. Your wins become someone else's shortcut."
        }
    ];

    return (
        <section className="bg-white py-[88px] px-11">
            <div className="max-w-[1100px] mx-auto">
                {/* Eyebrow badge */}
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-2 h-2 rounded-full bg-sage"></div>
                    <span className="text-[11px] font-outfit font-medium tracking-[2px] uppercase text-bark">
                        How it works
                    </span>
                </div>

                {/* Section heading */}
                <h2 className="font-cormorant text-[clamp(36px,4.5vw,54px)] font-light leading-[1.1] text-soil mb-[44px]">
                    From landed to sorted
                    <br />
                    <em className="italic text-bark">in an afternoon.</em>
                </h2>

                {/* Steps grid */}
                <div className="grid md:grid-cols-3 gap-[1px] bg-mist rounded-2xl overflow-hidden">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="bg-white p-[36px_30px] transition-colors hover:bg-cream"
                        >
                            <div className="font-cormorant text-[12px] text-bark font-normal mb-4 tracking-[1px]">
                                {step.number} – {step.label}
                            </div>
                            <h3 className="font-cormorant text-[22px] font-normal text-soil mb-2">
                                {step.heading}
                            </h3>
                            <p className="text-[13px] font-outfit font-light text-t2 leading-[1.7]">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
