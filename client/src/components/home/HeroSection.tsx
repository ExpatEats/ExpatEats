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
            <div className="flex-1 max-w-[1100px] mx-auto w-full px-11 pt-[65px] md:pt-[calc(42px+64px+24px)] pb-[68px]">
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
                        <p className="text-[15px] font-outfit font-light leading-[1.8] text-t2 max-w-[400px]">
                            We did the confusing label-reading, the disappointing detours, and the Google-Translate grocery runs – so your healthy life picks up exactly where it left off.
                        </p>
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
