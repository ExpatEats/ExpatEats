import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { WhatsLiveSection } from "@/components/home/WhatsLiveSection";
import { FeaturedPlacesSection } from "@/components/home/FeaturedPlacesSection";

export default function Home() {
    return (
        <div className="w-full">
            <HeroSection />
            <HowItWorksSection />
            <WhatsLiveSection />
            <FeaturedPlacesSection />
        </div>
    );
}
