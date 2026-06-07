import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from './components/Sidebar';
import GlobalStyles from './GlobalStyles';
import CreatePostModal from './components/CreatePostModal';
import { isDemoModeEnabled } from './demo/mockApi';

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

const DemoBanner = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1400;
  max-width: 360px;
  padding: 0.85rem 1rem;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.92);
  color: #ffffff;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.24);
  font-size: 0.9rem;
  line-height: 1.45;
`;

function App() {
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [postsRefreshTrigger, setPostsRefreshTrigger] = useState(0);
  const [statsRefreshTrigger, setStatsRefreshTrigger] = useState(0);
  const showDemoBanner = isDemoModeEnabled();

  const openCreatePost = () => setShowCreatePostModal(true);
  const closeCreatePost = () => setShowCreatePostModal(false);
  const handlePostCreated = () => {
    setPostsRefreshTrigger((prev) => prev + 1);
    setStatsRefreshTrigger((prev) => prev + 1);
  };
  const refreshStats = () => setStatsRefreshTrigger((prev) => prev + 1);

  useEffect(() => {
    if (!showDemoBanner) return undefined;
    window.__owlDiarySkipDemoResetPrompt = false;
    const handleBeforeUnload = (event) => {
      if (window.__owlDiarySkipDemoResetPrompt) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [showDemoBanner]);

  return (
    <>
      <GlobalStyles />
      {showDemoBanner && (
        <DemoBanner>
          Demo mode is active. Changes live only in this tab and reset when you refresh or sign out.
        </DemoBanner>
      )}
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
