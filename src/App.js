import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import ActiveSession from "./components/ActiveSession";
import TicketsPrice from "./components/TicketsPrice";
import BalanceSheet from "./components/BalanceSheet";
import Support from "./components/Support";
import { TicketingPriceProvider } from "./components/TicketingPriceContext";


function App() {
  const [activeSessions, setActiveSessions] = useState(() => {
    // Retrieve the sessions from localStorage if available
    const savedSessions = localStorage.getItem("activeSessions");
    return savedSessions ? JSON.parse(savedSessions) : [];
  });

  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 1024); // 1024px breakpoint
    };

    // Check on mount
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    // Store the sessions in localStorage whenever it changes
    localStorage.setItem("activeSessions", JSON.stringify(activeSessions));
  }, [activeSessions]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentTime = new Date().toISOString();

      // Filter out sessions that have passed their end time
      const updatedSessions = activeSessions.filter(
        (session) => session.endTime > currentTime
      );

      if (updatedSessions.length !== activeSessions.length) {
        setActiveSessions(updatedSessions);
      }
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [activeSessions]);

  // Show small screen message if screen is too small
  if (isSmallScreen) {
    return (
      <div className="small-screen-container">
        <div className="small-screen-message">
          <div className="icon">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="2"
                y="4"
                width="20"
                height="12"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
              />
              <rect
                x="8"
                y="18"
                width="8"
                height="2"
                rx="1"
                fill="currentColor"
              />
              <path d="M12 20v-2" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <h1>Desktop Required</h1>
          <p>
            This application is optimized for desktop use and requires a larger
            screen.
          </p>
          <p>
            Please access this application from a PC or laptop with a screen
            width of at least 1024px.
          </p>
          <div className="current-resolution">
            Current screen width: {window.innerWidth}px
          </div>
        </div>
      </div>
    );
  }

  return (
    <TicketingPriceProvider>
      <Router>
        <div className="App">
          <>
            <Sidebar />
            <hr />
            <div className="content">
              <Routes>
                <Route
                  path="/"
                  element={
                    <Dashboard
                      activeSessions={activeSessions}
                      setActiveSessions={setActiveSessions}
                    />
                  }
                />
                <Route
                  path="/active-session"
                  element={<ActiveSession activeSessions={activeSessions} />}
                />
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
