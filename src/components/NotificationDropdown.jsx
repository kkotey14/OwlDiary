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

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Item = styled.button`
  text-align: left;
  border: none;
  background: #f8fafc;
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

const NotificationDropdown = ({ notifications, onSelect }) => {
  return (
    <Dropdown>
      <Title>Notifications</Title>
      {notifications.length === 0 ? (
        <Empty>No notifications yet.</Empty>
      ) : (
        <List>
          {notifications.map((note) => (
            <Item key={note.id} onClick={() => onSelect(note)}>
              {note.text}
            </Item>
          ))}
        </List>
      )}
    </Dropdown>
  );
};

export default NotificationDropdown;
