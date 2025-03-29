import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const SalesStatsCard = () => {
  const [stats, setStats] = useState({
    todaySales: 0,
    todayRentalSales: 0,
    todayFoodSales: 0,
    yesterday: 0,
    percentChange: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSalesStats = async () => {
    try {
      setRefreshing(true);
      const response = await api.get('/reports/daily-sales');
      setStats(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching sales stats:', err);
      setError('Gagal memuat data penjualan. Silakan coba lagi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSalesStats();
  }, []);

  const formatCurrency = (amount) => {
    return `Rp${amount.toLocaleString('id-ID')}`;
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 shadow border border-gray-700 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gray-700 rounded mb-3"></div>
        <div className="h-5 bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <DollarSign className="mr-2" size={20} />
          Penjualan Hari Ini
        </h3>
        <button 
          onClick={fetchSalesStats} 
          disabled={refreshing}
          className="p-1 rounded-full hover:bg-gray-700"
          title="Refresh"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900 bg-opacity-50 border border-red-800 rounded-lg text-sm text-red-200">
          {error}
          <button 
            onClick={fetchSalesStats}
            className="ml-2 underline"
          >
            Coba lagi
          </button>
        </div>
      )}
      
      <div className="text-3xl font-bold mb-1">
        {formatCurrency(stats.todaySales)}
      </div>
      
      <div className={`flex items-center text-sm ${
        stats.percentChange >= 0 ? 'text-green-500' : 'text-red-500'
      }`}>
        <TrendingUp size={16} className="mr-1" />
        <span>{stats.percentChange}% dari kemarin</span>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-sm text-gray-400">Rental PS</div>
          <div className="font-semibold">{formatCurrency(stats.todayRentalSales)}</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="text-sm text-gray-400">Makanan & Minuman</div>
          <div className="font-semibold">{formatCurrency(stats.todayFoodSales)}</div>
        </div>
      </div>
    </div>
  );
};

export default SalesStatsCard;