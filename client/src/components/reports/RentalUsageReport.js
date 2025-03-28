import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Download, Filter } from 'lucide-react';
import api from '../../services/api';

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6'];

const RentalUsageReport = () => {
  const [usageData, setUsageData] = useState({
    byPS: [],
    byHour: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reports/rental-usage?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      setUsageData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching usage data:', err);
      setError('Gagal memuat data penggunaan');
      
      // Mock data for demo
      const mockPSData = [
        { name: 'PS3', usage: 125, hours: 250 },
        { name: 'PS4', usage: 320, hours: 640 },
        { name: 'PS5', usage: 210, hours: 420 }
      ];
      
      const mockHourData = [];
      for (let i = 8; i <= 23; i++) {
        mockHourData.push({
          hour: `${i}:00`,
          count: Math.floor(Math.random() * 30) + 10
        });
      }
      
      setUsageData({
        byPS: mockPSData,
        byHour: mockHourData
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageData();
  }, [dateRange]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotal = () => {
    if (!usageData.byPS.length) return { totalSessions: 0, totalHours: 0 };
    
    return usageData.byPS.reduce((acc, curr) => ({
      totalSessions: acc.totalSessions + curr.usage,
      totalHours: acc.totalHours + curr.hours
    }), {
      totalSessions: 0,
      totalHours: 0
    });
  };

  const { totalSessions, totalHours } = calculateTotal();

  const exportToCSV = () => {
    const byPSHeader = 'Jenis PS,Jumlah Penggunaan,Jam Penggunaan\n';
    const byPSRows = usageData.byPS.map(row => {
      return `${row.name},${row.usage},${row.hours}`;
    });
    
    const byHourHeader = '\n\nJam,Jumlah Penggunaan\n';
    const byHourRows = usageData.byHour.map(row => {
      return `${row.hour},${row.count}`;
    });
    
    const csvContent = `${byPSHeader}${byPSRows.join('\n')}${byHourHeader}${byHourRows.join('\n')}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `usage_report_${dateRange.startDate}_to_${dateRange.endDate}.csv`);
    link.click();
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-12 bg-gray-700 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 bg-gray-700 rounded mb-4"></div>
          <div className="h-64 bg-gray-700 rounded mb-4"></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-24 bg-gray-700 rounded"></div>
          <div className="h-24 bg-gray-700 rounded"></div>
          <div className="h-24 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Laporan Penggunaan PlayStation</h2>
        <button
          onClick={exportToCSV}
          className="flex items-center bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg"
        >
          <Download size={16} className="mr-1" />
          Export CSV
        </button>
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
      </div>
      
      {error && (
        <div className="bg-red-900 bg-opacity-20 p-4 rounded-lg border border-red-500 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Distribusi Penggunaan PS</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={usageData.byPS}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="usage"
                >
                  {usageData.byPS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} sesi`, undefined]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Jam Ramai Penggunaan</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageData.byHour} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hour" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip formatter={(value) => [`${value} sesi`, undefined]} />
                <Bar dataKey="count" name="Jumlah Sesi" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Sesi</div>
          <div className="text-xl font-bold">{totalSessions} sesi</div>
          <div className="text-xs text-gray-500 mt-1">
            {dateRange.startDate} s/d {dateRange.endDate}
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Jam</div>
          <div className="text-xl font-bold">{totalHours} jam</div>
          <div className="text-xs text-gray-500 mt-1">
            Rata-rata {(totalHours / totalSessions).toFixed(1)} jam per sesi
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Penggunaan per Hari</div>
          <div className="text-xl font-bold">
            {Math.round(totalSessions / ((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24) + 1))} sesi
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {Math.round(totalHours / ((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24) + 1))} jam per hari
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Detail Penggunaan Berdasarkan Jenis</h3>
        <div className="bg-gray-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="py-3 px-4 text-left">Jenis PS</th>
                <th className="py-3 px-4 text-right">Jumlah Sesi</th>
                <th className="py-3 px-4 text-right">Total Jam</th>
                <th className="py-3 px-4 text-right">Rata-rata per Sesi</th>
                <th className="py-3 px-4 text-right">Persentase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {usageData.byPS.map((item, index) => (
                <tr key={index}>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2`} style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">{item.usage} sesi</td>
                  <td className="py-3 px-4 text-right">{item.hours} jam</td>
                  <td className="py-3 px-4 text-right">{(item.hours / item.usage).toFixed(1)} jam</td>
                  <td className="py-3 px-4 text-right">{Math.round((item.usage / totalSessions) * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RentalUsageReport;