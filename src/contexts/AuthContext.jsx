/**
 * Authentication Context
 * Uses Supabase client-side auth for all operations.
 * Exposes both the "supabase style" (signUp / session) used by LoginPage
 * and the "register/login" aliases used by AuthModal.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);


  // Fetch role from profiles table
  const fetchUserRole = useCallback(async (userId) => {
    if (!userId) return null;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      const role = data?.role ?? null;
      setUserRole(role);
      return role;
    } catch {
      return null;
    }
  }, []);

  // Bootstrap: restore session from Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchUserRole(s.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchUserRole(s.user.id); else setUserRole(null);
      setLoading(false);

      if (s?.access_token) {
        localStorage.setItem('access_token', s.access_token);
        localStorage.setItem('refresh_token', s.refresh_token ?? '');
        localStorage.setItem('user', JSON.stringify(s.user));
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserRole]);

  // ── Helpers ────────────────────────────────────────────────────────
  const clearError = () => setError(null);

  // getAccessToken — returns the live JWT from the Supabase session
  const getAccessToken = () =>
    session?.access_token ?? localStorage.getItem('access_token') ?? null;

  // ── signUp (Supabase style — LoginPage uses this) ──────────────────
  const signUp = async (email, password, fullName = '') => {
    setError(null);
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        // emailRedirectTo: window.location.origin   ← uncomment if you want custom redirect
      },
    });
    if (err) { setError(err.message); return { error: err }; }
    return { data, error: null };
  };

  // ── register (alias used by AuthModal) ────────────────────────────
  const register = async (email, password, fullName = '', _company = null) => {
    setError(null);
    setLoading(true);
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (err) { setError(err.message); return { success: false, error: err.message }; }
    return { success: true, data };
  };

  // ── login (Supabase style — AuthModal + LoginPage) ─────────────────
  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) { setError(err.message); return { success: false, error: err.message }; }
    return { success: true, data };
  };

  // ── signInWithGoogle ──────────────────────────────────────────────
  const signInWithGoogle = async () => {
    setError(null);
    const { data, error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/chat' },
    });
    if (err) { setError(err.message); return { error: err }; }
    return { data, error: null };
  };

  // ── logout ────────────────────────────────────────────────────────
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  // ── fetchUserInfo (kept for backward compat with other components) ─
  const fetchUserInfo = () => user;

  // ── authenticatedFetch (for backend API calls) ────────────────────
  const authenticatedFetch = async (url, options = {}) => {
    const token = getAccessToken();
    const fullUrl = url.startsWith('http') ? url
      : (process.env.REACT_APP_API_URL || 'http://localhost:10000') + url;

    const config = {
      ...options,
      headers: {
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
    return fetch(fullUrl, config);
  };

  const value = {
    // state
    user,
    session,
    loading,
    error,
    userRole,
    isAuthenticated: !!session,

    // auth actions
    signUp,
    register,
    login,
    logout,
    signInWithGoogle,

    // helpers
    fetchUserInfo,
    fetchUserRole,
    authenticatedFetch,
    getAccessToken,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;