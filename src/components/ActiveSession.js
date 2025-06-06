import React from "react";

const ActiveSession = ({ activeSessions }) => {
  console.log(activeSessions); // Check if the data is received correctly

  return (
    <div className="active-sessions page-overflow overflow-y">
      <h2 className="section-heading">Active Sessions</h2>
      <table className="">
        <thead>
          <tr>
            <th>Name</th>
            <th>People</th>
            <th>Start Time</th>
            <th>End Time</th>
          </tr>
        </thead>
        <tbody>
          {activeSessions && activeSessions.length > 0 ? (
            activeSessions.map((session, index) => (
              <tr key={index}>
                <td>{session.name}</td>
                <td>{session.people}</td>
                <td>
                  {new Date(session.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td>
                  {new Date(session.endTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No active sessions available.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ActiveSession;
