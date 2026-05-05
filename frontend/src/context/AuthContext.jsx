import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  /**
   * Login user
   */
  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { data } = response.data;

      setUser(data);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));

      return { success: true, data };
    } catch (error) {
      const body = error.response?.data;
      const msg =
        body?.message ||
        body?.errors?.[0]?.msg ||
        error.message ||
        'Login failed';
      return { success: false, error: msg };
    }
  };

  /**
   * Register user
   */
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { data } = response.data;

      setUser(data);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));

      return { success: true, data };
    } catch (error) {
      const body = error.response?.data;
      const message =
        body?.message ||
        body?.errors?.[0]?.msg ||
        error.message ||
        'Registration failed';
      const errors = body?.errors;
      return { success: false, error: message, errors };
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  /**
   * Update user data
   */
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
