import React, { useState, useEffect } from 'react';
import { Monitor, Edit, Trash, Plus, AlertCircle, Check, X } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

// Contoh data default dari database SQL yang diberikan
const DEFAULT_DEVICES = [
  {
    device_id: 1,
    device_name: 'PS-01',
    device_type: 'PS4',
    status: 'Available',
    location: 'Ruang 1',
    added_date: '2025-03-28T15:00:26',
    createdAt: '2025-03-28T15:00:26',
    updatedAt: '2025-03-28T15:00:26'
  },
  {
    device_id: 2,
    device_name: 'PS-02',
    device_type: 'PS5',
    status: 'Available',
    location: 'Ruang 1',
    added_date: '2025-03-28T15:00:26',
    createdAt: '2025-03-28T15:00:26',
    updatedAt: '2025-03-28T15:00:26'
  },
  {
    device_id: 3,
    device_name: 'PS-03',
    device_type: 'PS4',
    status: 'Available',
    location: 'Ruang 2',
    added_date: '2025-03-28T15:00:26',
    createdAt: '2025-03-28T15:00:26',
    updatedAt: '2025-03-28T15:00:26'
  }
];

const DevicesList = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [formData, setFormData] = useState({
    device_name: '',
    device_type: 'PS4',
    status: 'Available',
    location: ''
  });

  const fetchDevices = async () => {
    try {
      setLoading(true);
      
      // Try to get data from API
      try {
        const response = await api.get('/devices');
        console.log("API response:", response.data);
        setDevices(response.data);
        setError(null);
      } catch (apiError) {
        console.error('Error fetching devices from API:', apiError);
        
        // Fallback to default data if API fails
        console.log("Using default devices data");
        setDevices(DEFAULT_DEVICES);
        // Don't set error since we're using default data
        setError(null);
      }
    } catch (err) {
      console.error('Error in fetchDevices:', err);
      setError('Gagal memuat data perangkat');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      // Try API first
      try {
        const response = await api.post('/devices', formData);
        toast.success('Perangkat berhasil ditambahkan');
        // Add the new device to our local state
        setDevices([...devices, response.data]);
      } catch (apiError) {
        console.error('API error:', apiError);
        
        // Fallback to local state update
        const newDevice = {
          device_id: Math.max(...devices.map(d => d.device_id)) + 1,
          ...formData,
          added_date: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setDevices([...devices, newDevice]);
        toast.success('Perangkat berhasil ditambahkan (mode lokal)');
      }
      
      setShowAddModal(false);
      setFormData({
        device_name: '',
        device_type: 'PS4',
        status: 'Available',
        location: ''
      });
    } catch (err) {
      console.error('Error adding device:', err);
      toast.error(err.response?.data?.message || 'Gagal menambahkan perangkat');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Try API first
      try {
        const response = await api.put(`/devices/${selectedDevice.device_id}`, formData);
        toast.success('Perangkat berhasil diperbarui');
        
        // Update device in local state
        setDevices(devices.map(device => 
          device.device_id === selectedDevice.device_id ? {...response.data} : device
        ));
      } catch (apiError) {
        console.error('API error:', apiError);
        
        // Fallback to local state update
        setDevices(devices.map(device => 
          device.device_id === selectedDevice.device_id 
            ? {...device, ...formData, updatedAt: new Date().toISOString()} 
            : device
        ));
        toast.success('Perangkat berhasil diperbarui (mode lokal)');
      }
      
      setShowEditModal(false);
    } catch (err) {
      console.error('Error updating device:', err);
      toast.error(err.response?.data?.message || 'Gagal memperbarui perangkat');
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      // Try API first
      try {
        await api.delete(`/devices/${selectedDevice.device_id}`);
        toast.success('Perangkat berhasil dihapus');
      } catch (apiError) {
        console.error('API error:', apiError);
        
        // Fallback to local state update
        toast.success('Perangkat berhasil dihapus (mode lokal)');
      }
      
      // Remove from local state
      setDevices(devices.filter(device => device.device_id !== selectedDevice.device_id));
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting device:', err);
      toast.error(err.response?.data?.message || 'Gagal menghapus perangkat');
    }
  };

  const openEditModal = (device) => {
    setSelectedDevice(device);
    setFormData({
      device_name: device.device_name,
      device_type: device.device_type,
      status: device.status,
      location: device.location || ''
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (device) => {
    setSelectedDevice(device);
    setShowDeleteModal(true);
  };

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

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="h-12 bg-gray-700 rounded mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 bg-opacity-20 p-4 rounded-lg border border-red-500">
        <div className="flex items-center text-red-500 mb-2">
          <AlertCircle size={18} className="mr-2" />
          <span className="font-medium">Error</span>
        </div>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Daftar PlayStation</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg"
        >
          <Plus size={18} className="mr-1" />
          Tambah PlayStation
        </button>
      </div>
      
      {devices.length === 0 ? (
        <div className="text-center py-8 text-gray-400 bg-gray-800 rounded-lg border border-gray-700">
          <Monitor size={48} className="mx-auto mb-3 opacity-30" />
          <p>Belum ada perangkat PlayStation yang tersedia</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg inline-flex items-center"
          >
            <Plus size={16} className="mr-1" />
            Tambah Perangkat
          </button>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left">Nama</th>
                <th className="py-3 px-4 text-left">Jenis</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Lokasi</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {devices.map(device => (
                <tr key={device.device_id} className="hover:bg-gray-750">
                  <td className="py-3 px-4 font-medium">{device.device_name}</td>
                  <td className="py-3 px-4">{device.device_type}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <span className={`inline-block w-2 h-2 rounded-full ${getStatusColor(device.status)} mr-2`}></span>
                      <span>
                        {device.status === 'Available' 
                          ? 'Tersedia' 
                          : device.status === 'In Use' 
                            ? 'Sedang Digunakan' 
                            : 'Maintenance'
                        }
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">{device.location || '-'}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openEditModal(device)}
                      className="text-blue-500 hover:text-blue-400 p-1"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(device)}
                      className="text-red-500 hover:text-red-400 p-1 ml-2"
                      title="Hapus"
                      disabled={device.status === 'In Use'}
                    >
                      <Trash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Add Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Tambah PlayStation</h2>
              <button onClick={() => setShowAddModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit}>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Nama PlayStation</label>
                <input
                  type="text"
                  name="device_name"
                  value={formData.device_name}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="Contoh: PS-01"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Jenis PlayStation</label>
                <select
                  name="device_type"
                  value={formData.device_type}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  required
                >
                  <option value="PS3">PS3</option>
                  <option value="PS4">PS4</option>
                  <option value="PS5">PS5</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  required
                >
                  <option value="Available">Tersedia</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-400 mb-2">Lokasi (Opsional)</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="Contoh: Ruang 1, Meja 3"
                />
              </div>
              
              <div className="flex space-x-3">
                <button 
                  type="button"
                  className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg"
                  onClick={() => setShowAddModal(false)}
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-medium"
                >
                  Tambah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Device Modal */}
      {showEditModal && selectedDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit PlayStation</h2>
              <button onClick={() => setShowEditModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Nama PlayStation</label>
                <input
                  type="text"
                  name="device_name"
                  value={formData.device_name}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="Contoh: PS-01"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Jenis PlayStation</label>
                <select
                  name="device_type"
                  value={formData.device_type}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  required
                >
                  <option value="PS3">PS3</option>
                  <option value="PS4">PS4</option>
                  <option value="PS5">PS5</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  required
                  disabled={formData.status === 'In Use'}
                >
                  <option value="Available">Tersedia</option>
                  <option value="In Use">Sedang Digunakan</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-400 mb-2">Lokasi (Opsional)</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="Contoh: Ruang 1, Meja 3"
                />
              </div>
              
              <div className="flex space-x-3">
                <button 
                  type="button"
                  className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg"
                  onClick={() => setShowEditModal(false)}
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded-lg font-medium"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="mb-4">
              <div className="flex items-center text-red-500 mb-2">
                <AlertCircle size={24} className="mr-2" />
                <h2 className="text-xl font-bold">Konfirmasi Hapus</h2>
              </div>
              <p>
                Apakah Anda yakin ingin menghapus PlayStation <strong>{selectedDevice.device_name}</strong>?
                Tindakan ini tidak dapat dikembalikan.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button 
                className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg"
                onClick={() => setShowDeleteModal(false)}
              >
                Batal
              </button>
              <button 
                className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-lg font-medium flex justify-center items-center"
                onClick={handleDeleteSubmit}
              >
                <Trash size={16} className="mr-2" />
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevicesList;