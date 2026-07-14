import { Link } from "wouter";

interface CTAButtonProps {
    className?: string;
}

export function CTAButton({ className = "" }: CTAButtonProps) {
    return (
        <Link href="/search">
            <button className={`inline-flex items-center justify-center gap-2.5 font-outfit text-base font-medium bg-bark text-white border-none rounded-xl px-9 py-[17px] cursor-pointer tracking-[0.1px] transition-all duration-200 shadow-[0_4px_18px_rgba(124,92,59,0.28)] hover:bg-soil hover:-translate-y-px ${className}`}>
                Find my picks →
            </button>
        </Link>
    );
}
