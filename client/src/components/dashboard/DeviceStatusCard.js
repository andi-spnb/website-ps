import React, { useState, useEffect } from 'react';
import { Monitor, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const DeviceStatusCard = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    inUse: 0,
    maintenance: 0,
    ps3Count: 0,
    ps4Count: 0,
    ps5Count: 0
  });

  const fetchDevices = async () => {
    try {
      setRefreshing(true);
      const response = await api.get('/devices');
      const deviceData = response.data;
      setDevices(deviceData);
      
      // Calculate stats
      const total = deviceData.length;
      const available = deviceData.filter(d => d.status === 'Available').length;
      const inUse = deviceData.filter(d => d.status === 'In Use').length;
      const maintenance = deviceData.filter(d => d.status === 'Maintenance').length;
      const ps3Count = deviceData.filter(d => d.device_type === 'PS3').length;
      const ps4Count = deviceData.filter(d => d.device_type === 'PS4').length;
      const ps5Count = deviceData.filter(d => d.device_type === 'PS5').length;
      
      setStats({
        total,
        available,
        inUse,
        maintenance,
        ps3Count,
        ps4Count,
        ps5Count
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching devices:', err);
      setError('Gagal memuat data perangkat. Silakan coba lagi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 shadow border border-gray-700 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="h-16 bg-gray-700 rounded"></div>
          <div className="h-16 bg-gray-700 rounded"></div>
          <div className="h-16 bg-gray-700 rounded"></div>
          <div className="h-16 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Monitor className="mr-2" size={20} />
          Status PlayStation
        </h3>
        <button 
          onClick={fetchDevices} 
          disabled={refreshing}
          className="p-1 rounded-full hover:bg-gray-700"
          title="Refresh"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900 bg-opacity-50 border border-red-800 rounded-lg text-sm text-red-200">
          {error}
          <button 
            onClick={fetchDevices}
            className="ml-2 underline"
          >
            Coba lagi
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 mb-4">
        <div className="bg-gray-700 rounded-lg p-3 border border-blue-500">
          <div className="text-sm text-gray-400">Total</div>
          <div className="text-2xl font-semibold">{stats.total}</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3 border border-green-500">
          <div className="text-sm text-gray-400">Tersedia</div>
          <div className="text-2xl font-semibold">{stats.available}</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3 border border-yellow-500">
          <div className="text-sm text-gray-400">Digunakan</div>
          <div className="text-2xl font-semibold">{stats.inUse}</div>
        </div>
        <div className="bg-gray-700 rounded-lg p-3 border border-red-500">
          <div className="text-sm text-gray-400">Maintenance</div>
          <div className="text-2xl font-semibold">{stats.maintenance}</div>
        </div>
      </div>
      
      <div className="bg-gray-700 rounded-lg p-3">
        <h4 className="text-sm text-gray-400 mb-2">Berdasarkan Jenis</h4>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="text-sm">PS3</div>
            <div className="font-semibold">{stats.ps3Count}</div>
          </div>
          <div>
            <div className="text-sm">PS4</div>
            <div className="font-semibold">{stats.ps4Count}</div>
          </div>
          <div>
            <div className="text-sm">PS5</div>
            <div className="font-semibold">{stats.ps5Count}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceStatusCard;