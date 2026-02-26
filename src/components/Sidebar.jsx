import React, { useMemo, useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiUser, FiBell, FiSettings, FiLogOut, FiPlusSquare } from 'react-icons/fi';
import { jwtDecode } from 'jwt-decode';
import { getAuthTokenOrLogout } from '../utils/auth';
import NotificationDropdown from './NotificationDropdown';

const SidebarContainer = styled.aside`
  width: 90px;
  flex-shrink: 0;
  background: linear-gradient(135deg, #5fa9ff 0%, #ffffff 100%);
  padding: 2.5rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
`;

const NavItem = styled(NavLink)`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.8rem;
  transition: all 0.3s ease;
  position: relative;

  &.active,
  &:hover {
    color: white;
    transform: scale(1.1);
  }

  &:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    left: 120%;
    top: 50%;
    transform: translateY(-50%);
    background: #0f172a;
    color: white;
    padding: 0.35rem 0.6rem;
    border-radius: 6px;
    font-size: 0.75rem;
    white-space: nowrap;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.2);
    pointer-events: none;
    opacity: 0.95;
  }
`;

const ActionItem = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    color: white;
    transform: scale(1.1);
  }

  &:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    left: 120%;
    top: 50%;
    transform: translateY(-50%);
    background: #0f172a;
    color: white;
    padding: 0.35rem 0.6rem;
    border-radius: 6px;
    font-size: 0.75rem;
    white-space: nowrap;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.2);
    pointer-events: none;
    opacity: 0.95;
  }
`;

const BellWrapper = styled.div`
  position: relative;
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: auto;
  margin-bottom: 2rem;

  &:hover {
    color: white;
    transform: scale(1.1);
  }
`;

const Sidebar = ({ onCreatePost }) => {
  const navigate = useNavigate();
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const bellRef = useRef(null);
  const myProfilePath = useMemo(() => {
    const token = getAuthTokenOrLogout(navigate);
    if (!token) return '/login';
    try {
      const decoded = jwtDecode(token);
      return `/profile/${decoded.id}`;
    } catch (error) {
      return '/login';
    }
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsNotifyOpen(false);
      }
    };
    if (isNotifyOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotifyOpen]);

  const notifications = [
    { id: 1, text: 'New comment on your post', postId: 7, studentId: 1 },
    { id: 2, text: 'Samira liked your post', postId: 6, studentId: 2 },
  ];

  const handleNotificationClick = (note) => {
    setIsNotifyOpen(false);
    navigate(`/profile/${note.studentId}#post-${note.postId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the JWT
    console.log('Logging out...');
    window.location.href = '/login';
  };

  return (
    <SidebarContainer>
      <NavItem to="/" title="Home" data-tooltip="Home">
        <FiHome />
      </NavItem>
      <NavItem to="/directory" title="Classroom Directory" data-tooltip="Directory">
        <FiUsers />
      </NavItem>
      <ActionItem onClick={onCreatePost} title="Create Post" data-tooltip="New Post">
        <FiPlusSquare />
      </ActionItem>
      <NavItem to={myProfilePath} title="My Profile" data-tooltip="My Profile">
        <FiUser />
      </NavItem>
      <BellWrapper ref={bellRef}>
        <ActionItem
          type="button"
          title="Notifications"
          data-tooltip="Notifications"
          onClick={() => setIsNotifyOpen((prev) => !prev)}
        >
          <FiBell />
        </ActionItem>
        {isNotifyOpen && (
          <NotificationDropdown
            notifications={notifications}
            onSelect={handleNotificationClick}
          />
        )}
      </BellWrapper>
      <NavItem to="/settings" title="Settings" data-tooltip="Settings">
        <FiSettings />
      </NavItem>
      <LogoutButton onClick={handleLogout} title="Logout" data-tooltip="Logout">
        <FiLogOut />
      </LogoutButton>
    </SidebarContainer>
  );
};

export default Sidebar;
