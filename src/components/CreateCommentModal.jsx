import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { getAuthTokenOrLogout, handleAuthFailure } from '../utils/auth';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const CommentTextArea = styled.textarea`
  width: 100%;
  height: 100px;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const SubmitButton = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: var(--primary-teal);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #16a085;
  }
`;

const CancelButton = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: #ccc;
  color: #333;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #bbb;
  }
`;

const ErrorMessage = styled.p`
  color: #ff6b6b;
  font-size: 0.9rem;
  text-align: center;
`;

const CommentsSection = styled.div`
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
`;

const CommentItem = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: white;
  border-radius: 8px;
`;

const CommentAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
`;

const CommentContent = styled.div`
  flex: 1;
`;

const CommentAuthor = styled.div`
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
`;

const CommentText = styled.p`
  color: #555;
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
`;

const NoComments = styled.p`
  text-align: center;
  color: #999;
  font-size: 0.9rem;
  padding: 1rem;
`;

const CreateCommentModal = ({ postId, onClose, onCommentPosted }) => {
  const [commentContent, setCommentContent] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const navigate = useNavigate();

  const fetchComments = async () => {
    setLoadingComments(true);
    const token = getAuthTokenOrLogout(navigate);
    if (!token) {
      setLoadingComments(false);
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (handleAuthFailure(response.status, navigate)) {
          return;
        }
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch comments');
      }

      const contentType = response.headers.get('content-type');
      const data = contentType && contentType.includes('application/json')
        ? await response.json()
        : [];
      setComments(data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    const token = getAuthTokenOrLogout(navigate);
    if (!token) {
      setError('Not authenticated. Please log in.');
      setLoading(false);
      return;
    }

    if (!commentContent.trim()) {
      setError('Comment cannot be empty.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: commentContent }),
      });

      const contentType = response.headers.get('content-type');
      const data = contentType && contentType.includes('application/json')
        ? await response.json()
        : {};

      if (!response.ok) {
        if (handleAuthFailure(response.status, navigate)) {
          return;
        }
        const errorText = data.message || response.statusText;
        throw new Error(errorText || 'Failed to post comment');
      }

      setCommentContent(''); // Clear input
      setComments([...comments, data.comment]); // Add new comment to the list
      onCommentPosted(data.comment); // Notify parent with the new comment
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalTitle>Comments</ModalTitle>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        {/* Display existing comments */}
        <CommentsSection>
          {loadingComments ? (
            <NoComments>Loading comments...</NoComments>
          ) : comments.length === 0 ? (
            <NoComments>No comments yet. Be the first to comment!</NoComments>
          ) : (
            comments.map((comment) => (
              <CommentItem key={comment.id}>
                <CommentAvatar src={comment.user_avatar} alt={comment.user_name} />
                <CommentContent>
                  <CommentAuthor>{comment.user_name}</CommentAuthor>
                  <CommentText>{comment.content}</CommentText>
                </CommentContent>
              </CommentItem>
            ))
          )}
        </CommentsSection>

        <CommentTextArea
          placeholder="Write your comment here..."
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          rows="4"
        />
        <ButtonGroup>
          <CancelButton onClick={onClose} disabled={loading}>Close</CancelButton>
          <SubmitButton onClick={handleSubmit} disabled={loading}>
            {loading ? 'Posting...' : 'Post Comment'}
          </SubmitButton>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CreateCommentModal;
