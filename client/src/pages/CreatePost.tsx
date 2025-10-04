import React, { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const SECTIONS = [
    { id: "general", name: "General", description: "General discussions and community topics" },
    { id: "where-to-find", name: "Where to find", description: "Help finding specific products and ingredients" },
    { id: "product-swaps", name: "Product Swaps", description: "Share alternatives and substitutions" }
] as const;

interface CreatePostFormData {
    title: string;
    body: string;
    section: string;
}

const CreatePost: React.FC = () => {
    const [, setLocation] = useLocation();
    const [match] = useRoute("/community/create/:section?");
    const { isAuthenticated } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Get section from URL or default to general
    const defaultSection = match?.section || "general";

    const [formData, setFormData] = useState<CreatePostFormData>({
        title: "",
        body: "",
        section: defaultSection
    });

    const [errors, setErrors] = useState<Partial<CreatePostFormData>>({});

    // Redirect if not authenticated
    React.useEffect(() => {
        if (!isAuthenticated) {
            setLocation("/");
        }
    }, [isAuthenticated, setLocation]);

    const createPostMutation = useMutation({
        mutationFn: async (data: CreatePostFormData) => {
            // Get CSRF token
            const csrfResponse = await fetch("/api/csrf-token", {
                credentials: "include"
            });
            if (!csrfResponse.ok) throw new Error("Failed to get CSRF token");
            const { csrfToken } = await csrfResponse.json();

            const response = await fetch("/api/community/posts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": csrfToken
                },
                credentials: "include",
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create post");
            }

            return response.json();
        },
        onSuccess: (data) => {
            toast({
                title: "Post created successfully!",
                description: "Your post has been published to the community.",
            });
            // Invalidate posts cache for the section
            queryClient.invalidateQueries({ queryKey: ["community-posts", formData.section] });
            // Navigate back to community with the section
            setLocation("/community");
        },
        onError: (error: Error) => {
            toast({
                title: "Error creating post",
                description: error.message,
                variant: "destructive"
            });
        }
    });

    const validateForm = (): boolean => {
        const newErrors: Partial<CreatePostFormData> = {};

        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        } else if (formData.title.length > 200) {
            newErrors.title = "Title must be less than 200 characters";
        }

        if (!formData.body.trim()) {
            newErrors.body = "Content is required";
        } else if (formData.body.length > 5000) {
            newErrors.body = "Content must be less than 5000 characters";
        }

        if (!formData.section) {
            newErrors.section = "Section is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            createPostMutation.mutate(formData);
        }
    };

    const handleInputChange = (field: keyof CreatePostFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    if (!isAuthenticated) {
        return null; // Will redirect
    }

    const selectedSection = SECTIONS.find(s => s.id === formData.section);

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            onClick={() => setLocation("/community")}
                            className="mb-4"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Community
                        </Button>
                        <div className="text-center">
                            <h1 className="font-montserrat text-3xl font-bold mb-2">Create New Post</h1>
                            <p className="text-gray-600">
                                Share your thoughts, questions, or discoveries with the community
                            </p>
                        </div>
                    </div>

                    {/* Create Post Form */}
                    <Card className="max-w-2xl mx-auto">
                        <CardHeader>
                            <CardTitle>New Post</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Section Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="section">Section</Label>
                                    <Select
                                        value={formData.section}
                                        onValueChange={(value) => handleInputChange("section", value)}
                                    >
                                        <SelectTrigger className="text-left">
                                            <SelectValue placeholder="Select a section" />
                                        </SelectTrigger>
                                        <SelectContent className="w-full min-w-[400px]">
                                            {SECTIONS.map((section) => (
                                                <SelectItem key={section.id} value={section.id} className="text-left">
                                                    <div className="text-left w-full">
                                                        <div className="font-medium">{section.name}</div>
                                                        <div className="text-sm text-gray-500">{section.description}</div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.section && (
                                        <p className="text-sm text-red-600">{errors.section}</p>
                                    )}
                                    {selectedSection && (
                                        <p className="text-sm text-gray-500">
                                            Posting to: <span className="font-medium">{selectedSection.name}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => handleInputChange("title", e.target.value)}
                                        placeholder="Enter a descriptive title for your post"
                                        className={errors.title ? "border-red-500" : ""}
                                    />
                                    <div className="flex justify-between text-sm text-gray-500">
                                        {errors.title ? (
                                            <span className="text-red-600">{errors.title}</span>
                                        ) : (
                                            <span></span>
                                        )}
                                        <span>{formData.title.length}/200</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="space-y-2">
                                    <Label htmlFor="body">Content</Label>
                                    <Textarea
                                        id="body"
                                        value={formData.body}
                                        onChange={(e) => handleInputChange("body", e.target.value)}
                                        placeholder="Write your post content here..."
                                        rows={8}
                                        className={errors.body ? "border-red-500" : ""}
                                    />
                                    <div className="flex justify-between text-sm text-gray-500">
                                        {errors.body ? (
                                            <span className="text-red-600">{errors.body}</span>
                                        ) : (
                                            <span></span>
                                        )}
                                        <span>{formData.body.length}/5000</span>
                                    </div>
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex gap-4 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setLocation("/community")}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={createPostMutation.isPending}
                                        className="flex-1"
                                    >
                                        {createPostMutation.isPending ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Publishing...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4 mr-2" />
                                                Publish Post
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;