import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { resolveMediaUrl } from '../utils/media';

const Card = styled(Link)`
  background: var(--card-background);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  transition: transform 0.3s, box-shadow 0.3s;
  position: relative;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  }
`;

const Avatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid #e3eeff;
  object-fit: cover;
`;

const StudentName = styled.span`
  font-weight: 500;
  color: var(--text-primary);
  font-size: 1.1rem;
  text-align: center;
`;

const StudentEmail = styled.span`
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-align: center;
`;

const AboutText = styled.p`
  font-size: 0.85rem;
  color: #6b7a90;
  text-align: center;
  margin: 0;
  line-height: 1.4;
`;

const NotificationIndicator = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 12px;
  height: 12px;
  background-color: #ff6b6b;
  border-radius: 50%;
  border: 2px solid white;
`;

const ProfileCard = ({ student, viewerId }) => {
  const latestPostAt = student.latest_post_at;
  const seenKey = viewerId ? `seen_profile_posts_${viewerId}_${student.id}` : null;
  const seenAt = seenKey ? localStorage.getItem(seenKey) : null;
  const hasNewActivity = Boolean(
    viewerId &&
      String(viewerId) !== String(student.id) &&
      latestPostAt &&
      (!seenAt || latestPostAt > seenAt)
  );
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || 'User')}&background=random`;
  const avatarUrl = resolveMediaUrl(student.avatar_url) || fallbackAvatar;

  return (
    <Card
      to={`/profile/${student.id}`}
      onClick={() => {
        if (seenKey && latestPostAt) {
          localStorage.setItem(seenKey, latestPostAt);
        }
      }}
    >
      {hasNewActivity && <NotificationIndicator />}
      <Avatar src={avatarUrl} alt={student.name} />
      <StudentName>{student.name}</StudentName>
      {student.email && <StudentEmail>{student.email}</StudentEmail>}
      {student.about_me && <AboutText>{student.about_me}</AboutText>}
    </Card>
  );
};

export default ProfileCard;
