import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { getAuthTokenOrLogout, handleAuthFailure } from '../utils/auth';
import RichTextEditor from './RichTextEditor';

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  width: 90%;
  max-width: 620px;
  max-height: calc(100vh - 6rem);
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
`;

const TitleInput = styled.input`
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  color: #2c3e50;
  width: 100%;
  box-sizing: border-box;
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const SecondaryButton = styled.button`
  border: 1px solid #dfe6ee;
  background: white;
  color: #2c3e50;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;

  &:hover {
    background: #f0f2f5;
  }
`;

const ActionButton = styled.button`
  border: none;
  background: var(--primary-teal);
  color: white;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;

  &:hover {
    background: #12737b;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.p`
  color: #ff6b6b;
  margin: 0;
  font-size: 0.9rem;
`;


const EditPostModal = ({ post, onClose, onPostUpdated }) => {
  const [editTitle, setEditTitle] = useState(post.title || '');
  const [editContent, setEditContent] = useState(post.content || '');
  const [postError, setPostError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSavePost = async () => {
    setPostError('');
    setLoading(true);

    const token = getAuthTokenOrLogout(navigate);
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });

      if (!response.ok) {
        if (handleAuthFailure(response.status, navigate)) return;
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update post');
      }

      const updatedPost = await response.json();
      onPostUpdated(updatedPost);
      onClose();
    } catch (err) {
      setPostError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalTitle>Edit Post</ModalTitle>
        {postError && <ErrorText>{postError}</ErrorText>}
        <TitleInput
          type="text"
          placeholder="Post title"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
        />
        <RichTextEditor
          initialContent={editContent}
          onChange={(html) => setEditContent(html)}
        />
        <ActionRow>
          <SecondaryButton onClick={onClose} disabled={loading}>Cancel</SecondaryButton>
          <ActionButton onClick={handleSavePost} disabled={loading}>
            {loading ? 'Saving...' : 'Save Post'}
          </ActionButton>
        </ActionRow>
      </ModalContent>
    </ModalOverlay>
  );
};


export default EditPostModal;
