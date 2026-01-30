import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import PostCard from './PostCard';
import CreateCommentModal from './CreateCommentModal'; // Import the new modal
import { getAuthTokenOrLogout, handleAuthFailure } from '../utils/auth';

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
  const [selectedPostIdForComment, setSelectedPostIdForComment] = useState(null);
  const navigate = useNavigate();

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthTokenOrLogout(navigate);
      if (!token) {
        setLoading(false);
        return;
      }
      const response = await fetch('/api/posts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        if (handleAuthFailure(response.status, navigate)) {
          return;
        }
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    fetchPosts,
  }));

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (refreshTrigger !== undefined) {
      fetchPosts();
    }
  }, [refreshTrigger]);

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p>Error loading posts: {error}</p>;

  if (posts.length === 0) {
    return <p>No posts yet. Be the first to share your thoughts!</p>;
  }

  const handleLikeSuccess = (updatedPost) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
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

  return (
    <FeedContainer>
      {posts.map((post) => (
        <PostCard 
          key={post.id} 
          post={post} 
          onLikeSuccess={handleLikeSuccess} 
          fetchStats={fetchStats} 
          onCommentClick={handleOpenCommentModal} // Pass the handler
        />
      ))}

      {showCommentModal && (
        <CreateCommentModal
          postId={selectedPostIdForComment}
          onClose={handleCloseCommentModal}
          onCommentPosted={handleCommentPosted}
        />
      )}
    </FeedContainer>
  );
});

export default ActivityFeed;
