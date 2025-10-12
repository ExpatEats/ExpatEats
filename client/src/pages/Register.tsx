import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, X, Loader2 } from "lucide-react";
import { NotificationDialog } from "@/components/NotificationDialog";
import { useAuth } from "@/contexts/AuthContext";
import { RegistrationSuccessModal } from "@/components/RegistrationSuccessModal";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";

const passwordSchema = z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number");

const formSchema = z.object({
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must be no more than 20 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    email: z.string().email("Please enter a valid email address"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    name: z.string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be no more than 50 characters"),
    acceptTerms: z.boolean().refine((val) => val === true, {
        message: "You must accept the terms and conditions to continue",
    }),
    newsletter: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

const Register = () => {
    const [, navigate] = useLocation();
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [registeredUserName, setRegisteredUserName] = useState<string | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);
    const [validationState, setValidationState] = useState({
        usernameChecking: false,
        emailChecking: false,
        usernameAvailable: null as boolean | null,
        emailAvailable: null as boolean | null,
    });
    const { register, isLoading, isAuthenticated } = useAuth();
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

    const checkUsernameAvailability = useCallback(async (username: string) => {
        if (username.length < 3) {
            setValidationState(prev => ({ ...prev, usernameAvailable: null }));
            return;
        }

        setValidationState(prev => ({ ...prev, usernameChecking: true }));

        try {
            const response = await fetch(`/api/auth/check-username/${encodeURIComponent(username)}`);
            const data = await response.json();
            
            setValidationState(prev => ({ 
                ...prev, 
                usernameChecking: false,
                usernameAvailable: data.available 
            }));
        } catch (error) {
            console.error('Username check error:', error);
            setValidationState(prev => ({ 
                ...prev, 
                usernameChecking: false,
                usernameAvailable: null 
            }));
        }
    }, []);

    const checkEmailAvailability = useCallback(async (email: string) => {
        // Basic email format validation using a simple regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setValidationState(prev => ({ ...prev, emailAvailable: null }));
            return;
        }

        setValidationState(prev => ({ ...prev, emailChecking: true }));

        try {
            const response = await fetch(`/api/auth/check-email/${encodeURIComponent(email)}`);
            const data = await response.json();
            
            setValidationState(prev => ({ 
                ...prev, 
                emailChecking: false,
                emailAvailable: data.available 
            }));
        } catch (error) {
            console.error('Email check error:', error);
            setValidationState(prev => ({ 
                ...prev, 
                emailChecking: false,
                emailAvailable: null 
            }));
        }
    }, []);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate("/find-my-food");
        }
    }, [isAuthenticated, navigate]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            name: "",
            acceptTerms: false,
            newsletter: true,
        },
    });

    const onSubmit = async (data: FormValues) => {
        setLocalError(null); // Clear any previous errors

        try {
            // Remove confirmPassword from the data sent to the server
            const { confirmPassword, acceptTerms, newsletter, ...registrationData } = data;

            // Register without auto-login
            await register(registrationData, false);

            // Store the user name for the success modal
            setRegisteredUserName(data.name);
            
            // Show success modal immediately
            setSuccessModalOpen(true);

        } catch (error) {
            console.error('Registration error:', error);
            
            const errorMessage = error instanceof Error ? error.message : "Please try again later.";
            setLocalError(errorMessage);
            
            showNotification("Registration failed", errorMessage, "error");
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="text-center mb-6">
                <div className="inline-flex items-center bg-[#6D9075] text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                    </svg>
                    <span>PORTUGAL</span>
                </div>
                <h1 className="font-montserrat text-3xl md:text-4xl font-light tracking-wide mb-3">
                    Welcome to Expat Eats
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Your Guide to Sustainable Living Abroad
                </p>
            </div>

            <Card className="border shadow-lg">
                <CardHeader className="bg-primary/10 border-b">
                    <CardTitle className="text-2xl text-center">
                        Join Our Community
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-6">
                    <p className="mb-6 text-center text-gray-600">
                        Register to access our complete guides to food and
                        shopping in your new home and join our community of
                        expats.
                    </p>

                    {localError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600">{localError}</p>
                        </div>
                    )}

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="John Doe"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    placeholder="johndoe"
                                                    {...field}
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                        checkUsernameAvailability(e.target.value);
                                                    }}
                                                />
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                    {validationState.usernameChecking && (
                                                        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                                                    )}
                                                    {!validationState.usernameChecking && validationState.usernameAvailable === true && (
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                    )}
                                                    {!validationState.usernameChecking && validationState.usernameAvailable === false && (
                                                        <X className="h-4 w-4 text-red-500" />
                                                    )}
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                        {validationState.usernameAvailable === false && (
                                            <p className="text-sm text-red-600">Username is already taken</p>
                                        )}
                                        {validationState.usernameAvailable === true && (
                                            <p className="text-sm text-green-600">Username is available</p>
                                        )}
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type="email"
                                                    placeholder="you@example.com"
                                                    {...field}
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                        checkEmailAvailability(e.target.value);
                                                    }}
                                                />
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                    {validationState.emailChecking && (
                                                        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                                                    )}
                                                    {!validationState.emailChecking && validationState.emailAvailable === true && (
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                    )}
                                                    {!validationState.emailChecking && validationState.emailAvailable === false && (
                                                        <X className="h-4 w-4 text-red-500" />
                                                    )}
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                        {validationState.emailAvailable === false && (
                                            <p className="text-sm text-red-600">Email is already registered</p>
                                        )}
                                        {validationState.emailAvailable === true && (
                                            <p className="text-sm text-green-600">Email is available</p>
                                        )}
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
                                                placeholder="••••••••"
                                                {...field}
                                            />
                                        </FormControl>
                                        <PasswordStrengthIndicator password={field.value || ""} />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="newsletter"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Newsletter</FormLabel>
                                            <p className="text-sm text-gray-500">
                                                Receive notifications about
                                                community events and
                                                food-related news in Lisbon.
                                            </p>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="acceptTerms"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                I accept the{" "}
                                                <a
                                                    href="/terms"
                                                    className="text-primary hover:underline"
                                                    target="_blank"
                                                >
                                                    Terms and Conditions
                                                </a>
                                            </FormLabel>
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <div className="flex flex-col items-center pt-4 space-y-4">
                                <Button
                                    type="submit"
                                    className="bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white text-lg px-8 py-6 rounded-full font-medium w-full max-w-xs"
                                    size="lg"
                                    disabled={isLoading}
                                >
                                    {isLoading
                                        ? "Processing..."
                                        : "Join & Continue"}
                                </Button>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        // Add a test user to localStorage
                                        localStorage.setItem(
                                            "userProfile",
                                            JSON.stringify({
                                                email: "test@example.com",
                                                name: "Test User",
                                                newsletter: false,
                                            }),
                                        );
                                        // Redirect to find my food page
                                        navigate("/find-my-food");
                                    }}
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    I just want to test for now
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Registration Success Modal */}
            <RegistrationSuccessModal
                open={successModalOpen}
                onOpenChange={setSuccessModalOpen}
                userName={registeredUserName || undefined}
            />

            <NotificationDialog
                open={notificationOpen}
                onOpenChange={setNotificationOpen}
                title={notificationConfig.title}
                description={notificationConfig.description}
                variant={notificationConfig.variant}
            />
        </div>
    );
};

export default Register;
