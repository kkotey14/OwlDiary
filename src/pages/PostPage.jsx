import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiHeart, FiMessageSquare, FiArrowLeft } from 'react-icons/fi';
import { resolveMediaUrl } from '../utils/media';
import { getAuthTokenOrLogout, handleAuthFailure } from '../utils/auth';


// ─── Styled Components ────────────────────────────────────────────────────────


const PageWrapper = styled.div`
  min-height: 100vh;
  width: calc(100% + 5rem);
  margin: -2.5rem;
  padding: 2.5rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  background: #f7f9fc;
`;


const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #6b7a90;
  font-size: 0.9rem;
  text-decoration: none;
  transition: color 0.2s;


  &:hover {
    color: var(--primary-teal);
  }
`;


const PostCard = styled.article`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;


const AuthorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;


const Avatar = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
`;


const AuthorMeta = styled.div`
  display: flex;
  flex-direction: column;
`;


const AuthorName = styled(Link)`
  font-weight: 600;
  color: #2c3e50;
  text-decoration: none;
  font-size: 0.95rem;


  &:hover {
    color: var(--primary-teal);
  }
`;


const PostDate = styled.span`
  font-size: 0.8rem;
  color: #6b7a90;
`;


const PostTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1.3;
  margin: 0;
`;


const PostMedia = styled.div`
  width: 100%;


  img,
  video {
    width: 100%;
    max-height: 500px;
    object-fit: contain;
    border-radius: 10px;
    background-color: #f0f2f5;
  }
`;


const PostContent = styled.div`
  color: #3d4f60;
  line-height: 1.8;
  font-size: 1rem;
  white-space: pre-wrap;
`;


const EngagementBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f2f5;
  color: #888;
`;


const EngagementBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: ${(props) => (props.$active ? 'red' : '#888')};
  font-size: 0.95rem;
  padding: 0;
  transition: color 0.2s;


  &:hover {
    color: var(--primary-teal);
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


// ─── Comments Section ─────────────────────────────────────────────────────────


const CommentsSection = styled.section`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;


const SectionTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
`;


const CommentItem = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 0.25rem;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.18s ease;
  background: ${(props) => (props.$active ? 'rgba(26, 188, 156, 0.12)' : 'transparent')};

  &:hover {
    background: rgba(15, 23, 42, 0.04);
  }
`;


const CommentAvatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;


const CommentBody = styled.div`
  background: #f7f9fc;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  flex: 1;
`;


const CommentAuthor = styled.span`
  font-weight: 600;
  font-size: 0.85rem;
  color: #2c3e50;
`;


const CommentDate = styled.span`
  font-size: 0.75rem;
  color: #6b7a90;
  margin-left: 0.5rem;
`;


const CommentText = styled.p`
  margin: 0.25rem 0 0;
  color: #3d4f60;
  font-size: 0.9rem;
  line-height: 1.5;
`;


const CommentForm = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
`;


const CommentInput = styled.textarea`
  flex: 1;
  border: 1px solid #dfe6ee;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 80px;
  outline: none;
  font-family: inherit;
  color: #2c3e50;


  &:focus {
    border-color: var(--primary-teal);
    box-shadow: 0 0 0 3px rgba(26, 188, 156, 0.12);
  }
`;


const SubmitButton = styled.button`
  border: none;
  background: var(--primary-teal);
  color: white;
  padding: 0.6rem 1.1rem;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.9rem;
  align-self: flex-end;
  transition: background 0.2s;


  &:hover {
    background: #12737b;
  }


  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;


const EmptyComments = styled.p`
  color: #6b7a90;
  font-size: 0.9rem;
  margin: 0;
`;


const ErrorText = styled.p`
  color: #ff6b6b;
  margin: 0;
  font-size: 0.9rem;
`;


// ─── Helpers ──────────────────────────────────────────────────────────────────


const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};


// ─── Component ────────────────────────────────────────────────────────────────


const PostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();


  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [postLoading, setPostLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [activeCommentId, setActiveCommentId] = useState(null);


  // Fetch post and comments independently so page content can render sooner.
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      const token = getAuthTokenOrLogout(navigate);
      if (!token) {
        if (isMounted) {
          setPostLoading(false);
          setCommentsLoading(false);
        }
        return;
      }

      const fetchPost = async () => {
        try {
          const postRes = await fetch(`/api/posts/${postId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!postRes.ok) {
            if (handleAuthFailure(postRes.status, navigate)) return;
            throw new Error('Post not found.');
          }
          const postData = await postRes.json();
          if (!isMounted) return;
          setPost(postData);
          setIsLiked(postData.isLiked === 1);
          setLikeCount(postData.likes);
        } catch (err) {
          if (isMounted) {
            setError(err.message);
          }
        } finally {
          if (isMounted) {
            setPostLoading(false);
          }
        }
      };

      const fetchComments = async () => {
        try {
          const commentsRes = await fetch(`/api/posts/${postId}/comments`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!commentsRes.ok) {
            if (handleAuthFailure(commentsRes.status, navigate)) return;
            throw new Error('Could not load comments.');
          }
          const commentsData = await commentsRes.json();
          if (!isMounted) return;
          setComments(Array.isArray(commentsData) ? commentsData : []);
        } catch (err) {
          if (isMounted) {
            setCommentError(err.message);
          }
        } finally {
          if (isMounted) {
            setCommentsLoading(false);
          }
        }
      };

      fetchPost();
      fetchComments();
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [postId, navigate]);

  useEffect(() => {
  if (postLoading || commentsLoading) return;
  const hash = window.location.hash || '';

  if (hash.startsWith('#comment-')) {
    const targetId = hash.slice(1);
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const commentId = targetId.replace('comment-', '');
      setActiveCommentId(commentId);
    }
    return;
  }

  if (hash === '#comments') {
    const el = document.getElementById('comments');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}, [postLoading, commentsLoading, comments.length]);

  const handleCommentClick = (commentId) => {
    const targetId = `comment-${commentId}`;
    const target = document.getElementById(targetId);
    setActiveCommentId(String(commentId));
    window.history.replaceState(null, '', `#${targetId}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  const handleLike = async () => {
    const token = getAuthTokenOrLogout(navigate);
    if (!token) return;


    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });


      if (!res.ok) {
        if (handleAuthFailure(res.status, navigate)) return;
        return;
      }


      const updated = await res.json();
      setIsLiked(!!updated.isLiked);
      setLikeCount(updated.likes);
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };


  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    setCommentError('');


    const token = getAuthTokenOrLogout(navigate);
    if (!token) return;


    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: commentText.trim() }),
      });


      if (!res.ok) {
        if (handleAuthFailure(res.status, navigate)) return;
        const errText = await res.text();
        throw new Error(errText || 'Failed to post comment.');
      }


      const { comment } = await res.json();
      setComments((prev) => [...prev, comment]);
      setCommentText('');
    } catch (err) {
      setCommentError(err.message);
    } finally {
      setSubmitting(false);
    }
  };


  if (postLoading) return <p>Loading post...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!post) return <p>Post not found.</p>;


  const isHidden = post.is_hidden === 1 || post.is_hidden === true;
  const postFont = post.post_font_family || 'inherit';
  const mediaUrl = post.media_url ? resolveMediaUrl(post.media_url) : null;


  return (
    <PageWrapper>
      <BackLink to={`/profile/${post.student_id}`}>
        <FiArrowLeft /> Back to {post.student_name}'s blog
      </BackLink>


      <PostCard>
        {isHidden && <HiddenBadge>Hidden</HiddenBadge>}


        <AuthorRow>
          <Avatar
            src={resolveMediaUrl(post.student_avatar)}
            alt={post.student_name}
          />
          <AuthorMeta>
            <AuthorName to={`/profile/${post.student_id}`}>
              {post.student_name}
            </AuthorName>
            <PostDate>{formatDate(post.created_at)}</PostDate>
          </AuthorMeta>
        </AuthorRow>


        <PostTitle style={{ fontFamily: postFont }}>{post.title}</PostTitle>


        {mediaUrl && (
          <PostMedia>
            {post.post_type === 'image' && (
              <img src={mediaUrl} alt="Post media" />
            )}
            {post.post_type === 'video' && (
              <video src={mediaUrl} controls />
            )}
          </PostMedia>
        )}


        <PostContent style={{ fontFamily: postFont }}>{post.content}</PostContent>


        <EngagementBar>
          <EngagementBtn $active={isLiked} onClick={handleLike}>
            <FiHeart />
            <span>{likeCount}</span>
          </EngagementBtn>
          <EngagementBtn as="span">
            <FiMessageSquare />
            <span>{commentsLoading ? '...' : comments.length}</span>
          </EngagementBtn>
        </EngagementBar>
      </PostCard>


      <CommentsSection id="comments">
        <SectionTitle>Comments ({comments.length})</SectionTitle>


        {commentsLoading && <EmptyComments>Loading comments...</EmptyComments>}

        {!commentsLoading && comments.length === 0 && (
          <EmptyComments>No comments yet. Be the first!</EmptyComments>
        )}

        {!commentsLoading && comments.map((comment) => (
          <CommentItem
            key={comment.id}
            id={`comment-${comment.id}`}
            $active={String(activeCommentId) === String(comment.id)}
            onClick={() => handleCommentClick(comment.id)}>
            <CommentAvatar
              src={resolveMediaUrl(comment.user_avatar)}
              alt={comment.user_name}
            />
            <CommentBody>
              <CommentAuthor>{comment.user_name}</CommentAuthor>
              <CommentDate>{formatDate(comment.created_at)}</CommentDate>
              <CommentText>{comment.content}</CommentText>
            </CommentBody>
          </CommentItem>
        ))}


        <CommentForm>
          <CommentInput
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <SubmitButton onClick={handleSubmitComment} disabled={submitting || !commentText.trim()}>
            {submitting ? 'Posting...' : 'Post'}
          </SubmitButton>
        </CommentForm>
        {commentError && <ErrorText>{commentError}</ErrorText>}
      </CommentsSection>
    </PageWrapper>
  );
};


export default PostPage;
