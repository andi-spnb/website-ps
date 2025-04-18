import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Plus, 
  Edit, 
  Trash, 
  AlertCircle, 
  Search, 
  X, 
  CheckCircle,
  AlignLeft,
  Clock
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { IdCard } from 'lucide-react';


const AdminPlayboxPage = () => {
  const [playboxes, setPlayboxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPlaybox, setSelectedPlaybox] = useState(null);
  const [activeTab, setActiveTab] = useState('playboxes'); // 'playboxes' or 'reservations'
  const [reservations, setReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [identityData, setIdentityData] = useState(null);
  const [loadingIdentity, setLoadingIdentity] = useState(false);
  const [identityError, setIdentityError] = useState(null);

  
  const [formData, setFormData] = useState({
    playbox_name: '',
    tv_size: '',
    ps4_model: 'PS4 Slim',
    controllers_count: 2,
    description: '',
    image_url: '',
    status: 'Available',
    location: '',
    featured: false
  });

  const fetchPlayboxes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/playbox');
      setPlayboxes(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching playboxes:', err);
      setError('Gagal memuat data Playbox');
    } finally {
      setLoading(false);
    }
  };

  const getCorrectImageUrl = (path) => {
    if (!path) return null;
    
    // Jika path sudah lengkap dengan http, kembalikan apa adanya
    if (path.startsWith('http')) {
      return path;
    }
    
    // Gunakan URL langsung, bukan melalui konfigurasi API
    // Pastikan path dimulai dengan slash
    const formattedPath = path.startsWith('/') ? path : `/${path}`;
    const fullUrl = `http://localhost:5000${formattedPath}`;
    
    console.log('Original path:', path);
    console.log('Direct URL:', fullUrl);
    
    return fullUrl;
  };

  const fetchReservations = async () => {
    try {
      setLoadingReservations(true);
      const response = await api.get('/playbox/reservations');
      setReservations(response.data);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      toast.error('Gagal memuat data reservasi');
    } finally {
      setLoadingReservations(false);
    }
  };

  useEffect(() => {
    fetchPlayboxes();
    
    if (activeTab === 'reservations') {
      fetchReservations();
    }
  }, [activeTab]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/playbox', formData);
      toast.success('Playbox berhasil ditambahkan');
      setShowAddModal(false);
      setFormData({
        playbox_name: '',
        tv_size: '',
        ps4_model: 'PS4 Slim',
        controllers_count: 2,
        description: '',
        image_url: '',
        status: 'Available',
        location: '',
        featured: false
      });
      fetchPlayboxes();
    } catch (err) {
      console.error('Error adding playbox:', err);
      toast.error(err.response?.data?.message || 'Gagal menambahkan Playbox');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/playbox/${selectedPlaybox.playbox_id}`, formData);
      toast.success('Playbox berhasil diperbarui');
      setShowEditModal(false);
      fetchPlayboxes();
    } catch (err) {
      console.error('Error updating playbox:', err);
      toast.error(err.response?.data?.message || 'Gagal memperbarui Playbox');
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      await api.delete(`/playbox/${selectedPlaybox.playbox_id}`);
      toast.success('Playbox berhasil dihapus');
      setShowDeleteModal(false);
      fetchPlayboxes();
    } catch (err) {
      console.error('Error deleting playbox:', err);
      toast.error(err.response?.data?.message || 'Gagal menghapus Playbox');
    }
  };
  
  const fetchIdentityData = async (reservationId) => {
    try {
      setLoadingIdentity(true);
      const response = await api.get(`/playbox/reservations/${reservationId}/identity`);
      setIdentityData(response.data);
      setIdentityError(null);
    } catch (err) {
      console.error('Error fetching identity data:', err);
      setIdentityError('Data identitas tidak tersedia');
      setIdentityData(null);
    } finally {
      setLoadingIdentity(false);
    }
  };

  const handleUpdateReservationStatus = async (newStatus) => {
    if (!selectedReservation) return;
    
    try {
      await api.put(`/playbox/reservations/${selectedReservation.reservation_id}/status`, {
        status: newStatus,
        notes: statusNote
      });
      
      toast.success(`Status reservasi diperbarui ke ${newStatus}`);
      setShowReservationModal(false);
      setStatusNote('');
      fetchReservations();
    } catch (err) {
      console.error('Error updating reservation status:', err);
      toast.error(err.response?.data?.message || 'Gagal memperbarui status reservasi');
    }
  };
  
  const handleConfirmReservation = async () => {
    if (!selectedReservation) return;
    
    try {
      await api.post(`/playbox/reservations/${selectedReservation.reservation_id}/confirm`);
      
      toast.success('Reservasi berhasil dikonfirmasi');
      setShowReservationModal(false);
      fetchReservations();
    } catch (err) {
      console.error('Error confirming reservation:', err);
      toast.error(err.response?.data?.message || 'Gagal mengkonfirmasi reservasi');
    }
  };

  const openEditModal = (playbox) => {
    setSelectedPlaybox(playbox);
    setFormData({
      playbox_name: playbox.playbox_name,
      tv_size: playbox.tv_size,
      ps4_model: playbox.ps4_model,
      controllers_count: playbox.controllers_count,
      description: playbox.description || '',
      image_url: playbox.image_url || '',
      status: playbox.status,
      location: playbox.location || '',
      featured: playbox.featured || false
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (playbox) => {
    setSelectedPlaybox(playbox);
    setShowDeleteModal(true);
  };
  
const openReservationModal = (reservation) => {
  setSelectedReservation(reservation);
  setShowReservationModal(true);
  
  // Ambil data identitas jika ada reservation_id
  if (reservation && reservation.reservation_id) {
    fetchIdentityData(reservation.reservation_id);
  }
};


  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-500';
      case 'In Use':
        return 'bg-yellow-500';
      case 'Maintenance':
        return 'bg-red-500';
      case 'In Transit':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  const getReservationStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="px-2 py-1 bg-yellow-900 bg-opacity-20 text-yellow-500 rounded-full text-xs">Menunggu Konfirmasi</span>;
      case 'Confirmed':
        return <span className="px-2 py-1 bg-green-900 bg-opacity-20 text-green-500 rounded-full text-xs">Dikonfirmasi</span>;
      case 'In Preparation':
        return <span className="px-2 py-1 bg-blue-900 bg-opacity-20 text-blue-500 rounded-full text-xs">Dalam Persiapan</span>;
      case 'In Transit':
        return <span className="px-2 py-1 bg-purple-900 bg-opacity-20 text-purple-500 rounded-full text-xs">Dalam Pengantaran</span>;
      case 'In Use':
        return <span className="px-2 py-1 bg-green-900 bg-opacity-20 text-green-500 rounded-full text-xs">Sedang Digunakan</span>;
      case 'Returning':
        return <span className="px-2 py-1 bg-orange-900 bg-opacity-20 text-orange-500 rounded-full text-xs">Perjalanan Kembali</span>;
      case 'Completed':
        return <span className="px-2 py-1 bg-gray-900 bg-opacity-20 text-gray-400 rounded-full text-xs">Selesai</span>;
      case 'Cancelled':
        return <span className="px-2 py-1 bg-red-900 bg-opacity-20 text-red-500 rounded-full text-xs">Dibatalkan</span>;
      default:
        return <span className="px-2 py-1 bg-gray-900 bg-opacity-20 text-gray-400 rounded-full text-xs">{status}</span>;
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredPlayboxes = playboxes.filter(playbox => 
    playbox.playbox_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    playbox.tv_size.toLowerCase().includes(searchQuery.toLowerCase()) ||
    playbox.ps4_model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (playbox.location && playbox.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const filteredReservations = reservations.filter(reservation =>
    reservation.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reservation.customer_phone.includes(searchQuery) ||
    reservation.booking_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (reservation.Playbox && reservation.Playbox.playbox_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading && activeTab === 'playboxes') {
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Playbox Management</h2>
        {activeTab === 'playboxes' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg"
          >
            <Plus size={18} className="mr-1" />
            Tambah Playbox
          </button>
        )}
      </div>
      
      <div className="flex border-b border-gray-700 mb-6">
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'playboxes' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
          onClick={() => setActiveTab('playboxes')}
        >
          <Monitor size={16} className="inline-block mr-1" />
          Daftar Playbox
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'reservations' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
          onClick={() => setActiveTab('reservations')}
        >
          <Clock size={16} className="inline-block mr-1" />
          Reservasi
        </button>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder={activeTab === 'playboxes' ? "Cari nama, tipe, atau lokasi Playbox..." : "Cari nama, nomor telepon, atau kode booking..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>
      
      {error && activeTab === 'playboxes' && (
        <div className="bg-red-900 bg-opacity-20 p-4 rounded-lg border border-red-500 mb-6">
          <div className="flex items-center text-red-500 mb-2">
            <AlertCircle size={18} className="mr-2" />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-red-400">{error}</p>
        </div>
      )}
      
      {/* Playboxes Tab */}
      {activeTab === 'playboxes' && (
        <>
          {filteredPlayboxes.length === 0 ? (
            <div className="text-center py-8 text-gray-400 bg-gray-800 rounded-lg border border-gray-700">
              <Monitor size={48} className="mx-auto mb-3 opacity-30" />
              {searchQuery ? (
                <p>Tidak ada Playbox yang sesuai dengan pencarian "{searchQuery}"</p>
              ) : (
                <p>Belum ada data Playbox</p>
              )}
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg inline-flex items-center"
              >
                <Plus size={16} className="mr-1" />
                Tambah Playbox
              </button>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left">Nama</th>
                    <th className="py-3 px-4 text-left">Spesifikasi</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Lokasi</th>
                    <th className="py-3 px-4 text-center">Featured</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredPlayboxes.map(playbox => (
                    <tr key={playbox.playbox_id} className="hover:bg-gray-750">
                      <td className="py-3 px-4 font-medium">{playbox.playbox_name}</td>
                      <td className="py-3 px-4">
                        {playbox.tv_size} + {playbox.ps4_model}
                        <div className="text-xs text-gray-400">
                          {playbox.controllers_count} Controller
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className={`inline-block w-2 h-2 rounded-full ${getStatusColor(playbox.status)} mr-2`}></span>
                          <span>
                            {playbox.status === 'Available' 
                              ? 'Tersedia' 
                              : playbox.status === 'In Use' 
                                ? 'Sedang Digunakan' 
                                : playbox.status === 'In Transit'
                                  ? 'Dalam Perjalanan'
                                  : 'Maintenance'
                            }
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{playbox.location || '-'}</td>
                      <td className="py-3 px-4 text-center">
                        {playbox.featured ? (
                          <CheckCircle size={16} className="text-green-500 mx-auto" />
                        ) : (
                          <X size={16} className="text-gray-500 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openEditModal(playbox)}
                          className="text-blue-500 hover:text-blue-400 p-1"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(playbox)}
                          className="text-red-500 hover:text-red-400 p-1 ml-2"
                          title="Hapus"
                          disabled={playbox.status === 'In Use'}
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
        </>
      )}
      
      {/* Reservations Tab */}
      {activeTab === 'reservations' && (
        <>
          {loadingReservations ? (
            <div className="animate-pulse space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-700 rounded"></div>
              ))}
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="text-center py-8 text-gray-400 bg-gray-800 rounded-lg border border-gray-700">
              <Clock size={48} className="mx-auto mb-3 opacity-30" />
              {searchQuery ? (
                <p>Tidak ada reservasi yang sesuai dengan pencarian "{searchQuery}"</p>
              ) : (
                <p>Belum ada data reservasi</p>
              )}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left">Kode Booking</th>
                    <th className="py-3 px-4 text-left">Playbox</th>
                    <th className="py-3 px-4 text-left">Customer</th>
                    <th className="py-3 px-4 text-left">Jadwal</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredReservations.map(reservation => (
                    <tr key={reservation.reservation_id} className="hover:bg-gray-750">
                      <td className="py-3 px-4 font-medium">{reservation.booking_code}</td>
                      <td className="py-3 px-4">
                        {reservation.Playbox ? reservation.Playbox.playbox_name : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <div>{reservation.customer_name}</div>
                        <div className="text-xs text-gray-400">{reservation.customer_phone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div>{formatDate(reservation.start_time)}</div>
                        <div className="text-xs text-gray-400">
                          {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getReservationStatusBadge(reservation.status)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openReservationModal(reservation)}
                          className="text-blue-500 hover:text-blue-400 p-1"
                          title="Detail"
                        >
                          <AlignLeft size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      
      {/* Add Playbox Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Tambah Playbox</h2>
              <button onClick={() => setShowAddModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit}>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Nama Playbox</label>
                <input
                  type="text"
                  name="playbox_name"
                  value={formData.playbox_name}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="Contoh: Playbox 01"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Ukuran TV</label>
                <input
                  type="text"
                  name="tv_size"
                  value={formData.tv_size}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="Contoh: 32 inch LED"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Model PS4</label>
                <select
                  name="ps4_model"
                  value={formData.ps4_model}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  required
                >
                  <option value="PS4 Slim">PS4 Slim</option>
                  <option value="PS4 Pro">PS4 Pro</option>
                  <option value="PS4 Original">PS4 Original</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Jumlah Controller</label>
                <input
                  type="number"
                  name="controllers_count"
                  value={formData.controllers_count}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  min="1"
                  max="4"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Deskripsi</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 h-24"
                  placeholder="Deskripsi singkat tentang Playbox ini"
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">URL Gambar</label>
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="https://example.com/image.jpg"
                />
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
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Lokasi (Opsional)</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="Contoh: Ruang Penyimpanan A"
                />
              </div>
              
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-gray-400">Tampilkan sebagai Playbox unggulan</span>
                </label>
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
      
      {/* Edit Playbox Modal */}
      {showEditModal && selectedPlaybox && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Playbox</h2>
              <button onClick={() => setShowEditModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Nama Playbox</label>
                <input
                  type="text"
                  name="playbox_name"
                  value={formData.playbox_name}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="Contoh: Playbox 01"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Ukuran TV</label>
                <input
                  type="text"
                  name="tv_size"
                  value={formData.tv_size}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="Contoh: 32 inch LED"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Model PS4</label>
                <select
                  name="ps4_model"
                  value={formData.ps4_model}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  required
                >
                  <option value="PS4 Slim">PS4 Slim</option>
                  <option value="PS4 Pro">PS4 Pro</option>
                  <option value="PS4 Original">PS4 Original</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Jumlah Controller</label>
                <input
                  type="number"
                  name="controllers_count"
                  value={formData.controllers_count}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  min="1"
                  max="4"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Deskripsi</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 h-24"
                  placeholder="Deskripsi singkat tentang Playbox ini"
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">URL Gambar</label>
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="https://example.com/image.jpg"
                />
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
                  <option value="In Use">Sedang Digunakan</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="In Transit">Dalam Perjalanan</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Lokasi (Opsional)</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="Contoh: Ruang Penyimpanan A"
                />
              </div>
              
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-gray-400">Tampilkan sebagai Playbox unggulan</span>
                </label>
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
      {showDeleteModal && selectedPlaybox && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="mb-4">
              <div className="flex items-center text-red-500 mb-2">
                <AlertCircle size={24} className="mr-2" />
                <h2 className="text-xl font-bold">Konfirmasi Hapus</h2>
              </div>
              <p>
                Apakah Anda yakin ingin menghapus Playbox <strong>{selectedPlaybox.playbox_name}</strong>?
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
      
      {/* Reservation Detail Modal */}
      {showReservationModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-3xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Detail Reservasi</h2>
              <button onClick={() => setShowReservationModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Informasi Reservasi</h3>
                <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Kode Booking:</span>
                    <span className="font-medium">{selectedReservation.booking_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span>{getReservationStatusBadge(selectedReservation.status)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tanggal:</span>
                    <span>{formatDate(selectedReservation.start_time)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Waktu:</span>
                    <span>{formatTime(selectedReservation.start_time)} - {formatTime(selectedReservation.end_time)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Pembayaran:</span>
                    <span>Rp{selectedReservation.total_amount.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Metode Pembayaran:</span>
                    <span>{selectedReservation.payment_method || '-'}</span>
                  </div>
{selectedReservation.payment_proof_url && (
  <div className="mb-6">
    <h3 className="text-lg font-semibold mb-3">Bukti Pembayaran</h3>
    <div className="bg-gray-700 rounded-lg p-4">
      <a 
        href={getCorrectImageUrl(selectedReservation.payment_proof_url)}
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-blue-400 hover:underline"
      >
        Lihat / Download Bukti
      </a>
      {/\.(jpg|jpeg|png|webp|gif)$/i.test(selectedReservation.payment_proof_url) && (
        <div className="mt-4">
<img 
  src={getCorrectImageUrl(selectedReservation.payment_proof_url)}
  alt="Bukti Pembayaran" 
  className="rounded border border-gray-600 max-h-64 object-contain"
  onError={(e) => {
    console.error('Payment proof image failed to load:', e);
    e.target.src = '/placeholder-payment.png';
    e.target.classList.add('img-error');
    console.log('Original payment proof URL:', selectedReservation.payment_proof_url);
    console.log('Failed URL:', getCorrectImageUrl(selectedReservation.payment_proof_url));
  }}
/>
        </div>
      )}
    </div>
  </div>
)}
                {selectedReservation && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Identitas Pelanggan</h3>
                    
                    {loadingIdentity ? (
                      <div className="bg-gray-700 rounded-lg p-4 animate-pulse">
                        <div className="h-4 bg-gray-600 rounded w-1/3 mb-3"></div>
                        <div className="h-4 bg-gray-600 rounded w-1/2 mb-3"></div>
                        <div className="h-24 bg-gray-600 rounded mb-3"></div>
                      </div>
                    ) : identityError ? (
                      <div className="bg-red-900 bg-opacity-20 p-4 rounded-lg border border-red-500">
                        <div className="flex items-center text-red-500 mb-2">
                          <AlertCircle size={18} className="mr-2" />
                          <span className="font-medium">Error</span>
                        </div>
                        <p className="text-red-400">{identityError}</p>
                      </div>
                    ) : identityData ? (
                      <div className="bg-gray-700 rounded-lg p-4">
                        <div className="flex justify-between mb-3">
                          <div>
                            <span className="text-gray-400">Jenis Identitas:</span>
                            <span className="ml-2 font-medium">{identityData.identity_type}</span>
                          </div>
                          
                          {identityData.identity_number && (
                            <div>
                              <span className="text-gray-400">Nomor:</span>
                              <span className="ml-2 font-medium">{identityData.identity_number}</span>
                            </div>
                          )}
                        </div>
                        
                        {identityData && identityData.identity_file_url && (
  <div>
    <div className="text-gray-400 mb-2">File Identitas:</div>
    <div className="border border-gray-600 rounded-lg p-2 bg-gray-800">
      <a 
        href={getCorrectImageUrl(identityData.identity_file_url)}
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-blue-400 hover:underline flex items-center"
      >
        <IdCard size={16} className="mr-2" />
        Lihat Identitas
      </a>
      
      {/\.(jpg|jpeg|png|webp|gif)$/i.test(identityData.identity_file_url) && (
        <div className="mt-3">
<img 
  src={getCorrectImageUrl(identityData.identity_file_url)}
  alt="Identitas Pelanggan" 
  className="rounded border border-gray-600 max-h-64 object-contain mx-auto"
  onError={(e) => {
    console.error('Image failed to load:', e);
    e.target.src = '/placeholder-id.png';
    e.target.classList.add('img-error');
    console.log('Original identity URL:', identityData.identity_file_url);
    console.log('Failed URL:', getCorrectImageUrl(identityData.identity_file_url));
  }}
/>
        </div>
      )}
    </div>
    
    <div className="mt-2 text-xs text-gray-400">
      <p>File identitas akan otomatis dihapus pada: {new Date(identityData.expiry_date).toLocaleString('id-ID')}</p>
    </div>
  </div>
)}
                      </div>
                    ) : (
                      <div className="bg-gray-700 rounded-lg p-4 text-center text-gray-400">
                        <IdCard size={32} className="mx-auto mb-2 opacity-50" />
                        <p>Tidak ada data identitas yang tersedia</p>
                      </div>
                    )}
                  </div>
                )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status Pembayaran:</span>
                    <span>
                      {selectedReservation.payment_status === 'Paid' 
                        ? 'Lunas' 
                        : selectedReservation.payment_status === 'Down Payment' 
                          ? 'DP' 
                          : 'Belum Bayar'
                      }
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Data Pelanggan</h3>
                <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nama:</span>
                    <span>{selectedReservation.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Telepon:</span>
                    <span>{selectedReservation.customer_phone}</span>
                  </div>
                  {selectedReservation.customer_email && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email:</span>
                      <span>{selectedReservation.customer_email}</span>
                    </div>
                  )}
                  <div>
                    <div className="text-gray-400 mb-1">Alamat Pengantaran:</div>
                    <div className="border border-gray-600 rounded p-2 bg-gray-800 text-sm">
                      {selectedReservation.delivery_address}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Playbox</h3>
              <div className="bg-gray-700 rounded-lg p-4">
                {selectedReservation.Playbox ? (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-800 rounded flex items-center justify-center mr-4">
                      <Monitor size={32} className="text-blue-500" />
                    </div>
                    <div>
                      <div className="font-medium text-lg">{selectedReservation.Playbox.playbox_name}</div>
                      <div>
                        {selectedReservation.Playbox.tv_size} + {selectedReservation.Playbox.ps4_model}
                      </div>
                      <div className="text-sm text-gray-400">
                        {selectedReservation.Playbox.controllers_count} Controller
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400">Data Playbox tidak tersedia</div>
                )}
              </div>
            </div>
            
            {selectedReservation.notes && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Catatan</h3>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="whitespace-pre-wrap">{selectedReservation.notes}</div>
                </div>
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Update Status</h3>
              <div className="mb-4">
                <textarea
                  placeholder="Catatan untuk update status (opsional)"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-3 h-24"
                ></textarea>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {selectedReservation.status === 'Pending' && (
                  <button
                    onClick={handleConfirmReservation}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                  >
                    Konfirmasi
                  </button>
                )}
                
                {selectedReservation.status === 'Confirmed' && (
                  <button
                    onClick={() => handleUpdateReservationStatus('In Preparation')}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                  >
                    Dalam Persiapan
                  </button>
                )}
                
                {selectedReservation.status === 'In Preparation' && (
                  <button
                    onClick={() => handleUpdateReservationStatus('In Transit')}
                    className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded"
                  >
                    Dalam Pengantaran
                  </button>
                )}
                
                {selectedReservation.status === 'In Transit' && (
                  <button
                    onClick={() => handleUpdateReservationStatus('In Use')}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                  >
                    Sedang Digunakan
                  </button>
                )}
                
                {selectedReservation.status === 'In Use' && (
                  <button
                    onClick={() => handleUpdateReservationStatus('Returning')}
                    className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded"
                  >
                    Perjalanan Kembali
                  </button>
                )}
                
                {selectedReservation.status === 'Returning' && (
                  <button
                    onClick={() => handleUpdateReservationStatus('Completed')}
                    className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
                  >
                    Selesai
                  </button>
                )}
                
                {['Pending', 'Confirmed', 'In Preparation'].includes(selectedReservation.status) && (
                  <button
                    onClick={() => handleUpdateReservationStatus('Cancelled')}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
                  >
                    Batalkan
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowReservationModal(false)}
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlayboxPage;