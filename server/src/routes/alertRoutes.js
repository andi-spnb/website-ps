import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, XCircle, Info, Settings, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

// Komponen utama untuk sistem peringatan stok
const StockAlertSystem = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'unread', 'critical'
  const [thresholds, setThresholds] = useState({
    critical: 5,
    low: 10
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(300000); // 5 menit dalam milidetik

  // Mengambil data peringatan stok
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/alerts/stock');
      
      // Urutkan peringatan berdasarkan tingkat keparahan dan waktu
      const sortedAlerts = response.data.sort((a, b) => {
        // Urutkan berdasarkan tingkat keparahan (Critical, Low)
        if (a.severity !== b.severity) {
          return a.severity === 'Critical' ? -1 : 1;
        }
        // Jika tingkat keparahan sama, urutkan berdasarkan waktu (terbaru dulu)
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
      
      setAlerts(sortedAlerts);
      setError(null);
      
      // Hitung jumlah peringatan belum dibaca
      const unreadCount = sortedAlerts.filter(alert => !alert.isRead).length;
      if (unreadCount > 0) {
        document.title = `(${unreadCount}) Kenzie Gaming - Peringatan Stok`;
      } else {
        document.title = 'Kenzie Gaming';
      }
    } catch (err) {
      console.error('Error fetching stock alerts:', err);
      setError('Gagal memuat data peringatan stok');
      
      // Data contoh untuk pengembangan
      const mockAlerts = [
        {
          id: 1,
          item_id: 101,
          item_name: 'Coca Cola',
          category: 'Drink',
          current_stock: 3,
          min_stock: 10,
          severity: 'Critical',
          message: 'Stok Coca Cola sangat rendah (3 tersisa)',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 menit yang lalu
          isRead: false
        },
        {
          id: 2,
          item_id: 102,
          item_name: 'Keripik',
          category: 'Snack',
          current_stock: 7,
          min_stock: 10,
          severity: 'Low',
          message: 'Stok Keripik hampir habis (7 tersisa)',
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 jam yang lalu
          isRead: true
        },
        {
          id: 3,
          item_id: 103,
          item_name: 'Mie Goreng',
          category: 'Food',
          current_stock: 4,
          min_stock: 15,
          severity: 'Low',
          message: 'Stok Mie Goreng hampir habis (4 tersisa)',
          timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 jam yang lalu
          isRead: false
        },
        {
          id: 4,
          item_id: 104,
          item_name: 'Es Teh',
          category: 'Drink',
          current_stock: 2,
          min_stock: 10,
          severity: 'Critical',
          message: 'Stok Es Teh sangat rendah (2 tersisa)',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 menit yang lalu
          isRead: false
        }
      ];
      
      setAlerts(mockAlerts);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Memuat data peringatan saat komponen dimount
  useEffect(() => {
    fetchAlerts();
  }, []);

  // Mengatur auto-refresh
  useEffect(() => {
    let intervalId;
    
    if (autoRefresh) {
      intervalId = setInterval(fetchAlerts, refreshInterval);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, refreshInterval]);

  // Menangani tanda baca peringatan
  const handleMarkAsRead = async (alertId) => {
    try {
      await api.patch(`/alerts/${alertId}/read`);
      
      // Update state
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      ));
      
      toast.success('Peringatan ditandai sebagai telah dibaca');
    } catch (err) {
      console.error('Error marking alert as read:', err);
      toast.error('Gagal menandai peringatan sebagai telah dibaca');
      
      // Untuk pengembangan, update state langsung
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      ));
    }
  };

  // Menangani penandaan semua peringatan sebagai telah dibaca
  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/alerts/read-all');
      
      // Update state
      setAlerts(alerts.map(alert => ({ ...alert, isRead: true })));
      
      toast.success('Semua peringatan ditandai sebagai telah dibaca');
    } catch (err) {
      console.error('Error marking all alerts as read:', err);
      toast.error('Gagal menandai semua peringatan sebagai telah dibaca');
      
      // Untuk pengembangan, update state langsung
      setAlerts(alerts.map(alert => ({ ...alert, isRead: true })));
    }
  };

  // Menangani penghapusan peringatan
  const handleDismissAlert = async (alertId) => {
    try {
      await api.delete(`/alerts/${alertId}`);
      
      // Update state
      setAlerts(alerts.filter(alert => alert.id !== alertId));
      
      toast.success('Peringatan telah dihapus');
    } catch (err) {
      console.error('Error dismissing alert:', err);
      toast.error('Gagal menghapus peringatan');
      
      // Untuk pengembangan, update state langsung
      setAlerts(alerts.filter(alert => alert.id !== alertId));
    }
  };

  // Menangani update pengaturan threshold
  const handleThresholdUpdate = async () => {
    try {
      await api.put('/settings/stock-thresholds', thresholds);
      
      toast.success('Pengaturan threshold berhasil diperbarui');
      setShowSettings(false);
    } catch (err) {
      console.error('Error updating thresholds:', err);
      toast.error('Gagal memperbarui pengaturan threshold');
      
      // Untuk pengembangan, tutup panel pengaturan
      setShowSettings(false);
    }
  };

  // Filter peringatan berdasarkan status
  const filteredAlerts = alerts.filter(alert => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'unread') return !alert.isRead;
    if (filterStatus === 'critical') return alert.severity === 'Critical';
    return true;
  });

  // Mendapatkan warna berdasarkan tingkat keparahan
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical':
        return 'text-red-500';
      case 'Low':
        return 'text-yellow-500';
      default:
        return 'text-blue-500';
    }
  };

  // Mendapatkan ikon berdasarkan tingkat keparahan
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'Critical':
        return <AlertTriangle size={20} className="text-red-500" />;
      case 'Low':
        return <Info size={20} className="text-yellow-500" />;
      default:
        return <Info size={20} className="text-blue-500" />;
    }
  };

  // Mengubah format waktu peringatan
  const formatAlertTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffMinutes < 1) {
      return 'Baru saja';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} menit yang lalu`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)} jam yang lalu`;
    } else {
      return date.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Bell size={24} className="mr-2" />
          <h2 className="text-xl font-semibold">Peringatan Stok</h2>
          {alerts.filter(alert => !alert.isRead).length > 0 && (
            <span className="ml-3 px-2 py-1 bg-red-600 text-white text-xs rounded-full">
              {alerts.filter(alert => !alert.isRead).length} baru
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
            title="Pengaturan"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={fetchAlerts}
            className={`p-2 bg-gray-700 hover:bg-gray-600 rounded-lg ${refreshing ? 'animate-spin' : ''}`}
            disabled={refreshing}
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>
      
      {/* Pengaturan */}
      {showSettings && (
        <div className="bg-gray-700 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold mb-2">Pengaturan Peringatan Stok</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Threshold Stok Kritis</label>
              <input
                type="number"
                value={thresholds.critical}
                onChange={(e) => setThresholds({...thresholds, critical: parseInt(e.target.value) || 0})}
                className="w-full bg-gray-800 border border-gray-600 rounded p-2"
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Item dengan stok di bawah nilai ini akan ditandai sebagai "Kritis"
              </p>
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-1">Threshold Stok Rendah</label>
              <input
                type="number"
                value={thresholds.low}
                onChange={(e) => setThresholds({...thresholds, low: parseInt(e.target.value) || 0})}
                className="w-full bg-gray-800 border border-gray-600 rounded p-2"
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Item dengan stok di bawah nilai ini akan ditandai sebagai "Rendah"
              </p>
            </div>
          </div>
          
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 mr-2"
            />
            <label htmlFor="autoRefresh" className="text-sm">Auto-refresh peringatan</label>
            
            {autoRefresh && (
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                className="ml-4 bg-gray-800 border border-gray-600 rounded p-1"
              >
                <option value={60000}>Setiap 1 menit</option>
                <option value={300000}>Setiap 5 menit</option>
                <option value={600000}>Setiap 10 menit</option>
                <option value={1800000}>Setiap 30 menit</option>
              </select>
            )}
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={() => setShowSettings(false)}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded-lg mr-2"
            >
              Batal
            </button>
            <button
              onClick={handleThresholdUpdate}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Simpan Pengaturan
            </button>
          </div>
        </div>
      )}
      
      {/* Filter */}
      <div className="flex mb-4">
        <div className="bg-gray-700 p-1 rounded-lg flex">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded ${filterStatus === 'all' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilterStatus('unread')}
            className={`px-3 py-1 rounded ${filterStatus === 'unread' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
          >
            Belum Dibaca
          </button>
          <button
            onClick={() => setFilterStatus('critical')}
            className={`px-3 py-1 rounded ${filterStatus === 'critical' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
          >
            Kritis
          </button>
        </div>
        
        {alerts.some(alert => !alert.isRead) && (
          <button
            onClick={handleMarkAllAsRead}
            className="ml-auto px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
          >
            Tandai Semua Telah Dibaca
          </button>
        )}
      </div>
      
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-700 rounded"></div>
          ))}
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="text-center py-8 text-gray-400 bg-gray-700 rounded-lg">
          <CheckCircle size={48} className="mx-auto mb-3 text-green-500" />
          <p>Tidak ada peringatan {filterStatus !== 'all' ? `dengan filter "${filterStatus}"` : ''}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`bg-gray-700 rounded-lg p-4 ${!alert.isRead ? 'border-l-4 border-blue-500' : ''}`}
            >
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  {getSeverityIcon(alert.severity)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">
                        {alert.item_name}
                        <span className={`ml-2 text-sm ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </h4>
                      <p className="text-sm text-gray-400 mt-1">{alert.message}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatAlertTime(alert.timestamp)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center">
                      <span className="text-xs px-2 py-1 bg-gray-600 rounded mr-2">
                        {alert.category}
                      </span>
                      <span className="text-xs">
                        Stok saat ini: <span className={alert.severity === 'Critical' ? 'text-red-500 font-medium' : 'text-yellow-500 font-medium'}>
                          {alert.current_stock}
                        </span> / Min: {alert.min_stock}
                      </span>
                    </div>
                    <div className="flex">
                      {!alert.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(alert.id)}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs mr-2"
                        >
                          Tandai Telah Dibaca
                        </button>
                      )}
                      <button
                        onClick={() => handleDismissAlert(alert.id)}
                        className="px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-xs"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {filteredAlerts.length > 0 && (
        <div className="mt-4 p-3 bg-gray-700 rounded-lg">
          <div className="text-sm flex items-center">
            <Info size={16} className="mr-2 text-blue-500" />
            <span>
              Terdapat {alerts.filter(a => a.severity === 'Critical').length} item dengan stok kritis dan {alerts.filter(a => a.severity === 'Low').length} item dengan stok rendah yang perlu perhatian.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockAlertSystem;

// Komponen notifikasi untuk digunakan di sidebar atau navbar
export const StockAlertNotification = () => {
  const [alertCount, setAlertCount] = useState(0);
  
  // Periksa jumlah peringatan stok
  const checkAlerts = async () => {
    try {
      const response = await api.get('/alerts/stock/count');
      setAlertCount(response.data.count);
    } catch (err) {
      console.error('Error checking stock alerts:', err);
      // Data contoh untuk pengembangan
      setAlertCount(3);
    }
  };
  
  // Periksa jumlah peringatan saat komponen dimount
  useEffect(() => {
    checkAlerts();
    
    // Periksa peringatan setiap menit
    const intervalId = setInterval(checkAlerts, 60000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  return (
    <div className="relative">
      <Bell size={20} />
      {alertCount > 0 && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">{alertCount}</span>
        </div>
      )}
    </div>
  );
};

// Komponen widget ringkasan untuk dashboard
export const StockAlertSummary = () => {
  const [alertSummary, setAlertSummary] = useState({
    critical: 0,
    low: 0,
    items: []
  });
  const [loading, setLoading] = useState(true);
  
  // Ambil ringkasan peringatan stok
  const fetchAlertSummary = async () => {
    try {
      setLoading(true);
      const response = await api.get('/alerts/stock/summary');
      setAlertSummary(response.data);
    } catch (err) {
      console.error('Error fetching stock alert summary:', err);
      // Data contoh untuk pengembangan
      setAlertSummary({
        critical: 2,
        low: 1,
        items: [
          { id: 101, name: 'Coca Cola', category: 'Drink', current_stock: 3, min_stock: 10, severity: 'Critical' },
          { id: 104, name: 'Es Teh', category: 'Drink', current_stock: 2, min_stock: 10, severity: 'Critical' },
          { id: 103, name: 'Mie Goreng', category: 'Food', current_stock: 4, min_stock: 15, severity: 'Low' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Ambil ringkasan saat komponen dimount
  useEffect(() => {
    fetchAlertSummary();
  }, []);
  
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 shadow border border-gray-700 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-20 bg-gray-700 rounded"></div>
      </div>
    );
  }
  
  // Jika tidak ada peringatan
  if (alertSummary.critical === 0 && alertSummary.low === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 shadow border border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold flex items-center">
            <Bell size={18} className="mr-2" />
            Status Stok
          </h3>
          <button
            onClick={fetchAlertSummary}
            className="p-1 rounded-full hover:bg-gray-700"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
        </div>
        
        <div className="flex items-center justify-center py-3 text-green-400">
          <CheckCircle size={20} className="mr-2" />
          <span>Semua stok dalam kondisi baik</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-gray-800 rounded-lg p-4 shadow border ${
      alertSummary.critical > 0 ? 'border-red-500' : 'border-yellow-500'
    }`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold flex items-center">
          <Bell size={18} className="mr-2" />
          Peringatan Stok
        </h3>
        <button
          onClick={fetchAlertSummary}
          className="p-1 rounded-full hover:bg-gray-700"
          title="Refresh"
        >
          <RefreshCw size={14} />
        </button>
      </div>
      
      <div className="space-y-2">
        {alertSummary.critical > 0 && (
          <div className="flex items-center text-red-500">
            <AlertTriangle size={16} className="mr-2" />
            <span>
              {alertSummary.critical} item dengan stok kritis
            </span>
          </div>
        )}
        
        {alertSummary.low > 0 && (
          <div className="flex items-center text-yellow-500">
            <Info size={16} className="mr-2" />
            <span>
              {alertSummary.low} item dengan stok rendah
            </span>
          </div>
        )}
      </div>
      
      {alertSummary.items.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="text-xs text-gray-400 mb-2">Item yang memerlukan perhatian:</div>
          <div className="space-y-2">
            {alertSummary.items.slice(0, 3).map(item => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center">
                  {item.severity === 'Critical' ? (
                    <AlertTriangle size={14} className="mr-2 text-red-500" />
                  ) : (
                    <Info size={14} className="mr-2 text-yellow-500" />
                  )}
                  <span className="text-sm">{item.name}</span>
                </div>
                <div className="text-sm">
                  <span className={item.severity === 'Critical' ? 'text-red-500' : 'text-yellow-500'}>
                    {item.current_stock}
                  </span>
                  <span className="text-gray-500">/{item.min_stock}</span>
                </div>
              </div>
            ))}
            
            {alertSummary.items.length > 3 && (
              <div className="text-xs text-center text-blue-500 hover:underline cursor-pointer mt-1">
                +{alertSummary.items.length - 3} item lainnya
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};