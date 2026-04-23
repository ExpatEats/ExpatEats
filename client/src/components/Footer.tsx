import { Link } from "wouter";

const Footer = () => {
    return (
        <footer className="bg-[#160F06] py-[60px_44px_32px] px-11">
            <div className="max-w-[1100px] mx-auto">
                {/* Footer grid */}
                <div className="grid md:grid-cols-[2fr_1fr_1fr_1fr] gap-11 mb-11">
                    {/* Brand column */}
                    <div>
                        <div className="font-cormorant text-[20px] font-semibold text-white mb-[7px]">
                            Expat<em className="italic text-bark-lt">Eats</em>
                        </div>
                        <div className="text-[13px] font-outfit font-light text-white/[0.28] leading-[1.65] max-w-[200px] mb-[18px]">
                            Making healthy, sustainable living simple for expats – starting in Portugal.
                        </div>
                        <div className="flex gap-[6px]">
                            {[
                                { label: "ig", href: "https://instagram.com/expateatsguide" },
                                { label: "yt", href: "#" },
                                { label: "fb", href: "#" },
                                { label: "wa", href: "#" }
                            ].map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    target={social.href.startsWith("http") ? "_blank" : undefined}
                                    rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
                                    className="w-[34px] h-[34px] border border-white/10 rounded-md flex items-center justify-center text-[11px] font-outfit font-medium text-white/30 cursor-pointer transition-colors hover:border-bark-lt hover:text-bark-lt"
                                >
                                    {social.label}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Discover column */}
                    <div>
                        <h5 className="text-[10px] font-outfit font-medium tracking-[2px] uppercase text-white/[0.18] mb-[14px]">
                            Discover
                        </h5>
                        <Link href="/search">
                            <a className="block text-[13px] font-outfit font-light text-white/[0.38] mb-[9px] transition-colors hover:text-white/[0.72]">
                                Food Guide
                            </a>
                        </Link>
                        <a className="block text-[13px] font-outfit font-light text-white/[0.16] italic mb-[9px]">
                            Restaurants – soon
                        </a>
                        <a className="block text-[13px] font-outfit font-light text-white/[0.16] italic mb-[9px]">
                            Sustainable Living – soon
                        </a>
                    </div>

                    {/* Cities column */}
                    <div>
                        <h5 className="text-[10px] font-outfit font-medium tracking-[2px] uppercase text-white/[0.18] mb-[14px]">
                            Cities
                        </h5>
                        <Link href="/search">
                            <a className="block text-[13px] font-outfit font-light text-white/[0.38] mb-[9px] transition-colors hover:text-white/[0.72]">
                                Lisbon
                            </a>
                        </Link>
                        <a className="block text-[13px] font-outfit font-light text-white/[0.16] italic mb-[9px]">
                            Porto – soon
                        </a>
                        <a className="block text-[13px] font-outfit font-light text-white/[0.16] italic mb-[9px]">
                            Algarve – soon
                        </a>
                    </div>

                    {/* Company column */}
                    <div>
                        <h5 className="text-[10px] font-outfit font-medium tracking-[2px] uppercase text-white/[0.18] mb-[14px]">
                            Company
                        </h5>
                        <a href="#" className="block text-[13px] font-outfit font-light text-white/[0.38] mb-[9px] transition-colors hover:text-white/[0.72]">
                            About
                        </a>
                        <a href="#" className="block text-[13px] font-outfit font-light text-white/[0.38] mb-[9px] transition-colors hover:text-white/[0.72]">
                            Ambassadors
                        </a>
                        <a href="#" className="block text-[13px] font-outfit font-light text-white/[0.38] mb-[9px] transition-colors hover:text-white/[0.72]">
                            For Businesses
                        </a>
                        <Link href="/contact-us">
                            <a className="block text-[13px] font-outfit font-light text-white/[0.38] mb-[9px] transition-colors hover:text-white/[0.72]">
                                Contact
                            </a>
                        </Link>
                    </div>
                </div>

                {/* Footer bottom */}
                <div className="flex justify-between items-center border-t border-white/[0.05] pt-[22px] flex-wrap gap-3">
                    <div className="text-[11px] font-outfit font-light text-white/[0.16]">
                        © 2025 Expat Eats · admin@expateatsguide.com
                    </div>
                    <div className="flex gap-4">
                        <a href="#" className="text-[11px] font-outfit text-white/[0.16] transition-colors hover:text-white/[0.42]">
                            Privacy Policy
                        </a>
                        <Link href="/terms">
                            <a className="text-[11px] font-outfit text-white/[0.16] transition-colors hover:text-white/[0.42]">
                                Terms of Use
                            </a>
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
