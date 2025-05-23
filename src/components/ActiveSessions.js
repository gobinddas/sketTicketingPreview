import React, { useEffect } from 'react';

const ActiveSessions = ({ activeSessions, setActiveSessions }) => {

  // Load sessions from localStorage on component mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('activeSessions');
    if (savedSessions) {
      setActiveSessions(JSON.parse(savedSessions));
    }
  }, [setActiveSessions]);

  // Save sessions to localStorage whenever activeSessions changes
  useEffect(() => {
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
    }, 60000); // Check every 1 minute

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, [activeSessions, setActiveSessions]);

  return (
    <div className="active-sessions box-white overflow-y">
      <h2 className='section-heading'>Active Sessions </h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>People</th>
            <th>Start Time</th>
            <th>End Time</th>
          </tr>
        </thead>
        <tbody>
          {activeSessions.map((session, index) => (
            <tr key={index}>
              <td>{session.name}</td>
              <td>{session.people}</td>
              <td>{new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
              <td>{new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActiveSessions;
