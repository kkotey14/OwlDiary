import React from 'react';
import styled from 'styled-components';

const Dropdown = styled.div`
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translate(12px, -50%);
  width: 280px;
  max-height: 400px;
  overflow-y: auto;
  background: white;
  border-radius: 14px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.15);
  border: 1px solid #e6eef8;
  z-index: 2000;
  padding: 0.75rem;
`;

const Title = styled.h4`
  margin: 0 0 0.75rem;
  font-size: 0.95rem;
  color: #0f172a;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const MarkAllButton = styled.button`
  border: none;
  background: transparent;
  color: #2563eb;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Item = styled.button`
  text-align: left;
  border: none;
  background: ${(props) => (props.$unread ? '#e8f0ff' : '#f8fafc')};
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  cursor: pointer;
  color: #1f2937;
  font-size: 0.9rem;
  transition: background 0.2s ease;

  &:hover {
    background: #eef2f7;
  }
`;

const Empty = styled.div`
  font-size: 0.85rem;
  color: #6b7a90;
  padding: 0.75rem;
  text-align: center;
`;

const NotificationDropdown = ({ notifications, onSelect, onMarkAllRead, loading }) => {
  return (
    <Dropdown>
      <HeaderRow>
        <Title>Notifications</Title>
        {notifications.length > 0 && (
          <MarkAllButton type="button" onClick={onMarkAllRead} disabled={loading}>
            Mark all read
          </MarkAllButton>
        )}
      </HeaderRow>
      {notifications.length === 0 ? (
        <Empty>No notifications yet.</Empty>
      ) : (
        <List>
          {notifications.map((note) => (
            <Item key={note.id} $unread={Number(note.is_read) !== 1} onClick={() => onSelect(note)}>
              {note.message || note.text}
            </Item>
          ))}
        </List>
      )}
    </Dropdown>
  );
};

export default NotificationDropdown;
