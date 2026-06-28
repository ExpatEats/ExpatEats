import { Link } from "wouter";
import { HeroStatsBar } from "./HeroStatsBar";

export function HeroSection() {
    return (
        <section className="bg-cream relative overflow-hidden min-h-auto flex flex-col">
            {/* Background watermark */}
            <div className="absolute bottom-12 right-[-16px] font-cormorant text-[28vw] font-light text-bark/[0.042] leading-none pointer-events-none select-none tracking-[-8px]">
                eat
            </div>

            {/* Hero content - Centered */}
            <div className="flex-1 max-w-[1100px] mx-auto w-full px-4 md:px-11 pt-[calc(64px+24px)] pb-5">
                <div className="flex flex-col items-center text-center py-14">
                    {/* Main heading */}
                    <h1 className="font-cormorant text-[clamp(44px,5.8vw,80px)] font-light leading-[1.04] tracking-[-2.5px] text-soil mb-[18px] max-w-[700px]">
                        Your expat food guide
                        <br />
                        to <em className="italic text-bark">Portugal.</em>
                    </h1>

                    {/* Paragraph */}
                    <p className="text-[18px] font-outfit font-light leading-[1.8] text-t2 max-w-[500px] mb-7">
                        Find trusted grocery stores, supplements and healthy essentials that help you feel at home.
                    </p>

                    {/* CTA Button */}
                    <Link href="/search">
                        <button className="inline-flex items-center justify-center gap-2.5 mt-2 w-full max-w-[320px] font-outfit text-base font-medium bg-bark text-white border-none rounded-xl px-9 py-[17px] cursor-pointer tracking-[0.1px] transition-all duration-200 shadow-[0_4px_18px_rgba(124,92,59,0.28)] hover:bg-soil hover:-translate-y-px">
                            Find my picks →
                        </button>
                    </Link>

                    {/* Coming Soon Badge */}
                    <div className="inline-flex items-center gap-[7px] mt-[18px] bg-bark-pale border border-bark/25 rounded-full px-[14px] py-[6px] text-xs font-light text-bark-lt">
                        <span className="w-[5px] h-[5px] rounded-full bg-bark-lt flex-shrink-0 animate-pulse"></span>
                        <span><strong className="font-medium text-bark">Coming soon:</strong> Restaurants &amp; cafés</span>
                    </div>
                </div>
            </div>

            {/* Stats bar */}
            <HeroStatsBar />
        </section>
    );
}
