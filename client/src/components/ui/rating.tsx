import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
    value: number;
    max?: number;
    size?: "sm" | "md" | "lg";
    onChange?: (value: number) => void;
    readOnly?: boolean;
    className?: string;
}

const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
    (
        { value, max = 5, size = "md", onChange, readOnly = false, className },
        ref,
    ) => {
        const [hoverValue, setHoverValue] = React.useState<number | null>(null);

        const sizeClasses = {
            sm: "h-4 w-4",
            md: "h-5 w-5",
            lg: "h-6 w-6",
        };

        const handleClick = (index: number) => {
            if (!readOnly && onChange) {
                onChange(index + 1);
            }
        };

        return (
            <div
                ref={ref}
                className={cn("flex", className)}
                onMouseLeave={() => setHoverValue(null)}
            >
                {[...Array(max)].map((_, index) => {
                    const starValue = index + 1;
                    const filled =
                        hoverValue !== null
                            ? starValue <= hoverValue
                            : starValue <= value;

                    return (
                        <Star
                            key={index}
                            className={cn(
                                sizeClasses[size],
                                "cursor-pointer transition-colors",
                                filled
                                    ? "text-[#F5A623] fill-[#F5A623]"
                                    : "text-gray-300",
                                !readOnly && "hover:text-[#F5A623]",
                            )}
                            onClick={() => handleClick(index)}
                            onMouseEnter={() =>
                                !readOnly && setHoverValue(starValue)
                            }
                        />
                    );
                })}
            </div>
        );
    },
);

Rating.displayName = "Rating";

export { Rating };
