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
        <div className="bg-sage text-white h-[42px] flex items-center justify-center relative px-4 transition-all duration-300">
            <div className="flex items-center gap-[10px] text-[12.5px] font-outfit font-light">
                <div className="w-[5px] h-[5px] rounded-full bg-white animate-pulse flex-shrink-0"></div>
                <span>
                    <strong className="font-medium">Food guide live</strong> in Greater Lisbon – 180+ verified listings
                </span>
                <Link href="/search">
                    <a className="text-white/90 border-b border-white/40 pb-[1px] ml-2 transition-all hover:text-white hover:border-white">
                        Start exploring →
                    </a>
                </Link>
            </div>
            <button
                onClick={handleDismiss}
                aria-label="Dismiss"
                className="absolute right-4 text-white/60 hover:text-white text-[18px] leading-none transition-colors"
            >
                ×
            </button>
        </div>
    );
}
