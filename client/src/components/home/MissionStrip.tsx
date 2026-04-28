export function MissionStrip() {
    return (
        <section className="bg-bark-pale py-[52px] px-11 border-t border-b border-mist">
            <div className="max-w-[1100px] mx-auto">
                <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12">
                    {/* Quote */}
                    <div className="flex-1 font-cormorant text-[clamp(18px,2.2vw,26px)] italic font-light text-soil leading-[1.45] tracking-[-0.3px]">
                        "Moving country doesn't mean starting over on your health. It means finding the right map.{" "}
                        <em className="not-italic font-normal text-bark">
                            That's exactly what we built.
                        </em>
                        "
                    </div>

                    {/* Separator line */}
                    <div className="hidden md:block w-[1px] h-[60px] bg-mist flex-shrink-0"></div>

                    {/* Attribution */}
                    <div className="text-[13px] font-outfit font-light text-t2 leading-[1.7] md:max-w-[280px] flex-shrink-0">
                        Built by a health-conscious expat living in Portugal – for people navigating exactly the same messy, confusing, beautiful transition.
                    </div>
                </div>
            </div>
        </section>
    );
}
