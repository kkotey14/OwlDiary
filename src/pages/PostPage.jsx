import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useOutletContext } from 'react-router-dom';
import styled from 'styled-components';
import { FiHeart, FiMessageSquare, FiArrowLeft, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { resolveMediaUrl } from '../utils/media';
import { getAuthTokenOrLogout, getStoredAuthToken, handleAuthFailure } from '../utils/auth';
import { jwtDecode } from 'jwt-decode';
import DOMPurify from 'dompurify';
import BrandedLoader from '../components/BrandedLoader';
import useMinimumLoadingDelay from '../hooks/useMinimumLoadingDelay';


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
  color: ${(props) => (props.$active ? '#dc2626' : '#888')};
  font-size: 0.95rem;
  padding: 0;
  transition: color 0.2s;


  &:hover {
    color: ${(props) => (props.$active ? '#dc2626' : 'var(--primary-teal)')};
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

const FilledHeart = styled(FiHeart)`
  fill: ${(props) => (props.$active ? 'currentColor' : 'transparent')};
  stroke-width: 2.15px;
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

const CommentActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const CommentActionBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #aab;
  font-size: 0.8rem;
  padding: 0;
  transition: color 0.2s;

  &:hover {
    color: ${(props) => (props.$danger ? '#ff6b6b' : 'var(--primary-teal)')};
  }
`;

const EditInput = styled.textarea`
  width: 100%;
  border: 1px solid #dfe6ee;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 60px;
  outline: none;
  font-family: inherit;
  color: #2c3e50;
  margin-top: 0.5rem;
  box-sizing: border-box;

  &:focus {
    border-color: var(--primary-teal);
    box-shadow: 0 0 0 3px rgba(26, 188, 156, 0.12);
  }
`;

const EditActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const SaveBtn = styled.button`
  border: none;
  background: var(--primary-teal);
  color: white;
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background 0.2s;

  &:hover { background: #12737b; }
`;

const CancelBtn = styled.button`
  border: 1px solid #dfe6ee;
  background: white;
  color: #6b7a90;
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background 0.2s;

  &:hover { background: #f0f2f5; }
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

const isLikedValue = (value) => value === 1 || value === '1' || value === true;

const normalizeComment = (comment) => ({
  ...comment,
  likes: Number(comment?.likes) || 0,
  isLiked: isLikedValue(comment?.isLiked) ? 1 : 0,
});


// ─── Component ────────────────────────────────────────────────────────────────


const PostPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const refreshStats = outletContext?.refreshStats || (() => {});


  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [postLoading, setPostLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isPostLikePending, setIsPostLikePending] = useState(false);
  const [commentLikePending, setCommentLikePending] = useState({});
  const postLikeLockRef = useRef(false);
  const commentLikeLocksRef = useRef({});
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [activeCommentId, setActiveCommentId] = useState(null);
  const showPostLoader = useMinimumLoadingDelay(postLoading, 500);
  const showCommentsLoader = useMinimumLoadingDelay(commentsLoading, 500);

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const currentUserId = (() => {
    try {
      const token = getStoredAuthToken();
      if (!token) return null;
      return jwtDecode(token).id;
    } catch {
      return null;
    }
  })();

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
          setIsLiked(postData.isLiked === 1 || postData.isLiked === true);
          setLikeCount(Number(postData.likes) || 0);
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
          setComments(
            Array.isArray(commentsData) ? commentsData.map(normalizeComment) : []
          );
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
    if (postLikeLockRef.current || isPostLikePending) return;
    const token = getAuthTokenOrLogout(navigate);
    if (!token) return;

    const nextLiked = !isLiked;

    postLikeLockRef.current = true;
    setIsPostLikePending(true);

    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ liked: nextLiked }),
      });


      if (!res.ok) {
        if (handleAuthFailure(res.status, navigate)) {
          return;
        }
        return;
      }


      const updated = await res.json();
      setIsLiked(updated.isLiked === 1 || updated.isLiked === true);
      setLikeCount(Number(updated.likes) || 0);
      refreshStats();
    } catch (err) {
      console.error('Error toggling like:', err);
    } finally {
      postLikeLockRef.current = false;
      setIsPostLikePending(false);
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

  const handleCommentLike = async (commentId) => {
    if (commentLikeLocksRef.current[commentId] || commentLikePending[commentId]) return;
    const token = getAuthTokenOrLogout(navigate);
    if (!token) return;

    const targetComment = comments.find((c) => c.id === commentId);
    if (!targetComment) return;

    const nextLiked = !isLikedValue(targetComment.isLiked);

    commentLikeLocksRef.current[commentId] = true;
    setCommentLikePending((prev) => ({ ...prev, [commentId]: true }));

    try {
        const res = await fetch(`/api/comments/${commentId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ liked: nextLiked }),
        });
        if (!res.ok) {
            return;
        }
        const updated = await res.json();
        setComments((prev) =>
            prev.map((c) => (
              c.id === commentId
                ? normalizeComment({ ...c, ...updated })
                : c
            ))
        );
        refreshStats();
    } catch (err) {
        console.error('Error liking comment:', err);
    } finally {
        delete commentLikeLocksRef.current[commentId];
        setCommentLikePending((prev) => {
            const next = { ...prev };
            delete next[commentId];
            return next;
        });
    }
  };

  const handleEditComment = (comment) => {
  setEditingCommentId(comment.id);
  setEditingText(comment.content);
};

const handleSaveEdit = async (commentId) => {
  const token = getAuthTokenOrLogout(navigate);
  if (!token) return;

  try {
    const res = await fetch(`/api/comments/${commentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: editingText }),
    });
    if (!res.ok) return;
    const { comment: updated } = await res.json();
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, content: updated.content } : c))
    );
    setEditingCommentId(null);
    setEditingText('');
  } catch (err) {
    console.error('Error editing comment:', err);
  }
};

const handleDeleteComment = async (commentId) => {
  if (!window.confirm('Are you sure you want to delete this comment?')) return;
  const token = getAuthTokenOrLogout(navigate);
  if (!token) return;

  try {
    const res = await fetch(`/api/comments/${commentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  } catch (err) {
    console.error('Error deleting comment:', err);
  }
};
  


  if (showPostLoader) return <BrandedLoader message="Loading post..." minHeight="100vh" />;
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


        <PostContent
          style={{ fontFamily: postFont }}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
        />


        <EngagementBar>
          <EngagementBtn $active={isLiked} onClick={handleLike} disabled={isPostLikePending}>
            <FilledHeart $active={isLiked} />
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


        {showCommentsLoader && (
          <EmptyComments as="div">
            <BrandedLoader message="Loading comments..." minHeight="180px" size="64px" />
          </EmptyComments>
        )}

        {!showCommentsLoader && comments.length === 0 && (
          <EmptyComments>No comments yet. Be the first!</EmptyComments>
        )}

        {!showCommentsLoader && comments.map((comment) => (
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
              {editingCommentId === comment.id ? (
                <>
                  <EditInput
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                  />
                  <EditActions>
                    <SaveBtn onClick={() => handleSaveEdit(comment.id)}>Save</SaveBtn>
                    <CancelBtn onClick={() => setEditingCommentId(null)}>Cancel</CancelBtn>
                  </EditActions>
                </>
              ) : (
                <CommentText>{comment.content}</CommentText>
              )}
              <CommentActions>
                <EngagementBtn
                  $active={isLikedValue(comment.isLiked)}
                  onClick={() => handleCommentLike(comment.id)}
                  disabled={!!commentLikePending[comment.id]}
                  style={{ fontSize: '0.8rem' }}
                >
                  <FilledHeart $active={isLikedValue(comment.isLiked)} />
                  <span>{comment.likes || 0}</span>
                </EngagementBtn>
                {String(currentUserId) === String(comment.user_id) && (
                  <>
                    <CommentActionBtn onClick={() => handleEditComment(comment)}>
                      <FiEdit2 /> Edit
                    </CommentActionBtn>
                    <CommentActionBtn $danger onClick={() => handleDeleteComment(comment.id)}>
                      <FiTrash2 /> Delete
                    </CommentActionBtn>
                  </>
                )}
              </CommentActions>
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
