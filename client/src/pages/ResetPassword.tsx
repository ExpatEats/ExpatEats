import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NotificationDialog } from "@/components/NotificationDialog";
import { apiRequest } from "@/lib/queryClient";
import { KeyRound, CheckCircle2, XCircle, Loader2 } from "lucide-react";

const passwordResetSchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type PasswordResetFormValues = z.infer<typeof passwordResetSchema>;

export default function ResetPassword() {
    const [, navigate] = useLocation();
    const [token, setToken] = useState<string | null>(null);
    const [isValidating, setIsValidating] = useState(true);
    const [isValid, setIsValid] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const [email, setEmail] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [notificationConfig, setNotificationConfig] = useState<{
        title: string;
        description?: string;
        variant: "success" | "error" | "warning" | "info";
    }>({
        title: "",
        variant: "success"
    });

    const showNotification = (title: string, description?: string, variant: "success" | "error" | "warning" | "info" = "success") => {
        setNotificationConfig({ title, description, variant });
        setNotificationOpen(true);
    };

    const form = useForm<PasswordResetFormValues>({
        resolver: zodResolver(passwordResetSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    useEffect(() => {
        // Get token from URL query params
        const params = new URLSearchParams(window.location.search);
        const tokenParam = params.get("token");

        if (!tokenParam) {
            setErrorMessage("Invalid reset link. No token provided.");
            setIsValidating(false);
            return;
        }

        setToken(tokenParam);

        // Verify token with backend
        const verifyToken = async () => {
            try {
                const response = await apiRequest("GET", `/api/auth/verify-reset-token/${tokenParam}`);
                const data = await response.json();

                if (data.valid) {
                    setIsValid(true);
                    setEmail(data.email);
                } else {
                    setErrorMessage("This reset link has expired or is invalid. Please request a new password reset.");
                }
            } catch (error) {
                console.error("Token verification error:", error);
                setErrorMessage("This reset link has expired or is invalid. Please request a new password reset.");
            } finally {
                setIsValidating(false);
            }
        };

        verifyToken();
    }, []);

    const onSubmit = async (data: PasswordResetFormValues) => {
        if (!token) {
            showNotification("Error", "No reset token found", "error");
            return;
        }

        setIsResetting(true);
        setErrorMessage(null);

        try {
            const response = await apiRequest("POST", "/api/auth/reset-password", {
                token,
                password: data.password,
            });
            await response.json(); // Consume the response

            setResetSuccess(true);
            showNotification(
                "Password Reset Successful!",
                "Your password has been reset. You can now login with your new password.",
                "success"
            );

            // Redirect to home after 3 seconds
            setTimeout(() => {
                navigate("/");
            }, 3000);
        } catch (error: any) {
            console.error("Password reset error:", error);
            const message = error.message || "Failed to reset password. Please try again.";
            setErrorMessage(message);
            showNotification("Error", message, "error");
        } finally {
            setIsResetting(false);
        }
    };

    // Loading state
    if (isValidating) {
        return (
            <div className="container mx-auto py-16">
                <div className="max-w-md mx-auto">
                    <Card>
                        <CardContent className="pt-16 pb-16 text-center">
                            <Loader2 className="h-12 w-12 animate-spin text-[#E07A5F] mx-auto mb-4" />
                            <p className="text-gray-600">Verifying reset link...</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Invalid token state
    if (!isValid) {
        return (
            <div className="container mx-auto py-16">
                <div className="max-w-md mx-auto">
                    <Card>
                        <CardHeader>
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <XCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <CardTitle className="text-2xl font-light text-center">
                                Invalid Reset Link
                            </CardTitle>
                            <CardDescription className="text-center">
                                {errorMessage || "This password reset link is invalid or has expired."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <p className="text-sm text-gray-600 text-center">
                                    Password reset links expire after 1 hour for security reasons.
                                </p>
                                <Button
                                    className="w-full bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white"
                                    onClick={() => navigate("/")}
                                >
                                    Return to Home
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Success state
    if (resetSuccess) {
        return (
            <div className="container mx-auto py-16">
                <div className="max-w-md mx-auto">
                    <Card>
                        <CardHeader>
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            </div>
                            <CardTitle className="text-2xl font-light text-center">
                                Password Reset Successful!
                            </CardTitle>
                            <CardDescription className="text-center">
                                Your password has been successfully reset.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <p className="text-sm text-gray-600 text-center">
                                    You can now login with your new password.
                                </p>
                                <p className="text-sm text-gray-500 text-center">
                                    Redirecting you to the homepage...
                                </p>
                                <Button
                                    className="w-full bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white"
                                    onClick={() => navigate("/")}
                                >
                                    Go to Home
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Reset password form
    return (
        <div className="container mx-auto py-16">
            <div className="max-w-md mx-auto">
                <Card>
                    <CardHeader>
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#E07A5F]/10 mb-4">
                            <KeyRound className="h-6 w-6 text-[#E07A5F]" />
                        </div>
                        <CardTitle className="text-2xl font-light text-center">
                            Reset Your Password
                        </CardTitle>
                        <CardDescription className="text-center">
                            {email ? `Enter a new password for ${email}` : "Enter your new password"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {errorMessage && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm text-red-600">{errorMessage}</p>
                            </div>
                        )}

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>New Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="Enter your new password"
                                                    {...field}
                                                    autoComplete="new-password"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm New Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="password"
                                                    placeholder="Confirm your new password"
                                                    {...field}
                                                    autoComplete="new-password"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        className="w-full bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white"
                                        disabled={isResetting}
                                    >
                                        {isResetting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Resetting Password...
                                            </>
                                        ) : (
                                            "Reset Password"
                                        )}
                                    </Button>
                                </div>

                                <div className="text-center">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="text-sm text-gray-600"
                                        onClick={() => navigate("/")}
                                        disabled={isResetting}
                                    >
                                        Cancel and return to home
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>

            <NotificationDialog
                open={notificationOpen}
                onOpenChange={setNotificationOpen}
                title={notificationConfig.title}
                description={notificationConfig.description}
                variant={notificationConfig.variant}
            />
        </div>
    );
}
