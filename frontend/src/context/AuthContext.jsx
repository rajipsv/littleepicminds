import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('lang') || 'en');

  const applySession = useCallback((nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    if (nextToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${nextToken}`;
      localStorage.setItem('token', nextToken);
      localStorage.setItem('user', JSON.stringify(nextUser));
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return null;
    try {
      const res = await api.get('/api/auth/me');
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      return res.data;
    } catch {
      applySession(null, null);
      return null;
    }
  }, [token, applySession]);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      }
      refreshUser().finally(() => setLoading(false));
    } else {
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  }, [token, refreshUser]);

  useEffect(() => {
    localStorage.setItem('lang', currentLang);
  }, [currentLang]);

  const login = async (identifier, password) => {
    const id = String(identifier || '').trim();
    const body = id.includes('@') ? { email: id, password } : { username: id, password };
    const res = await api.post('/api/auth/login', body);
    applySession(res.data.token, res.data.user);
    return true;
  };

  const register = async (username, email, password, age, grade, mobile) => {
    const res = await api.post('/api/auth/register', { username, email, password, age, grade, mobile });
    applySession(res.data.token, res.data.user);
    return true;
  };

  const logout = () => {
    applySession(null, null);
  };

  const upgrade = async () => {
    if (!user) return;
    const res = await api.post('/api/auth/upgrade');
    const updatedUser = res.data;
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return true;
  };

  const updateProfile = async (age, grade, name, level) => {
    if (!user) return;
    const payload = {};
    if (level !== undefined) {
      payload.level = level;
    } else {
      payload.name = name ?? user.name ?? null;
      payload.age = age !== '' && age !== undefined ? parseInt(age, 10) : null;
      payload.grade = grade || null;
    }
    const res = await api.put('/api/auth/profile', payload);
    setUser((prev) => ({ ...prev, ...res.data }));
    localStorage.setItem('user', JSON.stringify({ ...user, ...res.data }));
    return true;
  };

  const changePassword = async (currentPassword, newPassword) => {
    await api.post('/api/auth/change-password', { currentPassword, newPassword });
    return true;
  };

  const saveProgress = async (scripture, chapter_number, verse_id, question, response) => {
    if (!user) return;
    await api.post('/api/journal', {
      scripture,
      chapter_number,
      verse_id,
      question,
      response,
    });
    return true;
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    upgrade,
    updateProfile,
    changePassword,
    refreshUser,
    saveProgress,
    loading,
    currentLang,
    setCurrentLang,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
