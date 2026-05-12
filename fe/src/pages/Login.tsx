import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {

    e.preventDefault()
    try {
      const res = await axios.post('http://localhost:3001/api/v1/signin', { username, password });

      console.log(res.data.token);
      // If the server returns a token, the login was successful
      if (res.data.token) {
        // Store the JWT token in localStorage so it persists across page reloads
        // "Bearer " prefix is the standard format for Authorization headers
        localStorage.setItem('token', 'Bearer ' + res.data.token);
        // Redirect the user to the dashboard page
        navigate('/dashboard');
      }
    } catch (err: any) {
      // If the request fails, display the server's error message (or a fallback)
      setError(err.response?.data?.message || 'Error logging in');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Log in to access your Second Brain</p>
        {
          error && (
            <div style={{ color: "red", marginBottom: "16px", fontSize: "14px", textAlign: 'center' }}>
              {error}
            </div>
          )
        }
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              placeholder="johndoe"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary auth-btn">Log In</button>
        </form>
        <Link to="/register" className="auth-link">
          Don't have an account? <span>Sign up</span>
        </Link>
      </div>
    </div>
  );
}
