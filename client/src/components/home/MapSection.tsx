import { Link } from "wouter";

export function MapSection() {
    return (
        <section className="bg-soil py-[88px] px-11">
            <div className="max-w-[1100px] mx-auto">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    {/* Left side - Content */}
                    <div>
                        {/* Eyebrow badge */}
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-2 h-2 rounded-full bg-white/25"></div>
                            <span className="text-[11px] font-outfit font-medium tracking-[2px] uppercase text-white/30">
                                Interactive map guide
                            </span>
                        </div>

                        {/* Section heading */}
                        <h2 className="font-cormorant text-[clamp(36px,4.5vw,54px)] font-light leading-[1.1] text-white">
                            Find it here.
                            <br />
                            <em className="italic text-bark-lt">Get there instantly.</em>
                        </h2>

                        {/* Description */}
                        <p className="text-[15px] font-outfit font-light leading-[1.8] text-white/45 mt-5">
                            Every verified listing on an interactive map. One tap to open it in Waze or Google Maps – no address copying, no screenshot chaos, no detours.
                        </p>

                        {/* City pills */}
                        <div className="flex gap-[7px] flex-wrap my-5 mt-[20px] mb-7">
                            <span className="text-[12px] font-outfit rounded-[20px] px-[13px] py-[5px] border border-bark-lt text-bark-lt bg-bark/[0.14]">
                                ● Greater Lisbon
                            </span>
                            <span className="text-[12px] font-outfit rounded-[20px] px-[13px] py-[5px] border border-white/[0.06] text-white/[0.22] italic">
                                Porto – soon
                            </span>
                            <span className="text-[12px] font-outfit rounded-[20px] px-[13px] py-[5px] border border-white/[0.06] text-white/[0.22] italic">
                                Algarve – soon
                            </span>
                        </div>

                        {/* CTA button */}
                        <Link href="/search">
                            <button className="font-outfit text-[13px] font-medium bg-bark text-white border-none rounded-lg px-[22px] py-3 cursor-pointer transition-all hover:bg-bark-lt hover:-translate-y-0.5">
                                Open map guide →
                            </button>
                        </Link>
                    </div>

                    {/* Right side - Map placeholder */}
                    <div className="relative">
                        <div className="bg-[#261C10] rounded-2xl overflow-hidden aspect-[4/3] border border-white/[0.07] relative flex items-center justify-center">
                            {/* Map placeholder */}
                            <div className="text-white/20 font-outfit text-sm">
                                Interactive map preview
                            </div>
                        </div>

                        {/* Map badge */}
                        <div className="absolute bottom-[-10px] right-[-10px] bg-white rounded-[10px] p-[12px_16px] shadow-[0_12px_40px_rgba(0,0,0,0.2)]">
                            <div className="font-cormorant text-[26px] font-light text-soil">
                                180+
                            </div>
                            <div className="text-[10px] text-t3">
                                verified spots
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
