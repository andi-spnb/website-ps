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
  const { currentShift, loading: shiftLoading } = useShift();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if shift is active
    if (!shiftLoading && !currentShift) {
      toast.warning('Anda belum memulai shift. Silakan mulai shift terlebih dahulu.');
      navigate('/shift');
    }
  }, [currentShift, shiftLoading, navigate]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-400">
          Selamat datang, {currentUser?.name}. Berikut adalah ringkasan operasional Kenzie Gaming.
        </p>
      </div>
      
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