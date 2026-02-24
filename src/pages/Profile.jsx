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

const DragItem = styled.div`
  cursor: grab;
`;

const ProfileShell = styled.div`
  min-height: 100vh;
  width: calc(100% + 5rem);
  margin: -2.5rem;
  padding: 2.5rem;
  background: var(--profile-bg, #f7f9fc);
  color: var(--profile-text, #2c3e50);
  font-family: var(--profile-font, 'Inter', sans-serif);
  font-size: var(--profile-font-size, 1rem);
  box-sizing: border-box;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin: 1rem 0 2rem;
`;

const ActionButton = styled.button`
  border: none;
  background: var(--profile-accent, var(--primary-teal));
  color: white;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;

  &:hover {
    background: var(--profile-accent-dark, #12737b);
  }
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
  background: var(--profile-card, white);
  border-radius: 16px;
  padding: 1.5rem;
  width: 90%;
  max-width: 520px;
  max-height: calc(100vh - 6rem);
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FieldLabel = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--profile-muted, #6b7a90);
`;

const Field = styled.input`
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  background: var(--profile-card, #ffffff);
  color: var(--profile-text, #2c3e50);
`;

const Select = styled.select`
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  background: var(--profile-card, #ffffff);
  color: var(--profile-text, #2c3e50);
`;

const NumberField = styled.input`
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  background: var(--profile-card, #ffffff);
  color: var(--profile-text, #2c3e50);
`;
const TextArea = styled.textarea`
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  min-height: 120px;
  resize: vertical;
  background: var(--profile-card, #ffffff);
  color: var(--profile-text, #2c3e50);
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
  color: var(--profile-text, #2c3e50);
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [appearanceTheme, setAppearanceTheme] = useState('classic');
  const [fontFamily, setFontFamily] = useState('inter');
  const [accentColor, setAccentColor] = useState('#542133');
  const [fontSize, setFontSize] = useState('16px');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [profileError, setProfileError] = useState('');
  const fileInputRef = useRef(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [postError, setPostError] = useState('');
  const dragIndexRef = useRef(null);

  const themeOptions = {
    classic: {
      label: 'Classic',
      bg: 'linear-gradient(135deg, #f5f7fb 0%, #e3ecf7 100%)',
      card: '#ffffff',
      text: '#1f2937',
      muted: '#6b7280',
      accent: '#2563eb',
      accentDark: '#1d4ed8',
    },
    dusk: {
      label: 'Dusk',
      bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      card: '#111827',
      text: '#e5e7eb',
      muted: '#9ca3af',
      accent: '#38bdf8',
      accentDark: '#0ea5e9',
    },
    mint: {
      label: 'Mint',
      bg: 'linear-gradient(135deg, #ecfeff 0%, #dbeafe 100%)',
      card: '#ffffff',
      text: '#0f172a',
      muted: '#64748b',
      accent: '#14b8a6',
      accentDark: '#0d9488',
    },
    sunset: {
      label: 'Sunset',
      bg: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
      card: '#ffffff',
      text: '#3f1d2e',
      muted: '#8b5d74',
      accent: '#f97316',
      accentDark: '#ea580c',
    },
    rose: {
      label: 'Rose',
      bg: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
      card: '#ffffff',
      text: '#4c1d95',
      muted: '#7c3aed',
      accent: '#ec4899',
      accentDark: '#db2777',
    },
    ocean: {
      label: 'Ocean',
      bg: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
      card: '#ffffff',
      text: '#0f172a',
      muted: '#475569',
      accent: '#0284c7',
      accentDark: '#0369a1',
    },
    lagoon: {
      label: 'Lagoon',
      bg: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)',
      card: '#ffffff',
      text: '#0f172a',
      muted: '#64748b',
      accent: '#06b6d4',
      accentDark: '#0891b2',
    },
    forest: {
      label: 'Forest',
      bg: 'linear-gradient(135deg, #ecfccb 0%, #d9f99d 100%)',
      card: '#ffffff',
      text: '#14532d',
      muted: '#3f6212',
      accent: '#16a34a',
      accentDark: '#15803d',
    },
    sage: {
      label: 'Sage',
      bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      card: '#ffffff',
      text: '#1f2937',
      muted: '#6b7280',
      accent: '#22c55e',
      accentDark: '#16a34a',
    },
    lavender: {
      label: 'Lavender',
      bg: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
      card: '#ffffff',
      text: '#312e81',
      muted: '#6d28d9',
      accent: '#8b5cf6',
      accentDark: '#7c3aed',
    },
    midnight: {
      label: 'Midnight',
      bg: 'linear-gradient(135deg, #0b1020 0%, #1f2937 100%)',
      card: '#111827',
      text: '#e5e7eb',
      muted: '#9ca3af',
      accent: '#6366f1',
      accentDark: '#4f46e5',
    },
    amber: {
      label: 'Amber',
      bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
      card: '#ffffff',
      text: '#78350f',
      muted: '#92400e',
      accent: '#f59e0b',
      accentDark: '#d97706',
    },
    cocoa: {
      label: 'Cocoa',
      bg: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
      card: '#ffffff',
      text: '#3f1d2e',
      muted: '#7c2d12',
      accent: '#a855f7',
      accentDark: '#9333ea',
    },
    graphite: {
      label: 'Graphite',
      bg: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      card: '#ffffff',
      text: '#0f172a',
      muted: '#475569',
      accent: '#334155',
      accentDark: '#1f2937',
    },
    sand: {
      label: 'Sand',
      bg: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
      card: '#ffffff',
      text: '#3f2d0f',
      muted: '#7c5a2b',
      accent: '#ca8a04',
      accentDark: '#a16207',
    },
    blush: {
      label: 'Blush',
      bg: 'linear-gradient(135deg, #fff1f2 0%, #fde68a 100%)',
      card: '#ffffff',
      text: '#3f1d2e',
      muted: '#9f1239',
      accent: '#f43f5e',
      accentDark: '#e11d48',
    },
    ice: {
      label: 'Ice',
      bg: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      card: '#ffffff',
      text: '#0f172a',
      muted: '#64748b',
      accent: '#38bdf8',
      accentDark: '#0ea5e9',
    },
    plum: {
      label: 'Plum',
      bg: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
      card: '#ffffff',
      text: '#3b0764',
      muted: '#6b21a8',
      accent: '#c026d3',
      accentDark: '#a21caf',
    },
    berry: {
      label: 'Berry',
      bg: 'linear-gradient(135deg, #fff1f2 0%, #fbcfe8 100%)',
      card: '#ffffff',
      text: '#831843',
      muted: '#9d174d',
      accent: '#db2777',
      accentDark: '#be185d',
    },
    citrus: {
      label: 'Citrus',
      bg: 'linear-gradient(135deg, #ecfeff 0%, #fef9c3 100%)',
      card: '#ffffff',
      text: '#0f172a',
      muted: '#64748b',
      accent: '#84cc16',
      accentDark: '#65a30d',
    },
    steel: {
      label: 'Steel',
      bg: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5f5 100%)',
      card: '#ffffff',
      text: '#0f172a',
      muted: '#475569',
      accent: '#475569',
      accentDark: '#334155',
    },
    peach: {
      label: 'Peach',
      bg: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
      card: '#ffffff',
      text: '#431407',
      muted: '#7c2d12',
      accent: '#fb923c',
      accentDark: '#f97316',
    },
    coral: {
      label: 'Coral',
      bg: 'linear-gradient(135deg, #fff1f2 0%, #fecdd3 100%)',
      card: '#ffffff',
      text: '#4c0519',
      muted: '#9f1239',
      accent: '#fb7185',
      accentDark: '#f43f5e',
    },
    emerald: {
      label: 'Emerald',
      bg: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
      card: '#ffffff',
      text: '#064e3b',
      muted: '#065f46',
      accent: '#10b981',
      accentDark: '#059669',
    },
    aurora: {
      label: 'Aurora',
      bg: 'linear-gradient(135deg, #ecfeff 0%, #ede9fe 100%)',
      card: '#ffffff',
      text: '#1f2937',
      muted: '#64748b',
      accent: '#22d3ee',
      accentDark: '#06b6d4',
    },
    sunrise: {
      label: 'Sunrise',
      bg: 'linear-gradient(135deg, #fff7ed 0%, #fde68a 100%)',
      card: '#ffffff',
      text: '#3f2d0f',
      muted: '#7c5a2b',
      accent: '#f59e0b',
      accentDark: '#d97706',
    },
    slate: {
      label: 'Slate',
      bg: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
      card: '#ffffff',
      text: '#0f172a',
      muted: '#475569',
      accent: '#64748b',
      accentDark: '#475569',
    },
    orchid: {
      label: 'Orchid',
      bg: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)',
      card: '#ffffff',
      text: '#4a044e',
      muted: '#6b21a8',
      accent: '#d946ef',
      accentDark: '#c026d3',
    },
    glacier: {
      label: 'Glacier',
      bg: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
      card: '#ffffff',
      text: '#0f172a',
      muted: '#64748b',
      accent: '#38bdf8',
      accentDark: '#0ea5e9',
    },
  };

  const fontOptions = {
    inter: { label: 'Inter', stack: "'Inter', sans-serif" },
    playfair: { label: 'Playfair Display', stack: "'Playfair Display', serif" },
    dmSans: { label: 'DM Sans', stack: "'DM Sans', sans-serif" },
    poppins: { label: 'Poppins', stack: "'Poppins', sans-serif" },
    montserrat: { label: 'Montserrat', stack: "'Montserrat', sans-serif" },
    raleway: { label: 'Raleway', stack: "'Raleway', sans-serif" },
    nunito: { label: 'Nunito', stack: "'Nunito', sans-serif" },
    karla: { label: 'Karla', stack: "'Karla', sans-serif" },
    firaSans: { label: 'Fira Sans', stack: "'Fira Sans', sans-serif" },
    sourceSans: { label: 'Source Sans 3', stack: "'Source Sans 3', sans-serif" },
    sourceSerif: { label: 'Source Serif 4', stack: "'Source Serif 4', serif" },
    spaceGrotesk: { label: 'Space Grotesk', stack: "'Space Grotesk', sans-serif" },
    lora: { label: 'Lora', stack: "'Lora', serif" },
    merriweather: { label: 'Merriweather', stack: "'Merriweather', serif" },
    workSans: { label: 'Work Sans', stack: "'Work Sans', sans-serif" },
    manrope: { label: 'Manrope', stack: "'Manrope', sans-serif" },
    rubik: { label: 'Rubik', stack: "'Rubik', sans-serif" },
    ibmPlex: { label: 'IBM Plex Sans', stack: "'IBM Plex Sans', sans-serif" },
    libreBaskerville: { label: 'Libre Baskerville', stack: "'Libre Baskerville', serif" },
    crimsonText: { label: 'Crimson Text', stack: "'Crimson Text', serif" },
    georgia: { label: 'Georgia', stack: "Georgia, serif" },
    courier: { label: 'Courier', stack: "'Courier New', monospace" },
  };

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
        setAppearanceTheme(studentData.appearance_theme || 'classic');
        setFontFamily(studentData.font_family || 'inter');
        setAccentColor(studentData.accent_color || '#542133');
        setFontSize(studentData.font_size || '16px');
        const avatar = studentData.avatar_url || '';
        setAvatarPreview(resolveMediaUrl(avatar));

        if (token) {
          try {
            const decoded = jwtDecode(token);
            setIsOwner(String(decoded.id) === String(studentId));
            setIsAdmin(decoded.role === 'admin');
          } catch (err) {
            setIsOwner(false);
            setIsAdmin(false);
          }
        } else {
          setIsOwner(false);
          setIsAdmin(false);
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
    setAppearanceTheme(student.appearance_theme || 'classic');
    setFontFamily(student.font_family || 'inter');
    setAccentColor(student.accent_color || '#542133');
    setFontSize(student.font_size || '16px');
  }, [student]);

  useEffect(() => {
    if (!editingProfile || !student) return;
    setProfileName(student.name || '');
    setProfileBio(student.about_me || '');
    setAppearanceTheme(student.appearance_theme || 'classic');
    setFontFamily(student.font_family || 'inter');
    setAccentColor(student.accent_color || '#542133');
    setFontSize(student.font_size || '16px');
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
      formData.append('appearance_theme', appearanceTheme);
      formData.append('font_family', fontFamily);
      formData.append('accent_color', accentColor);
      formData.append('font_size', fontSize);
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
      setAppearanceTheme(updated.appearance_theme || 'classic');
      setFontFamily(updated.font_family || 'inter');
      setAccentColor(updated.accent_color || '#542133');
      setFontSize(updated.font_size || '16px');
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

  const handleTogglePostVisibility = async (post) => {
    const token = getAuthTokenOrLogout(navigate);
    if (!token) return;

    try {
      const response = await fetch(`/api/posts/${post.id}/visibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_hidden: !(post.is_hidden === 1 || post.is_hidden === true) })
      });

      if (!response.ok) {
        if (handleAuthFailure(response.status, navigate)) {
          return;
        }
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update visibility');
      }

      const updatedPost = await response.json();
      setPosts((prev) =>
        prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
      );
    } catch (err) {
      setPostError(err.message);
    }
  };

  const handleDragStart = (index) => {
    dragIndexRef.current = index;
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = async (index) => {
    const fromIndex = dragIndexRef.current;
    if (fromIndex === null || fromIndex === index) return;

    const nextPosts = [...posts];
    const [moved] = nextPosts.splice(fromIndex, 1);
    nextPosts.splice(index, 0, moved);
    setPosts(nextPosts);
    dragIndexRef.current = null;

    const token = getAuthTokenOrLogout(navigate);
    if (!token) return;

    try {
      const response = await fetch('/api/posts/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ postIds: nextPosts.map((p) => p.id) })
      });

      if (!response.ok) {
        if (handleAuthFailure(response.status, navigate)) {
          return;
        }
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to reorder posts');
      }
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

  const activeTheme = themeOptions[appearanceTheme] || themeOptions.classic;
  const activeFont = fontOptions[fontFamily]?.stack || fontOptions.inter.stack;
  const accentHex = accentColor && accentColor.match(/^#([0-9a-fA-F]{6})$/) ? accentColor : activeTheme.accent;
  const modeTheme = { ...activeTheme, accent: accentHex, accentDark: accentHex };

  return (
    <ProfileShell
      style={{
        '--profile-bg': modeTheme.bg,
        '--profile-card': modeTheme.card,
        '--profile-text': modeTheme.text,
        '--profile-muted': modeTheme.muted,
        '--profile-accent': modeTheme.accent,
        '--profile-accent-dark': modeTheme.accentDark,
        '--profile-font': activeFont,
        '--profile-font-size': fontSize,
      }}
    >
      <ProfileHeader
        student={student}
        showEditButton={isOwner}
        onEditProfile={() => setEditingProfile(true)}
      />
      <BlogFeed>
        {posts.map((post, index) => (
          <DragItem
            key={post.id}
            draggable={isOwner}
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
          >
            <PostCard
              post={post}
              canEdit={isOwner}
              canHide={isOwner || isAdmin}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
              onToggleVisibility={handleTogglePostVisibility}
            />
          </DragItem>
        ))}
      </BlogFeed>

      {editingProfile && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>Edit Profile</ModalTitle>
            {profileError && <ErrorText>{profileError}</ErrorText>}
            <FieldLabel htmlFor="profile-name">Display name</FieldLabel>
            <Field
              id="profile-name"
              type="text"
              placeholder="Your name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
            />
            <FieldLabel htmlFor="profile-bio">About you</FieldLabel>
            <TextArea
              id="profile-bio"
              placeholder="Tell people about yourself"
              value={profileBio}
              onChange={(e) => setProfileBio(e.target.value)}
            />
            <FieldLabel htmlFor="profile-theme">Profile theme</FieldLabel>
            <Select
              id="profile-theme"
              value={appearanceTheme}
              onChange={(e) => setAppearanceTheme(e.target.value)}
            >
              {Object.entries(themeOptions).map(([key, option]) => (
                <option key={key} value={key}>
                  {option.label}
                </option>
              ))}
            </Select>
            <FieldLabel htmlFor="profile-font">Font</FieldLabel>
            <Select
              id="profile-font"
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
            >
              {Object.entries(fontOptions).map(([key, option]) => (
                <option key={key} value={key}>
                  {option.label}
                </option>
              ))}
            </Select>
            <FieldLabel htmlFor="profile-font-size">Font size (px)</FieldLabel>
            <NumberField
              id="profile-font-size"
              type="number"
              min="12"
              max="30"
              value={parseInt(fontSize, 10)}
              onChange={(e) => {
                const next = Math.max(12, Math.min(30, Number(e.target.value || 0)));
                setFontSize(`${next}px`);
              }}
            />
            <FieldLabel htmlFor="profile-accent">Accent color</FieldLabel>
            <Field
              id="profile-accent"
              type="text"
              placeholder="#542133"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
            />
            <FieldLabel htmlFor="profile-accent-picker">Pick accent</FieldLabel>
            <Field
              id="profile-accent-picker"
              type="color"
              value={accentHex}
              onChange={(e) => setAccentColor(e.target.value)}
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
    </ProfileShell>
  );
};

export default Profile;
