import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from './components/Sidebar';
import GlobalStyles from './GlobalStyles';
import CreatePostModal from './components/CreatePostModal';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: var(--soft-background);
`;

const Content = styled.main`
  flex-grow: 1;
  padding: 2.5rem;
  overflow-y: auto;
`;

function App() {
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [postsRefreshTrigger, setPostsRefreshTrigger] = useState(0);
  const [statsRefreshTrigger, setStatsRefreshTrigger] = useState(0);

  const openCreatePost = () => setShowCreatePostModal(true);
  const closeCreatePost = () => setShowCreatePostModal(false);
  const handlePostCreated = () => {
    setPostsRefreshTrigger((prev) => prev + 1);
    setStatsRefreshTrigger((prev) => prev + 1);
  };
  const refreshStats = () => setStatsRefreshTrigger((prev) => prev + 1);

  return (
    <>
      <GlobalStyles />
      <AppContainer>
        <Sidebar onCreatePost={openCreatePost} />
        <Content>
          <Outlet context={{ postsRefreshTrigger, statsRefreshTrigger, refreshStats }} />
        </Content>
      </AppContainer>
      {showCreatePostModal && (
        <CreatePostModal
          onClose={closeCreatePost}
          onPostCreated={handlePostCreated}
        />
      )}
    </>
  );
}

export default App;
