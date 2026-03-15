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
  position: relative;
  z-index: 50;
`;

const NavItem = styled(NavLink)`
  color: rgba(15, 23, 42, 0.62);
  font-size: 1.8rem;
  transition: all 0.3s ease;
  position: relative;

  &.active,
  &:hover {
    color: #0f172a;
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
    z-index: 200;
  }
`;

const ActionItem = styled.button`
  background: none;
  border: none;
  color: rgba(15, 23, 42, 0.62);
  font-size: 1.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    color: #0f172a;
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
    z-index: 200;
  }
`;

const BellWrapper = styled.div`
  position: relative;
`;

const BellBadge = styled.span`
  position: absolute;
  top: -5px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #ef4444;
  color: #fff;
  font-size: 0.68rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.28rem;
  border: 2px solid rgba(255, 255, 255, 0.85);
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: rgba(15, 23, 42, 0.62);
  font-size: 1.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: auto;
  margin-bottom: 2rem;

  &:hover {
    color: #0f172a;
    transform: scale(1.1);
  }
`;

const Sidebar = ({ onCreatePost }) => {
  const navigate = useNavigate();
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const bellRef = useRef(null);
  
  const myProfilePath = useMemo(() => {
    const token = getAuthTokenOrLogout(navigate);
    if (!token) return '/login';
    try {
      const decoded = jwtDecode(token);
      return `/profile/${decoded.id}`;
    } catch {
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

  const fetchNotifications = async () => {
    const token = getAuthTokenOrLogout(navigate);
    if (!token) {
      setNotifications([]);
      return;
    }

    try {
      const response = await fetch('/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      // keep previous notification state on transient failure
    }
  };

  useEffect(() => {
    fetchNotifications();
    const intervalId = window.setInterval(fetchNotifications, 30000);
    return () => window.clearInterval(intervalId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isNotifyOpen) return;
    fetchNotifications();
  }, [isNotifyOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNotificationClick = async (note) => {
    setIsNotifyOpen(false);
    const token = getAuthTokenOrLogout(navigate);
    if (token && note?.id) {
      try {
        await fetch(`/api/notifications/${note.id}/read`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch {
        // no-op; still navigate
      }
    }
    setNotifications((prev) =>
      prev.map((item) => (item.id === note.id ? { ...item, is_read: 1 } : item))
    );
    const target = note?.link_url || '/notifications';
    navigate(target);
  };

  const handleMarkAllRead = async () => {
    const token = getAuthTokenOrLogout(navigate);
    if (!token) return;
    try {
      setMarkingAllRead(true);
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications((prev) => prev.map((note) => ({ ...note, is_read: 1 })));
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the JWT
    console.log('Logging out...');
    window.location.href = '/login';
  };

  const unreadCount = notifications.reduce(
    (count, note) => count + (Number(note.is_read) === 1 ? 0 : 1),
    0
  );

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
          {unreadCount > 0 && <BellBadge>{unreadCount > 9 ? '9+' : unreadCount}</BellBadge>}
        </ActionItem>
        {isNotifyOpen && (
          <NotificationDropdown
            notifications={notifications}
            onSelect={handleNotificationClick}
            onMarkAllRead={handleMarkAllRead}
            loading={markingAllRead}
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
