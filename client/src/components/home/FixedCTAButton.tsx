import { Link } from "wouter";

export function FixedCTAButton() {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6 px-4 pointer-events-none">
            <Link href="/search">
                <button className="inline-flex items-center justify-center gap-2.5 w-full max-w-[320px] font-outfit text-base font-medium bg-bark text-white border-none rounded-xl px-9 py-[17px] cursor-pointer tracking-[0.1px] transition-all duration-200 shadow-[0_4px_18px_rgba(124,92,59,0.28)] hover:bg-soil hover:-translate-y-px pointer-events-auto">
                    Find my picks →
                </button>
            </Link>
        </div>
    );
}
