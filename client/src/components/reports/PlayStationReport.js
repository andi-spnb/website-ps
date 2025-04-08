// client/src/components/reports/PlayStationReport.js
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Download, Monitor, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

const PlayStationReport = ({ dateRange }) => {
  const [reportData, setReportData] = useState({
    deviceStats: [],
    deviceRevenue: [],
    sessionsByDeviceType: [],
    popularDevices: [],
    usageByHour: [],
    usageByDay: [],
    summary: {
      totalSessions: 0,
      totalRevenue: 0,
      totalHours: 0,
      averageSessionLength: 0,
      utilizationRate: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      const response = await api.get('/reports/playstation', {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      });
      
      setReportData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching PlayStation report:', err);
      setError('Gagal memuat data laporan PlayStation: ' + (err.response?.data?.message || err.message));
      toast.error('Gagal memuat data laporan PlayStation');
      
      // Mock data for development/demo
      setReportData({
        deviceStats: [
          { device_type: 'PS5', count: 5, available: 3, in_use: 2, maintenance: 0 },
          { device_type: 'PS4', count: 8, available: 5, in_use: 2, maintenance: 1 },
          { device_type: 'PS3', count: 3, available: 2, in_use: 0, maintenance: 1 }
        ],
        deviceRevenue: [
          { device_type: 'PS5', revenue: 5800000 },
          { device_type: 'PS4', revenue: 6200000 },
          { device_type: 'PS3', revenue: 1200000 }
        ],
        sessionsByDeviceType: [
          { device_type: 'PS5', count: 58, total_hours: 232 },
          { device_type: 'PS4', count: 124, total_hours: 496 },
          { device_type: 'PS3', count: 24, total_hours: 96 }
        ],
        popularDevices: [
          { device_id: 2, device_name: 'PS-02', device_type: 'PS5', session_count: 25, total_hours: 100 },
          { device_id: 1, device_name: 'PS-01', device_type: 'PS4', session_count: 23, total_hours: 92 },
          { device_id: 3, device_name: 'PS-03', device_type: 'PS4', session_count: 22, total_hours: 88 },
          { device_id: 5, device_name: 'PS-05', device_type: 'PS4', session_count: 20, total_hours: 80 },
          { device_id: 4, device_name: 'PS-04', device_type: 'PS5', session_count: 18, total_hours: 72 }
        ],
        usageByHour: Array.from({ length: 24 }, (_, i) => ({
          hour: `${i}:00`,
          count: Math.floor(Math.random() * 20)
        })),
        usageByDay: Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - 30 + i);
          return {
            date: date.toISOString().split('T')[0],
            session_count: Math.floor(Math.random() * 15) + 5
          };
        }),
        summary: {
          totalSessions: 206,
          totalRevenue: 13200000,
          totalHours: 824,
          averageSessionLength: 4,
          utilizationRate: 68.7
        }
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount) => {
    return `Rp${Number(amount).toLocaleString('id-ID')}`;
  };

  const handleExportToExcel = () => {
    const sheetData = [
      // Header row
      ['Laporan PlayStation', '', '', '', ''],
      [`Periode: ${dateRange.startDate} s/d ${dateRange.endDate}`, '', '', '', ''],
      ['', '', '', '', ''],
      ['Ringkasan', '', '', '', ''],
      ['Total Sesi', reportData.summary.totalSessions, '', '', ''],
      ['Total Pendapatan', formatCurrency(reportData.summary.totalRevenue), '', '', ''],
      ['Total Jam', reportData.summary.totalHours, '', '', ''],
      ['Rata-rata Durasi', `${reportData.summary.averageSessionLength} jam`, '', '', ''],
      ['Tingkat Utilisasi', `${reportData.summary.utilizationRate}%`, '', '', ''],
      ['', '', '', '', ''],
      ['Pendapatan per Jenis PlayStation', '', '', '', ''],
      ['Jenis', 'Pendapatan', '', '', ''],
      ...reportData.deviceRevenue.map(item => [item.device_type, formatCurrency(item.revenue)]),
      ['', '', '', '', ''],
      ['PlayStation Paling Populer', '', '', '', ''],
      ['Nama', 'Jenis', 'Jumlah Sesi', 'Total Jam', ''],
      ...reportData.popularDevices.map(item => [
        item.device_name, 
        item.device_type, 
        item.session_count, 
        item.total_hours
      ])
    ];
    
    exportToExcel(sheetData, `laporan_playstation_${dateRange.startDate}_${dateRange.endDate}`);
    toast.success('Laporan berhasil diekspor ke Excel');
  };

  const handleExportToPDF = () => {
    exportToPDF('playstation-report-container', `laporan_playstation_${dateRange.startDate}_${dateRange.endDate}`);
    toast.success('Laporan berhasil diekspor ke PDF');
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-24 bg-gray-700 rounded"></div>
          <div className="h-24 bg-gray-700 rounded"></div>
          <div className="h-24 bg-gray-700 rounded"></div>
          <div className="h-24 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6" id="playstation-report-container">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold flex items-center">
            <Monitor size={24} className="mr-2" />
            Laporan PlayStation
          </h2>
          <button
            onClick={fetchReportData}
            className="ml-4 p-2 rounded-full hover:bg-gray-700"
            title="Refresh"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleExportToExcel}
            className="flex items-center bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg"
            title="Ekspor ke Excel"
          >
            <Download size={16} className="mr-1" />
            Excel
          </button>
          <button
            onClick={handleExportToPDF}
            className="flex items-center bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg"
            title="Ekspor ke PDF"
          >
            <Download size={16} className="mr-1" />
            PDF
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-900 bg-opacity-20 p-4 rounded-lg border border-red-500 mb-6">
          <div className="flex items-center text-red-500 mb-2">
            <AlertCircle size={18} className="mr-2" />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-red-400">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Sesi</div>
          <div className="text-2xl font-bold">{reportData.summary.totalSessions}</div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Pendapatan</div>
          <div className="text-2xl font-bold">{formatCurrency(reportData.summary.totalRevenue)}</div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Jam</div>
          <div className="text-2xl font-bold">{reportData.summary.totalHours} jam</div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Rata-rata Durasi</div>
          <div className="text-2xl font-bold">{reportData.summary.averageSessionLength} jam</div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Tingkat Utilisasi</div>
          <div className="text-2xl font-bold">{reportData.summary.utilizationRate}%</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Pendapatan per Jenis PlayStation</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={reportData.deviceRevenue}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="device_type" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" tickFormatter={(value) => `Rp${(value / 1000000).toFixed(1)}jt`} />
                <Tooltip formatter={(value) => [`${formatCurrency(value)}`, 'Pendapatan']} />
                <Bar dataKey="revenue" name="Pendapatan" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Distribusi Sesi per Jenis PlayStation</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportData.sessionsByDeviceType}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="device_type"
                  label={({device_type, percent}) => `${device_type} ${(percent * 100).toFixed(0)}%`}
                >
                  {reportData.sessionsByDeviceType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} sesi`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Penggunaan Berdasarkan Jam</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={reportData.usageByHour}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="hour" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip formatter={(value) => [`${value} sesi`, 'Jumlah']} />
                <Bar dataKey="count" name="Jumlah Sesi" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Trend Penggunaan Harian</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={reportData.usageByDay}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip formatter={(value) => [`${value} sesi`, 'Jumlah']} />
                <Line 
                  type="monotone" 
                  dataKey="session_count" 
                  name="Jumlah Sesi" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">PlayStation Paling Populer</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left">Nama</th>
                <th className="px-4 py-2 text-left">Jenis</th>
                <th className="px-4 py-2 text-right">Jumlah Sesi</th>
                <th className="px-4 py-2 text-right">Total Jam</th>
                <th className="px-4 py-2 text-right">Rata-rata Jam/Sesi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {reportData.popularDevices.map((device, index) => (
                <tr key={device.device_id} className={index % 2 === 0 ? "bg-gray-750" : ""}>
                  <td className="px-4 py-2">{device.device_name}</td>
                  <td className="px-4 py-2">{device.device_type}</td>
                  <td className="px-4 py-2 text-right">{device.session_count}</td>
                  <td className="px-4 py-2 text-right">{device.total_hours}</td>
                  <td className="px-4 py-2 text-right">
                    {(device.total_hours / device.session_count).toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-6 bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Status Perangkat PlayStation</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left">Jenis</th>
                <th className="px-4 py-2 text-right">Total</th>
                <th className="px-4 py-2 text-right">Tersedia</th>
                <th className="px-4 py-2 text-right">Digunakan</th>
                <th className="px-4 py-2 text-right">Maintenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {reportData.deviceStats.map((stat, index) => (
                <tr key={stat.device_type} className={index % 2 === 0 ? "bg-gray-750" : ""}>
                  <td className="px-4 py-2">{stat.device_type}</td>
                  <td className="px-4 py-2 text-right">{stat.count}</td>
                  <td className="px-4 py-2 text-right text-green-400">{stat.available}</td>
                  <td className="px-4 py-2 text-right text-yellow-400">{stat.in_use}</td>
                  <td className="px-4 py-2 text-right text-red-400">{stat.maintenance}</td>
                </tr>
              ))}
              <tr className="font-semibold bg-gray-800">
                <td className="px-4 py-2">Total</td>
                <td className="px-4 py-2 text-right">
                  {reportData.deviceStats.reduce((sum, stat) => sum + parseInt(stat.count), 0)}
                </td>
                <td className="px-4 py-2 text-right text-green-400">
                  {reportData.deviceStats.reduce((sum, stat) => sum + parseInt(stat.available), 0)}
                </td>
                <td className="px-4 py-2 text-right text-yellow-400">
                  {reportData.deviceStats.reduce((sum, stat) => sum + parseInt(stat.in_use), 0)}
                </td>
                <td className="px-4 py-2 text-right text-red-400">
                  {reportData.deviceStats.reduce((sum, stat) => sum + parseInt(stat.maintenance), 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PlayStationReport;