import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Download, Filter, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

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
      // Pastikan parameter dikirim dengan benar
      const response = await api.get(`/reports/rental-usage`, {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      });
      
      // Log respons untuk debugging
      console.log('Data penggunaan diterima:', response.data);
      
      // Verifikasi struktur data yang diterima
      if (!response.data.byPS || !response.data.byHour) {
        throw new Error('Format data tidak valid');
      }
      
      setUsageData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching usage data:', err);
      setError('Gagal memuat data penggunaan: ' + (err.response?.data?.message || err.message));
      toast.error('Gagal memuat data penggunaan');
      
      // Data dummy untuk pengembangan jika API gagal
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

  const handleExportToExcel = () => {
    // Format angka dalam format Indonesia
    const formatNumberID = (num) => {
      return num.toLocaleString('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    };

    // Create data for Excel export
    const excelData = [
      // Header and title
      ['Laporan Penggunaan PlayStation', '', '', '', ''],
      [`Periode: ${dateRange.startDate} s/d ${dateRange.endDate}`, '', '', '', ''],
      ['', '', '', '', ''],
      
      // Penggunaan berdasarkan jenis PS
      ['Penggunaan Berdasarkan Jenis PS', '', '', '', ''],
      ['Jenis PS', 'Jumlah Sesi', 'Jam Penggunaan', 'Rata-rata Jam per Sesi', 'Persentase'],
      ...usageData.byPS.map(row => [
        row.name,
        formatNumberID(row.usage),
        formatNumberID(row.hours),
        (row.usage > 0 ? (row.hours / row.usage).toFixed(1) : "0"),
        `${totalSessions > 0 ? Math.round((row.usage / totalSessions) * 100) : 0}%`
      ]),
      
      // Penggunaan berdasarkan jam
      ['', '', '', '', ''],
      ['Penggunaan Berdasarkan Jam', '', '', '', ''],
      ['Jam', 'Jumlah Sesi', '', '', ''],
      ...usageData.byHour.map(row => [
        row.hour,
        formatNumberID(row.count),
        '',
        '',
        ''
      ]),
      
      // Summary
      ['', '', '', '', ''],
      ['Ringkasan', '', '', '', ''],
      ['Total Sesi', formatNumberID(totalSessions), '', '', ''],
      ['Total Jam', formatNumberID(totalHours), '', '', ''],
      ['Rata-rata Jam per Sesi', totalSessions > 0 ? (totalHours / totalSessions).toFixed(1) : "0", '', '', ''],
    ];
    
    // Format filename with date range
    const startDateFormatted = dateRange.startDate.split('-').reverse().join('');
    const endDateFormatted = dateRange.endDate.split('-').reverse().join('');
    const filename = `laporan_penggunaan_ps_${startDateFormatted}_sampai_${endDateFormatted}`;
    
    try {
      exportToExcel(excelData, filename);
      toast.success('Laporan berhasil diekspor ke Excel');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Gagal mengekspor ke Excel');
    }
  };

  const handleExportToPDF = () => {
    try {
      // Format filename with date range
      const startDateFormatted = dateRange.startDate.split('-').reverse().join('');
      const endDateFormatted = dateRange.endDate.split('-').reverse().join('');
      const filename = `laporan_penggunaan_ps_${startDateFormatted}_sampai_${endDateFormatted}`;
      
      // Export report div to PDF
      exportToPDF('rental-usage-report-container', filename);
      toast.success('Laporan berhasil diekspor ke PDF');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Gagal mengekspor ke PDF');
    }
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
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6" id="rental-usage-report-container">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Laporan Penggunaan PlayStation</h2>
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
        <div className="bg-red-900 bg-opacity-20 p-4 rounded-lg border border-red-500 mb-6 flex items-start">
          <AlertCircle size={20} className="text-red-500 mr-2 mt-0.5" />
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
            Rata-rata {totalSessions ? (totalHours / totalSessions).toFixed(1) : 0} jam per sesi
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Penggunaan per Hari</div>
          <div className="text-xl font-bold">
            {(() => {
              const dayDiff = Math.max(1, Math.floor((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24)) + 1);
              return Math.round(totalSessions / dayDiff);
            })() || 0} sesi
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {(() => {
              const dayDiff = Math.max(1, Math.floor((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24)) + 1);
              return Math.round(totalHours / dayDiff);
            })() || 0} jam per hari
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
                  <td className="py-3 px-4 text-right">{item.usage ? (item.hours / item.usage).toFixed(1) : 0} jam</td>
                  <td className="py-3 px-4 text-right">{totalSessions ? Math.round((item.usage / totalSessions) * 100) : 0}%</td>
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