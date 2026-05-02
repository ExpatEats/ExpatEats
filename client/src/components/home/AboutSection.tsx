export function AboutSection() {
    const stats = [
        { number: "180", suffix: "+", label: "verified listings" },
        { number: "2", suffix: "", label: "cities live now" },
        { number: "12", suffix: "+", label: "dietary filters" },
        { number: "4", suffix: "", label: "guides available now" }
    ];

    return (
        <section className="bg-cream py-[88px] px-11" id="about">
            <div className="max-w-[1100px] mx-auto">
                <div className="grid md:grid-cols-2 gap-16 items-start">
                    {/* Left side - Story */}
                    <div>
                        <div className="text-[11px] font-outfit font-medium tracking-[2px] text-bark mb-5">
                            ✦ Our story
                        </div>
                        <h2 className="font-cormorant text-[clamp(36px,4.5vw,54px)] font-light leading-[1.1] text-soil mb-7">
                            Built because
                            <br />
                            <em className="italic text-bark">
                                we needed it
                                <br />
                                and it didn't exist.
                            </em>
                        </h2>
                        <p className="text-[15px] font-outfit font-light leading-[1.8] text-t2 mb-5">
                            Expat Eats started with one frustrating afternoon in a Portuguese supermarket – staring at labels, unable to figure out if anything was actually organic, wondering how anyone does this without Google Translate and three hours to spare.
                        </p>
                        <p className="text-[15px] font-outfit font-light leading-[1.8] text-t2 mb-5">
                            We're health-conscious expats who made the move to Portugal and spent months learning what we wish someone had just told us on day one. So we built the guide we needed – starting with Greater Lisbon, and growing one verified listing at a time.
                        </p>
                        <p className="text-[15px] font-outfit font-light leading-[1.8] text-t2">
                            No algorithms. No paid placements. No "just eat what's local" advice that ignores the fact you have real dietary needs. Just an honest, human-curated map for people who care about what they put in their bodies – wherever they call home.
                        </p>
                    </div>

                    {/* Right side - Stats card */}
                    <div>
                        <div className="bg-white rounded-2xl p-[40px] border border-mist">
                            {/* Stats grid */}
                            <div className="grid grid-cols-2 gap-8 mb-8">
                                {stats.map((stat, index) => (
                                    <div key={index} className="text-center">
                                        <div className="font-cormorant text-[44px] font-light text-soil leading-none mb-2">
                                            {stat.number}
                                            {stat.suffix && <em className="not-italic text-bark">{stat.suffix}</em>}
                                        </div>
                                        <div className="text-[11px] font-outfit text-t3 uppercase tracking-[1px]">
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Quote */}
                            <div className="border-t border-mist pt-7">
                                <div className="text-[15px] font-outfit font-light italic text-t1 leading-[1.7] mb-3">
                                    "We are not asking people to change their values – we are removing the friction that makes living them feel impossible in a new place."
                                </div>
                                <div className="text-[12px] font-outfit text-t3">
                                    – Founder, Expat Eats · Living in Cascais since 2023
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
