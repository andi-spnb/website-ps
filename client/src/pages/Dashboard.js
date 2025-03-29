import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useShift } from '../contexts/ShiftContext';
import { toast } from 'react-toastify';

// Components
import ActiveSessionsCard from '../components/dashboard/ActiveSessionsCard';
import DeviceStatusCard from '../components/dashboard/DeviceStatusCard';
import SalesStatsCard from '../components/dashboard/SalesStatsCard';
import RecentTransactionsCard from '../components/dashboard/RecentTransactionsCard';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { currentShift, loading: shiftLoading, checkActiveShift } = useShift();
  const navigate = useNavigate();

  // Check for active shift when component mounts
  useEffect(() => {
    const checkShift = async () => {
      try {
        await checkActiveShift();
      } catch (error) {
        console.error("Error checking shift:", error);
      }
    };
    
    checkShift();
  }, []);

  // Show warning if no active shift
  useEffect(() => {
    if (!shiftLoading && !currentShift && currentUser) {
      toast.warning('Anda belum memulai shift. Silakan mulai shift terlebih dahulu.');
    }
  }, [currentShift, shiftLoading, currentUser]);

  // Redirect to shift page if needed
  const handleStartShift = () => {
    navigate('/shift');
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-400">
          Selamat datang, {currentUser?.name}. Berikut adalah ringkasan operasional Kenzie Gaming.
        </p>
      </div>
      
      {!currentShift && !shiftLoading && (
        <div className="mb-6 p-4 bg-yellow-900 bg-opacity-50 border border-yellow-700 rounded-lg">
          <p className="text-yellow-200 mb-2">Anda belum memulai shift. Sesi kerja belum dimulai.</p>
          <button 
            onClick={handleStartShift}
            className="px-4 py-2 bg-yellow-700 hover:bg-yellow-600 rounded-lg text-sm"
          >
            Mulai Shift Sekarang
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActiveSessionsCard />
        </div>
        <div>
          <SalesStatsCard />
        </div>
        <div>
          <DeviceStatusCard />
        </div>
        <div className="lg:col-span-2">
          <RecentTransactionsCard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;