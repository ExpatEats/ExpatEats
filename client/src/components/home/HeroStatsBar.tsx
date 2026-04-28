export function HeroStatsBar() {
    return (
        <div className="bg-soil">
            <div className="max-w-[1100px] mx-auto flex">
                <div className="flex-1 flex flex-col md:flex-row md:items-baseline gap-1 md:gap-2 py-5 justify-center items-center border-r border-white/[0.07]">
                    <div className="font-cormorant text-[30px] font-light text-white tracking-tight">180+</div>
                    <div className="text-[12px] text-white/[0.38] font-light font-outfit text-center md:text-left">curated listings</div>
                </div>
                <div className="flex-1 flex flex-col md:flex-row md:items-baseline gap-1 md:gap-2 py-5 justify-center items-center border-r border-white/[0.07]">
                    <div className="font-cormorant text-[30px] font-light text-white tracking-tight">2</div>
                    <div className="text-[12px] text-white/[0.38] font-light font-outfit text-center md:text-left">cities live now</div>
                </div>
                <div className="flex-1 flex flex-col md:flex-row md:items-baseline gap-1 md:gap-2 py-5 justify-center items-center border-r border-white/[0.07]">
                    <div className="font-cormorant text-[30px] font-light text-white tracking-tight">12+</div>
                    <div className="text-[12px] text-white/[0.38] font-light font-outfit text-center md:text-left">filter categories</div>
                </div>
                <div className="flex-1 flex flex-col md:flex-row md:items-baseline gap-1 md:gap-2 py-5 justify-center items-center">
                    <div className="font-cormorant text-[30px] font-light text-white tracking-tight">100%</div>
                    <div className="text-[12px] text-white/[0.38] font-light font-outfit text-center md:text-left">ambassador verified</div>
                </div>
            </div>
        </div>
    );
}
