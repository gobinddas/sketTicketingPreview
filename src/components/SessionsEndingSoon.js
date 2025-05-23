// SessionsEndingSoon.js
import React, { useEffect, useState } from 'react';

const SessionsEndingSoon = ({ activeSessions, setActiveSessions }) => {
  const [endingSoonSessions, setEndingSoonSessions] = useState([]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentTime = new Date().toISOString();
      const fifteenMinutesFromNow = new Date(Date.now() + 1 * 60 * 1000).toISOString();

      // Filter sessions that are ending within the next 15 minutes
      const soonToEndSessions = activeSessions.filter(session => session.endTime > currentTime && session.endTime <= fifteenMinutesFromNow);

      // Filter out expired sessions from the active sessions list
      const updatedActiveSessions = activeSessions.filter(session => session.endTime > currentTime);

      if (updatedActiveSessions.length !== activeSessions.length) {
        setActiveSessions(updatedActiveSessions);
        localStorage.setItem('activeSessions', JSON.stringify(updatedActiveSessions));
      }

      setEndingSoonSessions(soonToEndSessions);
    }, 6000); // Check every 1 minute

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, [activeSessions, setActiveSessions]);

  return (
    <div className="sessions-ending-soon box-white overflow-y">
      <h2 className='section-heading'>Sessions Ending In 1 minutes</h2>
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
          {endingSoonSessions.map((session, index) => (
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

export default SessionsEndingSoon;