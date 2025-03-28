import React, { useState, useEffect } from 'react';
import { Monitor, Clock, Info } from 'lucide-react';
import api from '../../services/api';

const DeviceSelection = ({ onSelectDevice }) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await api.get('/devices');
        setDevices(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching devices:', err);
        setError('Gagal memuat data perangkat');
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-500';
      case 'In Use':
        return 'bg-yellow-500';
      case 'Maintenance':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredDevices = selectedType === 'all' 
    ? devices 
    : devices.filter(device => device.device_type === selectedType);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-700 rounded w-full"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 bg-opacity-20 p-4 rounded-lg border border-red-500">
        <div className="flex items-center text-red-500 mb-2">
          <Info size={18} className="mr-2" />
          <span className="font-medium">Error</span>
        </div>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex overflow-x-auto space-x-2 pb-2">
        <button
          onClick={() => setSelectedType('all')}
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
            selectedType === 'all' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          Semua
        </button>
        <button
          onClick={() => setSelectedType('PS5')}
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
            selectedType === 'PS5' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          PS5
        </button>
        <button
          onClick={() => setSelectedType('PS4')}
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
            selectedType === 'PS4' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          PS4
        </button>
        <button
          onClick={() => setSelectedType('PS3')}
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
            selectedType === 'PS3' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          PS3
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredDevices.map(device => (
          <div
            key={device.device_id}
            onClick={() => device.status === 'Available' && onSelectDevice(device)}
            className={`bg-gray-800 border rounded-lg p-4 ${
              device.status === 'Available'
                ? 'border-green-500 cursor-pointer hover:bg-gray-700'
                : 'border-gray-700 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold">{device.device_name}</h3>
              <span className={`inline-block w-3 h-3 rounded-full ${getStatusColor(device.status)}`}></span>
            </div>
            <div className="flex items-center mb-2">
              <Monitor size={16} className="mr-2 text-gray-400" />
              <span>{device.device_type}</span>
            </div>
            <div className="flex items-center mb-3">
              <Clock size={16} className="mr-2 text-gray-400" />
              <span className="text-sm">
                {device.status === 'Available' 
                  ? 'Tersedia'
                  : device.status === 'In Use'
                    ? 'Sedang Digunakan'
                    : 'Maintenance'
                }
              </span>
            </div>
            {device.status === 'Available' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectDevice(device);
                }}
                className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm"
              >
                Pilih PlayStation
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeviceSelection;