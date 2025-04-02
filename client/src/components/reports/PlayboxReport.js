import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Download, Filter, Box, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

const PlayboxReport = () => {
  const [reportData, setReportData] = useState({
    reservations: [],
    statusDistribution: [],
    revenueByPlaybox: [],
    popularTimeSlots: [],
    summary: {
      totalReservations: 0,
      totalRevenue: 0,
      completionRate: 0,
      avgDuration: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/playbox', {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      });
      
      setReportData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching playbox report:', err);
      setError('Gagal memuat data laporan Playbox: ' + (err.response?.data?.message || err.message));
      toast.error('Gagal memuat data laporan Playbox');
      
      // Data dummy untuk pengembangan
      setReportData({
        reservations: [],
        statusDistribution: [
          { name: 'Completed', value: 45 },
          { name: 'Cancelled', value: 8 },
          { name: 'In Use', value: 12 },
          { name: 'Pending', value: 5 }
        ],
        revenueByPlaybox: [
          { name: 'Playbox A', revenue: 2500000 },
          { name: 'Playbox B', revenue: 3200000 },
          { name: 'Playbox C', revenue: 1800000 },
          { name: 'Playbox D', revenue: 2900000 }
        ],
        popularTimeSlots: [
          { hour: '10:00', count: 12 },
          { hour: '14:00', count: 18 },
          { hour: '16:00', count: 25 },
          { hour: '18:00', count: 30 },
          { hour: '20:00', count: 22 }
        ],
        summary: {
          totalReservations: 70,
          totalRevenue: 10400000,
          completionRate: 85,
          avgDuration: 4.5
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCurrency = (amount) => {
    return `Rp${amount.toLocaleString('id-ID')}`;
  };

  const handleExportToExcel = () => {
    const sheetData = [
      // Header row
      ['Laporan Playbox', '', '', '', ''],
      [`Periode: ${dateRange.startDate} s/d ${dateRange.endDate}`, '', '', '', ''],
      ['', '', '', '', ''],
      ['Ringkasan', '', '', '', ''],
      ['Total Reservasi', reportData.summary.totalReservations, '', '', ''],
      ['Total Pendapatan', formatCurrency(reportData.summary.totalRevenue), '', '', ''],
      ['Tingkat Penyelesaian', `${reportData.summary.completionRate}%`, '', '', ''],
      ['Rata-rata Durasi', `${reportData.summary.avgDuration} jam`, '', '', ''],
      ['', '', '', '', ''],
      ['Pendapatan per Playbox', '', '', '', ''],
      ['Nama Playbox', 'Pendapatan', '', '', ''],
      ...reportData.revenueByPlaybox.map(item => [item.name, item.revenue]),
      ['', '', '', '', ''],
      ['Distribusi Status', '', '', '', ''],
      ['Status', 'Jumlah', '', '', ''],
      ...reportData.statusDistribution.map(item => [item.name, item.value])
    ];
    
    exportToExcel(sheetData, `laporan_playbox_${dateRange.startDate}_${dateRange.endDate}`);
    toast.success('Laporan berhasil diekspor ke Excel');
  };

  const handleExportToPDF = () => {
    exportToPDF('playbox-report-container', `laporan_playbox_${dateRange.startDate}_${dateRange.endDate}`);
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
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6" id="playbox-report-container">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Laporan Playbox</h2>
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
          <div className="flex items-center text-red-500 mb-2">
            <AlertCircle size={18} className="mr-2" />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-red-400">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Reservasi</div>
          <div className="text-2xl font-bold">{reportData.summary.totalReservations}</div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Pendapatan</div>
          <div className="text-2xl font-bold">{formatCurrency(reportData.summary.totalRevenue)}</div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Tingkat Penyelesaian</div>
          <div className="text-2xl font-bold">{reportData.summary.completionRate}%</div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Rata-rata Durasi</div>
          <div className="text-2xl font-bold">{reportData.summary.avgDuration} jam</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Distribusi Status Reservasi</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportData.statusDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {reportData.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Pendapatan per Playbox</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={reportData.revenueByPlaybox}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" tickFormatter={(value) => `Rp${(value / 1000000).toFixed(1)}jt`} />
                <Tooltip formatter={(value) => [`${formatCurrency(value)}`, 'Pendapatan']} />
                <Bar dataKey="revenue" name="Pendapatan" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Waktu Reservasi Terpopuler</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={reportData.popularTimeSlots}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="hour" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip formatter={(value) => [`${value} reservasi`, 'Jumlah']} />
              <Bar dataKey="count" name="Jumlah Reservasi" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PlayboxReport;