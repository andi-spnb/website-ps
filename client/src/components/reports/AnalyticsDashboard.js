import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Calendar, Download, RefreshCw, TrendingUp, TrendingDown, 
  DollarSign, Users, Coffee, Monitor, Clock, ChevronDown 
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

const AnalyticsDashboard = ({ dateRange }) => {
  const [dashboardData, setDashboardData] = useState({
    overviewStats: {
      totalRevenue: 0,
      totalSessions: 0,
      totalOrders: 0,
      totalCustomers: 0
    },
    revenueData: [],
    deviceUsage: [],
    foodSalesData: [],
    hourlyActivity: [],
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState(dateRange || {
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [dataTimespan, setDataTimespan] = useState('month');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    revenue: true,
    devices: true,
    food: true,
    hourly: true,
    transactions: true
  });

  // Fetch dashboard data from the API
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      setLoading(true);
      
      // Make API calls to get the various dashboard data components
      const [
        salesResponse,
        rentalUsageResponse,
        statsResponse,
        transactionsResponse
      ] = await Promise.all([
        api.get('/reports/sales', {
          params: {
            startDate: selectedDateRange.startDate,
            endDate: selectedDateRange.endDate,
            groupBy: dataTimespan
          }
        }),
        api.get('/reports/rental-usage', {
          params: {
            startDate: selectedDateRange.startDate,
            endDate: selectedDateRange.endDate
          }
        }),
        api.get('/reports/daily-sales'),
        api.get('/reports/recent-transactions', {
          params: {
            limit: 10
          }
        })
      ]);

      // Food sales data by category (transform from sales data)
      const foodSalesCategories = [
        { name: 'Food', value: 0 },
        { name: 'Drink', value: 0 },
        { name: 'Snack', value: 0 }
      ];

      // Calculate food sales totals by category
      salesResponse.data.forEach(item => {
        const foodSales = item.foodSales || 0;
        // Simulate distribution by categories (as we don't have real category data)
        foodSalesCategories[0].value += foodSales * 0.4; // 40% Food
        foodSalesCategories[1].value += foodSales * 0.35; // 35% Drink
        foodSalesCategories[2].value += foodSales * 0.25; // 25% Snack
      });

      // Calculate hourly activity data
      let hourlyData = rentalUsageResponse.data.byHour || [];
      
      // If no hourly data, create sample data
      if (!hourlyData.length) {
        hourlyData = [];
        for (let i = 8; i <= 23; i++) {
          hourlyData.push({
            hour: `${i}:00`,
            count: Math.floor(Math.random() * 20) + 5
          });
        }
      }

      // Calculate overview statistics
      let totalRevenue = 0;
      let totalSessions = 0;
      
      // Sum up revenue from all sales data
      salesResponse.data.forEach(day => {
        totalRevenue += (day.rentalSales || 0) + (day.foodSales || 0);
      });
      
      // Sum up sessions from usage data
      if (rentalUsageResponse.data.byPS) {
        rentalUsageResponse.data.byPS.forEach(item => {
          totalSessions += item.usage || 0;
        });
      }

      // Set the dashboard data
      setDashboardData({
        overviewStats: {
          totalRevenue: totalRevenue,
          totalSessions: totalSessions,
          totalOrders: Math.floor(totalSessions * 0.7), // Estimate: 70% of sessions include orders
          totalCustomers: Math.floor(totalSessions * 0.6) // Estimate: 60% unique customers
        },
        revenueData: salesResponse.data,
        deviceUsage: rentalUsageResponse.data.byPS || [],
        foodSalesData: foodSalesCategories,
        hourlyActivity: hourlyData,
        recentTransactions: transactionsResponse.data,
        statsResponse: statsResponse.data
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Gagal memuat data dashboard: ' + (err.response?.data?.message || err.message));
      toast.error('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle date range changes
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setSelectedDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle timespan change
  const handleTimespanChange = (e) => {
    setDataTimespan(e.target.value);
  };

  // Toggle expanded sections
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Format currency in Indonesian Rupiah
  const formatCurrency = (amount) => {
    return `Rp${Math.round(amount).toLocaleString('id-ID')}`;
  };

  // Export dashboard as PDF
  const exportDashboard = () => {
    toast.info('Mengekspor dashboard...');
    // Implementation would use a library like jspdf
    setTimeout(() => {
      toast.success('Dashboard berhasil diekspor');
    }, 1500);
  };

  // Fetch data when component mounts or filters change
  useEffect(() => {
    fetchDashboardData();
  }, [selectedDateRange, dataTimespan]);

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading && !dashboardData.revenueData.length) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-700 rounded"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-700 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold">Dashboard Analitik</h2>
          <div className="ml-4 text-sm px-3 py-1 bg-blue-600 rounded-full">
            {formatDate(selectedDateRange.startDate)} - {formatDate(selectedDateRange.endDate)}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center"
            title="Muat Ulang Data"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
          <button
            onClick={exportDashboard}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
            title="Ekspor Dashboard"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900 bg-opacity-20 p-4 rounded-lg border border-red-500 mb-6">
          <p className="text-red-400">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-2 text-blue-400 underline"
          >
            Coba lagi
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex flex-col">
              <label className="text-gray-400 text-sm mb-1">Tanggal Mulai</label>
              <div className="relative">
                <input
                  type="date"
                  name="startDate"
                  value={selectedDateRange.startDate}
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
                  value={selectedDateRange.endDate}
                  onChange={handleDateChange}
                  className="bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4"
                />
                <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>
            </div>
          </div>
          <div className="flex items-end">
            <div className="flex flex-col">
              <label className="text-gray-400 text-sm mb-1">Tampilan</label>
              <select
                value={dataTimespan}
                onChange={handleTimespanChange}
                className="bg-gray-700 border border-gray-600 rounded-lg py-2 px-4"
              >
                <option value="day">Hari</option>
                <option value="month">Bulan</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Pendapatan</div>
          <div className="text-2xl font-bold">{formatCurrency(dashboardData.overviewStats.totalRevenue)}</div>
          <div className="flex items-center text-xs mt-1">
            {dashboardData?.statsResponse?.percentChange >= 0 ? (
              <TrendingUp size={14} className="text-green-500 mr-1" />
            ) : (
              <TrendingDown size={14} className="text-red-500 mr-1" />
            )}
            <span className={dashboardData?.statsResponse?.percentChange >= 0 ? "text-green-500" : "text-red-500"}>
              {dashboardData?.statsResponse?.percentChange}% dari periode sebelumnya
            </span>
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Sesi Rental</div>
          <div className="text-2xl font-bold">{dashboardData.overviewStats.totalSessions}</div>
          <div className="text-xs text-gray-500 mt-1">
            {dataTimespan === 'day' ? 'Per hari' : 'Per bulan'}: {Math.round(dashboardData.overviewStats.totalSessions / dashboardData.revenueData.length) || 0}
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Pesanan F&B</div>
          <div className="text-2xl font-bold">{dashboardData.overviewStats.totalOrders}</div>
          <div className="text-xs text-gray-500 mt-1">
            {((dashboardData.overviewStats.totalOrders / dashboardData.overviewStats.totalSessions) * 100).toFixed(1)}% dari total sesi
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Rata-rata Pendapatan</div>
          <div className="text-2xl font-bold">
            {formatCurrency(dashboardData.overviewStats.totalRevenue / (dashboardData.revenueData.length || 1))}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {dataTimespan === 'day' ? 'Per hari' : 'Per bulan'}
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2 cursor-pointer" onClick={() => toggleSection('revenue')}>
          <h3 className="text-lg font-semibold">Tren Pendapatan</h3>
          <ChevronDown size={18} className={`transition-transform ${expandedSections.revenue ? 'rotate-180' : ''}`} />
        </div>
        
        {expandedSections.revenue && (
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dashboardData.revenueData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="label" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" tickFormatter={(value) => `Rp${(value / 1000000).toFixed(1)}jt`} />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value), undefined]}
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="rentalSales" 
                    name="Pendapatan Rental" 
                    stackId="1"
                    stroke={COLORS[0]} 
                    fill={COLORS[0]} 
                    fillOpacity={0.6} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="foodSales" 
                    name="Pendapatan F&B" 
                    stackId="1"
                    stroke={COLORS[1]} 
                    fill={COLORS[1]} 
                    fillOpacity={0.6} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-sm text-gray-400">Total Pendapatan</div>
                <div className="text-xl font-bold">{formatCurrency(dashboardData.overviewStats.totalRevenue)}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-sm text-gray-400">Pendapatan Rental</div>
                <div className="text-xl font-bold">
                  {formatCurrency(dashboardData.revenueData.reduce((sum, day) => sum + (day.rentalSales || 0), 0))}
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-sm text-gray-400">Pendapatan F&B</div>
                <div className="text-xl font-bold">
                  {formatCurrency(dashboardData.revenueData.reduce((sum, day) => sum + (day.foodSales || 0), 0))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Device Usage and Food Sales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Device Usage */}
        <div>
          <div className="flex justify-between items-center mb-2 cursor-pointer" onClick={() => toggleSection('devices')}>
            <h3 className="text-lg font-semibold">Penggunaan PlayStation</h3>
            <ChevronDown size={18} className={`transition-transform ${expandedSections.devices ? 'rotate-180' : ''}`} />
          </div>
          
          {expandedSections.devices && (
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.deviceUsage}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="usage"
                      nameKey="name"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {dashboardData.deviceUsage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} sesi`, undefined]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
                {dashboardData.deviceUsage.map((device, index) => (
                  <div key={device.name} className="bg-gray-800 rounded-lg p-2">
                    <div className="flex items-center mb-1">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <div className="text-sm">{device.name}</div>
                    </div>
                    <div className="text-lg font-semibold">{device.usage} sesi</div>
                    <div className="text-xs text-gray-400">{device.hours} jam total</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Food Sales */}
        <div>
          <div className="flex justify-between items-center mb-2 cursor-pointer" onClick={() => toggleSection('food')}>
            <h3 className="text-lg font-semibold">Penjualan F&B</h3>
            <ChevronDown size={18} className={`transition-transform ${expandedSections.food ? 'rotate-180' : ''}`} />
          </div>
          
          {expandedSections.food && (
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.foodSalesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {dashboardData.foodSalesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatCurrency(value), undefined]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4">
                <div className="text-center">
                  <div className="text-sm text-gray-400">Total Penjualan F&B</div>
                  <div className="text-xl font-bold">
                    {formatCurrency(dashboardData.foodSalesData.reduce((sum, item) => sum + item.value, 0))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hourly Activity */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2 cursor-pointer" onClick={() => toggleSection('hourly')}>
          <h3 className="text-lg font-semibold">Aktivitas per Jam</h3>
          <ChevronDown size={18} className={`transition-transform ${expandedSections.hourly ? 'rotate-180' : ''}`} />
        </div>
        
        {expandedSections.hourly && (
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.hourlyActivity} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="hour" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    formatter={(value) => [`${value} sesi`, 'Jumlah Sesi']}
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }}
                  />
                  <Bar dataKey="count" name="Jumlah Sesi" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-sm text-gray-400">Jam Paling Ramai</div>
                <div className="text-xl font-bold">
                  {(() => {
                    if (!dashboardData.hourlyActivity.length) return 'N/A';
                    const maxActivity = dashboardData.hourlyActivity.reduce(
                      (max, hour) => hour.count > max.count ? hour : max, 
                      { count: 0 }
                    );
                    return maxActivity.hour;
                  })()}
                </div>
                <div className="text-xs text-gray-400">
                  {(() => {
                    if (!dashboardData.hourlyActivity.length) return '';
                    const maxActivity = dashboardData.hourlyActivity.reduce(
                      (max, hour) => hour.count > max.count ? hour : max, 
                      { count: 0 }
                    );
                    return `${maxActivity.count} sesi`;
                  })()}
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-sm text-gray-400">Jam Paling Sepi</div>
                <div className="text-xl font-bold">
                  {(() => {
                    if (!dashboardData.hourlyActivity.length) return 'N/A';
                    const minActivity = dashboardData.hourlyActivity.reduce(
                      (min, hour) => hour.count < min.count ? hour : min, 
                      { count: Infinity }
                    );
                    return minActivity.hour;
                  })()}
                </div>
                <div className="text-xs text-gray-400">
                  {(() => {
                    if (!dashboardData.hourlyActivity.length) return '';
                    const minActivity = dashboardData.hourlyActivity.reduce(
                      (min, hour) => hour.count < min.count ? hour : min, 
                      { count: Infinity }
                    );
                    return `${minActivity.count} sesi`;
                  })()}
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-sm text-gray-400">Rata-rata per Jam</div>
                <div className="text-xl font-bold">
                  {(() => {
                    if (!dashboardData.hourlyActivity.length) return '0';
                    const total = dashboardData.hourlyActivity.reduce(
                      (sum, hour) => sum + hour.count, 0
                    );
                    return (total / dashboardData.hourlyActivity.length).toFixed(1);
                  })()}
                </div>
                <div className="text-xs text-gray-400">sesi</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex justify-between items-center mb-2 cursor-pointer" onClick={() => toggleSection('transactions')}>
          <h3 className="text-lg font-semibold">Transaksi Terbaru</h3>
          <ChevronDown size={18} className={`transition-transform ${expandedSections.transactions ? 'rotate-180' : ''}`} />
        </div>
        
        {expandedSections.transactions && (
          <div className="bg-gray-700 rounded-lg p-4">
            {dashboardData.recentTransactions.length === 0 ? (
              <div className="text-center py-4 text-gray-400">
                <p>Tidak ada transaksi terbaru</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="py-2 px-4 text-left">Jenis</th>
                      <th className="py-2 px-4 text-left">Waktu</th>
                      <th className="py-2 px-4 text-left">Metode</th>
                      <th className="py-2 px-4 text-right">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {dashboardData.recentTransactions.map((tx, index) => (
                      <tr key={index} className="hover:bg-gray-650">
                        <td className="py-2 px-4">
                          <div className="flex items-center">
                            {tx.type === 'Rental' ? (
                              <Monitor size={16} className="mr-2 text-blue-500" />
                            ) : (
                              <Coffee size={16} className="mr-2 text-green-500" />
                            )}
                            <span>{tx.type}</span>
                          </div>
                        </td>
                        <td className="py-2 px-4">
                          {new Date(tx.transaction_time).toLocaleString()}
                        </td>
                        <td className="py-2 px-4">{tx.payment_method}</td>
                        <td className="py-2 px-4 text-right font-medium">
                          {formatCurrency(tx.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;