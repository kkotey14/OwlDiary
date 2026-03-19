import React from 'react';
import styled from 'styled-components';
import { useOutletContext } from 'react-router-dom';
import ActivityFeed from '../components/ActivityFeed';
import YourStats from '../components/YourStats';

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
`;

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: 2.5fr 1fr;
  gap: 2rem;
  align-items: start;
`;

const DashboardPage = styled.div`
  margin: -2.5rem;
  padding: 2.5rem;
  min-height: 100vh;
  width: calc(100% + 5rem);
  background: linear-gradient(135deg, #5fa9ff 0%, #ffffff 100%);
  box-sizing: border-box;
`;

const MainContent = styled.div``;

const Sidebar = styled.div`
  position: sticky;
  top: 2rem;
`;

const Dashboard = () => {
  const outletContext = useOutletContext();
  const postsRefreshTrigger = outletContext ? outletContext.postsRefreshTrigger : 0;
  const statsRefreshTrigger = outletContext ? outletContext.statsRefreshTrigger : 0;
  const fetchStats = outletContext?.refreshStats || (() => {});

  return (
    <DashboardPage>
      <DashboardHeader>
        <PageTitle>Dashboard</PageTitle>
      </DashboardHeader>
      <DashboardContainer>
        <MainContent>
          <ActivityFeed
            fetchStats={fetchStats}
            refreshTrigger={postsRefreshTrigger}
          />
        </MainContent>
        <Sidebar>
          <YourStats statsRefreshTrigger={`${postsRefreshTrigger}-${statsRefreshTrigger}`} />
        </Sidebar>
      </DashboardContainer>
    </DashboardPage>
  );
};

export default Dashboard;
