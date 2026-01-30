import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import ProfileHeader from '../components/ProfileHeader';
import PostCard from '../components/PostCard';
import { jwtDecode } from 'jwt-decode';
import { getAuthTokenOrLogout, handleAuthFailure } from '../utils/auth';
import { resolveMediaUrl } from '../utils/media';

const BlogFeed = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin: 1rem 0 2rem;
`;

const ActionButton = styled.button`
  border: none;
  background: var(--primary-teal);
  color: white;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
`;

const SecondaryButton = styled.button`
  border: 1px solid #dfe6ee;
  background: white;
  color: #2c3e50;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
`;

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
  padding: 2rem;
  width: 90%;
  max-width: 520px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Field = styled.input`
  border: 1px solid #dfe6ee;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
`;

const TextArea = styled.textarea`
  border: 1px solid #dfe6ee;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  min-height: 120px;
  resize: vertical;
`;

const FileInput = styled.input`
  display: none;
`;

const FilePicker = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px dashed #c9d6e8;
  background: #f7f9fc;
  color: #2c3e50;
  cursor: pointer;
  font-size: 0.95rem;
  transition: border-color 0.2s ease, background 0.2s ease;

  &:hover {
    border-color: var(--primary-teal);
    background: #eef6f6;
  }
`;

const FileName = styled.span`
  color: #6b7a90;
  font-size: 0.85rem;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PreviewRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const AvatarPreview = styled.img`
  width: 84px;
  height: 84px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e6eef8;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #2c3e50;
`;

const ErrorText = styled.p`
  color: #ff6b6b;
  margin: 0;
`;

const Profile = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [profileError, setProfileError] = useState('');
  const fileInputRef = useRef(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [postError, setPostError] = useState('');

  const addCacheBust = (url) => {
    if (!url || url.startsWith('blob:')) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${Date.now()}`;
  };

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getAuthTokenOrLogout(navigate);
        const [studentResponse, postsResponse] = await Promise.all([
          fetch(`/api/students/${studentId}`),
          fetch(`/api/students/${studentId}/posts`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
          }),
        ]);

        if (!studentResponse.ok || !postsResponse.ok) {
          throw new Error('Network response was not ok');
        }

        const studentData = await studentResponse.json();
        const postsData = await postsResponse.json();

        setStudent(studentData);
        setPosts(postsData);
        setProfileName(studentData.name || '');
        setProfileBio(studentData.about_me || '');
        const avatar = studentData.avatar_url || '';
        setAvatarPreview(resolveMediaUrl(avatar));

        if (token) {
          try {
            const decoded = jwtDecode(token);
            setIsOwner(String(decoded.id) === String(studentId));
          } catch (err) {
            setIsOwner(false);
          }
        } else {
          setIsOwner(false);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  useEffect(() => {
    if (!student) return;
    setProfileName(student.name || '');
    setProfileBio(student.about_me || '');
  }, [student]);

  useEffect(() => {
    if (!editingProfile || !student) return;
    setProfileName(student.name || '');
    setProfileBio(student.about_me || '');
    setAvatarFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    const avatar = student.avatar_url || '';
    setAvatarPreview(addCacheBust(resolveMediaUrl(avatar)));
  }, [editingProfile, student]);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>Error loading profile: {error}</p>;
  if (!student) return <p>Student not found.</p>;

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };

  const handleSaveProfile = async () => {
    setProfileError('');
    const token = getAuthTokenOrLogout(navigate);
    if (!token) return;

    try {
      const formData = new FormData();
      formData.append('name', profileName);
      formData.append('about_me', profileBio);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        if (handleAuthFailure(response.status, navigate)) {
          return;
        }
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update profile');
      }

      const updated = await response.json();
      setStudent(updated);
      setAvatarFile(null);
      setAvatarPreview(addCacheBust(resolveMediaUrl(updated.avatar_url)));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setProfileName(updated.name || '');
      setProfileBio(updated.about_me || '');
      setPosts((prev) =>
        prev.map((post) => ({
          ...post,
          student_name: updated.name || post.student_name,
          student_avatar: updated.avatar_url || post.student_avatar,
        }))
      );
      setEditingProfile(false);
    } catch (err) {
      setProfileError(err.message);
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditTitle(post.title || '');
    setEditContent(post.content || '');
    setPostError('');
  };

  const handleDeletePost = async (post) => {
    if (!window.confirm('Delete this post? This cannot be undone.')) {
      return;
    }
    const token = getAuthTokenOrLogout(navigate);
    if (!token) return;

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (handleAuthFailure(response.status, navigate)) {
          return;
        }
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to delete post');
      }

      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } catch (err) {
      setPostError(err.message);
    }
  };

  const handleSavePost = async () => {
    if (!editingPost) return;
    const token = getAuthTokenOrLogout(navigate);
    if (!token) return;

    try {
      const response = await fetch(`/api/posts/${editingPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: editTitle, content: editContent })
      });

      if (!response.ok) {
        if (handleAuthFailure(response.status, navigate)) {
          return;
        }
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update post');
      }

      const updatedPost = await response.json();
      setPosts((prev) => prev.map((post) => (post.id === updatedPost.id ? updatedPost : post)));
      setEditingPost(null);
    } catch (err) {
      setPostError(err.message);
    }
  };

  return (
    <div>
      <ProfileHeader
        student={student}
        showEditButton={isOwner}
        onEditProfile={() => setEditingProfile(true)}
      />
      <BlogFeed>
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            canEdit={isOwner}
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
          />
        ))}
      </BlogFeed>

      {editingProfile && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>Edit Profile</ModalTitle>
            {profileError && <ErrorText>{profileError}</ErrorText>}
            <Field
              type="text"
              placeholder="Your name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
            />
            <TextArea
              placeholder="Tell people about yourself"
              value={profileBio}
              onChange={(e) => setProfileBio(e.target.value)}
            />
            <PreviewRow>
              {avatarPreview && <AvatarPreview src={avatarPreview} alt="Avatar preview" />}
              <div>
                <FileInput
                  ref={fileInputRef}
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
                <FilePicker htmlFor="avatar-upload">
                  <span>Choose a new photo</span>
                  <FileName>{avatarFile ? avatarFile.name : 'No file selected'}</FileName>
                </FilePicker>
              </div>
            </PreviewRow>
            <ActionRow>
              <SecondaryButton onClick={() => setEditingProfile(false)}>Cancel</SecondaryButton>
              <ActionButton onClick={handleSaveProfile}>Save Profile</ActionButton>
            </ActionRow>
          </ModalContent>
        </ModalOverlay>
      )}

      {editingPost && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>Edit Post</ModalTitle>
            {postError && <ErrorText>{postError}</ErrorText>}
            <Field
              type="text"
              placeholder="Post title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <TextArea
              placeholder="Post content"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
            <ActionRow>
              <SecondaryButton onClick={() => setEditingPost(null)}>Cancel</SecondaryButton>
              <ActionButton onClick={handleSavePost}>Save Post</ActionButton>
            </ActionRow>
          </ModalContent>
        </ModalOverlay>
      )}
    </div>
  );
};

export default Profile;
