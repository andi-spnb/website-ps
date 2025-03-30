import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkLoggedIn = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/auth/me');
          setCurrentUser(response.data.staff);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          setCurrentUser(null);
        }
      }
      
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = async (username, password) => {
    try {
      setError(null);
      console.log("Attempting login:", username);
      
      const response = await api.post('/auth/login', { username, password });
      console.log("Login response:", response.data);
      
      const { token, staff } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setCurrentUser(staff);
      return staff;
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = error.response?.data?.message || 'Login gagal';
      setError(errorMsg);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setCurrentUser(null);
  };

  const updateProfile = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};