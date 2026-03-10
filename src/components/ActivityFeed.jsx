import React, {
    useState,
    useEffect,
    useCallback,
    forwardRef,
    useImperativeHandle,
} from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import PostCard from "./PostCard";
import CreateCommentModal from "./CreateCommentModal"; // Import the new modal
import { getAuthTokenOrLogout, handleAuthFailure } from "../utils/auth";
import EditPostModal from './EditPostModal';

const FeedContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const ActivityFeed = forwardRef(({ fetchStats, refreshTrigger }, ref) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [selectedPostIdForComment, setSelectedPostIdForComment] =
        useState(null);
    const [viewer, setViewer] = useState({ id: null, isAdmin: false });
    const navigate = useNavigate();
    const [editingPost, setEditingPost] = useState(null);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = getAuthTokenOrLogout(navigate);
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const decoded = jwtDecode(token);
                setViewer({
                    id: decoded?.id ?? null,
                    isAdmin: decoded?.role === "admin",
                });
            } catch {
                setViewer({ id: null, isAdmin: false });
            }
            const response = await fetch("/api/posts", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                if (handleAuthFailure(response.status, navigate)) {
                    return;
                }
                const errorText = await response.text();
                throw new Error(`API error: ${response.status} - ${errorText}`);
            }
            const data = await response.json();
            const normalizedPosts = Array.isArray(data)
                ? data
                : Array.isArray(data?.posts)
                  ? data.posts
                  : [];
            if (!Array.isArray(data) && !Array.isArray(data?.posts)) {
                const fallbackError =
                    data?.message || data?.error || "Unexpected posts payload";
                setError(fallbackError);
            }
            setPosts(normalizedPosts);
        } catch (error) {
            setError(error.message);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useImperativeHandle(ref, () => ({
        fetchPosts,
    }));

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    useEffect(() => {
        if (refreshTrigger !== undefined) {
            fetchPosts();
        }
    }, [refreshTrigger, fetchPosts]);

    if (loading) return <p>Loading posts...</p>;
    if (error) return <p>Error loading posts: {error}</p>;

    if (posts.length === 0) {
        return <p>No posts yet. Be the first to share your thoughts!</p>;
    }

    const handleLikeSuccess = (updatedPost) => {
        setPosts((prevPosts) =>
            (Array.isArray(prevPosts) ? prevPosts : []).map((post) =>
                post.id === updatedPost.id ? updatedPost : post,
            ),
        );
        fetchStats(); // Call fetchStats after a successful like operation
    };

    const handleOpenCommentModal = (postId) => {
        setSelectedPostIdForComment(postId);
        setShowCommentModal(true);
    };

    const handleCloseCommentModal = () => {
        setShowCommentModal(false);
        setSelectedPostIdForComment(null);
    };

    const handleCommentPosted = () => {
        fetchPosts(); // Re-fetch posts to update comment count on PostCard (if displayed)
        fetchStats(); // Re-fetch stats to update Total Comments count on YourStats
        handleCloseCommentModal(); // Close the modal
    };

    const handleTogglePostVisibility = async (post) => {
        const token = getAuthTokenOrLogout(navigate);
        if (!token) return;

        try {
            const response = await fetch(`/api/posts/${post.id}/visibility`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    is_hidden: !(
                        post.is_hidden === 1 || post.is_hidden === true
                    ),
                }),
            });

            if (!response.ok) {
                if (handleAuthFailure(response.status, navigate)) {
                    return;
                }
                const errorText = await response.text();
                throw new Error(errorText || "Failed to update visibility");
            }

            const updatedPost = await response.json();
            setPosts((prevPosts) =>
                (Array.isArray(prevPosts) ? prevPosts : []).map((currentPost) =>
                    currentPost.id === updatedPost.id
                        ? { ...currentPost, ...updatedPost }
                        : currentPost,
                ),
            );
        } catch (requestError) {
            setError(requestError.message);
        }
    };

    

    return (
        <FeedContainer>
            {(Array.isArray(posts) ? posts : []).map((post) => {
                const isOwner =
                    viewer.id !== null &&
                    String(viewer.id) === String(post.student_id);
                const canHide = viewer.isAdmin || isOwner;
                return (
                    <PostCard
                        key={post.id}
                        post={post}
                        onLikeSuccess={handleLikeSuccess}
                        fetchStats={fetchStats}
                        onCommentClick={handleOpenCommentModal} // Pass the handler
                        canHide={canHide}
                        onToggleVisibility={handleTogglePostVisibility}
                        canEdit={isOwner}
                        onEdit={(post) => setEditingPost(post)}
                        showMoveButtons={false}
                    />
                );
            })}
            {showCommentModal && (
                <CreateCommentModal
                    postId={selectedPostIdForComment}
                    onClose={handleCloseCommentModal}
                    onCommentPosted={handleCommentPosted}
                />
            )}
            {editingPost && (
                <EditPostModal
                    post={editingPost}
                    onClose={() => setEditingPost(null)}
                    onPostUpdated={(updatedPost) => {
                        setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
                        setEditingPost(null);
                    }}
                />
            )}
        </FeedContainer>
    );
});

export default ActivityFeed;
