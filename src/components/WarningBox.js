// components/WarningBox.js
import React, { useEffect, useState } from 'react';

const WarningBox = ({ activeSessions }) => {
  const [warningSessions, setWarningSessions] = useState([]);

  useEffect(() => {
    const checkWarningSessions = () => {
      const currentTime = new Date();
      const warningList = activeSessions.filter(session => {
        const endTime = new Date(session.endTime); // Parse ISO format to Date object
        const timeDiff = endTime - currentTime;
        return timeDiff > 0 && timeDiff <= 0.5 * 60 * 1000; // 5 minutes in milliseconds
      });

      setWarningSessions(warningList);

      // Call out names for new warning sessions
      warningList.forEach(session => {
        if (!warningSessions.find(ws => ws.name === session.name)) {
          speakName(session.name);
        }
      });
    };

    const intervalId = setInterval(checkWarningSessions, 1000); // Check every 1 seconds

    return () => clearInterval(intervalId);
  }, [activeSessions, warningSessions]);

  const speakName = (name) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`${name}, your session is ending in 30 seconds`);

      // Wait for voices to be loaded
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        const naturalVoice = voices.find(voice => voice.name.includes('Google UK English Female') || voice.name.includes('Google US English'));
        if (naturalVoice) {
          utterance.voice = naturalVoice;
        }
        window.speechSynthesis.speak(utterance);
      };

      // If voices are already loaded, speak immediately
      if (window.speechSynthesis.getVoices().length > 0) {
        loadVoices();
      } else {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  };

  window.speechSynthesis.getVoices().forEach(v => console.log(v.name));

  return (
    <div className="warning-box overflow-y">
      <h3 className='section-heading'>30 Seconds warning</h3>
      {warningSessions.length > 0 ? (
        warningSessions.map((session, index) => (
          <div key={index} className='warning-block'>
            <p>Name: {session.name}</p>
            <p>End Time: {new Date(session.endTime).toLocaleTimeString()}</p>
          </div>
        ))
      ) : (
        <p>No sessions ending soon</p>
      )}
    </div>
  );
};

export default WarningBox;