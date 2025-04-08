import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Download, Filter, AlertCircle, Coffee, Database, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

// Colors for charts
const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6'];

const FoodBeverageReport = ({ dateRange }) => {
  const [reportData, setReportData] = useState({
    categorySales: [],
    topItems: [],
    monthlySales: [],
    stockStatus: [],
    summary: {
      totalSales: 0,
      totalItems: 0,
      avgOrderValue: 0,
      topCategory: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useState('sales'); // 'sales' or 'inventory'

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      
      // Fetch report data from API
      const response = await api.get('/reports/food-beverage', {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      });
      
      console.log("Fetched food & beverage data:", response.data);
      setReportData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching food & beverage report:', err);
      setError('Gagal memuat data laporan Makanan & Minuman: ' + (err.response?.data?.message || err.message));
      toast.error('Gagal memuat data laporan Makanan & Minuman');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount) => {
    return `Rp${amount.toLocaleString('id-ID')}`;
  };

  const handleExportToExcel = () => {
    // Prepare data for Excel export
    const sheetData = [
      // Header row
      ['Laporan Makanan & Minuman', '', '', '', ''],
      [`Periode: ${dateRange.startDate} s/d ${dateRange.endDate}`, '', '', '', ''],
      ['', '', '', '', ''],
      ['Ringkasan', '', '', '', ''],
      ['Total Penjualan', formatCurrency(reportData.summary.totalSales), '', '', ''],
      ['Total Item Terjual', reportData.summary.totalItems, '', '', ''],
      ['Rata-rata Nilai Order', formatCurrency(reportData.summary.avgOrderValue), '', '', ''],
      ['Kategori Terlaris', reportData.summary.topCategory, '', '', ''],
      ['', '', '', '', ''],
      ['Penjualan per Kategori', '', '', '', ''],
      ['Kategori', 'Pendapatan', 'Persentase', '', ''],
      ...reportData.categorySales.map(item => [
        item.name, 
        item.value, 
        `${Math.round((item.value / reportData.summary.totalSales) * 100)}%`,
        '',
        ''
      ]),
      ['', '', '', '', ''],
      ['Item Terlaris', '', '', '', ''],
      ['Nama Item', 'Kategori', 'Jumlah Terjual', 'Pendapatan', ''],
      ...reportData.topItems.map(item => [
        item.name, 
        item.category, 
        item.quantity,
        item.revenue,
        ''
      ])
    ];
    
    exportToExcel(sheetData, `laporan_makanan_minuman_${dateRange.startDate}_${dateRange.endDate}`);
    toast.success('Laporan berhasil diekspor ke Excel');
  };

  const handleExportToPDF = () => {
    exportToPDF('food-beverage-report-container', `laporan_makanan_minuman_${dateRange.startDate}_${dateRange.endDate}`);
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
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6" id="food-beverage-report-container">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Coffee size={24} className="mr-2" />
          <h2 className="text-xl font-semibold">Laporan Makanan & Minuman</h2>
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
          <button
            onClick={fetchReportData}
            className={`flex items-center bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg ${refreshing ? 'animate-pulse' : ''}`}
            disabled={refreshing}
            title="Refresh Data"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center bg-gray-700 p-1 rounded-lg inline-flex">
          <button
            onClick={() => setView('sales')}
            className={`px-4 py-2 rounded ${view === 'sales' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
          >
            Penjualan
          </button>
          <button
            onClick={() => setView('inventory')}
            className={`px-4 py-2 rounded ${view === 'inventory' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
          >
            Inventaris
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
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Penjualan</div>
          <div className="text-2xl font-bold">{formatCurrency(reportData.summary.totalSales)}</div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Item Terjual</div>
          <div className="text-2xl font-bold">{reportData.summary.totalItems}</div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Rata-rata Order</div>
          <div className="text-2xl font-bold">{formatCurrency(reportData.summary.avgOrderValue)}</div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Kategori Terlaris</div>
          <div className="text-2xl font-bold">{reportData.summary.topCategory}</div>
        </div>
      </div>
      
      {view === 'sales' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Penjualan per Kategori</h3>
              {!reportData.categorySales || reportData.categorySales.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <p>Tidak ada data penjualan dalam periode ini</p>
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData.categorySales}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {reportData.categorySales.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Tren Penjualan Bulanan</h3>
              {!reportData.monthlySales || reportData.monthlySales.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <p>Tidak ada data tren penjualan dalam periode ini</p>
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={reportData.monthlySales}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" tickFormatter={(value) => `Rp${(value / 1000000).toFixed(1)}jt`} />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="Food" name="Makanan" fill="#3B82F6" />
                      <Bar dataKey="Drink" name="Minuman" fill="#10B981" />
                      <Bar dataKey="Snack" name="Snack" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-4">Item Terlaris</h3>
            {!reportData.topItems || reportData.topItems.length === 0 ? (
              <div className="py-8 text-center text-gray-400">
                <p>Tidak ada data penjualan item dalam periode ini</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left">Nama Item</th>
                      <th className="px-4 py-2 text-left">Kategori</th>
                      <th className="px-4 py-2 text-right">Jumlah Terjual</th>
                      <th className="px-4 py-2 text-right">Pendapatan</th>
                      <th className="px-4 py-2 text-right">% dari Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {reportData.topItems.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-750' : ''}>
                        <td className="px-4 py-2 font-medium">{item.name}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            item.category === 'Food' ? 'bg-blue-900 bg-opacity-40 text-blue-400' :
                            item.category === 'Drink' ? 'bg-green-900 bg-opacity-40 text-green-400' :
                            'bg-purple-900 bg-opacity-40 text-purple-400'
                          }`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right">{item.quantity}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(item.revenue)}</td>
                        <td className="px-4 py-2 text-right">
                          {reportData.summary.totalSales > 0 
                            ? ((item.revenue / reportData.summary.totalSales) * 100).toFixed(1)
                            : '0.0'}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Status Inventaris</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reportData.stockStatus}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill="#10B981" /> {/* Green for sufficient */}
                      <Cell fill="#F59E0B" /> {/* Yellow for low */}
                      <Cell fill="#EF4444" /> {/* Red for critical */}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Item yang Perlu Restock</h3>
              <div className="h-64 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-800 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left">Nama Item</th>
                      <th className="px-4 py-2 text-left">Kategori</th>
                      <th className="px-4 py-2 text-right">Stok Saat Ini</th>
                      <th className="px-4 py-2 text-right">Stok Minimum</th>
                      <th className="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {[
                      { name: "Coca Cola", category: "Drink", current: 3, min: 10, status: "Critical" },
                      { name: "Es Teh", category: "Drink", current: 4, min: 10, status: "Critical" },
                      { name: "Keripik", category: "Snack", current: 6, min: 15, status: "Critical" },
                      { name: "Mie Goreng", category: "Food", current: 8, min: 20, status: "Critical" },
                      { name: "Nasi Goreng", category: "Food", current: 12, min: 20, status: "Low" },
                      { name: "Air Mineral", category: "Drink", current: 15, min: 30, status: "Low" }
                    ].map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-750' : ''}>
                        <td className="px-4 py-2 font-medium">{item.name}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            item.category === 'Food' ? 'bg-blue-900 bg-opacity-40 text-blue-400' :
                            item.category === 'Drink' ? 'bg-green-900 bg-opacity-40 text-green-400' :
                            'bg-purple-900 bg-opacity-40 text-purple-400'
                          }`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right">{item.current}</td>
                        <td className="px-4 py-2 text-right">{item.min}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            item.status === 'Critical' ? 'bg-red-900 bg-opacity-40 text-red-400' :
                            'bg-yellow-900 bg-opacity-40 text-yellow-400'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Total Item dalam Inventaris</div>
              <div className="text-2xl font-bold">120</div>
              <div className="flex items-center text-xs text-gray-500 mt-2">
                <Database size={12} className="mr-1" />
                Food: 45 | Drink: 52 | Snack: 23
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Item dengan Stok Kritis</div>
              <div className="text-2xl font-bold text-red-500">16</div>
              <div className="text-xs text-gray-500 mt-2">
                Perlu segera diisi ulang
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Item dengan Stok Rendah</div>
              <div className="text-2xl font-bold text-yellow-500">24</div>
              <div className="text-xs text-gray-500 mt-2">
                Akan habis dalam minggu ini
              </div>
            </div>
          </div>
        </>
      )}
      
      <div className="mt-6 pt-6 border-t border-gray-700 text-sm text-center text-gray-500">
        <p>Periode: {new Date(dateRange.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} - {new Date(dateRange.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <p className="mt-1">Data diperbarui terakhir: {new Date().toLocaleString('id-ID')}</p>
      </div>
    </div>
  );
};

export default FoodBeverageReport;