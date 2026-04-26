import { Link } from "wouter";

export function WhatsLiveSection() {
    const services = [
        {
            status: "live",
            icon: "🛒",
            title: "Food Discovery",
            description: "Organic grocers, farmers' markets, and health food stores across Greater Lisbon – filtered precisely by your values. 180+ verified listings and growing.",
            link: "/search",
            linkText: "Explore the guide →"
        },
        {
            status: "live",
            icon: "💊",
            title: "Supplement Finder",
            description: "Find exactly where to buy your supplements in Portugal – pharmacies, health stores, and trusted online sources. No more guessing what's available or where to look.",
            link: "/search",
            linkText: "Find supplements →"
        },
        {
            status: "soon",
            icon: "🍽️",
            title: "Restaurant Guide",
            description: "Not just \"has a salad.\" Real restaurants, cafés, and wine bars that source carefully and cook with intention – matched to your dietary needs and values.",
            link: null,
            linkText: "→ Notify me when live"
        }
    ];

    return (
        <section className="bg-cream-mid py-[88px] px-11">
            <div className="max-w-[1100px] mx-auto">
                {/* Eyebrow badge */}
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-2 h-2 rounded-full bg-sage"></div>
                    <span className="text-[11px] font-outfit font-medium tracking-[2px] uppercase text-bark">
                        What's available
                    </span>
                </div>

                {/* Section heading */}
                <h2 className="font-cormorant text-[clamp(36px,4.5vw,54px)] font-light leading-[1.1] text-soil">
                    We launched with
                    <br />
                    <em className="italic text-bark">what matters most.</em>
                </h2>

                {/* Description */}
                <p className="text-[15px] font-outfit font-light leading-[1.8] text-t2 max-w-[440px] mt-5 mb-0">
                    One guide live, two more on the way. Here's exactly where things stand – no vague "coming soon" without a plan behind it.
                </p>

                {/* Services grid */}
                <div className="grid md:grid-cols-3 gap-[1px] bg-mist rounded-2xl overflow-hidden mt-[44px]">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className="bg-cream-mid p-[36px_30px] transition-colors hover:bg-cream"
                        >
                            {/* Status badge */}
                            <div
                                className={`inline-flex items-center gap-[6px] text-[10px] font-outfit font-medium tracking-[1.5px] uppercase rounded-[20px] px-[11px] py-[5px] mb-5 border ${
                                    service.status === "live"
                                        ? "text-sage border-sage/25"
                                        : "text-bark-lt border-bark-lt/22"
                                }`}
                            >
                                <div
                                    className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${
                                        service.status === "live"
                                            ? "bg-sage animate-pulse"
                                            : "bg-bark-lt"
                                    }`}
                                ></div>
                                {service.status === "live" ? "Live now" : "Coming soon"}
                            </div>

                            {/* Icon */}
                            <span className="text-[26px] block mb-[14px]">{service.icon}</span>

                            {/* Title */}
                            <h3 className="font-cormorant text-[23px] font-normal text-soil mb-2">
                                {service.title}
                            </h3>

                            {/* Description */}
                            <p className="text-[13px] font-outfit font-light text-t2 leading-[1.7]">
                                {service.description}
                            </p>

                            {/* Link or coming soon text */}
                            {service.link ? (
                                <Link href={service.link}>
                                    <a className="inline-flex items-center gap-[5px] text-[12px] font-outfit font-medium text-bark border-b border-bark/30 pb-[1px] mt-[18px] transition-all hover:gap-[9px]">
                                        {service.linkText}
                                    </a>
                                </Link>
                            ) : (
                                <span className="text-[12px] font-outfit text-t3 mt-[18px] block">
                                    {service.linkText}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
