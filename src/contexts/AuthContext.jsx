/**
 * Authentication Context and Provider
 * Manages user authentication state and token management
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_CONFIG } from '../utils/constants';

const API_URL = APP_CONFIG.API_URL || 'http://localhost:10000';
const AuthContext = createContext(null);
console.log('AuthContext initialized with API URL:', API_URL); // Debug log to verify API URL

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Token management
  const getAccessToken = () => localStorage.getItem('access_token');
  const getRefreshToken = () => localStorage.getItem('refresh_token');
  
  const setTokens = (accessToken, refreshToken) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  };

  const clearTokens = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Optionally verify token is still valid
          await fetchUserInfo();
        } catch (err) {
          console.error('Auth initialization failed:', err);
          clearTokens();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Fetch current user info
  const fetchUserInfo = async () => {
    try {
       const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      } else if (response.status === 401) {
        // Token expired, try to refresh
        await refreshAccessToken();
      }
    } catch (err) {
      console.error('Failed to fetch user info:', err);
      throw err;
    }
  };

  // Refresh access token
  const refreshAccessToken = async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (response.ok) {
        const { access_token } = await response.json();
        localStorage.setItem('access_token', access_token);
        return access_token;
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (err) {
      clearTokens();
      setUser(null);
      navigate('/');
      throw err;
    }
  };

  // Register new user
  const register = async (email, password, fullName, company = null) => {
    setError(null);
    setLoading(true);

    try {
     // const response = await fetch('http://localhost:10000/api/auth/register', {
        const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          company
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      // Store tokens
      setTokens(data.access_token, data.refresh_token);
      
      // Fetch user info
      await fetchUserInfo();
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    setError(null);
    setLoading(true);

    try {
      //const response = await fetch('http://localhost:10000/api/auth/login', {
        const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      // Store tokens
      setTokens(data.access_token, data.refresh_token);
      
      // Fetch user info
      await fetchUserInfo();
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    console.log('🔴 Logout initiated from AuthContext');
    console.log('Access Token:', getAccessToken());
    console.log('Refresh Token:', getRefreshToken());
    try {
      const refreshToken = getRefreshToken();
      console.log('Logging out with refresh token:', refreshToken);
      if (refreshToken) {
        console.log('📤 Sending logout request to backend...');
        //const response = await fetch('http://localhost:10000/api/auth/logout', {
          const response = await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
          },
          body: JSON.stringify({ refresh_token: refreshToken })
        });
         if (response.ok) {
        console.log('✅ Backend logout successful');
      } else {
        console.warn('⚠️ Backend logout failed:', await response.text());
      }
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearTokens();
      setUser(null);
      navigate('/');
    }
  };

  // API call helper with automatic token refresh
  const authenticatedFetch = async (url, options = {}) => {
    const token = getAccessToken();
    
    const config = {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    };

    let response = await fetch(url, config);
     console.log('API call to', url, 'response status:', response.status);
    // If unauthorized, try refreshing token
    if (response.status === 401) {
      try {
        const newToken = await refreshAccessToken();
        config.headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, config);
      } catch (err) {
        logout();
        throw new Error('Session expired. Please login again.');
      }
    }

    return response;
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    fetchUserInfo,
    authenticatedFetch,
    isAuthenticated: !!user,
    clearError: () => setError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;