import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { getAuthTokenOrLogout } from '../utils/auth';
import { resolveMediaUrl } from '../utils/media';

const HeaderContainer = styled.div`
  background: var(--profile-card, white);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
`;

const Avatar = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid white;
`;

const Info = styled.div`
  flex-grow: 1;
`;

const Name = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--profile-text, #2c3e50);
`;

const AboutMe = styled.p`
  color: var(--profile-muted, #556);
  line-height: 1.6;
  margin-top: 0.5rem;
  font-size: 1.1rem;
`;

const EditButton = styled.button`
  background: var(--profile-accent, #667eea);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background: var(--profile-accent-dark, #5a6edc);
  }
`;

const ProfileHeader = ({ student, showEditButton, onEditProfile }) => {
  const navigate = useNavigate();
  const isOwner = (() => {
    const token = getAuthTokenOrLogout(navigate);
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      return String(decoded.id) === String(student.id);
    } catch (error) {
      return false;
    }
  })();
  const showEdit = typeof showEditButton === 'boolean' ? showEditButton : isOwner;

  return (
    <HeaderContainer>
      <Avatar src={resolveMediaUrl(student.avatar_url)} alt={student.name} />
      <Info>
        <Name>{student.name}</Name>
        <AboutMe>{student.about_me}</AboutMe>
      </Info>
      {showEdit && <EditButton onClick={onEditProfile}>Edit Profile</EditButton>}
    </HeaderContainer>
  );
};

export default ProfileHeader;
