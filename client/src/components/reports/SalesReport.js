import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Download, Filter, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const SalesReport = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 6)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [groupBy, setGroupBy] = useState('day');

  const fetchSalesData = async () => {
    try {
      setRefreshing(true);
      const response = await api.get(`/reports/sales?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&groupBy=${groupBy}`);
      setSalesData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching sales data:', err);
      setError('Gagal memuat data penjualan. Silakan coba lagi.');
      toast.error('Gagal memuat data penjualan: ' + (err.response?.data?.message || 'Server error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [dateRange, groupBy]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGroupByChange = (e) => {
    setGroupBy(e.target.value);
  };

  const calculateTotals = () => {
    if (!salesData.length) return { totalRevenue: 0, totalRentalSales: 0, totalFoodSales: 0 };
    
    return salesData.reduce((acc, curr) => ({
      totalRevenue: acc.totalRevenue + curr.rentalSales + curr.foodSales,
      totalRentalSales: acc.totalRentalSales + curr.rentalSales,
      totalFoodSales: acc.totalFoodSales + curr.foodSales
    }), {
      totalRevenue: 0,
      totalRentalSales: 0,
      totalFoodSales: 0
    });
  };

  const { totalRevenue, totalRentalSales, totalFoodSales } = calculateTotals();

  const formatCurrency = (amount) => {
    return `Rp${amount.toLocaleString('id-ID')}`;
  };

  const exportToCSV = () => {
    const csvHeader = 'Tanggal,Pendapatan Rental,Pendapatan F&B,Total\n';
    const csvRows = salesData.map(row => {
      return `${row.label},${row.rentalSales},${row.foodSales},${row.rentalSales + row.foodSales}`;
    });
    
    const csvContent = `${csvHeader}${csvRows.join('\n')}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_report_${dateRange.startDate}_to_${dateRange.endDate}.csv`);
    link.click();
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Laporan Penjualan</h2>
        <div className="flex gap-2">
          <button
            onClick={fetchSalesData}
            disabled={refreshing}
            className="flex items-center bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg"
          >
            <RefreshCw size={16} className={`mr-1 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg"
            disabled={salesData.length === 0 || loading}
          >
            <Download size={16} className="mr-1" />
            Export CSV
          </button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex flex-col">
            <label className="text-gray-400 text-sm mb-1">Tanggal Mulai</label>
            <div className="relative">
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className="bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4"
              />
              <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-gray-400 text-sm mb-1">Tanggal Akhir</label>
            <div className="relative">
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                className="bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4"
              />
              <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>
        </div>
        
        <div className="flex items-end">
          <div className="flex flex-col">
            <label className="text-gray-400 text-sm mb-1">Kelompokkan Berdasarkan</label>
            <div className="relative">
              <select
                value={groupBy}
                onChange={handleGroupByChange}
                className="bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4"
              >
                <option value="day">Harian</option>
                <option value="month">Bulanan</option>
              </select>
              <Filter className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-900 bg-opacity-20 p-4 rounded-lg border border-red-500 mb-6">
          <p className="text-red-400">{error}</p>
          <button 
            onClick={fetchSalesData}
            className="mt-2 text-red-400 underline"
          >
            Coba lagi
          </button>
        </div>
      )}
      
      {loading ? (
        <div className="h-80 mb-6 bg-gray-700 rounded-lg animate-pulse"></div>
      ) : salesData.length === 0 ? (
        <div className="h-80 mb-6 flex items-center justify-center bg-gray-700 rounded-lg">
          <div className="text-center text-gray-400">
            <p>Tidak ada data penjualan dalam periode ini</p>
          </div>
        </div>
      ) : (
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="label" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" tickFormatter={(value) => `Rp${(value / 1000000).toFixed(1)}jt`} />
              <Tooltip
                formatter={(value) => [`${formatCurrency(value)}`, undefined]}
                labelFormatter={(label) => `Tanggal: ${label}`}
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '0.375rem' }}
              />
              <Legend />
              <Bar dataKey="rentalSales" name="Pendapatan Rental" fill="#3B82F6" />
              <Bar dataKey="foodSales" name="Pendapatan F&B" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Pendapatan</div>
          <div className="text-xl font-bold">{formatCurrency(totalRevenue)}</div>
          <div className="text-xs text-gray-500 mt-1">
            {dateRange.startDate} s/d {dateRange.endDate}
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Pendapatan Rental</div>
          <div className="text-xl font-bold">{formatCurrency(totalRentalSales)}</div>
          <div className="text-xs text-gray-500 mt-1">
            {totalRevenue > 0 ? Math.round((totalRentalSales / totalRevenue) * 100) : 0}% dari total pendapatan
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Pendapatan F&B</div>
          <div className="text-xl font-bold">{formatCurrency(totalFoodSales)}</div>
          <div className="text-xs text-gray-500 mt-1">
            {totalRevenue > 0 ? Math.round((totalFoodSales / totalRevenue) * 100) : 0}% dari total pendapatan
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;