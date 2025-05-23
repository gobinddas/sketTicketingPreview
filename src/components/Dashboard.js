// components/Dashboard.js
import React from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';

const Dashboard = ({ activeSessions, setActiveSessions }) => {
  return (
    <div className="dashboard">
      
      <MainContent activeSessions={activeSessions} setActiveSessions={setActiveSessions} />
    </div>
  );
};

export default Dashboard;