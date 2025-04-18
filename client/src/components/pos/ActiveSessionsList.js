// File: client/src/components/pos/ActiveSessionsList.js
import React, { useState, useEffect } from 'react';
import { Clock, User, Monitor, RefreshCw, AlertCircle, PlusCircle } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const ActiveSessionsList = ({ onExtendSession }) => {
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fungsi untuk mengambil daftar sesi aktif
  const fetchActiveSessions = async () => {
    try {
      setRefreshing(true);
      
      // Panggil endpoint untuk memeriksa sesi kedaluwarsa sebelum mengambil sesi aktif
      try {
        await api.post('/rentals/check-expired');
      } catch (checkError) {
        console.error('Error checking expired sessions:', checkError);
        // Lanjutkan meskipun ada error saat memeriksa sesi kedaluwarsa
      }
      
      const response = await api.get('/rentals/active');
      setActiveSessions(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching active sessions:', err);
      setError('Gagal memuat daftar sesi aktif');
      
      // Contoh data sesi aktif untuk demo jika API gagal
      setActiveSessions([
        {
          session_id: 1,
          Device: {
            device_id: 1,
            device_name: 'PS4 - 01',
            device_type: 'PS4'
          },
          User: null, // non-member
          Staff: { name: 'Admin' },
          start_time: new Date(Date.now() - 1000 * 60 * 30), // 30 menit yang lalu
          end_time: new Date(Date.now() + 1000 * 60 * 90), // 1.5 jam dari sekarang
          actual_end_time: null,
          status: 'Active',
          total_amount: 45000,
          payment_method: 'cash',
          payment_status: 'Paid',
          remaining: {
            hours: 1,
            minutes: 30,
            seconds: 0,
            total_seconds: 5400,
            is_overdue: false
          }
        },
        {
          session_id: 2,
          Device: {
            device_id: 2,
            device_name: 'PS5 - 01',
            device_type: 'PS5'
          },
          User: { name: 'Budi Santoso' },
          Staff: { name: 'Admin' },
          start_time: new Date(Date.now() - 1000 * 60 * 60), // 1 jam yang lalu
          end_time: new Date(Date.now() + 1000 * 60 * 60), // 1 jam dari sekarang
          actual_end_time: null,
          status: 'Active',
          total_amount: 60000,
          payment_method: 'cash',
          payment_status: 'Paid',
          remaining: {
            hours: 1,
            minutes: 0,
            seconds: 0,
            total_seconds: 3600,
            is_overdue: false
          }
        },
        {
          session_id: 3,
          Device: {
            device_id: 3,
            device_name: 'PS4 - 02',
            device_type: 'PS4'
          },
          User: null,
          Staff: { name: 'Admin' },
          start_time: new Date(Date.now() - 1000 * 60 * 70), // 70 menit yang lalu
          end_time: new Date(Date.now() - 1000 * 60 * 10), // 10 menit yang lalu
          actual_end_time: null,
          status: 'Active',
          total_amount: 45000,
          payment_method: 'cash',
          payment_status: 'Paid',
          remaining: {
            hours: 0,
            minutes: 0,
            seconds: 0,
            total_seconds: 0,
            is_overdue: true
          }
        }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Mengambil sesi aktif saat komponen dimuat
  useEffect(() => {
    fetchActiveSessions();
    
    // Polling untuk memperbarui waktu yang tersisa
    const interval = setInterval(() => {
      // Update sisa waktu secara lokal
      setActiveSessions(prevSessions => {
        if (!prevSessions.length) return prevSessions;
        
        return prevSessions.map(session => {
          const now = new Date();
          const endTime = new Date(session.end_time);
          const remainingMs = endTime - now;
          
          let remaining = { ...session.remaining };
          
          if (remainingMs > 0) {
            remaining.hours = Math.floor(remainingMs / (1000 * 60 * 60));
            remaining.minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
            remaining.seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
            remaining.total_seconds = Math.floor(remainingMs / 1000);
            remaining.is_overdue = false;
          } else {
            remaining.hours = 0;
            remaining.minutes = 0;
            remaining.seconds = 0;
            remaining.total_seconds = 0;
            remaining.is_overdue = true;
          }
          
          return { ...session, remaining };
        });
      });
    }, 1000);
    
    // Pembersihan interval ketika komponen di-unmount
    return () => clearInterval(interval);
  }, []);

  // Menangani perpanjangan sesi
  const handleExtend = (session) => {
    if (onExtendSession) {
      onExtendSession(session);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="h-20 bg-gray-700 rounded mb-2"></div>
        <div className="h-20 bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 bg-opacity-20 p-4 rounded-lg border border-red-500 mb-4">
        <div className="flex items-center text-red-500 mb-2">
          <AlertCircle size={18} className="mr-2" />
          <span className="font-medium">Error</span>
        </div>
        <p className="text-red-400">{error}</p>
        <button
          onClick={fetchActiveSessions}
          className="mt-2 px-3 py-1 bg-red-800 hover:bg-red-700 rounded text-sm"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Clock size={18} className="mr-2" />
          PlayStation Aktif
        </h3>
        <button
          onClick={fetchActiveSessions}
          className={`p-2 bg-gray-700 hover:bg-gray-600 rounded-lg ${refreshing ? 'animate-spin' : ''}`}
          disabled={refreshing}
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </div>
      
      {activeSessions.length === 0 ? (
        <div className="text-center py-6 text-gray-400">
          <Clock size={36} className="mx-auto mb-2 opacity-30" />
          <p>Tidak ada PlayStation yang aktif saat ini</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeSessions.map(session => (
            <div 
              key={session.session_id} 
              className={`bg-gray-700 rounded-lg p-3 border ${
                session.remaining.is_overdue 
                  ? 'border-red-500' 
                  : session.remaining.hours < 1
                    ? 'border-yellow-500'
                    : 'border-green-500'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium flex items-center">
                    <Monitor size={16} className="mr-1 text-blue-400" />
                    {session.Device?.device_name || 'PlayStation'}
                  </h4>
                  <div className="text-sm text-gray-400 flex items-center mt-1">
                    <User size={14} className="mr-1" />
                    {session.User ? session.User.name : 'Pelanggan Umum'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">Sisa Waktu:</div>
                  <div className={`font-bold ${
                    session.remaining.is_overdue 
                      ? 'text-red-500' 
                      : session.remaining.hours < 1
                        ? 'text-yellow-500'
                        : 'text-green-500'
                  }`}>
                    {session.remaining.is_overdue 
                      ? 'Waktu Habis' 
                      : `${String(session.remaining.hours).padStart(2, '0')}:${String(session.remaining.minutes).padStart(2, '0')}:${String(session.remaining.seconds).padStart(2, '0')}`}
                  </div>
                </div>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <div className="text-xs text-gray-400">
                  Mulai: {new Date(session.start_time).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}
                  {' | '}
                  Selesai: {new Date(session.end_time).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}
                </div>
                <button
                  onClick={() => handleExtend(session)}
                  className={`px-2 py-1 rounded text-xs flex items-center ${
                    session.remaining.is_overdue 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <PlusCircle size={14} className="mr-1" />
                  {session.remaining.is_overdue ? 'Tambah Jam Segera' : 'Tambah Jam'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveSessionsList;