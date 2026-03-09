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
  position: relative;
  min-width: 140px;
  width: 140px;
  height: 90px;
  border-radius: 10px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  padding: 0;
  background: var(--profile-bg, #f7f9fc);
  overflow: hidden;
  cursor: pointer;
  opacity: ${({ $dragging }) => ($dragging ? 0.55 : 1)};
  transform: ${({ $dragging }) => ($dragging ? "scale(0.98)" : "scale(1)")};
  transition: transform 0.12s ease, opacity 0.12s ease;
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
  background: rgba(15, 23, 42, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: 1.2rem;
`;

const ViewerModal = styled.div`
  width: min(1040px, 96vw);
  max-height: 92vh;
  background: var(--profile-card, #ffffff);
  color: var(--profile-text, #0f172a);
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  box-shadow: 0 18px 42px rgba(2, 6, 23, 0.28);
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr;
`;

const ViewerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  background: var(--profile-bg, #f8fafc);
  border-bottom: 1px solid rgba(15, 23, 42, 0.12);
`;

const CloseButton = styled.button`
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.08);
  color: var(--profile-text, #0f172a);
  font-size: 1.1rem;
  cursor: pointer;
`;

const ViewerHeaderTitle = styled.h3`
  margin: 0;
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--profile-text, #0f172a);
`;

const ViewerBody = styled.div`
  display: grid;
  grid-template-columns: 1.45fr 1fr;
  min-height: 0;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
  }
`;

const ViewerImageWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #0f172a 0%, #111827 100%);
  min-height: 300px;
`;

const ViewerImage = styled.img`
  width: 100%;
  height: 100%;
  max-height: 72vh;
  object-fit: contain;
`;

const ViewerButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  width: 38px;
  height: 38px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 1.15rem;
  cursor: pointer;
`;

const StatusText = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: var(--profile-muted, #475569);
  padding: 0 1rem 0.6rem;
`;

const UploadPanel = styled.div`
  margin: 0.3rem 1rem 1rem;
  padding: 1rem;
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.14);
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  display: grid;
  gap: 0.8rem;
`;

const UploadPanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.6rem;
`;

const UploadPanelTitle = styled.h4`
  margin: 0;
  font-size: 0.98rem;
  color: #0f172a;
`;

const FieldLabel = styled.label`
  display: block;
  margin: 0 0 0.35rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: #334155;
`;

const UploadField = styled.div`
  display: grid;
  gap: 0.25rem;
`;

const UploadPreview = styled.img`
  width: 100%;
  max-height: 180px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid rgba(15, 23, 42, 0.12);
`;

const UploadInput = styled.input`
  width: 100%;
  border: 1px solid rgba(15, 23, 42, 0.2);
  border-radius: 10px;
  padding: 0.6rem 0.7rem;
  font-size: 0.92rem;
`;

const UploadTextArea = styled.textarea`
  width: 100%;
  border: 1px solid rgba(15, 23, 42, 0.2);
  border-radius: 10px;
  padding: 0.6rem 0.7rem;
  min-height: 74px;
  resize: vertical;
  font-size: 0.92rem;
`;

const UploadActions = styled.div`
  display: flex;
  gap: 0.6rem;
`;

const UploadButton = styled.button`
  border: none;
  border-radius: 9px;
  padding: 0.58rem 0.85rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  background: ${({ $secondary }) => ($secondary ? "#e2e8f0" : "#0f172a")};
  color: ${({ $secondary }) => ($secondary ? "#0f172a" : "#fff")};
`;

const ThumbnailTitle = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 0.28rem 0.42rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.78), rgba(15, 23, 42, 0));
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ViewerMeta = styled.div`
  padding: 1rem;
  border-left: 1px solid rgba(15, 23, 42, 0.1);
  overflow-y: auto;
  background: var(--profile-card, #ffffff);

  @media (max-width: 900px) {
    border-left: none;
    border-top: 1px solid rgba(15, 23, 42, 0.1);
  }
`;

const ViewerTitle = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  color: var(--profile-text, #0f172a);
`;

const ViewerDescription = styled.p`
  margin: 0.28rem 0 0;
  font-size: 0.92rem;
  line-height: 1.5;
  color: var(--profile-muted, #475569);
`;

const ViewerMetaActions = styled.div`
  margin-top: 0.55rem;
  display: flex;
  gap: 0.5rem;
`;

const ViewerEditInput = styled.input`
  width: 100%;
  border: 1px solid rgba(15, 23, 42, 0.2);
  border-radius: 8px;
  padding: 0.52rem 0.62rem;
  font-size: 0.9rem;
  color: var(--profile-text, #0f172a);
  background: #fff;
`;

const ViewerEditTextArea = styled.textarea`
  width: 100%;
  border: 1px solid rgba(15, 23, 42, 0.2);
  border-radius: 8px;
  padding: 0.52rem 0.62rem;
  min-height: 66px;
  resize: vertical;
  font-size: 0.9rem;
  color: var(--profile-text, #0f172a);
  background: #fff;
  margin-top: 0.45rem;
`;

const ProfileHeader = ({ student, showEditButton, onEditProfile }) => {
  const navigate = useNavigate();
  const uploadRef = useRef(null);
  const dragIndexRef = useRef(null);
  const [gallery, setGallery] = useState([]);
  const [galleryError, setGalleryError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [draggingPhotoId, setDraggingPhotoId] = useState(null);
  const [viewerIndex, setViewerIndex] = useState(-1);
  const [editingViewerMeta, setEditingViewerMeta] = useState(false);
  const [viewerTitle, setViewerTitle] = useState("");
  const [viewerDescription, setViewerDescription] = useState("");
  const [savingViewerMeta, setSavingViewerMeta] = useState(false);
  const [pendingPhotoFile, setPendingPhotoFile] = useState(null);
  const [pendingPhotoPreview, setPendingPhotoPreview] = useState("");
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoDescription, setPhotoDescription] = useState("");

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

  useEffect(() => {
    return () => {
      if (pendingPhotoPreview && pendingPhotoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(pendingPhotoPreview);
      }
    };
  }, [pendingPhotoPreview]);

  const handleSelectPhoto = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (pendingPhotoPreview && pendingPhotoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(pendingPhotoPreview);
    }
    setPendingPhotoFile(file);
    setPendingPhotoPreview(URL.createObjectURL(file));
    setPhotoTitle("");
    setPhotoDescription("");
    setGalleryError("");
    if (uploadRef.current) {
      uploadRef.current.value = "";
    }
  };

  const cancelPendingUpload = () => {
    if (pendingPhotoPreview && pendingPhotoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(pendingPhotoPreview);
    }
    setPendingPhotoFile(null);
    setPendingPhotoPreview("");
    setPhotoTitle("");
    setPhotoDescription("");
  };

  const handleUploadPhoto = async () => {
    if (!pendingPhotoFile) return;

    const authToken = getAuthTokenOrLogout(navigate);
    if (!authToken) return;

    try {
      setUploading(true);
      setGalleryError("");
      const formData = new FormData();
      formData.append("photo", pendingPhotoFile);
      formData.append("title", photoTitle.trim());
      formData.append("description", photoDescription.trim());

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
      cancelPendingUpload();
    } catch (error) {
      setGalleryError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const openViewer = (index) => {
    const photo = gallery[index];
    setViewerIndex(index);
    setEditingViewerMeta(false);
    setViewerTitle(photo?.title || "");
    setViewerDescription(photo?.description || "");
  };
  const closeViewer = () => {
    setViewerIndex(-1);
    setEditingViewerMeta(false);
    setViewerTitle("");
    setViewerDescription("");
  };
  const showPrev = () =>
    setViewerIndex((index) => (index - 1 + gallery.length) % gallery.length);
  const showNext = () => setViewerIndex((index) => (index + 1) % gallery.length);

  useEffect(() => {
    if (viewerIndex < 0 || !gallery[viewerIndex]) return;
    setEditingViewerMeta(false);
    setViewerTitle(gallery[viewerIndex].title || "");
    setViewerDescription(gallery[viewerIndex].description || "");
  }, [viewerIndex, gallery]);

  const saveViewerMeta = async () => {
    if (viewerIndex < 0 || !gallery[viewerIndex]) return;
    const authToken = getAuthTokenOrLogout(navigate);
    if (!authToken) return;

    try {
      setSavingViewerMeta(true);
      setGalleryError("");
      const response = await fetch(`/api/profile/gallery/${gallery[viewerIndex].id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: viewerTitle.trim(),
          description: viewerDescription.trim(),
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to update gallery details.");
      }

      const updated = await response.json();
      setGallery((prev) => prev.map((photo) => (photo.id === updated.id ? updated : photo)));
      setEditingViewerMeta(false);
    } catch (error) {
      setGalleryError(error.message);
    } finally {
      setSavingViewerMeta(false);
    }
  };

  const persistGalleryOrder = async (nextGallery) => {
    const authToken = getAuthTokenOrLogout(navigate);
    if (!authToken) return;

    const response = await fetch("/api/profile/gallery/reorder", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ photoIds: nextGallery.map((photo) => photo.id) }),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Failed to reorder gallery.");
    }
  };

  const handleGalleryDragStart = (index) => {
    dragIndexRef.current = index;
    setDraggingPhotoId(gallery[index]?.id ?? null);
  };

  const handleGalleryDragOver = (event) => {
    event.preventDefault();
  };

  const handleGalleryDrop = async (index) => {
    if (!isOwner || reordering) return;
    const fromIndex = dragIndexRef.current;
    dragIndexRef.current = null;
    setDraggingPhotoId(null);
    if (fromIndex === null || fromIndex === undefined || fromIndex === index) return;

    const nextGallery = [...gallery];
    const [moved] = nextGallery.splice(fromIndex, 1);
    nextGallery.splice(index, 0, moved);
    setGallery(nextGallery);

    try {
      setReordering(true);
      setGalleryError("");
      await persistGalleryOrder(nextGallery);
    } catch (error) {
      setGalleryError(error.message);
    } finally {
      setReordering(false);
    }
  };

  const handleGalleryDragEnd = () => {
    dragIndexRef.current = null;
    setDraggingPhotoId(null);
  };

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
              onChange={handleSelectPhoto}
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
            <GalleryTile
              key={photo.id}
              type="button"
              draggable={isOwner}
              $dragging={draggingPhotoId === photo.id}
              onDragStart={() => handleGalleryDragStart(index)}
              onDragOver={handleGalleryDragOver}
              onDrop={() => handleGalleryDrop(index)}
              onDragEnd={handleGalleryDragEnd}
              onClick={() => openViewer(index)}
            >
              <GalleryImage src={resolveMediaUrl(photo.photo_url)} alt={`Gallery ${index + 1}`} />
              {photo.title && <ThumbnailTitle>{photo.title}</ThumbnailTitle>}
            </GalleryTile>
          ))
        )}
      </GalleryStrip>

      {isOwner && pendingPhotoFile && (
        <UploadPanel>
          <UploadPanelHeader>
            <UploadPanelTitle>Add Photo Details</UploadPanelTitle>
            <UploadButton type="button" $secondary onClick={cancelPendingUpload} disabled={uploading}>
              Close
            </UploadButton>
          </UploadPanelHeader>
          {pendingPhotoPreview && <UploadPreview src={pendingPhotoPreview} alt="New gallery upload" />}
          <UploadField>
            <FieldLabel htmlFor="gallery-title">Title</FieldLabel>
            <UploadInput
              id="gallery-title"
              type="text"
              placeholder="e.g. Spring Fair Day"
              maxLength={100}
              value={photoTitle}
              onChange={(event) => setPhotoTitle(event.target.value)}
            />
          </UploadField>
          <UploadField>
            <FieldLabel htmlFor="gallery-description">Description</FieldLabel>
            <UploadTextArea
              id="gallery-description"
              placeholder="Write a short description..."
              value={photoDescription}
              onChange={(event) => setPhotoDescription(event.target.value)}
            />
          </UploadField>
          <UploadActions>
            <UploadButton type="button" onClick={handleUploadPhoto} disabled={uploading}>
              {uploading ? "Uploading..." : "Upload photo"}
            </UploadButton>
            <UploadButton
              type="button"
              $secondary
              onClick={cancelPendingUpload}
              disabled={uploading}
            >
              Cancel
            </UploadButton>
          </UploadActions>
        </UploadPanel>
      )}

      {galleryError && <StatusText>{galleryError}</StatusText>}

      {viewerIndex >= 0 && gallery[viewerIndex] && (
        <ViewerOverlay onClick={closeViewer}>
          <ViewerModal onClick={(event) => event.stopPropagation()}>
            <ViewerHeader>
              <ViewerHeaderTitle>
                Gallery Photo {viewerIndex + 1} of {gallery.length}
              </ViewerHeaderTitle>
              <CloseButton type="button" onClick={closeViewer}>
                <FiX />
              </CloseButton>
            </ViewerHeader>
            <ViewerBody>
              <ViewerImageWrap>
                {gallery.length > 1 && (
                  <>
                    <ViewerButton
                      type="button"
                      style={{ left: "14px" }}
                      onClick={showPrev}
                    >
                      <FiChevronLeft />
                    </ViewerButton>
                    <ViewerButton
                      type="button"
                      style={{ right: "14px" }}
                      onClick={showNext}
                    >
                      <FiChevronRight />
                    </ViewerButton>
                  </>
                )}
                <ViewerImage
                  src={resolveMediaUrl(gallery[viewerIndex].photo_url)}
                  alt={`Gallery view ${viewerIndex + 1}`}
                />
              </ViewerImageWrap>

              {(isOwner || gallery[viewerIndex].title || gallery[viewerIndex].description) && (
                <ViewerMeta>
                  {editingViewerMeta ? (
                    <>
                      <ViewerEditInput
                        type="text"
                        maxLength={100}
                        placeholder="Title"
                        value={viewerTitle}
                        onChange={(event) => setViewerTitle(event.target.value)}
                      />
                      <ViewerEditTextArea
                        placeholder="Description"
                        value={viewerDescription}
                        onChange={(event) => setViewerDescription(event.target.value)}
                      />
                      <ViewerMetaActions>
                        <UploadButton type="button" onClick={saveViewerMeta} disabled={savingViewerMeta}>
                          {savingViewerMeta ? "Saving..." : "Save"}
                        </UploadButton>
                        <UploadButton
                          type="button"
                          $secondary
                          onClick={() => {
                            setEditingViewerMeta(false);
                            setViewerTitle(gallery[viewerIndex].title || "");
                            setViewerDescription(gallery[viewerIndex].description || "");
                          }}
                          disabled={savingViewerMeta}
                        >
                          Cancel
                        </UploadButton>
                      </ViewerMetaActions>
                    </>
                  ) : (
                    <>
                      {gallery[viewerIndex].title && <ViewerTitle>{gallery[viewerIndex].title}</ViewerTitle>}
                      {gallery[viewerIndex].description && (
                        <ViewerDescription>{gallery[viewerIndex].description}</ViewerDescription>
                      )}
                      {isOwner && (
                        <ViewerMetaActions>
                          <UploadButton type="button" onClick={() => setEditingViewerMeta(true)}>
                            Edit Details
                          </UploadButton>
                        </ViewerMetaActions>
                      )}
                    </>
                  )}
                </ViewerMeta>
              )}
            </ViewerBody>
          </ViewerModal>
        </ViewerOverlay>
      )}
    </HeaderContainer>
  );
};

export default ProfileHeader;
