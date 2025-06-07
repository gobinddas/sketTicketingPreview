// components/WarningBox.js
import React, { useEffect, useState, useRef } from "react";

const WarningBox = ({ activeSessions }) => {
  const [warningSessions, setWarningSessions] = useState([]);
  const [debugInfo, setDebugInfo] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const spokenNamesRef = useRef(new Set()); // Track which names we've already spoken
  const currentAudioRef = useRef(null); // Track current audio element

  // Replace this with your actual Cloudflare Worker URL
  const WORKER_URL = "https://melotts-speech-service.anishkarkee45.workers.dev";

  useEffect(() => {
    const checkWarningSessions = () => {
      const currentTime = new Date();
      const warningList = activeSessions.filter((session) => {
        const endTime = new Date(session.endTime);
        const timeDiff = endTime - currentTime;
        return timeDiff > 0 && timeDiff <= 30 * 1000; // 30 seconds
      });

      setWarningSessions(warningList);

      // Check for new sessions that need speech alerts
      warningList.forEach((session) => {
        const sessionKey = `${session.name}-${session.endTime}`; // Unique key per session
        if (!spokenNamesRef.current.has(sessionKey)) {
          spokenNamesRef.current.add(sessionKey);
          speakNameWithMeloTTS(session.name);
          setDebugInfo(
            (prev) =>
              prev +
              `\nTrying to speak: ${
                session.name
              } at ${new Date().toLocaleTimeString()}`
          );
        }
      });

      // Clean up old spoken names (sessions that are no longer in warning list)
      const currentSessionKeys = new Set(
        warningList.map((s) => `${s.name}-${s.endTime}`)
      );
      spokenNamesRef.current.forEach((key) => {
        if (!currentSessionKeys.has(key)) {
          spokenNamesRef.current.delete(key);
        }
      });
    };

    const intervalId = setInterval(checkWarningSessions, 1000);
    checkWarningSessions(); // Run immediately

    return () => clearInterval(intervalId);
  }, [activeSessions]);

  const speakNameWithMeloTTS = async (name) => {
    try {
      setDebugInfo((prev) => prev + `\nMeloTTS speech attempt for: ${name}`);
      setIsPlaying(true);

      // Stop any currently playing audio
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }

      const text = `${name}, your session is ending in 30 seconds`;

      setDebugInfo((prev) => prev + `\nSending request to MeloTTS...`);

      // Call Cloudflare Worker
      const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          language: "en",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Unknown error");
      }

      setDebugInfo((prev) => prev + `\nReceived audio data, playing...`);

      // Convert base64 to blob and create audio URL
      const audioBlob = base64ToBlob(data.audio, "audio/mpeg");
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and play audio element
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      audio.onloadstart = () => {
        setDebugInfo((prev) => prev + `\nAudio loading started for: ${name}`);
      };

      audio.oncanplay = () => {
        setDebugInfo((prev) => prev + `\nAudio ready to play for: ${name}`);
      };

      audio.onplay = () => {
        setDebugInfo((prev) => prev + `\nAudio started playing for: ${name}`);
      };

      audio.onended = () => {
        setDebugInfo((prev) => prev + `\nAudio finished playing for: ${name}`);
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl); // Clean up blob URL
        currentAudioRef.current = null;
      };

      audio.onerror = (event) => {
        setDebugInfo(
          (prev) => prev + `\nAudio playback error for ${name}: ${event.error}`
        );
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
      };

      await audio.play();
    } catch (error) {
      setDebugInfo(
        (prev) => prev + `\nError in MeloTTS speech: ${error.message}`
      );
      setIsPlaying(false);
      console.error("MeloTTS Error:", error);
    }
  };

  // Helper function to convert base64 to blob
  const base64ToBlob = (base64, mimeType) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  // Test speech function (for debugging)
  const testMeloTTS = () => {
    speakNameWithMeloTTS("Test User");
  };

  // Clear debug info
  const clearDebug = () => {
    setDebugInfo("");
  };

  // Stop current audio
  const stopAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
      setIsPlaying(false);
      setDebugInfo((prev) => prev + `\nAudio stopped manually`);
    }
  };

  return (
    <div className="warning-box overflow-y">
      <h3 className="section-heading">30 Seconds Warning</h3>

      {warningSessions.length > 0 ? (
        warningSessions.map((session, index) => (
          <div key={index} className="warning-block">
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
