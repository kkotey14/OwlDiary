import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { FiCamera, FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { jwtDecode } from "jwt-decode";
import { getAuthTokenOrLogout } from "../utils/auth";
import { resolveMediaUrl } from "../utils/media";

const HeaderContainer = styled.section`
  width: calc(100% + 5rem);
  margin: -2.5rem -2.5rem 2rem;
  overflow: hidden;
  background: transparent;
`;

const Hero = styled.div`
  min-height: 320px;
  position: relative;
  background: ${({ $bg }) =>
    $bg
      ? `url(${$bg}) center/cover no-repeat`
      : "linear-gradient(135deg, #dbeafe 0%, #f8fafc 100%)"};
  padding: 2rem;
  display: flex;
  align-items: flex-end;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.22), rgba(15, 23, 42, 0.3));
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Identity = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Avatar = styled.img`
  width: 110px;
  height: 110px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.9);
  object-fit: cover;
`;

const Info = styled.div`
  color: #ffffff;
  text-shadow: 0 2px 14px rgba(15, 23, 42, 0.55);
`;

const Name = styled.h1`
  margin: 0;
  font-size: clamp(1.8rem, 2.4vw, 2.8rem);
  line-height: 1.1;
`;

const AboutMe = styled.p`
  margin: 0.45rem 0 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.92);
  max-width: 600px;
`;

const EditButton = styled.button`
  background: rgba(255, 255, 255, 0.92);
  color: #0f172a;
  border: none;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
`;

const GalleryStrip = styled.div`
  padding: 1rem;
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  background: var(--profile-bg, #f7f9fc);
  border-top: 1px solid rgba(15, 23, 42, 0.18);
`;

const GalleryTile = styled.button`
  min-width: 140px;
  width: 140px;
  height: 90px;
  border-radius: 10px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  padding: 0;
  background: var(--profile-bg, #f7f9fc);
  overflow: hidden;
  cursor: pointer;
`;

const GalleryImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const UploadTile = styled.label`
  min-width: 140px;
  width: 140px;
  height: 90px;
  border-radius: 10px;
  border: 1px dashed rgba(15, 23, 42, 0.25);
  background: var(--profile-bg, #f7f9fc);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  color: var(--profile-text, #0f172a);
  font-size: 0.85rem;
  cursor: pointer;
`;

const HiddenInput = styled.input`
  display: none;
`;

const EmptyTile = styled.div`
  min-width: 220px;
  height: 90px;
  background: var(--profile-bg, #f7f9fc);
  border-radius: 10px;
  border: 1px dashed rgba(15, 23, 42, 0.22);
  color: var(--profile-muted, #64748b);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  font-size: 0.85rem;
`;

const ViewerOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.86);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: 1rem;
`;

const ViewerImage = styled.img`
  max-width: min(94vw, 1100px);
  max-height: 82vh;
  border-radius: 12px;
  object-fit: contain;
`;

const ViewerButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 22px;
  right: 22px;
  border: none;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
`;

const StatusText = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: var(--profile-muted, #475569);
  padding: 0 1rem 0.6rem;
`;

const ProfileHeader = ({ student, showEditButton, onEditProfile }) => {
  const navigate = useNavigate();
  const uploadRef = useRef(null);
  const [gallery, setGallery] = useState([]);
  const [galleryError, setGalleryError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(-1);

  const token = getAuthTokenOrLogout(navigate);
  const isOwner = (() => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      return String(decoded.id) === String(student.id);
    } catch {
      return false;
    }
  })();
  const showEdit = typeof showEditButton === "boolean" ? showEditButton : isOwner;

  const heroBackground = student.profile_background_url
    ? resolveMediaUrl(student.profile_background_url)
    : null;

  useEffect(() => {
    let isMounted = true;
    const fetchGallery = async () => {
      if (!student?.id) return;
      try {
        const response = await fetch(`/api/students/${student.id}/gallery`);
        if (!response.ok) {
          const text = await response.text();
          let message = "Failed to load gallery";
          try {
            const parsed = text ? JSON.parse(text) : null;
            message = parsed?.message || parsed?.error || message;
          } catch {
            message = text || message;
          }
          throw new Error(message);
        }
        const data = await response.json();
        if (isMounted) {
          setGallery(Array.isArray(data) ? data : []);
          setGalleryError("");
        }
      } catch (error) {
        if (isMounted) setGalleryError(error.message);
      }
    };
    fetchGallery();
    return () => {
      isMounted = false;
    };
  }, [student?.id]);

  const handleUploadPhoto = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const authToken = getAuthTokenOrLogout(navigate);
    if (!authToken) return;

    try {
      setUploading(true);
      setGalleryError("");
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch("/api/profile/gallery", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to upload photo.");
      }

      const newPhoto = await response.json();
      setGallery((prev) => [newPhoto, ...prev]);
    } catch (error) {
      setGalleryError(error.message);
    } finally {
      setUploading(false);
      if (uploadRef.current) {
        uploadRef.current.value = "";
      }
    }
  };

  const openViewer = (index) => setViewerIndex(index);
  const closeViewer = () => setViewerIndex(-1);
  const showPrev = () =>
    setViewerIndex((index) => (index - 1 + gallery.length) % gallery.length);
  const showNext = () => setViewerIndex((index) => (index + 1) % gallery.length);

  return (
    <HeaderContainer>
      <Hero $bg={heroBackground}>
        <Overlay />
        <HeroContent>
          <Identity>
            <Avatar src={resolveMediaUrl(student.avatar_url)} alt={student.name} />
            <Info>
              <Name>{student.name}</Name>
              <AboutMe>{student.about_me || "No bio yet."}</AboutMe>
            </Info>
          </Identity>
          {showEdit && <EditButton onClick={onEditProfile}>Edit Profile</EditButton>}
        </HeroContent>
      </Hero>

      <GalleryStrip>
        {isOwner && (
          <>
            <UploadTile htmlFor="profile-gallery-upload">
              <FiCamera />
              {uploading ? "Uploading..." : "Add Photo"}
            </UploadTile>
            <HiddenInput
              id="profile-gallery-upload"
              ref={uploadRef}
              type="file"
              accept="image/*"
              onChange={handleUploadPhoto}
            />
          </>
        )}

        {gallery.length === 0 ? (
          <EmptyTile>
            {isOwner
              ? "No gallery to showcase yet. Add a few photos to get started."
              : "This user has not added a gallery yet."}
          </EmptyTile>
        ) : (
          gallery.map((photo, index) => (
            <GalleryTile key={photo.id} type="button" onClick={() => openViewer(index)}>
              <GalleryImage src={resolveMediaUrl(photo.photo_url)} alt={`Gallery ${index + 1}`} />
            </GalleryTile>
          ))
        )}
      </GalleryStrip>

      {galleryError && <StatusText>{galleryError}</StatusText>}

      {viewerIndex >= 0 && gallery[viewerIndex] && (
        <ViewerOverlay onClick={closeViewer}>
          <CloseButton type="button" onClick={closeViewer}>
            <FiX />
          </CloseButton>
          {gallery.length > 1 && (
            <>
              <ViewerButton
                type="button"
                style={{ left: "24px" }}
                onClick={(event) => {
                  event.stopPropagation();
                  showPrev();
                }}
              >
                <FiChevronLeft />
              </ViewerButton>
              <ViewerButton
                type="button"
                style={{ right: "24px" }}
                onClick={(event) => {
                  event.stopPropagation();
                  showNext();
                }}
              >
                <FiChevronRight />
              </ViewerButton>
            </>
          )}
          <ViewerImage
            src={resolveMediaUrl(gallery[viewerIndex].photo_url)}
            alt={`Gallery view ${viewerIndex + 1}`}
            onClick={(event) => event.stopPropagation()}
          />
        </ViewerOverlay>
      )}
    </HeaderContainer>
  );
};

export default ProfileHeader;
