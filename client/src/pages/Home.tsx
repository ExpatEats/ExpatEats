import { AnnouncementBar } from "@/components/home/AnnouncementBar";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { WhatsLiveSection } from "@/components/home/WhatsLiveSection";
import { FeaturedPlacesSection } from "@/components/home/FeaturedPlacesSection";
import { MapSection } from "@/components/home/MapSection";
import { MissionStrip } from "@/components/home/MissionStrip";

export default function Home() {
    return (
        <div className="w-full">
            <AnnouncementBar />
            <HeroSection />
            <HowItWorksSection />
            <WhatsLiveSection />
            <FeaturedPlacesSection />
            <MapSection />
            <MissionStrip />
        </div>
    );
}
