import React, { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    ArrowLeft,
    Heart,
    MessageSquare,
    Calendar,
    Send,
    MoreHorizontal,
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

interface PostDetail {
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
    isLikedByUser: boolean;
}

interface PostDetailResponse {
    post: PostDetail;
    comments: PostComment[];
}

const SECTIONS = [
    { id: "general", name: "General" },
    { id: "where-to-find", name: "Where to find" },
    { id: "product-swaps", name: "Product Swaps" }
] as const;

const PostDetail: React.FC = () => {
    const [, setLocation] = useLocation();
    const [match, params] = useRoute("/community/post/:id");
    const { user, isAuthenticated } = useAuth();
    const queryClient = useQueryClient();

    const [newComment, setNewComment] = useState("");
    const [commentError, setCommentError] = useState("");

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
    const [confirmPostDeleteOpen, setConfirmPostDeleteOpen] = useState(false);
    const [confirmCommentDeleteOpen, setConfirmCommentDeleteOpen] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState<number | null>(null);

    const postId = params?.id ? parseInt(params.id) : null;

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

    // Fetch post details with comments
    const { data: postResponse, isLoading, error } = useQuery<PostDetailResponse>({
        queryKey: ["post-detail", postId],
        queryFn: async () => {
            if (!postId) throw new Error("Invalid post ID");

            const response = await fetch(`/api/community/posts/${postId}`, {
                credentials: "include"
            });
            if (!response.ok) {
                throw new Error("Failed to fetch post");
            }
            return response.json();
        },
        enabled: isAuthenticated && !!postId
    });

    // Like post mutation
    const likePostMutation = useMutation({
        mutationFn: async () => {
            if (!postId) throw new Error("Invalid post ID");

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

            if (!response.ok) throw new Error("Failed to update like");
            return response.json();
        },
        onMutate: async () => {
            // Optimistic update
            await queryClient.cancelQueries({ queryKey: ["post-detail", postId] });

            const previousResponse = queryClient.getQueryData<PostDetailResponse>(["post-detail", postId]);

            if (previousResponse) {
                queryClient.setQueryData<PostDetailResponse>(["post-detail", postId], {
                    ...previousResponse,
                    post: {
                        ...previousResponse.post,
                        isLikedByUser: !previousResponse.post.isLikedByUser,
                        likesCount: previousResponse.post.isLikedByUser
                            ? previousResponse.post.likesCount - 1
                            : previousResponse.post.likesCount + 1
                    }
                });
            }

            return { previousResponse };
        },
        onError: (err, variables, context) => {
            // Revert optimistic update
            if (context?.previousResponse) {
                queryClient.setQueryData(["post-detail", postId], context.previousResponse);
            }
            showNotification("Error", "Failed to update like status", "error");
        },
        onSuccess: (data) => {
            showNotification(data.message, `Post ${data.isLiked ? "liked" : "unliked"}`);
        }
    });

    // Add comment mutation
    const addCommentMutation = useMutation({
        mutationFn: async (commentBody: string) => {
            if (!postId) throw new Error("Invalid post ID");

            // Get CSRF token
            const csrfResponse = await fetch("/api/csrf-token", {
                credentials: "include"
            });
            if (!csrfResponse.ok) throw new Error("Failed to get CSRF token");
            const { csrfToken } = await csrfResponse.json();

            const response = await fetch(`/api/community/posts/${postId}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": csrfToken
                },
                credentials: "include",
                body: JSON.stringify({ body: commentBody })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to add comment");
            }
            return response.json();
        },
        onSuccess: () => {
            setNewComment("");
            setCommentError("");
            showNotification("Comment added successfully!", "Your comment has been posted.");
            // Refresh post data to get updated comments
            queryClient.invalidateQueries({ queryKey: ["post-detail", postId] });
        },
        onError: (error: Error) => {
            showNotification("Error adding comment", error.message, "error");
        }
    });

    // Delete post mutation
    const deletePostMutation = useMutation({
        mutationFn: async () => {
            if (!postId) throw new Error("Invalid post ID");

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
            // Invalidate all community posts queries to refresh the list
            queryClient.invalidateQueries({ queryKey: ["community-posts"] });

            showNotification("Post Deleted", "Post and all associated comments have been removed");

            // Navigate back to community page after a short delay to show the notification
            setTimeout(() => {
                setLocation("/community");
            }, 1500);
        },
        onError: (error: Error) => {
            showNotification("Error", error.message || "Failed to delete post", "error");
        }
    });

    // Delete comment mutation
    const deleteCommentMutation = useMutation({
        mutationFn: async (commentId: number) => {
            // Get CSRF token
            const csrfResponse = await fetch("/api/csrf-token", {
                credentials: "include"
            });
            if (!csrfResponse.ok) throw new Error("Failed to get CSRF token");
            const { csrfToken } = await csrfResponse.json();

            const response = await fetch(`/api/community/comments/${commentId}`, {
                method: "DELETE",
                headers: {
                    "X-CSRF-Token": csrfToken
                },
                credentials: "include"
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to delete comment");
            }

            return response.json();
        },
        onSuccess: () => {
            showNotification("Comment Deleted", "Comment has been removed");
            // Refresh post data to get updated comments
            queryClient.invalidateQueries({ queryKey: ["post-detail", postId] });
        },
        onError: (error: Error) => {
            showNotification("Error", error.message || "Failed to delete comment", "error");
        }
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

    const handleLikePost = () => {
        likePostMutation.mutate();
    };

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();

        if (!newComment.trim()) {
            setCommentError("Comment cannot be empty");
            return;
        }

        if (newComment.length > 2000) {
            setCommentError("Comment must be less than 2000 characters");
            return;
        }

        addCommentMutation.mutate(newComment.trim());
    };

    const handleDeletePost = () => {
        setConfirmPostDeleteOpen(true);
    };

    const confirmDeletePost = () => {
        deletePostMutation.mutate();
    };

    const handleDeleteComment = (commentId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setCommentToDelete(commentId);
        setConfirmCommentDeleteOpen(true);
    };

    const confirmDeleteComment = () => {
        if (commentToDelete !== null) {
            deleteCommentMutation.mutate(commentToDelete);
            setCommentToDelete(null);
        }
    };

    if (!isAuthenticated) {
        return null; // Will redirect
    }

    if (!postId) {
        return (
            <div className="min-h-screen">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-red-600">Invalid Post</h1>
                        <p className="text-gray-600 mb-4">The post you're looking for doesn't exist.</p>
                        <Button onClick={() => setLocation("/community")}>
                            Back to Community
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        <Card className="animate-pulse">
                            <CardContent className="p-6">
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                                <div className="h-32 bg-gray-200 rounded w-full"></div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !postResponse) {
        return (
            <div className="min-h-screen">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-red-600">Error Loading Post</h1>
                        <p className="text-gray-600 mb-4">Failed to load the post. Please try again.</p>
                        <Button onClick={() => setLocation("/community")}>
                            Back to Community
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const post = postResponse.post;
    const comments = postResponse.comments;
    const sectionName = SECTIONS.find(s => s.id === post.section)?.name || post.section;

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <Button
                            variant="ghost"
                            onClick={() => setLocation("/community")}
                            className="mb-4"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Community
                        </Button>
                        <Badge variant="secondary" className="mb-4">
                            {sectionName}
                        </Badge>
                    </div>

                    {/* Post Content */}
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            {/* Post Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <Avatar className="h-12 w-12">
                                        <AvatarFallback>
                                            {post.username.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium text-gray-900 text-lg">
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
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={handleDeletePost}
                                                className="text-red-600 focus:text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete Post
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>

                            {/* Post Title and Content */}
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                                    {post.title}
                                </h1>
                                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {post.body}
                                </div>
                            </div>

                            {/* Post Actions */}
                            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                <div className="flex items-center space-x-6">
                                    <button
                                        onClick={handleLikePost}
                                        disabled={likePostMutation.isPending}
                                        className={`flex items-center space-x-2 text-sm transition-colors ${
                                            post.isLikedByUser
                                                ? "text-red-600 hover:text-red-700"
                                                : "text-gray-500 hover:text-red-600"
                                        }`}
                                    >
                                        <Heart
                                            className={`h-5 w-5 ${
                                                post.isLikedByUser ? "fill-current" : ""
                                            }`}
                                        />
                                        <span>{post.likesCount}</span>
                                    </button>
                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <MessageSquare className="h-5 w-5" />
                                        <span>{comments.length} comments</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Comments Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Comments ({comments.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Add Comment Form */}
                            <form onSubmit={handleSubmitComment} className="mb-6 space-y-4">
                                <div>
                                    <Label htmlFor="comment">Add a comment</Label>
                                    <Textarea
                                        id="comment"
                                        value={newComment}
                                        onChange={(e) => {
                                            setNewComment(e.target.value);
                                            if (commentError) setCommentError("");
                                        }}
                                        placeholder="Share your thoughts..."
                                        rows={3}
                                        className={commentError ? "border-red-500" : ""}
                                    />
                                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                                        {commentError ? (
                                            <span className="text-red-600">{commentError}</span>
                                        ) : (
                                            <span></span>
                                        )}
                                        <span>{newComment.length}/2000</span>
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={addCommentMutation.isPending || !newComment.trim()}
                                >
                                    {addCommentMutation.isPending ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Posting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Post Comment
                                        </>
                                    )}
                                </Button>
                            </form>

                            {/* Comments List */}
                            <div className="space-y-4">
                                {comments.length === 0 ? (
                                    <div className="text-center py-8">
                                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
                                        <p className="text-gray-500">Be the first to share your thoughts!</p>
                                    </div>
                                ) : (
                                    comments.map((comment) => (
                                        <div key={comment.id} className="border-l-2 border-gray-100 pl-4 py-3">
                                            <div className="flex items-start space-x-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>
                                                        {comment.username.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="font-medium text-gray-900">
                                                                {comment.username}
                                                            </span>
                                                            <span className="text-sm text-gray-500">
                                                                {formatTimeAgo(comment.createdAt)}
                                                            </span>
                                                        </div>
                                                        {(user?.id === comment.userId || user?.role === "admin") && (
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        <MoreHorizontal className="h-3 w-3" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem
                                                                        onClick={(e) => handleDeleteComment(comment.id, e)}
                                                                        className="text-red-600 focus:text-red-600"
                                                                    >
                                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                                        Delete Comment
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                        {comment.body}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
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

            {/* Confirm Delete Post Dialog */}
            <ConfirmDialog
                open={confirmPostDeleteOpen}
                onOpenChange={setConfirmPostDeleteOpen}
                title="Delete Post"
                description="Are you sure you want to delete this post? This will also delete all comments and cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDeletePost}
                variant="destructive"
                isLoading={deletePostMutation.isPending}
            />

            {/* Confirm Delete Comment Dialog */}
            <ConfirmDialog
                open={confirmCommentDeleteOpen}
                onOpenChange={setConfirmCommentDeleteOpen}
                title="Delete Comment"
                description="Are you sure you want to delete this comment? This cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDeleteComment}
                variant="destructive"
                isLoading={deleteCommentMutation.isPending}
            />
        </div>
    );
};

export default PostDetail;