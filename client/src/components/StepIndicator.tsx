import React from "react";

interface StepIndicatorProps {
    currentStep: 1 | 2;
}

const steps = [
    { number: 1, label: "Preferences" },
    { number: 2, label: "Locations" }
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
    return (
        <div className="flex justify-center items-center gap-4">
            {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                    <div className="flex items-center gap-2">
                        <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center
                            font-semibold transition-colors
                            ${currentStep >= step.number
                                ? 'bg-bark text-white'
                                : 'bg-gray-200 text-gray-500'}
                        `}>
                            {step.number}
                        </div>
                        <span className={`
                            font-outfit hidden sm:block
                            ${currentStep >= step.number ? 'text-bark' : 'text-gray-400'}
                        `}>
                            {step.label}
                        </span>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`
                            h-0.5 w-12 sm:w-24 transition-colors
                            ${currentStep > step.number ? 'bg-bark' : 'bg-gray-200'}
                        `} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}
