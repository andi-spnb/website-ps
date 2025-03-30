import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const ShiftContext = createContext();

export const useShift = () => useContext(ShiftContext);

export const ShiftProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [currentShift, setCurrentShift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkActiveShift = async () => {
    if (!currentUser) {
      setCurrentShift(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.get('/shifts/active');
      setCurrentShift(response.data.shift || null);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch active shift:', error);
      setError(error.response?.data?.message || 'Gagal memuat data shift');
      setCurrentShift(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      checkActiveShift();
    } else {
      setCurrentShift(null);
      setLoading(false);
    }
  }, [currentUser]);

  const startShift = async (openingBalance) => {
    try {
      setError(null);
      const response = await api.post('/shifts/start', { opening_balance: openingBalance });
      setCurrentShift(response.data.shift);
      return response.data.shift;
    } catch (error) {
      setError(error.response?.data?.message || 'Gagal memulai shift');
      throw error;
    }
  };

  const endShift = async (closingBalance, notes) => {
    if (!currentShift) return;
    
    try {
      setError(null);
      const response = await api.post(`/shifts/${currentShift.shift_id}/end`, {
        closing_balance: closingBalance,
        notes
      });
      setCurrentShift(null);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Gagal mengakhiri shift');
      throw error;
    }
  };

  const value = {
    currentShift,
    loading,
    error,
    startShift,
    endShift,
    checkActiveShift // Export this function to allow manual refresh
  };

  return (
    <ShiftContext.Provider value={value}>
      {children}
    </ShiftContext.Provider>
  );
};