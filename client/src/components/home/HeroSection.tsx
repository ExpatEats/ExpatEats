import { HeroSearchCard } from "./HeroSearchCard";
import { HeroStatsBar } from "./HeroStatsBar";

export function HeroSection() {
    return (
        <section className="bg-cream relative overflow-hidden min-h-screen flex flex-col">
            {/* Background watermark */}
            <div className="absolute bottom-12 right-[-16px] font-cormorant text-[28vw] font-light text-bark/[0.042] leading-none pointer-events-none select-none tracking-[-8px]">
                eat
            </div>

            {/* Hero content */}
            <div className="flex-1 max-w-[1100px] mx-auto w-full px-11 pt-[calc(42px+64px+24px)] pb-[68px]">
                <div className="grid md:grid-cols-2 gap-[52px] items-center py-[52px]">
                    {/* Left column */}
                    <div>
                        {/* Eyebrow badge */}
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-2 h-2 rounded-full bg-sage"></div>
                            <span className="text-[11px] font-outfit font-medium tracking-[2px] uppercase text-bark">
                                Greater Lisbon · Live now
                            </span>
                        </div>

                        {/* Main heading */}
                        <h1 className="font-cormorant text-[clamp(44px,5.8vw,80px)] font-light leading-[1.04] tracking-[-2.5px] text-soil mb-[18px]">
                            You moved here.
                            <br />
                            Don't settle for
                            <br />
                            <em className="italic text-bark">
                                a different
                                <br />
                                version of you.
                            </em>
                        </h1>

                        {/* Paragraph */}
                        <p className="text-[15px] font-outfit font-light leading-[1.8] text-t2 max-w-[400px] mb-7">
                            We did the confusing label-reading, the disappointing detours, and the Google-Translate grocery runs – so your healthy life picks up exactly where it left off.
                        </p>

                        {/* Honest card */}
                        <div className="flex items-start gap-[10px] bg-white border border-mist border-l-[3px] border-l-bark rounded-lg p-[13px_16px] max-w-[420px]">
                            <span className="text-[15px] flex-shrink-0 mt-[1px]">🌱</span>
                            <span className="text-[13px] font-outfit font-light text-t2 leading-[1.6]">
                                <strong className="font-medium text-soil">We're just getting started – and that's a feature.</strong> The food guide is live in Greater Lisbon. Restaurants and sustainable living shaped by people like you are coming next.
                            </span>
                        </div>
                    </div>

                    {/* Right column - Search card */}
                    <div>
                        <HeroSearchCard />
                    </div>
                </div>
            </div>

            {/* Stats bar */}
            <HeroStatsBar />
        </section>
    );
}
