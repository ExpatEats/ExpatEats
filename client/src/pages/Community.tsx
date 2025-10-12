import React, { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    MessageSquare,
    Heart,
    User,
    Calendar,
    MoreHorizontal,
    Plus,
    Trash2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationDialog } from "@/components/NotificationDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";

// Types for our API responses
interface PostComment {
    id: number;
    postId: number;
    userId: number;
    username: string;
    body: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

interface Post {
    id: number;
    title: string;
    body: string;
    userId: number;
    username: string;
    section: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    likesCount: number;
    commentsCount: number;
    isLikedByUser: boolean;
}

interface PostsResponse {
    posts: Post[];
    pagination: {
        limit: number;
        offset: number;
        total: number;
        hasMore: boolean;
    };
}

const SECTIONS = [
    { id: "general", name: "General", description: "General discussions and community topics" },
    { id: "where-to-find", name: "Where to find", description: "Help finding specific products and ingredients" },
    { id: "product-swaps", name: "Product Swaps", description: "Share alternatives and substitutions" }
] as const;

const Community: React.FC = () => {
    const [, setLocation] = useLocation();
    const { user, isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const [activeSection, setActiveSection] = useState<string>("general");

    // Notification dialog states
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [notificationConfig, setNotificationConfig] = useState<{
        title: string;
        description?: string;
        variant: "success" | "error" | "warning" | "info";
    }>({
        title: "",
        variant: "success"
    });

    // Confirm dialog states
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState<number | null>(null);

    // Helper function to show notifications
    const showNotification = (title: string, description?: string, variant: "success" | "error" | "warning" | "info" = "success") => {
        setNotificationConfig({ title, description, variant });
        setNotificationOpen(true);
    };

    // Redirect if not authenticated
    React.useEffect(() => {
        if (!isAuthenticated) {
            setLocation("/");
        }
    }, [isAuthenticated, setLocation]);

    // Fetch posts for the active section
    const { data: postsData, isLoading, error } = useQuery<PostsResponse>({
        queryKey: ["community-posts", activeSection],
        queryFn: async () => {
            const response = await fetch(`/api/community/posts?section=${activeSection}&limit=20&offset=0`, {
                credentials: "include"
            });
            if (!response.ok) {
                throw new Error("Failed to fetch posts");
            }
            return response.json();
        },
        enabled: isAuthenticated
    });

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return "Just now";
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    };


    const handleLikePost = async (postId: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent navigating to post

        // Optimistic update - immediately update local state
        queryClient.setQueryData<PostsResponse>(["community-posts", activeSection], (oldData) => {
            if (!oldData) return oldData;

            return {
                ...oldData,
                posts: oldData.posts.map(post => {
                    if (post.id === postId) {
                        return {
                            ...post,
                            isLikedByUser: !post.isLikedByUser,
                            likesCount: post.isLikedByUser ? post.likesCount - 1 : post.likesCount + 1
                        };
                    }
                    return post;
                })
            };
        });

        try {
            // Get CSRF token
            const csrfResponse = await fetch("/api/csrf-token", {
                credentials: "include"
            });
            if (!csrfResponse.ok) throw new Error("Failed to get CSRF token");
            const { csrfToken } = await csrfResponse.json();

            const response = await fetch(`/api/community/posts/${postId}/like`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": csrfToken
                },
                credentials: "include",
                body: "{}"
            });

            if (response.ok) {
                const result = await response.json();
                showNotification(result.message, `Post ${result.isLiked ? "liked" : "unliked"}`);
                // Invalidate to sync with server state
                queryClient.invalidateQueries({ queryKey: ["community-posts", activeSection] });
            } else {
                // Revert optimistic update on error
                queryClient.invalidateQueries({ queryKey: ["community-posts", activeSection] });
                throw new Error("Failed to update like");
            }
        } catch (error) {
            // Revert optimistic update on error
            queryClient.invalidateQueries({ queryKey: ["community-posts", activeSection] });
            showNotification("Error", "Failed to update like status", "error");
        }
    };

    // Delete post mutation
    const deletePostMutation = useMutation({
        mutationFn: async (postId: number) => {
            // Get CSRF token
            const csrfResponse = await fetch("/api/csrf-token", {
                credentials: "include"
            });
            if (!csrfResponse.ok) throw new Error("Failed to get CSRF token");
            const { csrfToken } = await csrfResponse.json();

            const response = await fetch(`/api/community/posts/${postId}`, {
                method: "DELETE",
                headers: {
                    "X-CSRF-Token": csrfToken
                },
                credentials: "include"
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to delete post");
            }

            return response.json();
        },
        onSuccess: () => {
            showNotification("Post Deleted", "Post and all associated comments have been removed");
            // Refresh the posts list
            queryClient.invalidateQueries({ queryKey: ["community-posts", activeSection] });
        },
        onError: (error: Error) => {
            showNotification("Error", error.message || "Failed to delete post", "error");
        }
    });

    const handleDeletePost = (postId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setPostToDelete(postId);
        setConfirmOpen(true);
    };

    const confirmDeletePost = () => {
        if (postToDelete !== null) {
            deletePostMutation.mutate(postToDelete);
            setPostToDelete(null);
        }
    };

    if (!isAuthenticated) {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="font-montserrat text-3xl font-bold mb-2">Community</h1>
                        <p className="text-gray-600 max-w-3xl mx-auto">
                            Connect with fellow expats, share experiences, and discover new food sources together.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-4">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold">Sections</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {SECTIONS.map((section) => (
                                        <button
                                            key={section.id}
                                            onClick={() => setActiveSection(section.id)}
                                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                                                activeSection === section.id
                                                    ? "bg-primary/10 text-primary border border-primary/20"
                                                    : "hover:bg-gray-100 text-gray-700"
                                            }`}
                                        >
                                            <div className="font-medium">{section.name}</div>
                                            <div className="text-sm text-gray-500 mt-1">
                                                {section.description}
                                            </div>
                                        </button>
                                    ))}
                                </CardContent>
                            </Card>

                        </div>

                        {/* Main Content - Posts Feed */}
                        <div className="lg:col-span-3">
                            {/* Section Header */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between">
                                    <Badge variant="secondary">
                                        {postsData?.pagination.total || 0} posts
                                    </Badge>
                                    <Button onClick={() => setLocation(`/community/create/${activeSection}`)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Post
                                    </Button>
                                </div>
                            </div>

                            {/* Posts Feed */}
                            <div className="space-y-6">
                                {isLoading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <Card key={i} className="animate-pulse">
                                                <CardContent className="p-6">
                                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : error ? (
                                    <Card>
                                        <CardContent className="p-6 text-center">
                                            <p className="text-red-600">Failed to load posts. Please try again.</p>
                                        </CardContent>
                                    </Card>
                                ) : postsData?.posts.length === 0 ? (
                                    <Card>
                                        <CardContent className="p-6 text-center">
                                            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                                            <p className="text-gray-500 mb-4">
                                                Be the first to start a conversation in this section!
                                            </p>
                                            <Button onClick={() => setLocation(`/community/create/${activeSection}`)}>
                                                Create First Post
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    postsData?.posts.map((post) => (
                                        <Card
                                            key={post.id}
                                            className="hover:shadow-md transition-shadow"
                                        >
                                            <CardContent className="p-6">
                                                {/* Post Header */}
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarFallback>
                                                                {post.username.charAt(0).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium text-gray-900">
                                                                {post.username}
                                                            </div>
                                                            <div className="text-sm text-gray-500 flex items-center">
                                                                <Calendar className="h-3 w-3 mr-1" />
                                                                {formatTimeAgo(post.createdAt)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {(user?.id === post.userId || user?.role === "admin") && (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    onClick={(e) => handleDeletePost(post.id, e)}
                                                                    className="text-red-600 focus:text-red-600"
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Delete Post
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                </div>

                                                {/* Post Content */}
                                                <div className="mb-4">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                        {truncateText(post.title, 100)}
                                                    </h3>
                                                    <p className="text-gray-700 leading-relaxed">
                                                        {truncateText(post.body, 300)}
                                                    </p>
                                                </div>

                                                {/* Post Actions */}
                                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                    <div className="flex items-center space-x-6">
                                                        <button
                                                            onClick={(e) => handleLikePost(post.id, e)}
                                                            className={`flex items-center space-x-2 text-sm transition-colors ${
                                                                post.isLikedByUser
                                                                    ? "text-red-600 hover:text-red-700"
                                                                    : "text-gray-500 hover:text-red-600"
                                                            }`}
                                                        >
                                                            <Heart
                                                                className={`h-4 w-4 ${
                                                                    post.isLikedByUser ? "fill-current" : ""
                                                                }`}
                                                            />
                                                            <span>{post.likesCount}</span>
                                                        </button>
                                                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                            <MessageSquare className="h-4 w-4" />
                                                            <span>{post.commentsCount} comments</span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setLocation(`/community/post/${post.id}`);
                                                        }}
                                                    >
                                                        Read More
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>

                            {/* Load More */}
                            {postsData?.pagination.hasMore && (
                                <div className="mt-8 text-center">
                                    <Button variant="outline">
                                        Load More Posts
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification Dialog */}
            <NotificationDialog
                open={notificationOpen}
                onOpenChange={setNotificationOpen}
                title={notificationConfig.title}
                description={notificationConfig.description}
                variant={notificationConfig.variant}
            />

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Delete Post"
                description="Are you sure you want to delete this post? This will also delete all comments and cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDeletePost}
                variant="destructive"
                isLoading={deletePostMutation.isPending}
            />
        </div>
    );
};

export default Community;