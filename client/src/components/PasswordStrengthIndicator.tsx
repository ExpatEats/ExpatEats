import { useMemo } from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthIndicatorProps {
    password: string;
}

interface PasswordRequirement {
    label: string;
    test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
    {
        label: "At least 8 characters",
        test: (password) => password.length >= 8,
    },
    {
        label: "Contains uppercase letter",
        test: (password) => /[A-Z]/.test(password),
    },
    {
        label: "Contains lowercase letter", 
        test: (password) => /[a-z]/.test(password),
    },
    {
        label: "Contains number",
        test: (password) => /[0-9]/.test(password),
    },
];

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
    const strength = useMemo(() => {
        const metRequirements = requirements.filter(req => req.test(password));
        return {
            score: metRequirements.length,
            percentage: (metRequirements.length / requirements.length) * 100,
        };
    }, [password]);

    const getStrengthColor = () => {
        if (strength.score === 0) return "bg-gray-200";
        if (strength.score <= 2) return "bg-red-500";
        if (strength.score === 3) return "bg-yellow-500";
        return "bg-green-500";
    };

    const getStrengthLabel = () => {
        if (strength.score === 0) return "";
        if (strength.score <= 2) return "Weak";
        if (strength.score === 3) return "Good";
        return "Strong";
    };

    if (!password) return null;

    return (
        <div className="space-y-2 mt-2">
            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Password strength</span>
                <span className={`text-sm font-medium ${
                    strength.score <= 2 ? "text-red-600" : 
                    strength.score === 3 ? "text-yellow-600" : "text-green-600"
                }`}>
                    {getStrengthLabel()}
                </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                    style={{ width: `${strength.percentage}%` }}
                />
            </div>

            <div className="space-y-1">
                {requirements.map((requirement, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs">
                        {requirement.test(password) ? (
                            <Check className="h-3 w-3 text-green-600" />
                        ) : (
                            <X className="h-3 w-3 text-gray-400" />
                        )}
                        <span className={requirement.test(password) ? "text-green-600" : "text-gray-500"}>
                            {requirement.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};