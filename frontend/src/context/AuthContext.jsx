import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('lang') || 'en');

  // Set default axios header if token exists
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      
      // In a real app, you would fetch user details here using the token
      // For now, we rely on the payload stored during login/register
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
            setUser(JSON.parse(storedUser));
        } catch (e) {
            setUser(null);
        }
      }
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    localStorage.setItem('lang', currentLang);
  }, [currentLang]);

  const login = async (username, password) => {
    try {
      const res = await api.post('/api/auth/login', { username, password });
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return true;
    } catch (error) {
      console.error('Login error', error);
      throw error;
    }
  };

  const register = async (username, email, password, age, grade) => {
    try {
      const res = await api.post('/api/auth/register', { username, email, password, age, grade });
      // Set user and token from register response directly
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return true;
    } catch (error) {
      console.error('Register error', error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const upgrade = async () => {
    if (!user) return;
    try {
      const res = await api.post('/api/auth/upgrade', { username: user.username });
      const updatedUser = res.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return true;
    } catch (error) {
       console.error('Upgrade error', error);
       throw error;
    }
  }

  const updateProfile = async (age, grade) => {
    if (!user) return;
    try {
      const res = await api.put('/api/auth/profile', { username: user.username, age, grade });
      const updatedUser = res.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return true;
    } catch (error) {
       console.error('Profile update error', error);
       throw error;
    }
  }

  const saveProgress = async (scripture, chapter_number, verse_id, question, response) => {
    if (!user) return;
    try {
      await api.post('/api/journal', { 
        username: user.username, 
        scripture, 
        chapter_number, 
        verse_id, 
        question, 
        response
      });
      return true;
    } catch (error) {
      console.error('Failed to save progress', error);
      throw error;
    }
  }

  const value = {
    user,
    token,
    login,
    register,
    logout,
    upgrade,
    updateProfile,
    saveProgress,
    loading,
    currentLang,
    setCurrentLang
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
