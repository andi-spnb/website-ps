import React, { useState, useEffect } from 'react';
import { Monitor, Clock, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const ActiveSessionsCard = () => {
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timer, setTimer] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch active sessions
  const fetchActiveSessions = async () => {
    try {
      setRefreshing(true);
      const response = await api.get('/rentals/active');
      setActiveSessions(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching active sessions:', err);
      setError('Gagal memuat data sesi aktif. Silakan coba lagi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActiveSessions();
  }, []);

  // Update remaining time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
      
      // Update remaining time calculations
      setActiveSessions(prevSessions => 
        prevSessions.map(session => {
          const now = new Date();
          const endTime = new Date(session.end_time);
          const remainingMs = endTime - now;
          
          let remaining = {
            hours: 0,
            minutes: 0,
            seconds: 0,
            total_seconds: 0,
            is_overdue: false
          };
          
          if (remainingMs > 0) {
            remaining.hours = Math.floor(remainingMs / (1000 * 60 * 60));
            remaining.minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
            remaining.seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
            remaining.total_seconds = Math.floor(remainingMs / 1000);
          } else {
            remaining.is_overdue = true;
          }
          
          return {
            ...session,
            remaining
          };
        })
      );
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 shadow border border-gray-700 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-10 bg-gray-700 rounded"></div>
          <div className="h-10 bg-gray-700 rounded"></div>
          <div className="h-10 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Monitor className="mr-2" size={20} />
          PlayStation Aktif
        </h3>
        <div className="flex items-center gap-2">
          <span className="bg-blue-600 text-xs rounded-full px-2 py-1">
            {activeSessions.length} Sesi
          </span>
          <button 
            onClick={fetchActiveSessions} 
            disabled={refreshing}
            className="p-1 rounded-full hover:bg-gray-700"
            title="Refresh"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900 bg-opacity-50 border border-red-800 rounded-lg text-sm text-red-200">
          {error}
          <button 
            onClick={fetchActiveSessions}
            className="ml-2 underline"
          >
            Coba lagi
          </button>
        </div>
      )}
      
      {activeSessions.length === 0 && !error ? (
        <div className="text-center py-6 text-gray-400">
          <Monitor size={36} className="mx-auto mb-3 opacity-30" />
          <p>Tidak ada sesi PlayStation aktif</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeSessions.map(session => (
            <div 
              key={session.session_id} 
              className={`bg-gray-700 rounded-lg p-3 border ${
                session.remaining?.total_seconds < 900 && !session.remaining?.is_overdue
                  ? 'border-yellow-500' 
                  : session.remaining?.is_overdue 
                    ? 'border-red-500' 
                    : 'border-green-500'
              }`}
            >
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">{session.Device?.device_name}</div>
                  <div className="text-sm text-gray-400">{session.Device?.device_type}</div>
                </div>
                <div className="text-right">
                  <div className={`flex items-center ${
                    session.remaining?.total_seconds < 900 && !session.remaining?.is_overdue
                      ? 'text-yellow-500' 
                      : session.remaining?.is_overdue 
                        ? 'text-red-500' 
                        : 'text-green-500'
                  }`}>
                    <Clock size={16} className="mr-1" />
                    {session.remaining?.is_overdue 
                      ? 'Waktu Habis' 
                      : `${String(session.remaining?.hours).padStart(2, '0')}:${
                          String(session.remaining?.minutes).padStart(2, '0')}:${
                          String(session.remaining?.seconds).padStart(2, '0')}`
                    }
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(session.start_time).toLocaleTimeString()} - {new Date(session.end_time).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveSessionsCard;