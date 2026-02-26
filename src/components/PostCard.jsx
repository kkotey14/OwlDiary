import React, { useState } from 'react';
import styled from 'styled-components';
import { FiHeart, FiMessageSquare } from 'react-icons/fi';
import { resolveMediaUrl } from '../utils/media';
import { useNavigate, Link } from 'react-router-dom';
import { getAuthTokenOrLogout, handleAuthFailure } from '../utils/auth';

const Card = styled(Link)`
  background: white; /* Changed from var(--card-background) to white for consistency */
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1); /* Adjusted shadow for consistency */
  display: flex;
  flex-direction: column;
  gap: 1rem;
  opacity: ${(props) => (props.$isHidden ? 0.6 : 1)};
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
`;

const AuthorName = styled.span`
  font-weight: 500;
  color: #2c3e50; /* Changed from var(--text-primary) to hex code */
`;

const PostTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #2c3e50; /* Changed from var(--text-primary) to hex code */
`;

const PostMedia = styled.div`
  margin: 15px 0; /* Add margin */
  width: 100%;
  
  img, video {
    width: 100%;
    max-height: 400px; /* Limit height for media */
    object-fit: contain;
    border-radius: 8px; /* Add border-radius */
    background-color: #f0f2f5; /* Placeholder background */
  }
`;

const PostPreview = styled.p`
  color: #556; /* Changed from var(--text-secondary) to hex code */
  line-height: 1.6;
`;

const EngagementBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  color: #888;
`;

const EngagementIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: color 0.3s;
  
  &.liked {
    color: red; /* Color for liked state */
  }

  &:hover {
    color: var(--primary-teal);
  }
`;

const OwnerActions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

const OwnerButton = styled.button`
  border: none;
  background: #f0f2f5;
  color: #2c3e50;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s ease;

  &:hover {
    background: #e1e6ee;
  }
`;

const HiddenBadge = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: #1f2937;
  background: #fef3c7;
  border-radius: 999px;
  padding: 0.2rem 0.6rem;
  align-self: flex-start;
`;


const StyledFiHeart = styled(FiHeart)`
  color: ${props => props.$isLiked ? 'red' : '#888'};
  transition: color 0.3s;
`;

const PostCard = ({
  post,
  onLikeSuccess,
  fetchStats,
  onCommentClick,
  canEdit,
  canHide,
  onEdit,
  onDelete,
  onToggleVisibility,
}) => {
  const [currentLikes, setCurrentLikes] = useState(post.likes);
  const [isLiked, setIsLiked] = useState(post.isLiked === 1); // Initialize from prop
  const navigate = useNavigate();
  const canComment = typeof onCommentClick === 'function';
  const isHidden = post.is_hidden === 1 || post.is_hidden === true;
  const postFont = post.post_font_family || 'inherit';

  const handleLike = async () => {
    console.log('handleLike: Initiating like toggle for post ID:', post.id);
    const token = getAuthTokenOrLogout(navigate);
    if (!token) {
      console.error('handleLike: Authentication token not found.');
      // Optionally, redirect to login or show a message
      return;
    }

    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Add Authorization header
        },
      });

      console.log('handleLike: Response status:', response.status);
      if (!response.ok) {
        if (handleAuthFailure(response.status, navigate)) {
          return;
        }
        const errorText = await response.text();
        console.error('handleLike: API error response:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const updatedPost = await response.json();
      console.log('handleLike: Parsed updated post data:', updatedPost);

      setCurrentLikes(updatedPost.likes);
      setIsLiked(!!updatedPost.isLiked); // Corrected: Update isLiked based on server response (coerce to boolean)
      if (onLikeSuccess) {
        onLikeSuccess(updatedPost); // Notify parent component
      }
      if (fetchStats) {
        fetchStats(); // Call fetchStats to refresh the stats card
      }
    } catch (error) {
      console.error('handleLike: Error toggling like:', error);
      // Optionally show an error message to the user
    }
  };

  const getMediaUrl = (url) => resolveMediaUrl(url);

  return (
    <Card to={`/post/${post.id}`} id={`post-${post.id}`} $isHidden={isHidden}>
      {(canEdit || canHide) && (
        <OwnerActions>
          {canHide && (
            <OwnerButton onClick={() => onToggleVisibility && onToggleVisibility(post)}>
              {isHidden ? 'Unhide' : 'Hide'}
            </OwnerButton>
          )}
          {canEdit && (
            <>
              <OwnerButton onClick={() => onEdit && onEdit(post)}>Edit</OwnerButton>
              <OwnerButton onClick={() => onDelete && onDelete(post)}>Delete</OwnerButton>
            </>
          )}
        </OwnerActions>
      )}
      {isHidden && <HiddenBadge>Hidden</HiddenBadge>}
      <AuthorInfo>
        <Avatar src={resolveMediaUrl(post.student_avatar)} alt={post.student_name} />
        <AuthorName>{post.student_name}</AuthorName>
      </AuthorInfo>
      <PostTitle style={{ fontFamily: postFont }}>{post.title}</PostTitle>
      
      
      {post.media_url && (
        <PostMedia>
          {post.post_type === 'image' && (
            <img src={getMediaUrl(post.media_url)} alt="Post media" />
          )}
          {post.post_type === 'video' && (
            <video src={getMediaUrl(post.media_url)} controls />
          )}
        </PostMedia>
      )}

      <PostPreview style={{ fontFamily: postFont }}>{post.content.substring(0, 150)}...</PostPreview>
      <EngagementBar>
        <EngagementIcon onClick={handleLike}>
          <StyledFiHeart $isLiked={isLiked} /> {/* Use StyledFiHeart */}
          <span>{currentLikes}</span>
        </EngagementIcon>
        <EngagementIcon onClick={() => canComment && onCommentClick(post.id)}>
          <FiMessageSquare />
          <span>{post.comment_count || 0}</span>
        </EngagementIcon>
      </EngagementBar>
    </Card>
  );
};

export default PostCard;
