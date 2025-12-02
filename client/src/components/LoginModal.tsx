import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
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

const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

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

    const showNotification = (title: string, description?: string, variant: "success" | "error" | "warning" | "info" = "success") => {
        setNotificationConfig({ title, description, variant });
        setNotificationOpen(true);
    };

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: "",
            rememberMe: false,
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

    // Clear error when modal closes
    const handleModalChange = (open: boolean) => {
        if (!open) {
            setLocalError(null);
            form.reset();
        }
        onOpenChange(open);
    };

    return (
        <Dialog open={open} onOpenChange={handleModalChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-light text-center">
                        Welcome Back
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {localError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600">{localError}</p>
                        </div>
                    )}

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
                                    className="w-full bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white"
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
                                    className="w-full text-sm text-gray-600"
                                    onClick={() => {
                                        showNotification("Coming soon", "Password reset functionality will be available soon.", "info");
                                    }}
                                    disabled={isLoading}
                                >
                                    Forgot Password?
                                </Button>
                            </div>
                        </form>
                    </Form>
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