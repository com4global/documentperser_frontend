import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../Styles/AdminDashboard.css'; 
import '../Styles/Auth.css';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    
    // MOCK LOGIN: In production, use axios.post here
    if (email && password) {
      const mockUser = { email, role: 'admin', token: 'fake-jwt-token' };
      onLogin(mockUser);
      navigate('/chat'); // Redirect to Chat after success
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-card">
        <h2>Welcome Back</h2>
        <p>Sign in to continue to Chat</p>
        <form onSubmit={handleLoginSubmit}>
          <input 
            type="email" placeholder="Email Address" required 
            value={email} onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" placeholder="Password" required 
            value={password} onChange={(e) => setPassword(e.target.value)} 
          />
          <button type="submit" className="primary-btn">Login</button>
        </form>
        <p className="auth-footer">
          New here? <Link to="/signup">Create account</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;