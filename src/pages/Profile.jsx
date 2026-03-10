import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import styled from 'styled-components';
import ProfileHeader from '../components/ProfileHeader';
import PostCard from '../components/PostCard';
import { jwtDecode } from 'jwt-decode';
import { getAuthTokenOrLogout, handleAuthFailure } from '../utils/auth';
import { resolveMediaUrl } from '../utils/media';
import EditPostModal from '../components/EditPostModal';

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

const CropControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  width: 100%;
`;

const CropRow = styled.div`
  display: grid;
  grid-template-columns: 90px 1fr auto;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.82rem;
  color: var(--profile-muted, #6b7a90);
`;

const CropRange = styled.input`
  width: 100%;
`;

const CropFrameAvatar = styled.div`
  width: 110px;
  height: 110px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #e6eef8;
  background: #f5f7fb;
  flex-shrink: 0;
  touch-action: none;
`;

const CropFrameBackground = styled.div`
  width: 100%;
  max-width: 100%;
  height: 180px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e6eef8;
  background: #f5f7fb;
  touch-action: none;
`;

const CropImage = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: center center;
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none;
`;

const CropEditorCard = styled.div`
  background: var(--profile-card, white);
  border-radius: 16px;
  padding: 1.2rem;
  width: 92%;
  max-width: 560px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
`;

const CropEditorFrame = styled.div`
  width: 100%;
  height: ${(props) => (props.$avatar ? '280px' : 'auto')};
  aspect-ratio: ${(props) => (props.$avatar ? '1 / 1' : '16 / 5')};
  border-radius: ${(props) => (props.$avatar ? '50%' : '12px')};
  overflow: hidden;
  border: 2px solid #e6eef8;
  background: #f5f7fb;
  touch-action: none;
  cursor: ${(props) => (props.$dragging ? 'grabbing' : 'grab')};
  align-self: center;
  max-width: ${(props) => (props.$avatar ? '280px' : '520px')};
  position: relative;
`;

const CropHint = styled.p`
  margin: 0;
  font-size: 0.82rem;
  color: var(--profile-muted, #6b7a90);
`;

const AvatarPreview = styled.img`
  width: 84px;
  height: 84px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e6eef8;
`;

const BackgroundPreview = styled.img`
  width: 100%;
  max-height: 180px;
  border-radius: 12px;
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
  const outletContext = useOutletContext();
  const postsRefreshTrigger = outletContext ? outletContext.postsRefreshTrigger : 0;
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
  const [profileBackgroundFile, setProfileBackgroundFile] = useState(null);
  const [profileBackgroundPreview, setProfileBackgroundPreview] = useState('');
  const [profileError, setProfileError] = useState('');
  const [cropModal, setCropModal] = useState({
    open: false,
    target: null,
    file: null,
    sourceUrl: '',
    imageSize: { width: 1, height: 1 },
    adjust: { zoom: 1, x: 0, y: 0 },
  });
  const [applyingCrop, setApplyingCrop] = useState(false);
  const [isCropDragging, setIsCropDragging] = useState(false);
  const [cropFrameSize, setCropFrameSize] = useState({ width: 0, height: 0 });
  const fileInputRef = useRef(null);
  const backgroundInputRef = useRef(null);
  const cropEditorFrameRef = useRef(null);
  const cropDragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    baseX: 0,
    baseY: 0,
  });
  const [editingPost, setEditingPost] = useState(null);
  const [postError, setPostError] = useState('');
  const dragIndexRef = useRef(null);
  const loadedStudentIdRef = useRef(null);

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

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const getViewportCropMetrics = (adjust, frame, source) => {
    const frameWidth = frame?.width || 1;
    const frameHeight = frame?.height || 1;
    const sourceWidth = source?.width || 1;
    const sourceHeight = source?.height || 1;
    const zoom = clamp(Number(adjust?.zoom) || 1, 1, 3);
    const baseScale = Math.min(frameWidth / sourceWidth, frameHeight / sourceHeight);
    const drawWidth = sourceWidth * baseScale * zoom;
    const drawHeight = sourceHeight * baseScale * zoom;
    const maxPanX = Math.max(0, (drawWidth - frameWidth) / 2);
    const maxPanY = Math.max(0, (drawHeight - frameHeight) / 2);
    const offsetX = (clamp(Number(adjust?.x) || 0, -100, 100) / 100) * maxPanX;
    const offsetY = (clamp(Number(adjust?.y) || 0, -100, 100) / 100) * maxPanY;

    return { drawWidth, drawHeight, offsetX, offsetY };
  };

  const getPointer = (event) => {
    if (event.touches && event.touches[0]) return event.touches[0];
    if (event.changedTouches && event.changedTouches[0]) return event.changedTouches[0];
    return event;
  };

  const startCropDrag = (event) => {
    if (!cropModal.open) return;
    event.preventDefault();
    const point = getPointer(event);
    setIsCropDragging(true);
    cropDragRef.current = {
      active: true,
      startX: point.clientX,
      startY: point.clientY,
      baseX: cropModal.adjust.x,
      baseY: cropModal.adjust.y,
    };
  };

  useEffect(() => {
    const moveDrag = (event) => {
      const state = cropDragRef.current;
      if (!cropModal.open || !state.active) return;
      event.preventDefault();

      const point = getPointer(event);
      const frame = cropEditorFrameRef.current;
      if (!frame) return;

      const dx = point.clientX - state.startX;
      const dy = point.clientY - state.startY;
      const width = frame.clientWidth || 1;
      const height = frame.clientHeight || 1;
      const nextX = clamp(state.baseX + (dx / width) * 100, -100, 100);
      const nextY = clamp(state.baseY + (dy / height) * 100, -100, 100);

      setCropModal((prev) => ({
        ...prev,
        adjust: { ...prev.adjust, x: nextX, y: nextY },
      }));
    };

    const endDrag = () => {
      setIsCropDragging(false);
      cropDragRef.current = { active: false, startX: 0, startY: 0, baseX: 0, baseY: 0 };
    };

    window.addEventListener('pointermove', moveDrag, { passive: false });
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);

    return () => {
      window.removeEventListener('pointermove', moveDrag);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
    };
  }, [cropModal.open]);

  useEffect(() => {
    if (!cropModal.open) return;
    const frame = cropEditorFrameRef.current;
    if (!frame) return;

    const updateFrameSize = () => {
      setCropFrameSize({
        width: frame.clientWidth || 0,
        height: frame.clientHeight || 0,
      });
    };

    updateFrameSize();
    const observer = new ResizeObserver(updateFrameSize);
    observer.observe(frame);
    window.addEventListener('resize', updateFrameSize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateFrameSize);
    };
  }, [cropModal.open, cropModal.target]);

  const createCroppedFile = async (file, adjust, output, outputName) => {
    const objectUrl = URL.createObjectURL(file);
    try {
      const image = await loadImage(objectUrl);
      const canvas = document.createElement('canvas');
      canvas.width = output.width;
      canvas.height = output.height;
      const context = canvas.getContext('2d');
      context.fillStyle = '#f5f7fb';
      context.fillRect(0, 0, output.width, output.height);
      const metrics = getViewportCropMetrics(
        adjust,
        { width: output.width, height: output.height },
        { width: image.width, height: image.height },
      );
      context.drawImage(
        image,
        (output.width - metrics.drawWidth) / 2 + metrics.offsetX,
        (output.height - metrics.drawHeight) / 2 + metrics.offsetY,
        metrics.drawWidth,
        metrics.drawHeight,
      );

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', 0.92),
      );
      if (!blob) return file;

      return new File([blob], outputName, { type: 'image/jpeg' });
    } catch {
      return file;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  };

  const openCropModal = (target, file) => {
    const sourceUrl = URL.createObjectURL(file);
    loadImage(sourceUrl)
      .then((image) => {
        setCropModal((prev) => {
          if (prev.sourceUrl && prev.sourceUrl.startsWith('blob:')) {
            URL.revokeObjectURL(prev.sourceUrl);
          }
          return {
            open: true,
            target,
            file,
            sourceUrl,
            imageSize: { width: image.width, height: image.height },
            adjust: { zoom: 1, x: 0, y: 0 },
          };
        });
      })
      .catch(() => {
        setCropModal((prev) => {
          if (prev.sourceUrl && prev.sourceUrl.startsWith('blob:')) {
            URL.revokeObjectURL(prev.sourceUrl);
          }
          return {
            open: true,
            target,
            file,
            sourceUrl,
            imageSize: { width: 1, height: 1 },
            adjust: { zoom: 1, x: 0, y: 0 },
          };
        });
      });
  };

  const closeCropModal = () => {
    if (cropModal.sourceUrl && cropModal.sourceUrl.startsWith('blob:')) {
      URL.revokeObjectURL(cropModal.sourceUrl);
    }
    cropDragRef.current = { active: false, startX: 0, startY: 0, baseX: 0, baseY: 0 };
    setIsCropDragging(false);
    setCropModal({
      open: false,
      target: null,
      file: null,
      sourceUrl: '',
      imageSize: { width: 1, height: 1 },
      adjust: { zoom: 1, x: 0, y: 0 },
    });
  };

  const applyCropModal = async () => {
    if (!cropModal.file || !cropModal.target) return;
    setApplyingCrop(true);
    try {
      if (cropModal.target === 'avatar') {
        const cropped = await createCroppedFile(
          cropModal.file,
          cropModal.adjust,
          { width: 512, height: 512 },
          `avatar-${Date.now()}.jpg`,
        );
        if (avatarPreview && avatarPreview.startsWith('blob:')) {
          URL.revokeObjectURL(avatarPreview);
        }
        setAvatarFile(cropped);
        setAvatarPreview(URL.createObjectURL(cropped));
      } else {
        const cropped = await createCroppedFile(
          cropModal.file,
          cropModal.adjust,
          { width: 1600, height: 500 },
          `background-${Date.now()}.jpg`,
        );
        if (profileBackgroundPreview && profileBackgroundPreview.startsWith('blob:')) {
          URL.revokeObjectURL(profileBackgroundPreview);
        }
        setProfileBackgroundFile(cropped);
        setProfileBackgroundPreview(URL.createObjectURL(cropped));
      }
      closeCropModal();
    } finally {
      setApplyingCrop(false);
    }
  };

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
      if (profileBackgroundPreview && profileBackgroundPreview.startsWith('blob:')) {
        URL.revokeObjectURL(profileBackgroundPreview);
      }
    };
  }, [avatarPreview, profileBackgroundPreview]);

  useEffect(() => {
    return () => {
      if (cropModal.sourceUrl && cropModal.sourceUrl.startsWith('blob:')) {
        URL.revokeObjectURL(cropModal.sourceUrl);
      }
    };
  }, [cropModal.sourceUrl]);

  useEffect(() => {
    const fetchData = async () => {
      const shouldShowPageLoader =
        loadedStudentIdRef.current === null ||
        String(loadedStudentIdRef.current) !== String(studentId);
      if (shouldShowPageLoader) {
        setLoading(true);
      }
      setError(null);
      try {
        const token = getAuthTokenOrLogout(navigate);
        const studentResponse = await fetch(`/api/students/${studentId}`);
        if (!studentResponse.ok) {
          throw new Error('Network response was not ok');
        }

        const studentData = await studentResponse.json();
        setStudent(studentData);
        loadedStudentIdRef.current = studentData?.id ?? null;
        setProfileName(studentData.name || '');
        setProfileBio(studentData.about_me || '');
        setAppearanceTheme(studentData.appearance_theme || 'classic');
        setFontFamily(studentData.font_family || 'inter');
        setAccentColor(studentData.accent_color || '#542133');
        setFontSize(studentData.font_size || '16px');
        const avatar = studentData.avatar_url || '';
        setAvatarPreview(resolveMediaUrl(avatar));
        if (shouldShowPageLoader) {
          setLoading(false);
        }

        if (token) {
          try {
            const decoded = jwtDecode(token);
            setIsOwner(String(decoded.id) === String(studentId));
            setIsAdmin(decoded.role === 'admin');
          } catch {
            setIsOwner(false);
            setIsAdmin(false);
          }
        } else {
          setIsOwner(false);
          setIsAdmin(false);
        }

        const postsResponse = await fetch(`/api/students/${studentId}/posts`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
        });
        if (!postsResponse.ok) {
          throw new Error('Failed to load posts');
        }
        const postsData = await postsResponse.json();
        const normalizedPosts = Array.isArray(postsData) ? postsData : [];
        setPosts(normalizedPosts);

        if (token) {
          try {
            const decoded = jwtDecode(token);
            if (String(decoded.id) !== String(studentId)) {
              const latestVisiblePostAt = normalizedPosts.reduce((latest, post) => {
                const createdAt = post?.created_at || '';
                return createdAt > latest ? createdAt : latest;
              }, '');
              if (latestVisiblePostAt) {
                localStorage.setItem(
                  `seen_profile_posts_${decoded.id}_${studentId}`,
                  latestVisiblePostAt
                );
              }
            }
          } catch {
            // ignore activity-dot updates when token cannot be decoded
          }
        }
      } catch (error) {
        setError(error.message);
      } finally {
        if (shouldShowPageLoader) {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [studentId, postsRefreshTrigger, navigate]);

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
    setProfileBackgroundFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (backgroundInputRef.current) {
      backgroundInputRef.current.value = '';
    }
    const avatar = student.avatar_url || '';
    const background = student.profile_background_url || '';
    setAvatarPreview(addCacheBust(resolveMediaUrl(avatar)));
    setProfileBackgroundPreview(addCacheBust(resolveMediaUrl(background)));
  }, [editingProfile, student]);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>Error loading profile: {error}</p>;
  if (!student) return <p>Student not found.</p>;

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    openCropModal('avatar', file);
  };

  const handleBackgroundChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    openCropModal('background', file);
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
      if (profileBackgroundFile) {
        formData.append('profile_background', profileBackgroundFile);
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
        const payload = await response.text();
        let errorMessage = payload || 'Failed to update profile';
        try {
          const parsed = payload ? JSON.parse(payload) : null;
          errorMessage = parsed?.message || parsed?.error || errorMessage;
        } catch {
          errorMessage = payload || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const updated = await response.json();
      setStudent(updated);
      setAvatarFile(null);
      setProfileBackgroundFile(null);
      setAvatarPreview(addCacheBust(resolveMediaUrl(updated.avatar_url)));
      setProfileBackgroundPreview(addCacheBust(resolveMediaUrl(updated.profile_background_url || '')));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (backgroundInputRef.current) {
        backgroundInputRef.current.value = '';
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

  const persistPostOrder = async (nextPosts) => {
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

  const handleDrop = async (index) => {
    const fromIndex = dragIndexRef.current;
    dragIndexRef.current = null;
    if (fromIndex === null || fromIndex === index) return;

    const nextPosts = [...posts];
    const [moved] = nextPosts.splice(fromIndex, 1);
    nextPosts.splice(index, 0, moved);
    setPosts(nextPosts);
    await persistPostOrder(nextPosts);
  };

  const handleMovePost = async (index, direction) => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= posts.length) return;

    const nextPosts = [...posts];
    const temp = nextPosts[index];
    nextPosts[index] = nextPosts[swapIndex];
    nextPosts[swapIndex] = temp;
    setPosts(nextPosts);
    await persistPostOrder(nextPosts);
  };


  const activeTheme = themeOptions[appearanceTheme] || themeOptions.classic;
  const activeFont = fontOptions[fontFamily]?.stack || fontOptions.inter.stack;
  const accentHex = accentColor && accentColor.match(/^#([0-9a-fA-F]{6})$/) ? accentColor : activeTheme.accent;
  const modeTheme = { ...activeTheme, accent: accentHex, accentDark: accentHex };
  const cropPreviewMetrics = getViewportCropMetrics(
    cropModal.adjust,
    cropFrameSize,
    cropModal.imageSize,
  );

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
        {(Array.isArray(posts) ? posts : []).map((post, index) => (
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
              onMoveUp={() => handleMovePost(index, 'up')}
              onMoveDown={() => handleMovePost(index, 'down')}
              canMoveUp={index > 0}
              canMoveDown={index < posts.length - 1}
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
                  <span>Choose and crop photo</span>
                  <FileName>{avatarFile ? avatarFile.name : 'No file selected'}</FileName>
                </FilePicker>
              </div>
            </PreviewRow>
            <FieldLabel htmlFor="profile-background-upload">Profile background</FieldLabel>
            {profileBackgroundPreview && (
              <BackgroundPreview src={profileBackgroundPreview} alt="Profile background preview" />
            )}
            <FileInput
              ref={backgroundInputRef}
              id="profile-background-upload"
              type="file"
              accept="image/*"
              onChange={handleBackgroundChange}
            />
            <FilePicker htmlFor="profile-background-upload">
              <span>Choose and crop background</span>
              <FileName>{profileBackgroundFile ? profileBackgroundFile.name : 'No file selected'}</FileName>
            </FilePicker>
            <ActionRow>
              <SecondaryButton onClick={() => setEditingProfile(false)}>Cancel</SecondaryButton>
              <ActionButton onClick={handleSaveProfile}>Save Profile</ActionButton>
            </ActionRow>
          </ModalContent>
        </ModalOverlay>
      )}

      {cropModal.open && (
        <ModalOverlay onClick={closeCropModal}>
          <CropEditorCard onClick={(event) => event.stopPropagation()}>
            <ModalTitle>
              {cropModal.target === 'avatar' ? 'Crop Profile Photo' : 'Crop Background Image'}
            </ModalTitle>
            <CropEditorFrame
              ref={cropEditorFrameRef}
              $avatar={cropModal.target === 'avatar'}
              $dragging={isCropDragging}
              onPointerDown={startCropDrag}>
              <CropImage
                src={cropModal.sourceUrl}
                alt="Crop preview"
                style={{
                  width: `${cropPreviewMetrics.drawWidth}px`,
                  height: `${cropPreviewMetrics.drawHeight}px`,
                  transform: `translate(calc(-50% + ${cropPreviewMetrics.offsetX}px), calc(-50% + ${cropPreviewMetrics.offsetY}px))`,
                }}
              />
            </CropEditorFrame>
            <CropControls>
              <CropRow>
                <span>Zoom</span>
                <CropRange
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  value={cropModal.adjust.zoom}
                  onChange={(e) =>
                    setCropModal((prev) => ({
                      ...prev,
                      adjust: { ...prev.adjust, zoom: Number(e.target.value) },
                    }))
                  }
                />
                <strong>{cropModal.adjust.zoom.toFixed(2)}x</strong>
              </CropRow>
              <CropHint>Drag image to position the area you want.</CropHint>
            </CropControls>
            <ActionRow>
              <SecondaryButton onClick={closeCropModal}>Cancel</SecondaryButton>
              <ActionButton onClick={applyCropModal} disabled={applyingCrop}>
                {applyingCrop ? 'Applying...' : 'Apply Crop'}
              </ActionButton>
            </ActionRow>
          </CropEditorCard>
        </ModalOverlay>
      )}

      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onPostUpdated={(updatedPost) => {
            setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
            setEditingPost(null);
          }}
        />
      )}
    </ProfileShell>
  );
};

export default Profile;
