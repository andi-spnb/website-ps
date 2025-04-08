// client/src/components/alerts/StockAlertSystem.js
import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, X, Info, Filter, RefreshCw, Eye, EyeOff, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { exportToExcel } from '../../utils/exportUtils';

const StockAlertSystem = () => {
  const [stockAlerts, setStockAlerts] = useState({
    criticalItems: [],
    lowItems: [],
    recentTransactions: [],
    summary: {
      totalItems: 0,
      criticalCount: 0,
      lowCount: 0,
      sufficientCount: 0,
      stockoutPercentage: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'critical', 'low'
  const [filterCategory, setFilterCategory] = useState('all'); // 'all', 'Food', 'Drink', 'Snack'
  const [showDetails, setShowDetails] = useState(true);
  
  // Get current date range for fetching data
  const dateRange = {
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  };

  useEffect(() => {
    fetchStockAlerts();
  }, []);

  const fetchStockAlerts = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      
      const response = await api.get('/reports/stock-alerts', {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      });
      
      console.log("Fetched stock alert data:", response.data);
      setStockAlerts(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching stock alerts:', err);
      setError('Gagal memuat data peringatan stok: ' + (err.response?.data?.message || err.message));
      toast.error('Gagal memuat data peringatan stok');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleExportToExcel = () => {
    // Combine critical and low stock items
    const allAlertItems = [
      ...stockAlerts.criticalItems.map(item => ({...item, status: 'Kritis'})),
      ...stockAlerts.lowItems.map(item => ({...item, status: 'Rendah'}))
    ];
    
    // Sort by status (critical first) and then by stock_quantity
    const sortedItems = allAlertItems.sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === 'Kritis' ? -1 : 1;
      }
      return a.stock_quantity - b.stock_quantity;
    });
    
    // Prepare data for Excel export
    const sheetData = [
      // Header row
      ['Laporan Peringatan Stok', '', '', '', ''],
      [`Periode: ${dateRange.startDate} s/d ${dateRange.endDate}`, '', '', '', ''],
      ['', '', '', '', ''],
      ['Ringkasan', '', '', '', ''],
      ['Total Item Inventaris', stockAlerts.summary.totalItems, '', '', ''],
      ['Item dengan Stok Kritis', stockAlerts.summary.criticalCount, '', '', ''],
      ['Item dengan Stok Rendah', stockAlerts.summary.lowCount, '', '', ''],
      ['Item dengan Stok Mencukupi', stockAlerts.summary.sufficientCount, '', '', ''],
      ['Persentase Ketersediaan Stok', `${100 - stockAlerts.summary.stockoutPercentage}%`, '', '', ''],
      ['', '', '', '', ''],
      ['Daftar Item yang Perlu Perhatian', '', '', '', ''],
      ['Nama Item', 'Kategori', 'Stok Tersedia', 'Stok Minimum', 'Status'],
      ...sortedItems.map(item => [
        item.name, 
        item.category, 
        item.stock_quantity,
        item.min_stock || 10,
        item.status
      ])
    ];
    
    exportToExcel(sheetData, `laporan_stok_${dateRange.startDate}_${dateRange.endDate}`);
    toast.success('Laporan peringatan stok berhasil diekspor ke Excel');
  };

  // Filter items based on status and category
  const getFilteredItems = () => {
    // First, combine critical and low stock items with their status
    const allItems = [
      ...stockAlerts.criticalItems.map(item => ({...item, status: 'Kritis'})),
      ...stockAlerts.lowItems.map(item => ({...item, status: 'Rendah'}))
    ];
    
    // Then filter based on selected filters
    return allItems.filter(item => {
      const statusMatch = 
        filterStatus === 'all' || 
        (filterStatus === 'critical' && item.status === 'Kritis') ||
        (filterStatus === 'low' && item.status === 'Rendah');
        
      const categoryMatch = 
        filterCategory === 'all' || 
        item.category === filterCategory;
        
      return statusMatch && categoryMatch;
    });
  };

  const getStatusBadge = (status) => {
    if (status === 'Kritis') {
      return <span className="px-2 py-1 bg-red-900 bg-opacity-40 text-red-400 rounded-full text-xs">Kritis</span>;
    } else {
      return <span className="px-2 py-1 bg-yellow-900 bg-opacity-40 text-yellow-400 rounded-full text-xs">Rendah</span>;
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-12 bg-gray-700 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="h-24 bg-gray-700 rounded"></div>
          <div className="h-24 bg-gray-700 rounded"></div>
          <div className="h-24 bg-gray-700 rounded"></div>
          <div className="h-24 bg-gray-700 rounded"></div>
        </div>
        <div className="h-64 bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Bell size={24} className="mr-2" />
          <h2 className="text-xl font-semibold">Sistem Peringatan Stok</h2>
          {stockAlerts.summary.criticalCount > 0 && (
            <span className="ml-3 px-2 py-1 bg-red-600 text-white text-xs rounded-full">
              {stockAlerts.summary.criticalCount} kritis
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={fetchStockAlerts}
            className={`p-2 bg-gray-700 hover:bg-gray-600 rounded-lg ${refreshing ? 'animate-pulse' : ''}`}
            disabled={refreshing}
            title="Refresh Data"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
            title={showDetails ? "Sembunyikan Detail" : "Tampilkan Detail"}
          >
            {showDetails ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button
            onClick={handleExportToExcel}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
            title="Ekspor ke Excel"
          >
            <Download size={16} />
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-900 bg-opacity-20 p-4 rounded-lg border border-red-500 mb-6">
          <div className="flex items-center text-red-500 mb-2">
            <AlertTriangle size={18} className="mr-2" />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-red-400">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Item</div>
          <div className="text-2xl font-bold">{stockAlerts.summary.totalItems}</div>
          <div className="text-xs text-gray-500 mt-1">
            Dalam inventaris
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Stok Kritis</div>
          <div className="text-2xl font-bold text-red-500">{stockAlerts.summary.criticalCount}</div>
          <div className="text-xs text-gray-500 mt-1">
            Perlu segera dipesan
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Stok Rendah</div>
          <div className="text-2xl font-bold text-yellow-500">{stockAlerts.summary.lowCount}</div>
          <div className="text-xs text-gray-500 mt-1">
            Perlu diperhatikan
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Ketersediaan Stok</div>
          <div className="text-2xl font-bold">
            {stockAlerts.summary.stockoutPercentage === 0 ? (
              <span className="text-green-500">100%</span>
            ) : (
              <span>{Math.round(100 - stockAlerts.summary.stockoutPercentage)}%</span>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {100 - stockAlerts.summary.stockoutPercentage > 90 ? 'Sangat baik' : 'Perlu ditingkatkan'}
          </div>
        </div>
      </div>

      {showDetails && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            <div className="flex items-center space-x-2 bg-gray-700 p-1 rounded-lg">
              <span className="text-sm text-gray-400 px-2">Status:</span>
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded-lg text-sm ${filterStatus === 'all' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterStatus('critical')}
                className={`px-3 py-1 rounded-lg text-sm ${filterStatus === 'critical' ? 'bg-red-600' : 'hover:bg-gray-600'}`}
              >
                Kritis
              </button>
              <button
                onClick={() => setFilterStatus('low')}
                className={`px-3 py-1 rounded-lg text-sm ${filterStatus === 'low' ? 'bg-yellow-600' : 'hover:bg-gray-600'}`}
              >
                Rendah
              </button>
            </div>
            
            <div className="flex items-center space-x-2 bg-gray-700 p-1 rounded-lg">
              <span className="text-sm text-gray-400 px-2">Kategori:</span>
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-3 py-1 rounded-lg text-sm ${filterCategory === 'all' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterCategory('Food')}
                className={`px-3 py-1 rounded-lg text-sm ${filterCategory === 'Food' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
              >
                Makanan
              </button>
              <button
                onClick={() => setFilterCategory('Drink')}
                className={`px-3 py-1 rounded-lg text-sm ${filterCategory === 'Drink' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
              >
                Minuman
              </button>
              <button
                onClick={() => setFilterCategory('Snack')}
                className={`px-3 py-1 rounded-lg text-sm ${filterCategory === 'Snack' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
              >
                Snack
              </button>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <AlertTriangle size={16} className="mr-2" />
              Item yang Memerlukan Perhatian
            </h3>
            
            {getFilteredItems().length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <CheckCircle size={48} className="mx-auto mb-3 text-green-500" />
                <p>Tidak ada item yang memerlukan perhatian sesuai filter yang dipilih</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left">Nama Item</th>
                      <th className="px-4 py-2 text-left">Kategori</th>
                      <th className="px-4 py-2 text-right">Stok Tersisa</th>
                      <th className="px-4 py-2 text-right">Min. Stok</th>
                      <th className="px-4 py-2 text-center">Status</th>
                      <th className="px-4 py-2 text-right">Hari Terakhir Penjualan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {getFilteredItems().map((item, index) => (
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
                        <td className={`px-4 py-2 text-right ${
                          item.status === 'Kritis' ? 'text-red-500 font-medium' : 'text-yellow-500'
                        }`}>
                          {item.stock_quantity}
                        </td>
                        <td className="px-4 py-2 text-right">{item.min_stock || 10}</td>
                        <td className="px-4 py-2 text-center">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {item.last_sold ? item.last_sold : 'Belum ada'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {stockAlerts.recentTransactions && stockAlerts.recentTransactions.length > 0 && (
            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold mb-4">Transaksi Terbaru dari Item dengan Stok Rendah</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left">Nama Item</th>
                      <th className="px-4 py-2 text-right">Jumlah</th>
                      <th className="px-4 py-2 text-left">Waktu Transaksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {stockAlerts.recentTransactions.map((transaction, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-750' : ''}>
                        <td className="px-4 py-2 font-medium">{transaction.item_name}</td>
                        <td className="px-4 py-2 text-right">{transaction.quantity}</td>
                        <td className="px-4 py-2">
                          {new Date(transaction.transaction_time).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
      
      <div className="bg-blue-900 bg-opacity-20 p-4 rounded-lg border border-blue-800">
        <div className="flex items-start">
          <Info size={18} className="text-blue-500 mr-2 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-400 mb-1">Informasi Alert</h4>
            <p className="text-sm text-blue-300">
              • Item dengan stok <strong>Kritis</strong> (&lt;= 5 unit) perlu segera dipesan kembali.
            </p>
            <p className="text-sm text-blue-300">
              • Item dengan stok <strong>Rendah</strong> (&lt;= 10 unit) perlu diperhatikan dan dimasukkan ke dalam perencanaan pembelian.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockAlertSystem;