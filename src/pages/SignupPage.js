import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../Styles/AdminDashboard.css';
import '../Styles/Auth.css';
const SignupPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic: Save to DB via axios.post(`${API_URL}/api/register`, formData)
    console.log("Registering:", formData);
    alert("Account created successfully! Please login.");
    navigate('/login');
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-card">
        <h2>Create Account</h2>
        <p>Join the Multimodal RAG Platform</p>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" placeholder="Full Name" required 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
          />
          <input 
            type="email" placeholder="Email Address" required 
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
          />
          <input 
            type="password" placeholder="Password" required 
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
          />
          <button type="submit" className="primary-btn">Sign Up</button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;