import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate(); // Initialize navigate

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/'); // Redirect to home page
  };

  return (
    <div className="login-container">
      <div className="left-panel">
        <h1> Skate Pass System</h1>
        <p className="fun-text">Your gateway to seamless skating access!</p>
        <div className="credentials-hint">
         
        </div>
        <p className="support">Need help? Contact <b>Bluebug Software</b>:</p>
        <p>Email: support@bluebugsoft.com</p>
        <p>Phone: 9829303050</p>
      </div>

      <div className="right-panel">
        <div className="form-card">
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="show-password">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              <label htmlFor="showPassword">Show Password</label>
            </div>
            <button type="submit">Let’s Go!</button>
          </form>
          
        </div>
      </div>
    </div>
  );
};

export default Login;
