import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { getAuthTokenOrLogout, handleAuthFailure } from '../utils/auth';
import RichTextEditor from './RichTextEditor';

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
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h2`
  font-size: 1.8rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
`;

const PostInput = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
`;

const FileInputLabel = styled.label`
  display: block;
  padding: 0.8rem 1.5rem;
  background-color: #f0f2f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  text-align: center;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #e0e2e5;
  }
`;

const FilePreview = styled.div`
  margin-top: 1rem;
  text-align: center;
  img, video {
    max-width: 100%;
    max-height: 200px;
    border-radius: 8px;
    object-fit: contain;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
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

const CreatePostModal = ({ onClose, onPostCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);
    };
  }, [mediaPreviewUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);
      setMediaPreviewUrl(URL.createObjectURL(file));
    } else {
      setMediaFile(null);
      if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);
      setMediaPreviewUrl(null);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    const token = getAuthTokenOrLogout(navigate);
    if (!token) {
      setError('Not authenticated. Please log in.');
      setLoading(false);
      return;
    }

    let post_type = 'text';
    if (mediaFile) {
      if (mediaFile.type.startsWith('image/')) post_type = 'image';
      else if (mediaFile.type.startsWith('video/')) post_type = 'video';
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('post_type', post_type);
    if (mediaFile) formData.append('media', mediaFile);

    try {
      console.log('CreatePostModal: Submitting post...');
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      console.log('CreatePostModal: Raw response from server:', response);
      let data = {};
      const contentType = response.headers.get('content-type');

      if (!response.ok) {
        if (handleAuthFailure(response.status, navigate)) return;
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
          throw new Error(data.error || data.message || 'Failed to create post');
        } else {
          const errorText = await response.text();
          throw new Error(`Server error: ${errorText || response.statusText}`);
        }
      }

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log('CreatePostModal: Parsed JSON data:', data);
      } else {
        const errorText = await response.text();
        throw new Error(`Server responded with non-JSON or empty body: ${errorText || response.statusText}`);
      }

      console.log('CreatePostModal: Post created successfully. Data:', data);
      onPostCreated();
      setMediaFile(null);
      if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);
      setMediaPreviewUrl(null);
      onClose();
    } catch (err) {
      console.error('CreatePostModal: Caught error during submission:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalTitle>Create New Entry</ModalTitle>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <PostInput
          type="text"
          placeholder="Entry Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <RichTextEditor onChange={(html) => setContent(html)} />

        <input
          type="file"
          id="media-upload"
          accept="image/*,video/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <FileInputLabel htmlFor="media-upload">
          {mediaFile ? mediaFile.name : 'Choose Image or Video'}
        </FileInputLabel>

        {mediaPreviewUrl && (
          <FilePreview>
            {mediaFile.type.startsWith('image/') ? (
              <img src={mediaPreviewUrl} alt="Media Preview" />
            ) : (
              <video src={mediaPreviewUrl} controls />
            )}
          </FilePreview>
        )}

        <ButtonGroup>
          <CancelButton onClick={onClose} disabled={loading}>Cancel</CancelButton>
          <SubmitButton onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Entry'}
          </SubmitButton>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CreatePostModal;
