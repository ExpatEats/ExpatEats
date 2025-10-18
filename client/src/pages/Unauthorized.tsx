import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, LogIn, UserPlus } from "lucide-react";
import { LoginModal } from "@/components/LoginModal";
import { useAuth } from "@/contexts/AuthContext";

const Unauthorized = () => {
    const [, setLocation] = useLocation();
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const { isAuthenticated } = useAuth();

    // Redirect authenticated users to home
    useEffect(() => {
        if (isAuthenticated) {
            setLocation("/");
        }
    }, [isAuthenticated, setLocation]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center pb-4">
                    <div className="mx-auto w-16 h-16 bg-[#E07A5F]/10 rounded-full flex items-center justify-center mb-4">
                        <Lock className="h-8 w-8 text-[#E07A5F]" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Login Required</CardTitle>
                    <CardDescription className="text-base mt-2">
                        You need to be logged in to view this page. Please log in to your account or create a new one to continue.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-2">
                    <Button
                        onClick={() => setLoginModalOpen(true)}
                        className="w-full bg-[#6D9075] hover:bg-[#6D9075]/90 text-white"
                        size="lg"
                    >
                        <LogIn className="h-5 w-5 mr-2" />
                        Log In
                    </Button>
                    <Button
                        onClick={() => setLocation("/register")}
                        variant="outline"
                        className="w-full border-[#E07A5F] text-[#E07A5F] hover:bg-[#E07A5F] hover:text-white"
                        size="lg"
                    >
                        <UserPlus className="h-5 w-5 mr-2" />
                        Create an Account
                    </Button>
                </CardContent>
            </Card>

            <LoginModal
                open={loginModalOpen}
                onOpenChange={setLoginModalOpen}
            />
        </div>
    );
};

export default Unauthorized;
