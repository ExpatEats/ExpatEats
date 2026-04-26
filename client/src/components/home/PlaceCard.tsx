import { Place } from "@/lib/types";

interface PlaceCardProps {
    place: Place;
    onClick?: () => void;
    delay?: number;
}

export function PlaceCard({ place, onClick, delay = 0 }: PlaceCardProps) {
    const { name, category, city, tags } = place;

    // Generate icon based on category
    const getCategoryIcon = (category: string) => {
        const cat = category.toLowerCase();
        if (cat.includes("health") || cat.includes("supplement")) return "🌿";
        if (cat.includes("market")) return "🧺";
        if (cat.includes("bakery") || cat.includes("café") || cat.includes("cafe")) return "☕";
        if (cat.includes("butcher") || cat.includes("meat")) return "🥩";
        if (cat.includes("farm")) return "🌾";
        if (cat.includes("bulk")) return "📦";
        return "🛒";
    };

    // Generate background color for icon
    const getIconBackground = (category: string) => {
        const cat = category.toLowerCase();
        if (cat.includes("health") || cat.includes("supplement")) return "#F5EFE6";
        if (cat.includes("market")) return "#EFF5EF";
        if (cat.includes("bakery") || cat.includes("café") || cat.includes("cafe")) return "#EEF2F8";
        if (cat.includes("butcher") || cat.includes("meat")) return "#FDF0E8";
        if (cat.includes("farm")) return "#EFF5EF";
        return "#F5EFE6";
    };

    // Determine if tag should be green
    const isGreenTag = (tag: string) => {
        const greenTags = ["farm-raised", "zero waste", "vegan", "grass-fed", "hormone-free", "organic", "seasonal"];
        return greenTags.some(gt => tag.toLowerCase().includes(gt));
    };

    return (
        <div
            className="bg-white rounded-xl p-[18px_20px] flex items-center gap-[14px] border border-transparent transition-all hover:border-bark/20 hover:translate-x-1 hover:shadow-[0_6px_20px_rgba(44,31,15,0.06)] cursor-pointer"
            onClick={onClick}
        >
            {/* Icon */}
            <div
                className="w-12 h-12 rounded-[10px] flex items-center justify-center text-[20px] flex-shrink-0"
                style={{ background: getIconBackground(category) }}
            >
                {getCategoryIcon(category)}
            </div>

            {/* Body */}
            <div className="flex-1 min-w-0">
                {/* Name */}
                <div className="text-[14px] font-outfit font-medium text-soil mb-[2px]">
                    {name}
                </div>

                {/* Meta */}
                <div className="text-[11px] font-outfit text-t3 mb-[7px]">
                    {category} · {city}
                </div>

                {/* Tags */}
                {tags && tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                        {tags.slice(0, 3).map((tag, index) => (
                            <span
                                key={index}
                                className={`text-[10px] font-outfit font-medium rounded px-[7px] py-[2px] ${
                                    isGreenTag(tag)
                                        ? "bg-sage-lt text-sage"
                                        : "bg-bark-pale text-bark"
                                }`}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Verified badge */}
            <div className="flex items-center gap-1 text-[10px] font-outfit font-medium text-sage flex-shrink-0 whitespace-nowrap">
                <div className="w-[6px] h-[6px] rounded-full bg-sage"></div>
                Verified
            </div>
        </div>
    );
}
