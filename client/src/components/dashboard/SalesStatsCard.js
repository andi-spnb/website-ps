import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';
import api from '../../services/api';

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

  useEffect(() => {
    const fetchSalesStats = async () => {
      try {
        // This would be a real API call to get sales stats
        const response = await api.get('/reports/daily-sales');
        setStats(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching sales stats:', err);
        
        // For demo purposes, we'll set mock data
        setStats({
          todaySales: 1250000,
          todayRentalSales: 850000,
          todayFoodSales: 400000,
          yesterday: 980000,
          percentChange: 27.55
        });
      } finally {
        setLoading(false);
      }
    };

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
      <h3 className="text-lg font-semibold flex items-center mb-4">
        <DollarSign className="mr-2" size={20} />
        Penjualan Hari Ini
      </h3>
      
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