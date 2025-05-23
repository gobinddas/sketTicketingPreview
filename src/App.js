import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ActiveSession from './components/ActiveSession';
import TicketsPrice from './components/TicketsPrice';
import BalanceSheet from './components/BalanceSheet';
import Support from './components/Support';
import { TicketingPriceProvider } from './components/TicketingPriceContext';



function App() {
  const [activeSessions, setActiveSessions] = useState(() => {
    // Retrieve the sessions from localStorage if available
    const savedSessions = localStorage.getItem('activeSessions');
    return savedSessions ? JSON.parse(savedSessions) : [];
  });
 

  useEffect(() => {
    // Store the sessions in localStorage whenever it changes
    localStorage.setItem('activeSessions', JSON.stringify(activeSessions));
  }, [activeSessions]);
  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentTime = new Date().toISOString();

      // Filter out sessions that have passed their end time
      const updatedSessions = activeSessions.filter(session => session.endTime > currentTime);

      if (updatedSessions.length !== activeSessions.length) {
        setActiveSessions(updatedSessions);
      }
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [activeSessions]);




 

  return (
    <TicketingPriceProvider>
    <Router>
      <div className="App">
      
          <>
            <Sidebar />
            <hr />
            <div className="content">
              <Routes>
                <Route path="/" element={<Dashboard activeSessions={activeSessions} setActiveSessions={setActiveSessions} />} />
                <Route path="/active-session" element={<ActiveSession activeSessions={activeSessions} />} />
                <Route path="/tickets-price" element={<TicketsPrice />} />
                <Route path="/balance-sheet" element={<BalanceSheet />} />
                <Route path="/support" element={<Support />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </>
      </div>
    </Router>
    </TicketingPriceProvider>
  );
}

export default App;
