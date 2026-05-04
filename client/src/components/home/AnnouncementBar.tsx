import { useState, useEffect } from "react";
import { Link } from "wouter";

export function AnnouncementBar() {
    const [dismissed, setDismissed] = useState(false);

    // Check localStorage on mount
    useEffect(() => {
        const isDismissed = localStorage.getItem("ee_announcement_dismissed");
        if (isDismissed === "true") {
            setDismissed(true);
        }
    }, []);

    const handleDismiss = () => {
        setDismissed(true);
        localStorage.setItem("ee_announcement_dismissed", "true");
    };

    if (dismissed) {
        return null;
    }

    return (
        <div className="fixed top-[64px] left-0 right-0 z-40 bg-soil text-white/85 h-[36px] sm:h-[38px] md:h-[42px] flex items-center justify-center px-4 transition-all duration-300">
            <div className="flex items-center gap-[6px] sm:gap-[10px] text-[10.5px] sm:text-[11.5px] md:text-[12.5px] font-outfit font-light">
                <div className="w-[5px] h-[5px] rounded-full bg-sage animate-pulse flex-shrink-0"></div>
                <span>
                    <strong className="font-medium text-white">Food guide live</strong> in Greater Lisbon – 180+ verified listings
                </span>
                <Link
                    href="/search"
                    className="text-bark-lt font-medium border-b border-bark-lt/40 pb-[1px] ml-2 transition-all hover:text-white hover:border-white whitespace-nowrap hidden sm:inline"
                >
                    Start exploring →
                </Link>
            </div>
            <button
                onClick={handleDismiss}
                aria-label="Dismiss"
                className="absolute right-4 text-white/35 hover:text-white/70 text-[18px] leading-none transition-colors flex items-center p-1"
            >
                ×
            </button>
        </div>
    );
}
