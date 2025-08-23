import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { LoginModal } from "./LoginModal";

interface RegistrationSuccessModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userName?: string;
}

export const RegistrationSuccessModal: React.FC<RegistrationSuccessModalProps> = ({
    open,
    onOpenChange,
    userName,
}) => {
    const [loginModalOpen, setLoginModalOpen] = useState(false);

    const handleLoginClick = () => {
        onOpenChange(false); // Close success modal
        setLoginModalOpen(true); // Open login modal
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <CheckCircle className="h-16 w-16 text-green-500" />
                        </div>
                        <DialogTitle className="text-2xl font-light text-center">
                            Welcome to ExpatEats!
                        </DialogTitle>
                        <DialogDescription className="text-center text-gray-600 mt-2">
                            {userName ? `Hi ${userName}! ` : ""}Your account has been created successfully.
                            Please sign in with your new credentials to start exploring our features.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 pt-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-6">
                                Ready to start your journey? Sign in with your new credentials to access your personalized experience.
                            </p>
                        </div>

                        <div className="flex flex-col space-y-3">
                            <Button
                                onClick={handleLoginClick}
                                className="w-full bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white"
                            >
                                Sign In Now
                            </Button>
                        </div>

                        <div className="text-center pt-4">
                            <p className="text-xs text-gray-400">
                                You can also sign in later using the Login button in the top navigation.
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Login Modal */}
            <LoginModal 
                open={loginModalOpen} 
                onOpenChange={setLoginModalOpen} 
            />
        </>
    );
};