import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { FiHeart, FiMessageSquare } from 'react-icons/fi';
import { resolveMediaUrl } from '../utils/media';
import { useNavigate, Link } from 'react-router-dom';
import { getAuthTokenOrLogout, handleAuthFailure } from '../utils/auth';
import DOMPurify from 'dompurify';

const Card = styled(Link)`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  opacity: ${(props) => (props.$isHidden ? 0.6 : 1)};
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
`;

const AuthorMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
`;

const AuthorName = styled.span`
  font-weight: 500;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PostTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #2c3e50;
`;



const PostMedia = styled.div`
  margin: 15px 0;
  width: 100%;

  img,
  video {
    width: 100%;
    max-height: 400px;
    object-fit: contain;
    border-radius: 8px;
    background-color: #f0f2f5;
  }
`;

const PostPreview = styled.p`
  color: #556;
  line-height: 1.6;
  padding: 0 0.5rem;
  ol, ul {
    padding-left: 1.5rem;
  }
  p {
    margin: 0 0 0.5rem 0;
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
    color: red;
  }

  &:hover {
    color: var(--primary-teal);
  }
`;

const OwnerActions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-left: auto;
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

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const HiddenBadge = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: #1f2937;
  background: #fef3c7;
  border-radius: 999px;
  padding: 0.2rem 0.6rem;
`;

const StyledFiHeart = styled(FiHeart)`
  color: ${(props) => (props.$isLiked ? 'red' : 'currentColor')};
  transition: color 0.3s;
`;

const ReadMore = styled.span`
  font-weight: 600;
  font-size: 0.85rem;
  margin-left: 0.25rem;
  white-space: nowrap;
  display: inline-block;
  transition: transform 0.2s ease, font-size 0.2s ease;

  &:hover {
    font-size: 0.95rem;
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
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  showMoveButtons = true,
}) => {
  const [currentLikes, setCurrentLikes] = useState(Number(post.likes) || 0);
  const [isLiked, setIsLiked] = useState(post.isLiked === 1 || post.isLiked === true);
  const [isLikePending, setIsLikePending] = useState(false);
  const likeRequestLockRef = useRef(false);
  const navigate = useNavigate();
  const canComment = typeof onCommentClick === 'function';
  const isHidden = post.is_hidden === 1 || post.is_hidden === true;
  const postFont = post.post_font_family || 'inherit';

  useEffect(() => {
    if (isLikePending) return;
    setCurrentLikes(Number(post.likes) || 0);
    setIsLiked(post.isLiked === 1 || post.isLiked === true);
  }, [post.likes, post.isLiked, isLikePending]);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (likeRequestLockRef.current || isLikePending) return;

    const token = getAuthTokenOrLogout(navigate);
    if (!token) {
      return;
    }

    const previousLiked = isLiked;
    const previousLikes = Number(currentLikes) || 0;
    const nextLiked = !previousLiked;
    const nextLikes = Math.max(0, previousLikes + (nextLiked ? 1 : -1));

    likeRequestLockRef.current = true;
    setIsLikePending(true);
    setIsLiked(nextLiked);
    setCurrentLikes(nextLikes);

    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (handleAuthFailure(response.status, navigate)) {
          setIsLiked(previousLiked);
          setCurrentLikes(previousLikes);
          return;
        }
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const updatedPost = await response.json();

      setCurrentLikes(Number(updatedPost.likes) || 0);
      setIsLiked(updatedPost.isLiked === 1 || updatedPost.isLiked === true);
      if (onLikeSuccess) {
        onLikeSuccess(updatedPost);
      }
      if (fetchStats) {
        fetchStats();
      }
    } catch (error) {
      setIsLiked(previousLiked);
      setCurrentLikes(previousLikes);
      console.error('handleLike: Error toggling like:', error);
    } finally {
      likeRequestLockRef.current = false;
      setIsLikePending(false);
    }
  };

  const getMediaUrl = (url) => resolveMediaUrl(url);

  return (
    <Card to={`/post/${post.id}`} id={`post-${post.id}`} $isHidden={isHidden}>
      <HeaderRow>
        <AuthorInfo>
          <Avatar src={resolveMediaUrl(post.student_avatar)} alt={post.student_name} />
          <AuthorMeta>
            <AuthorName>{post.student_name}</AuthorName>
            {isHidden && <HiddenBadge>Hidden</HiddenBadge>}
          </AuthorMeta>
        </AuthorInfo>
        {(canEdit || canHide) && (
          <OwnerActions>
            {canHide && (
              <OwnerButton onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleVisibility && onToggleVisibility(post); }}>
                {isHidden ? 'Unhide' : 'Hide'}
              </OwnerButton>
            )}
            {canEdit && (
              <>
                {showMoveButtons && (
                  <>
                    <OwnerButton
                      disabled={!canMoveUp}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onMoveUp && onMoveUp(post);
                      }}>
                      Up
                    </OwnerButton>
                    <OwnerButton
                      disabled={!canMoveDown}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onMoveDown && onMoveDown(post);
                      }}>
                      Down
                    </OwnerButton>
                  </>
                )}
                <OwnerButton onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit && onEdit(post); }}>Edit</OwnerButton>
                <OwnerButton onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete && onDelete(post); }}>Delete</OwnerButton>
              </>
            )}
          </OwnerActions>
        )}
      </HeaderRow>

      <PostTitle style={{ fontFamily: postFont }}>{post.title}</PostTitle>

      {post.media_url && (
        <PostMedia>
          {post.post_type === 'image' && <img src={getMediaUrl(post.media_url)} alt="Post media" />}
          {post.post_type === 'video' && <video src={getMediaUrl(post.media_url)} controls />}
        </PostMedia>
      )}

      <div>
        <PostPreview
          style={{ fontFamily: postFont }}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content, { ALLOWED_TAGS: ['p', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'br', 'span'] }).substring(0, 300) }}
        />
        <ReadMore>[CLICK TO READ MORE]</ReadMore>
      </div>
      <EngagementBar>
        <EngagementIcon onClick={handleLike} style={{ opacity: isLikePending ? 0.7 : 1 }}>
          <StyledFiHeart $isLiked={isLiked} />
          <span>{currentLikes}</span>
        </EngagementIcon>
        <EngagementIcon
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (canComment) onCommentClick(post.id);
            navigate(`/post/${post.id}#comments`);
          }}>
          <FiMessageSquare />
          <span>{post.comment_count || 0}</span>
        </EngagementIcon>
      </EngagementBar>
    </Card>
  );
};

export default PostCard;
