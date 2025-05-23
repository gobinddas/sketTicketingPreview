// components/MainContent.js
import React, { useState, useEffect } from 'react';
import TicketingForm from './TicketingForm';
import ActiveSessions from './ActiveSessions';
import TicketPrices from './TicketPrices';
import WarningBox from './WarningBox';
import SessionsEndingSoon from './SessionsEndingSoon';

const MainContent = () => {
  // Initialize state from localStorage or default to an empty array
  const [activeSessions, setActiveSessions] = useState(() => {
    const savedSessions = localStorage.getItem('activeSessions');
    return savedSessions ? JSON.parse(savedSessions) : [];
  });

  // Update localStorage whenever activeSessions changes
  useEffect(() => {
    localStorage.setItem('activeSessions', JSON.stringify(activeSessions));
  },  [activeSessions]);
  return (
    <div className="main-content">
      <div className='dashboard-two-box'>
        <TicketingForm setActiveSessions={setActiveSessions} />
        <div className='dashboard-two-box-inner'>
          <div className='item box-white'>


            <TicketPrices />
          </div>
          <div className='item box-white' style={{ backgroundColor: '#a41b1a' }}>
            <WarningBox activeSessions={activeSessions} />


          </div>

        </div>

      </div>


      <div className='dashboard-two-box'>
        <div className='two-box-right'>
          <ActiveSessions activeSessions={activeSessions}  setActiveSessions={setActiveSessions} />
          <SessionsEndingSoon activeSessions={activeSessions}setActiveSessions={setActiveSessions} />
        </div>

      </div>


    </div>
  );
};

export default MainContent;