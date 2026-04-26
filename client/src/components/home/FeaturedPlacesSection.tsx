import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { PlaceCard } from "./PlaceCard";
import { Place } from "@/lib/types";

export function FeaturedPlacesSection() {
    const { data: featuredPlaces, isLoading } = useQuery<Place[]>({
        queryKey: ["places", "random"],
        queryFn: async () => {
            const response = await fetch("/api/places/random?limit=4");
            if (!response.ok) throw new Error("Failed to fetch featured places");
            return response.json();
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    return (
        <section className="bg-cream py-[88px] px-11">
            <div className="max-w-[1100px] mx-auto">
                {/* Eyebrow badge */}
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-2 h-2 rounded-full bg-sage"></div>
                    <span className="text-[11px] font-outfit font-medium tracking-[2px] uppercase text-bark">
                        Featured in Greater Lisbon
                    </span>
                </div>

                {/* Layout */}
                <div className="grid md:grid-cols-2 gap-16 items-start mt-[44px]">
                    {/* Left side */}
                    <div className="md:sticky md:top-[104px]">
                        {/* Section heading */}
                        <h2 className="font-cormorant text-[clamp(36px,4.5vw,54px)] font-light leading-[1.1] text-soil">
                            No algorithms.
                            <br />
                            <em className="italic text-bark">
                                Every listing
                                <br />
                                is earned.
                            </em>
                        </h2>

                        {/* Description */}
                        <p className="text-[15px] font-outfit font-light leading-[1.8] text-t2 max-w-[340px] mt-5">
                            Every listing is added by someone who actually lives here, shops there, and trusts it enough to put their name on it. Businesses can't pay to appear. That's the only way in.
                        </p>

                        {/* Filter box */}
                        <div className="bg-white rounded-xl p-[18px] border border-mist mt-[22px]">
                            <div className="text-[11px] font-outfit font-medium tracking-[1.5px] uppercase text-t3 mb-[10px]">
                                Try filtering
                            </div>
                            <div className="flex flex-wrap gap-[6px]">
                                {["Organic", "Gluten-free", "Dairy-free", "Kid-friendly", "Zero waste", "Vegan"].map((filter, index) => (
                                    <span
                                        key={index}
                                        className={`text-[12px] font-outfit rounded-[20px] px-[13px] py-[5px] border cursor-pointer transition-all ${
                                            index < 2
                                                ? "bg-soil text-white border-soil"
                                                : "border-mist text-t2 hover:border-bark hover:text-bark"
                                        }`}
                                    >
                                        {filter}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* CTA buttons */}
                        <div className="flex items-center gap-[14px] flex-wrap mt-[22px]">
                            <Link href="/search">
                                <button className="font-outfit text-[13px] font-medium bg-bark text-white border-none rounded-lg px-[22px] py-3 cursor-pointer transition-all hover:bg-soil hover:-translate-y-0.5">
                                    See all listings →
                                </button>
                            </Link>
                            <Link href="/search">
                                <a className="text-[13px] font-outfit text-t2 border-b border-mist pb-[1px] transition-all hover:text-bark hover:border-bark">
                                    Open map view
                                </a>
                            </Link>
                        </div>
                    </div>

                    {/* Right side - Place cards */}
                    <div className="flex flex-col gap-[10px]">
                        {isLoading ? (
                            // Loading state
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bark"></div>
                            </div>
                        ) : featuredPlaces && featuredPlaces.length > 0 ? (
                            // Display place cards
                            featuredPlaces.map((place, index) => (
                                <PlaceCard
                                    key={place.id}
                                    place={place}
                                    delay={index}
                                    onClick={() => {
                                        // Navigate to store page
                                        window.location.href = `/store/${place.id}`;
                                    }}
                                />
                            ))
                        ) : (
                            // Empty state
                            <div className="text-center py-12 text-t3 font-outfit">
                                No featured places available at the moment.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
