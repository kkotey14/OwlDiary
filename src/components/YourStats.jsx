import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { getAuthTokenOrLogout, handleAuthFailure } from '../utils/auth';
import { resolveMediaUrl } from '../utils/media';
import BrandedLoader from './BrandedLoader';
import useMinimumLoadingDelay from '../hooks/useMinimumLoadingDelay';

const StatsContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const Title = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #333;
`;

const UserProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const AvatarImage = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--primary-teal);
`;

const UserName = styled.h4`
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary);
`;

const AboutMeText = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.4;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  margin-bottom: 1rem;
`;

const StatLabel = styled.span`
  color: #666;
`;

const StatValue = styled.span`
  font-family: 'Playfair Display', serif;
  font-weight: 700;
  color: #333;
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  background: linear-gradient(135deg, #f3e7e9 0%, #e3eeff 100%);
`;

const YourStats = ({ statsRefreshTrigger }) => {
  const [stats, setStats] = useState({ 
    posts: 0, 
    comments: 0, 
    likes: 0, 
    avatar_url: '', 
    name: '', 
    about_me: '' 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const showLoader = useMinimumLoadingDelay(loading, 500);

  useEffect(() => {
    const fetchUserStats = async () => {
      const token = getAuthTokenOrLogout(navigate);
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;

        const response = await fetch(`/api/user-stats/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (handleAuthFailure(response.status, navigate)) {
            return;
          }
          const errorText = await response.text();
          throw new Error(`API error: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [statsRefreshTrigger, navigate]); // Add statsRefreshTrigger to dependency array

  if (showLoader) return <StatsContainer><Title>Your Stats</Title><BrandedLoader message="Loading stats..." minHeight="180px" size="72px" /></StatsContainer>;
  if (error) return <StatsContainer><Title>Your Stats</Title><p>Error: {error}</p></StatsContainer>;

  return (
    <StatsContainer>
      <UserProfileHeader>
        {stats.avatar_url && <AvatarImage src={resolveMediaUrl(stats.avatar_url)} alt={stats.name || 'User Avatar'} />}
        {stats.name && <UserName>{stats.name}</UserName>}
      </UserProfileHeader>
      {stats.about_me && <AboutMeText>{stats.about_me}</AboutMeText>}
      <Title>Your Stats</Title>
      <StatItem>
        <StatLabel>📝 Total Posts</StatLabel>
        <StatValue>{stats.posts}</StatValue>
      </StatItem>
      {/* Assuming comments are also represented by posts count for now based on backend logic */}
      <StatItem>
        <StatLabel>💬 Total Comments</StatLabel>
        <StatValue>{stats.comments}</StatValue>
      </StatItem>
      <StatItem>
        <StatLabel>❤️ Total Likes</StatLabel>
        <StatValue>{stats.likes}</StatValue>
      </StatItem>
    </StatsContainer>
  );
};

export default YourStats;
