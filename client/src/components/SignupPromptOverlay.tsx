import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, LogIn, UserPlus } from "lucide-react";
import { LoginModal } from "@/components/LoginModal";

export const SignupPromptOverlay = () => {
    const [, setLocation] = useLocation();
    const [loginModalOpen, setLoginModalOpen] = useState(false);

    return (
        <div className="relative">
            {/* Blur overlay */}
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
                <Card className="w-full max-w-md mx-4 shadow-xl">
                    <CardHeader className="text-center pb-3">
                        <div className="mx-auto w-12 h-12 bg-[#E07A5F]/10 rounded-full flex items-center justify-center mb-3">
                            <Lock className="h-6 w-6 text-[#E07A5F]" />
                        </div>
                        <CardTitle className="text-xl font-bold">See All Results</CardTitle>
                        <p className="text-sm text-gray-600 mt-2">
                            Create a free account to view all available food sources and access personalized features
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                        <Button
                            onClick={() => setLoginModalOpen(true)}
                            className="w-full bg-[#6D9075] hover:bg-[#6D9075]/90 text-white"
                        >
                            <LogIn className="h-4 w-4 mr-2" />
                            Log In
                        </Button>
                        <Button
                            onClick={() => setLocation("/")}
                            variant="outline"
                            className="w-full border-[#E07A5F] text-[#E07A5F] hover:bg-[#E07A5F] hover:text-white"
                        >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Create Free Account
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <LoginModal
                open={loginModalOpen}
                onOpenChange={setLoginModalOpen}
            />
        </div>
    );
};
