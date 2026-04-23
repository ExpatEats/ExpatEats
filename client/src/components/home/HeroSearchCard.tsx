import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function HeroSearchCard() {
    return (
        <div className="bg-white border-radius-[20px] rounded-[20px] p-7 border border-mist shadow-[0_20px_60px_rgba(44,31,15,0.09),0_4px_16px_rgba(44,31,15,0.05)]">
            <div className="text-[11px] font-outfit font-medium tracking-[2px] uppercase text-bark mb-4">
                Find your next favourite spot
            </div>
            <Link href="/search">
                <Button className="w-full bg-soil hover:bg-bark text-white font-outfit text-[14px] font-medium rounded-[10px] py-[14px] transition-all duration-200 hover:-translate-y-0.5">
                    Search Listings →
                </Button>
            </Link>
        </div>
    );
}
