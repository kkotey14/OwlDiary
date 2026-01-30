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
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.8rem;
  color: var(--text-primary);
  margin-bottom: 1rem;
`;

const PostTextArea = styled.textarea`
  width: 100%;
  height: 150px;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
`;

const PostInput = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
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
    // Cleanup for preview URL
    return () => {
      if (mediaPreviewUrl) {
        URL.revokeObjectURL(mediaPreviewUrl);
      }
    };
  }, [mediaPreviewUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      if (mediaPreviewUrl) {
        URL.revokeObjectURL(mediaPreviewUrl); // Clean up previous preview
      }
      setMediaPreviewUrl(URL.createObjectURL(file));
    } else {
      setMediaFile(null);
      if (mediaPreviewUrl) {
        URL.revokeObjectURL(mediaPreviewUrl);
      }
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
    
    // Determine post_type based on media file
    let post_type = 'text';
    if (mediaFile) {
      if (mediaFile.type.startsWith('image/')) {
        post_type = 'image';
      } else if (mediaFile.type.startsWith('video/')) {
        post_type = 'video';
      }
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('post_type', post_type);
    if (mediaFile) {
      formData.append('media', mediaFile); // 'media' is the field name Multer expects
    }

              try {

                console.log('CreatePostModal: Submitting post...');

                const response = await fetch('/api/posts', {

                  method: 'POST',

                  headers: {

                    'Authorization': `Bearer ${token}`

                  },

                  body: formData,

                });

          

                console.log('CreatePostModal: Raw response from server:', response);

                let data = {};

                const contentType = response.headers.get('content-type');

                console.log('CreatePostModal: Response Content-Type:', contentType);

          

                if (!response.ok) {
                  if (handleAuthFailure(response.status, navigate)) {
                    return;
                  }
                  // Parse error response
                  if (contentType && contentType.includes('application/json')) {
                    data = await response.json();
                    console.error('CreatePostModal: Response not OK. Error details:', data.error || data.message);
                    throw new Error(data.error || data.message || 'Failed to create post');
                  } else {
                    const errorText = await response.text();
                    console.error('CreatePostModal: Server responded with non-JSON error:', errorText);
                    throw new Error(`Server error: ${errorText || response.statusText}`);
                  }
                }

                // Success - parse the response
                if (contentType && contentType.includes('application/json')) {
                  data = await response.json();
                  console.log('CreatePostModal: Parsed JSON data:', data);
                } else {
                  const errorText = await response.text();
                  console.error('CreatePostModal: Server responded with non-JSON or empty body:', errorText);
                  throw new Error(`Server responded with non-JSON or empty body: ${errorText || response.statusText}`);
                }

          

                console.log('CreatePostModal: Post created successfully. Data:', data);

                onPostCreated();

                setMediaFile(null);

                if (mediaPreviewUrl) {

                  URL.revokeObjectURL(mediaPreviewUrl);

                }

                setMediaPreviewUrl(null);

                onClose();

              } catch (err) {

                console.error('CreatePostModal: Caught error during submission:', err);

                setError(err.message);

              } finally {

                setLoading(false);

              }  };

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
        <PostTextArea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <input
          type="file"
          id="media-upload"
          accept="image/*,video/*"
          onChange={handleFileChange}
          style={{ display: 'none' }} // Hide the default input
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
