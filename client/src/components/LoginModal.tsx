import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FcGoogle } from "react-icons/fc";
import { ArrowLeft } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationDialog } from "@/components/NotificationDialog";
import { apiRequest } from "@/lib/queryClient";

const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional(),
});

const passwordResetSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type PasswordResetFormValues = z.infer<typeof passwordResetSchema>;

interface LoginModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ open, onOpenChange }) => {
    const [, navigate] = useLocation();
    const [localError, setLocalError] = useState<string | null>(null);
    const { login, isLoading } = useAuth();
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [notificationConfig, setNotificationConfig] = useState<{
        title: string;
        description?: string;
        variant: "success" | "error" | "warning" | "info";
    }>({
        title: "",
        variant: "success"
    });
    const [view, setView] = useState<"login" | "reset-password">("login");
    const [isResetting, setIsResetting] = useState(false);

    const showNotification = (title: string, description?: string, variant: "success" | "error" | "warning" | "info" = "success") => {
        setNotificationConfig({ title, description, variant });
        setNotificationOpen(true);
    };

    // Handle OAuth errors from URL parameters
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const error = params.get('error');

        if (error === 'oauth_failed') {
            const message = params.get('message') || 'Google sign-in failed';
            setLocalError(message);
            showNotification("Sign-in failed", message, "error");

            // Clean URL
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: "",
            rememberMe: false,
        },
    });

    const resetForm = useForm<PasswordResetFormValues>({
        resolver: zodResolver(passwordResetSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data: LoginFormValues) => {
        setLocalError(null); // Clear local error

        try {
            await login(data.username, data.password, data.rememberMe);

            showNotification("Login successful!", "Welcome back to ExpatEats.", "success");

            // Close modal and redirect
            onOpenChange(false);
            form.reset();
            setLocalError(null); // Clear error on close
            navigate("/");
        } catch (error) {
            console.error('Login error:', error);

            const errorMessage = error instanceof Error ? error.message : "Please check your credentials and try again.";
            setLocalError(errorMessage);

            showNotification("Login failed", errorMessage, "error");
        }
    };

    const handleCreateAccount = () => {
        onOpenChange(false);
        form.reset();
        setLocalError(null); // Clear error on close
        navigate("/register");
    };

    const onPasswordReset = async (data: PasswordResetFormValues) => {
        setLocalError(null);
        setIsResetting(true);

        try {
            const response = await apiRequest("POST", "/api/auth/request-password-reset", {
                email: data.email,
            });

            if (response.requiresGoogle) {
                showNotification(
                    "Google Account Detected",
                    "This email is registered with Google sign-in. Please use the 'Sign in with Google' button instead.",
                    "info"
                );
            } else if (response.emailNotFound) {
                showNotification(
                    "Email Not Found",
                    "No account exists with this email address. Please check your email or create a new account.",
                    "error"
                );
            } else {
                showNotification(
                    "Reset Link Sent!",
                    "If an account exists with this email, you will receive a password reset link. Please check your email (including spam folder). The link will expire in 1 hour.",
                    "success"
                );
                resetForm.reset();
                setView("login");
            }
        } catch (error) {
            console.error("Password reset error:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to send reset email. Please try again.";
            setLocalError(errorMessage);
            showNotification("Error", errorMessage, "error");
        } finally {
            setIsResetting(false);
        }
    };

    // Clear error when modal closes
    const handleModalChange = (open: boolean) => {
        if (!open) {
            setLocalError(null);
            form.reset();
            resetForm.reset();
            setView("login");
        }
        onOpenChange(open);
    };

    return (
        <Dialog open={open} onOpenChange={handleModalChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-light text-center">
                        {view === "login" ? "Welcome Back" : "Reset Password"}
                    </DialogTitle>
                    {view === "reset-password" && (
                        <DialogDescription className="text-center">
                            Enter your email address and we'll send you a link to reset your password.
                        </DialogDescription>
                    )}
                </DialogHeader>

                <div className="space-y-4">
                    {localError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600">{localError}</p>
                        </div>
                    )}

                    {view === "reset-password" && (
                        <>
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full justify-start text-sm text-t2"
                                onClick={() => {
                                    setView("login");
                                    setLocalError(null);
                                    resetForm.reset();
                                }}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Login
                            </Button>

                            <Form {...resetForm}>
                                <form onSubmit={resetForm.handleSubmit(onPasswordReset)} className="space-y-4">
                                    <FormField
                                        control={resetForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email Address</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="email"
                                                        placeholder="Enter your email"
                                                        {...field}
                                                        autoComplete="email"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        className="w-full bg-bark hover:bg-soil text-white"
                                        disabled={isResetting}
                                    >
                                        {isResetting ? "Sending Reset Link..." : "Send Reset Link"}
                                    </Button>
                                </form>
                            </Form>
                        </>
                    )}

                    {view === "login" && (
                        <>

                    {/* Google Sign-In Button */}
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={() => window.location.href = '/api/auth/google'}
                        disabled={isLoading}
                    >
                        <FcGoogle className="h-5 w-5" />
                        Sign in with Google
                    </Button>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter your username"
                                                {...field}
                                                autoComplete="username"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="Enter your password"
                                                {...field}
                                                autoComplete="current-password"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="rememberMe"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel className="text-sm">
                                                Remember me for 30 days
                                            </FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-3 pt-4">
                                <Button
                                    type="submit"
                                    className="w-full bg-bark hover:bg-soil text-white"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Signing in..." : "Sign In"}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={handleCreateAccount}
                                    disabled={isLoading}
                                >
                                    Create Account
                                </Button>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full text-sm text-t2"
                                    onClick={() => setView("reset-password")}
                                    disabled={isLoading}
                                >
                                    Forgot Password?
                                </Button>
                            </div>
                        </form>
                    </Form>
                    </>
                    )}
                </div>
            </DialogContent>

            <NotificationDialog
                open={notificationOpen}
                onOpenChange={setNotificationOpen}
                title={notificationConfig.title}
                description={notificationConfig.description}
                variant={notificationConfig.variant}
            />
        </Dialog>
    );
};