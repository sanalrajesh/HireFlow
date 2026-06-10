import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Load user profile on startup if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await API.get('/auth/profile');
        setUser(res.data);
      } catch (err) {
        console.error('Failed to load user profile:', err.message);
        logout(); // clear invalid/expired tokens
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      const { token: receivedToken, ...userData } = res.data;
      
      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      console.error('Login error:', err.response?.data?.message || err.message);
      return {
        success: false,
        message: err.response?.data?.message || 'Invalid credentials',
      };
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (fullName, email, password, role) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/register', {
        fullName,
        email,
        password,
        role,
      });
      const { token: receivedToken, ...userData } = res.data;
      
      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      console.error('Registration error:', err.response?.data?.message || err.message);
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed',
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      // Call backend logout endpoint optionally
      await API.post('/auth/logout');
    } catch (err) {
      console.warn('Backend logout failed or not supported:', err.message);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
