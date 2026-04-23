export function HeroStatsBar() {
    return (
        <div className="bg-soil">
            <div className="max-w-[1100px] mx-auto flex">
                <div className="flex-1 flex items-baseline gap-2 py-5 justify-center border-r border-white/[0.07]">
                    <div className="font-cormorant text-[30px] font-light text-white tracking-tight">180+</div>
                    <div className="text-[12px] text-white/[0.38] font-light font-outfit">curated listings</div>
                </div>
                <div className="flex-1 flex items-baseline gap-2 py-5 justify-center border-r border-white/[0.07]">
                    <div className="font-cormorant text-[30px] font-light text-white tracking-tight">2</div>
                    <div className="text-[12px] text-white/[0.38] font-light font-outfit">cities live now</div>
                </div>
                <div className="flex-1 flex items-baseline gap-2 py-5 justify-center border-r border-white/[0.07]">
                    <div className="font-cormorant text-[30px] font-light text-white tracking-tight">12+</div>
                    <div className="text-[12px] text-white/[0.38] font-light font-outfit">filter categories</div>
                </div>
                <div className="flex-1 flex items-baseline gap-2 py-5 justify-center">
                    <div className="font-cormorant text-[30px] font-light text-white tracking-tight">100%</div>
                    <div className="text-[12px] text-white/[0.38] font-light font-outfit">ambassador verified</div>
                </div>
            </div>
        </div>
    );
}
