import React, { useState, useEffect } from 'react';
import { Tag, Edit, Trash, Plus, AlertCircle, Search, X, Info, DollarSign, Clock, Monitor, Package } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const PricingManagement = () => {
  const [pricingList, setPricingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [activeTab, setActiveTab] = useState('playstation'); // 'playstation' atau 'playbox'
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    device_type: 'PS4',
    name: '',
    amount_per_hour: '',
    package_amount: '',
    package_hours: '',
    time_condition: 'Any',
    is_playbox: false // Tanda untuk membedakan harga PlayStation vs Playbox
  });
  const [playboxFormData, setPlayboxFormData] = useState({
    name: '',
    base_price: '',
    hourly_rate: '',
    min_hours: 1,
    delivery_fee: '',
    weekend_surcharge: '',
    deposit_amount: '',
    package_12h_price: '',
    package_24h_price: '',
    is_playbox: true,
    // Field untuk paket tetap
    is_fixed_package: false,
    fixed_start_time: '',
    fixed_end_time: '',
    fixed_duration: 0
  });
  
  const fetchPricingData = async () => {
    try {
      setLoading(true);
      console.log(`Fetching ${activeTab} pricing data...`);
      
      // Fetch pricing data sesuai dengan tab yang aktif
      if (activeTab === 'playstation') {
        const response = await api.get('/pricing');
        // Filter agar hanya menampilkan harga PlayStation
        const playstationPricing = response.data.filter(price => !price.is_playbox);
        setPricingList(playstationPricing);
      } else {
        // Gunakan endpoint baru yang tidak konflik
        const response = await api.get('/playbox-pricing');
        // Data untuk Playbox
        setPricingList(response.data);
      }
      
      setError(null);
    } catch (err) {
      console.error(`Error fetching ${activeTab} pricing data:`, err);
      setError(`Gagal memuat data harga ${activeTab === 'playstation' ? 'PlayStation' : 'Playbox'}`);
      
      if (activeTab === 'playstation') {
        // Mock data for PlayStation demo
        setPricingList([
          {
            price_id: 1,
            device_type: 'PS3',
            name: 'Standar PS3',
            amount_per_hour: 10000,
            package_amount: null,
            package_hours: null,
            time_condition: 'Any',
            is_playbox: false
          },
          {
            price_id: 2,
            device_type: 'PS4',
            name: 'Standar PS4',
            amount_per_hour: 15000,
            package_amount: null,
            package_hours: null,
            time_condition: 'Any',
            is_playbox: false
          },
          {
            price_id: 3,
            device_type: 'PS5',
            name: 'Standar PS5',
            amount_per_hour: 20000,
            package_amount: null,
            package_hours: null,
            time_condition: 'Any',
            is_playbox: false
          },
          {
            price_id: 4,
            device_type: 'PS4',
            name: 'Paket PS4 3 Jam',
            amount_per_hour: 15000,
            package_amount: 40000,
            package_hours: 3,
            time_condition: 'Any',
            is_playbox: false
          }
        ]);
      } else {
        // Mock data for Playbox demo
        setPricingList([
          {
            price_id: 101,
            name: 'Paket Standar Playbox',
            base_price: 50000,
            hourly_rate: 10000,
            min_hours: 3,
            delivery_fee: 20000,
            weekend_surcharge: 10,
            deposit_amount: 300000,
            package_12h_price: 180000,
            package_24h_price: 320000,
            is_playbox: true,
            is_fixed_package: false
          },
          {
            price_id: 102,
            name: 'Paket Premium Playbox',
            base_price: 70000,
            hourly_rate: 15000,
            min_hours: 3,
            delivery_fee: 0,
            weekend_surcharge: 20,
            deposit_amount: 500000,
            package_12h_price: null,
            package_24h_price: null,
            is_playbox: true,
            is_fixed_package: false
          },
          {
            price_id: 103,
            name: 'Paket Malam Playbox',
            base_price: 120000,
            hourly_rate: 0,
            min_hours: 0,
            delivery_fee: 20000,
            weekend_surcharge: 10,
            deposit_amount: 300000,
            is_playbox: true,
            is_fixed_package: true,
            fixed_start_time: '17:00',
            fixed_end_time: '23:00',
            fixed_duration: 6
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    fetchPricingData();
  }, [activeTab]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    // Convert numeric inputs to numbers
    if (['amount_per_hour', 'package_amount', 'package_hours'].includes(name)) {
      finalValue = value === '' ? '' : parseFloat(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };
  
  const handlePlayboxInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;

    // Convert numeric inputs to numbers
    if (['base_price', 'hourly_rate', 'min_hours', 'delivery_fee', 'weekend_surcharge', 'deposit_amount', 'package_12h_price', 'package_24h_price'].includes(name)) {
      finalValue = value === '' ? '' : parseFloat(value);
    }

    // Update form data
    setPlayboxFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
    
    // Jika ini adalah perubahan pada paket tetap atau waktu tetap, update durasi
    if (name === 'is_fixed_package' || name === 'fixed_start_time' || name === 'fixed_end_time') {
      if (name === 'is_fixed_package' && checked === false) {
        // Reset fixed time fields when unchecking is_fixed_package
        setPlayboxFormData(prev => ({
          ...prev,
          fixed_start_time: '',
          fixed_end_time: '',
          fixed_duration: 0
        }));
      } else if ((name === 'fixed_start_time' || name === 'fixed_end_time') && playboxFormData.is_fixed_package) {
        // Calculate duration when changing start or end time
        const startTime = name === 'fixed_start_time' ? value : playboxFormData.fixed_start_time;
        const endTime = name === 'fixed_end_time' ? value : playboxFormData.fixed_end_time;
        
        if (startTime && endTime) {
          const duration = calculateDuration(startTime, endTime);
          setPlayboxFormData(prev => ({
            ...prev,
            fixed_duration: duration
          }));
        }
      }
    }
  };
  
  // Function to calculate duration between two time strings
  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    let hours = endHours - startHours;
    if (hours < 0) hours += 24; // Handle overnight packages
    
    let minutes = endMinutes - startMinutes;
    if (minutes < 0) {
      hours -= 1;
      minutes += 60;
    }
    
    // Round to nearest 0.5 hour
    const duration = hours + (minutes / 60);
    return Math.round(duration * 2) / 2;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate fields for fixed package
      if (activeTab === 'playbox' && playboxFormData.is_fixed_package) {
        if (!playboxFormData.fixed_start_time || !playboxFormData.fixed_end_time) {
          toast.error('Paket tetap harus memiliki waktu mulai dan waktu selesai');
          return;
        }
        
        if (playboxFormData.fixed_duration <= 0) {
          toast.error('Durasi paket tetap harus lebih dari 0 jam');
          return;
        }
      }
      
      if (activeTab === 'playstation') {
        await api.post('/pricing', formData);
        toast.success('Harga PlayStation berhasil ditambahkan');
        setFormData({
          device_type: 'PS4',
          name: '',
          amount_per_hour: '',
          package_amount: '',
          package_hours: '',
          time_condition: 'Any',
          is_playbox: false
        });
      } else {
        // Untuk paket tetap, atur hourly_rate dan min_hours menjadi 0 jika tidak diisi
        if (playboxFormData.is_fixed_package) {
          playboxFormData.hourly_rate = playboxFormData.hourly_rate || 0;
          playboxFormData.min_hours = 0;
        }
        
        await api.post('/playbox-pricing', playboxFormData);
        toast.success('Harga Playbox berhasil ditambahkan');
        setPlayboxFormData({
          name: '',
          base_price: '',
          hourly_rate: '',
          min_hours: 1,
          delivery_fee: '',
          weekend_surcharge: '',
          deposit_amount: '',
          package_12h_price: '',
          package_24h_price: '',
          is_playbox: true,
          is_fixed_package: false,
          fixed_start_time: '',
          fixed_end_time: '',
          fixed_duration: 0
        });
      }
      
      setShowAddModal(false);
      fetchPricingData();
    } catch (err) {
      console.error('Error adding pricing:', err);
      toast.error(err.response?.data?.message || 'Gagal menambahkan harga');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate fields for fixed package
      if (activeTab === 'playbox' && playboxFormData.is_fixed_package) {
        if (!playboxFormData.fixed_start_time || !playboxFormData.fixed_end_time) {
          toast.error('Paket tetap harus memiliki waktu mulai dan waktu selesai');
          return;
        }
        
        if (playboxFormData.fixed_duration <= 0) {
          toast.error('Durasi paket tetap harus lebih dari 0 jam');
          return;
        }
      }
      
      if (activeTab === 'playstation') {
        await api.put(`/pricing/${selectedPrice.price_id}`, formData);
        toast.success('Harga PlayStation berhasil diperbarui');
      } else {
        // Untuk paket tetap, atur hourly_rate dan min_hours menjadi 0 jika tidak diisi
        if (playboxFormData.is_fixed_package) {
          playboxFormData.hourly_rate = playboxFormData.hourly_rate || 0;
          playboxFormData.min_hours = 0;
        }
        
        await api.put(`/playbox-pricing/${selectedPrice.price_id}`, playboxFormData);
        toast.success('Harga Playbox berhasil diperbarui');
      }
      
      setShowEditModal(false);
      fetchPricingData();
    } catch (err) {
      console.error('Error updating pricing:', err);
      toast.error(err.response?.data?.message || 'Gagal memperbarui harga');
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      if (activeTab === 'playstation') {
        await api.delete(`/pricing/${selectedPrice.price_id}`);
      } else {
        await api.delete(`/playbox-pricing/${selectedPrice.price_id}`);
      }
      
      toast.success(`Harga ${activeTab === 'playstation' ? 'PlayStation' : 'Playbox'} berhasil dihapus`);
      setShowDeleteModal(false);
      fetchPricingData();
    } catch (err) {
      console.error('Error deleting pricing:', err);
      toast.error(err.response?.data?.message || 'Gagal menghapus harga');
    }
  };

  const openEditModal = (price) => {
    setSelectedPrice(price);
    
    if (activeTab === 'playstation') {
      setFormData({
        device_type: price.device_type,
        name: price.name,
        amount_per_hour: price.amount_per_hour,
        package_amount: price.package_amount || '',
        package_hours: price.package_hours || '',
        time_condition: price.time_condition,
        is_playbox: false
      });
    } else {
      setPlayboxFormData({
        name: price.name,
        base_price: price.base_price,
        hourly_rate: price.hourly_rate,
        min_hours: price.min_hours,
        delivery_fee: price.delivery_fee,
        weekend_surcharge: price.weekend_surcharge,
        deposit_amount: price.deposit_amount,
        package_12h_price: price.package_12h_price || '',
        package_24h_price: price.package_24h_price || '',
        is_playbox: true,
        is_fixed_package: price.is_fixed_package || false,
        fixed_start_time: price.fixed_start_time || '',
        fixed_end_time: price.fixed_end_time || '',
        fixed_duration: price.fixed_duration || (price.fixed_start_time && price.fixed_end_time ? calculateDuration(price.fixed_start_time, price.fixed_end_time) : 0)
      });
    }
    
    setShowEditModal(true);
  };

  const openDeleteModal = (price) => {
    setSelectedPrice(price);
    setShowDeleteModal(true);
  };

  const formatRupiah = (amount) => {
    return `Rp${amount?.toLocaleString('id-ID')}`;
  };

  const getDeviceColor = (deviceType) => {
    switch (deviceType) {
      case 'PS3':
        return 'bg-gray-500 text-white';
      case 'PS4':
        return 'bg-blue-500 text-white';
      case 'PS5':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'Weekday':
        return 'bg-green-700 bg-opacity-40 text-green-400';
      case 'Weekend':
        return 'bg-yellow-700 bg-opacity-40 text-yellow-400';
      case 'Holiday':
        return 'bg-red-700 bg-opacity-40 text-red-400';
      default:
        return 'bg-blue-700 bg-opacity-40 text-blue-400';
    }
  };
  
  // Filter pricing list based on search query
  const filteredPricingList = pricingList.filter(price => {
    const lowerQuery = searchQuery.toLowerCase();
    if (activeTab === 'playstation') {
      return price.name.toLowerCase().includes(lowerQuery) || 
             price.device_type.toLowerCase().includes(lowerQuery);
    } else {
      return price.name.toLowerCase().includes(lowerQuery);
    }
  });

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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Manajemen Harga</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg"
        >
          <Plus size={18} className="mr-1" />
          Tambah Harga Baru
        </button>
      </div>
      
      {/* Tab Selector */}
      <div className="mb-6 border-b border-gray-700">
        <div className="flex -mb-px">
          <button
            className={`py-2 px-4 text-center border-b-2 font-medium ${
              activeTab === 'playstation'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('playstation')}
          >
            <Monitor size={16} className="inline-block mr-2" />
            PlayStation
          </button>
          <button
            className={`py-2 px-4 text-center border-b-2 font-medium ${
              activeTab === 'playbox'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('playbox')}
          >
            <Package size={16} className="inline-block mr-2" />
            Playbox
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
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder={`Cari harga ${activeTab === 'playstation' ? 'PlayStation...' : 'Playbox...'}`}
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

      {/* PlayStation Pricing Table */}
      {activeTab === 'playstation' && (
        <>
          {filteredPricingList.length === 0 ? (
            <div className="text-center py-8 text-gray-400 bg-gray-800 rounded-lg border border-gray-700">
              <DollarSign size={48} className="mx-auto mb-3 opacity-30" />
              <p>Belum ada data harga PlayStation yang tersedia</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg inline-flex items-center"
              >
                <Plus size={16} className="mr-1" />
                Tambah Harga PlayStation
              </button>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left">Jenis PS</th>
                    <th className="py-3 px-4 text-left">Nama</th>
                    <th className="py-3 px-4 text-left">Kondisi Waktu</th>
                    <th className="py-3 px-4 text-right">Harga Per Jam</th>
                    <th className="py-3 px-4 text-right">Harga Paket</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredPricingList.map(price => (
                    <tr key={price.price_id} className="hover:bg-gray-750">
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${getDeviceColor(price.device_type)}`}>
                          {price.device_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium">{price.name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${getConditionColor(price.time_condition)}`}>
                          {price.time_condition === 'Any' ? 'Kapan Saja' : 
                           price.time_condition === 'Weekday' ? 'Hari Kerja' :
                           price.time_condition === 'Weekend' ? 'Akhir Pekan' : 'Hari Libur'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">{formatRupiah(price.amount_per_hour)}</td>
                      <td className="py-3 px-4 text-right">
                        {price.package_amount ? (
                          <div>
                            {formatRupiah(price.package_amount)}
                            <div className="text-xs text-gray-400">{price.package_hours} jam</div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openEditModal(price)}
                          className="text-blue-500 hover:text-blue-400 p-1"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(price)}
                          className="text-red-500 hover:text-red-400 p-1 ml-2"
                          title="Hapus"
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
      
      {/* Playbox Pricing Table */}
      {activeTab === 'playbox' && (
        <>
          {filteredPricingList.length === 0 ? (
            <div className="text-center py-8 text-gray-400 bg-gray-800 rounded-lg border border-gray-700">
              <Package size={48} className="mx-auto mb-3 opacity-30" />
              <p>Belum ada data harga Playbox yang tersedia</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg inline-flex items-center"
              >
                <Plus size={16} className="mr-1" />
                Tambah Harga Playbox
              </button>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left">Nama Paket</th>
                    <th className="py-3 px-4 text-right">Harga Dasar</th>
                    <th className="py-3 px-4 text-right">Harga Per Jam</th>
                    <th className="py-3 px-4 text-center">Min Jam</th>
                    <th className="py-3 px-4 text-right">Biaya Antar</th>
                    <th className="py-3 px-4 text-right">Deposit</th>
                    <th className="py-3 px-4 text-left">Info Paket</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredPricingList.map(price => (
                    <tr key={price.price_id} className="hover:bg-gray-750">
                      <td className="py-3 px-4 font-medium">
                        {price.name}
                        {price.is_fixed_package && (
                          <span className="ml-2 inline-block px-2 py-0.5 bg-purple-900 text-purple-300 text-xs rounded-full">
                            Paket Tetap
                          </span>
                        )}
                        {price.weekend_surcharge > 0 && (
                          <div className="text-xs text-yellow-400 mt-1">
                            +{price.weekend_surcharge}% di akhir pekan
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">{formatRupiah(price.base_price)}</td>
                      <td className="py-3 px-4 text-right">
                        {price.is_fixed_package ? (
                          <span className="text-purple-400">Paket Tetap</span>
                        ) : (
                          formatRupiah(price.hourly_rate)
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {price.is_fixed_package ? (
                          <span className="text-purple-400">Tetap</span>
                        ) : (
                          `${price.min_hours} jam`
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {price.delivery_fee > 0 ? formatRupiah(price.delivery_fee) : 'Gratis'}
                      </td>
                      <td className="py-3 px-4 text-right">{formatRupiah(price.deposit_amount)}</td>
                      <td className="py-3 px-4">
                        <div className="space-y-1 text-sm">
                          {price.is_fixed_package ? (
                            <div className="bg-purple-900 bg-opacity-20 p-2 rounded-md text-center">
                              <div className="text-purple-300 text-xs font-medium">Jadwal Tetap</div>
                              <div className="text-white">
                                {price.fixed_start_time || '-'} - {price.fixed_end_time || '-'}
                                <span className="ml-2 text-purple-300 text-xs">
                                  ({price.fixed_duration || calculateDuration(price.fixed_start_time, price.fixed_end_time)} jam)
                                </span>
                              </div>
                            </div>
                          ) : (
                            <>
                              {price.package_12h_price ? (
                                <div className="flex items-center">
                                  <div className="w-4 h-4 bg-green-900 bg-opacity-30 rounded-full mr-1"></div>
                                  <span>12 Jam: {formatRupiah(price.package_12h_price)}</span>
                                </div>
                              ) : (
                                <div className="text-gray-500">-</div>
                              )}
                              {price.package_24h_price ? (
                                <div className="flex items-center">
                                  <div className="w-4 h-4 bg-blue-900 bg-opacity-30 rounded-full mr-1"></div>
                                  <span>24 Jam: {formatRupiah(price.package_24h_price)}</span>
                                </div>
                              ) : null}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openEditModal(price)}
                          className="text-blue-500
                          hover:text-blue-400 p-1"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(price)}
                          className="text-red-500 hover:text-red-400 p-1 ml-2"
                          title="Hapus"
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

      {/* Add Price Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {activeTab === 'playstation' ? 'Tambah Harga PlayStation' : 'Tambah Harga Playbox'}
              </h2>
              <button onClick={() => setShowAddModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            {/* PlayStation Form */}
            {activeTab === 'playstation' && (
              <form onSubmit={handleAddSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-400 mb-2">Jenis PlayStation</label>
                  <select
                    name="device_type"
                    value={formData.device_type}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                    required
                  >
                    <option value="PS3">PlayStation 3</option>
                    <option value="PS4">PlayStation 4</option>
                    <option value="PS5">PlayStation 5</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-400 mb-2">Nama Harga</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                    placeholder="Contoh: Standar PS4, Paket Hemat, dll"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-400 mb-2">Harga Per Jam (Rp)</label>
                  <input
                    type="number"
                    name="amount_per_hour"
                    value={formData.amount_per_hour}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                    placeholder="Contoh: 15000"
                    required
                    min="0"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-400 mb-2">Kondisi Waktu</label>
                  <select
                    name="time_condition"
                    value={formData.time_condition}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                    required
                  >
                    <option value="Any">Kapan Saja</option>
                    <option value="Weekday">Hari Kerja (Senin-Jumat)</option>
                    <option value="Weekend">Akhir Pekan (Sabtu-Minggu)</option>
                    <option value="Holiday">Hari Libur</option>
                  </select>
                </div>
                
                <div className="border-t border-gray-700 pt-4 mt-4 mb-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Tag size={16} className="mr-2" />
                    Pengaturan Paket (Opsional)
                  </h3>
                  
                  <div className="mb-4">
                    <label className="block text-gray-400 mb-2">Durasi Paket (Jam)</label>
                    <input
                      type="number"
                      name="package_hours"
                      value={formData.package_hours}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                      placeholder="Contoh: 3"
                      min="0"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-400 mb-2">Harga Paket (Rp)</label>
                    <input
                      type="number"
                      name="package_amount"
                      value={formData.package_amount}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                      placeholder="Contoh: 40000"
                      min="0"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      *Kosongkan harga paket jika tidak menawarkan paket
                    </p>
                  </div>
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
            )}
            
            {/* Playbox Form */}
            {activeTab === 'playbox' && (
              <form onSubmit={handleAddSubmit} className="max-h-[70vh] overflow-y-auto pr-2">
                <div className="mb-4">
                  <label className="block text-gray-400 mb-2">Nama Paket</label>
                  <input
                    type="text"
                    name="name"
                    value={playboxFormData.name}
                    onChange={handlePlayboxInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                    placeholder="Contoh: Paket Standar Playbox"
                    required
                  />
                </div>
                
                {/* Jenis Paket: Regular atau Paket Tetap */}
                <div className="mb-4 bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <label className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      name="is_fixed_package"
                      checked={playboxFormData.is_fixed_package}
                      onChange={handlePlayboxInputChange}
                      className="mr-2"
                    />
                    <span className="font-medium">Paket Tetap (Waktu Sudah Ditentukan)</span>
                  </label>
                  <p className="text-xs text-gray-400 mb-2">
                    Paket tetap memiliki waktu mulai dan selesai yang sudah ditentukan.
                    Pelanggan tidak dapat mengubah jadwal saat pemesanan.
                  </p>
                  
                  {playboxFormData.is_fixed_package && (
                    <div className="mt-3 bg-purple-900 bg-opacity-20 p-3 rounded-lg border border-purple-700">
                      <h4 className="font-medium text-purple-400 mb-2">Pengaturan Jadwal Tetap</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <div>
                          <label className="block text-gray-300 mb-2">Waktu Mulai</label>
                          <input
                            type="time"
                            name="fixed_start_time"
                            value={playboxFormData.fixed_start_time}
                            onChange={handlePlayboxInputChange}
                            className="w-full bg-gray-800 border border-gray-600 rounded p-2"
                            required={playboxFormData.is_fixed_package}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-300 mb-2">Waktu Selesai</label>
                          <input
                            type="time"
                            name="fixed_end_time"
                            value={playboxFormData.fixed_end_time}
                            onChange={handlePlayboxInputChange}
                            className="w-full bg-gray-800 border border-gray-600 rounded p-2"
                            required={playboxFormData.is_fixed_package}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center bg-gray-800 border border-gray-600 rounded p-2 mt-2">
                        <Clock size={16} className="text-purple-400 mr-2" />
                        <span>
                          Durasi: 
                          <span className="font-bold ml-1">
                            {playboxFormData.fixed_duration || calculateDuration(playboxFormData.fixed_start_time, playboxFormData.fixed_end_time)} jam
                          </span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-400 mb-2">Harga Dasar (Rp)</label>
                  <input
                    type="number"
                    name="base_price"
                    value={playboxFormData.base_price}
                    onChange={handlePlayboxInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                    placeholder="Contoh: 50000"
                    required
                    min="0"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {playboxFormData.is_fixed_package
                      ? "Harga total untuk paket waktu tetap"
                      : "Harga dasar untuk sewa Playbox (ditambah tarif per jam untuk durasi tambahan)"}
                  </p>
                </div>
                
                {/* Hanya tampilkan field tarif per jam & minimum jam jika bukan paket tetap */}
                {!playboxFormData.is_fixed_package && (
                  <>
                    <div className="mb-4">
                      <label className="block text-gray-400 mb-2">Harga Per Jam (Rp)</label>
                      <input
                        type="number"
                        name="hourly_rate"
                        value={playboxFormData.hourly_rate}
                        onChange={handlePlayboxInputChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                        placeholder="Contoh: 10000"
                        required={!playboxFormData.is_fixed_package}
                        min="0"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-400 mb-2">Minimum Jam Sewa</label>
                      <input
                        type="number"
                        name="min_hours"
                        value={playboxFormData.min_hours}
                        onChange={handlePlayboxInputChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                        placeholder="Contoh: 3"
                        required={!playboxFormData.is_fixed_package}
                        min="1"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Minimum jam sewa yang diizinkan
                      </p>
                    </div>
                  </>
                )}
                
                <div className="mb-4">
                  <label className="block text-gray-400 mb-2">Biaya Pengantaran (Rp)</label>
                  <input
                    type="number"
                    name="delivery_fee"
                    value={playboxFormData.delivery_fee}
                    onChange={handlePlayboxInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                    placeholder="Contoh: 20000 (0 untuk gratis)"
                    min="0"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-400 mb-2">Tambahan Biaya Akhir Pekan (%)</label>
                  <input
                    type="number"
                    name="weekend_surcharge"
                    value={playboxFormData.weekend_surcharge}
                    onChange={handlePlayboxInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                    placeholder="Contoh: 10 (untuk 10%)"
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Persentase tambahan biaya jika digunakan pada akhir pekan
                  </p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-400 mb-2">Jumlah Deposit (Rp)</label>
                  <input
                    type="number"
                    name="deposit_amount"
                    value={playboxFormData.deposit_amount}
                    onChange={handlePlayboxInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                    placeholder="Contoh: 300000"
                    min="0"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Deposit yang dikembalikan setelah Playbox dikembalikan dalam kondisi baik
                  </p>
                </div>
                
                {/* Hanya tampilkan paket khusus jika bukan paket tetap */}
                {!playboxFormData.is_fixed_package && (
                  <>
                    <div className="mb-4">
                      <label className="block text-gray-400 mb-2">Harga Paket 12 Jam (Rp)</label>
                      <input
                        type="number"
                        name="package_12h_price"
                        value={playboxFormData.package_12h_price || ''}
                        onChange={handlePlayboxInputChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                        placeholder="Contoh: 180000 (kosongkan jika tidak menawarkan)"
                        min="0"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Harga spesial untuk paket 12 jam (Rekomendasi: 15-20% lebih murah dari tarif per jam)
                      </p>
                    </div>

                    <div className="mb-6">
                      <label className="block text-gray-400 mb-2">Harga Paket 24 Jam (Rp)</label>
                      <input
                        type="number"
                        name="package_24h_price"
                        value={playboxFormData.package_24h_price || ''}
                        onChange={handlePlayboxInputChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                        placeholder="Contoh: 320000 (kosongkan jika tidak menawarkan)"
                        min="0"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Harga spesial untuk paket 24 jam / 1 hari (Rekomendasi: 25-30% lebih murah dari tarif per jam)
                      </p>
                    </div>
                  </>
                )}
                
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
            )}
          </div>
        </div>
      )}

      {/* Edit Price Modal */}
      {showEditModal && selectedPrice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {activeTab === 'playstation' ? 'Edit Harga PlayStation' : 'Edit Harga Playbox'}
              </h2>
              <button onClick={() => setShowEditModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            {/* PlayStation Edit Form */}
            {activeTab === 'playstation' && (
              <form onSubmit={handleEditSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-400 mb-2">Jenis PlayStation</label>
                  <select
                    name="device_type"
                    value={formData.device_type}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                    required
                  >
                    <option value="PS3">PlayStation 3</option>
                    <option value="PS4">PlayStation 4</option>
                    <option value="PS5">PlayStation 5</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-400 mb-2">Nama Harga</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                    placeholder="Contoh: Standar PS4, Paket Hemat, dll"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-400 mb-2">Harga Per Jam (Rp)</label>
                  <input
                    type="number"
                    name="amount_per_hour"
                    value={formData.amount_per_hour}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                    placeholder="Contoh: 15000"
                    required
                    min="0"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-400 mb-2">Kondisi Waktu</label>
                  <select
                    name="time_condition"
                    value={formData.time_condition}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                    required
                  >
                    <option value="Any">Kapan Saja</option>
                    <option value="Weekday">Hari Kerja (Senin-Jumat)</option>
                    <option value="Weekend">Akhir Pekan (Sabtu-Minggu)</option>
                    <option value="Holiday">Hari Libur</option>
                  </select>
                </div>
                
                <div className="border-t border-gray-700 pt-4 mt-4 mb-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Tag size={16} className="mr-2" />
                    Pengaturan Paket (Opsional)
                  </h3>
                  
                  <div className="mb-4">
                    <label className="block text-gray-400 mb-2">Durasi Paket (Jam)</label>
                    <input
                      type="number"
                      name="package_hours"
                      value={formData.package_hours}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                      placeholder="Contoh: 3"
                      min="0"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-400 mb-2">Harga Paket (Rp)</label>
                    <input
                      type="number"
                      name="package_amount"
                      value={formData.package_amount}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                      placeholder="Contoh: 40000"
                      min="0"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      *Kosongkan harga paket jika tidak menawarkan paket
                    </p>
                  </div>
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
            )}
            
            {/* Playbox Edit Form */}
            {activeTab === 'playbox' && (
              <form onSubmit={handleEditSubmit} className="max-h-[70vh] overflow-y-auto pr-2">
                <div className="mb-4">
                  <label className="block text-gray-400 mb-2">Nama Paket</label>
                  <input
                    type="text"
                    name="name"
                    value={playboxFormData.name}
                    onChange={handlePlayboxInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                    placeholder="Contoh: Paket Standar Playbox"
                    required
                  />
                </div>
                
                {/* Jenis Paket: Regular atau Paket Tetap */}
                <div className="mb-4 bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <label className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      name="is_fixed_package"
                      checked={playboxFormData.is_fixed_package}
                      onChange={handlePlayboxInputChange}
                      className="mr-2"
                    />
                    <span className="font-medium">Paket Tetap (Waktu Sudah Ditentukan)</span>
                  </label>
                  <p className="text-xs text-gray-400 mb-2">
                    Paket tetap memiliki waktu mulai dan selesai yang sudah ditentukan.
                    Pelanggan tidak dapat mengubah jadwal saat pemesanan.
                  </p>
                  
                  {playboxFormData.is_fixed_package && (
                    <div className="mt-3 bg-purple-900 bg-opacity-20 p-3 rounded-lg border border-purple-700">
                      <h4 className="font-medium text-purple-400 mb-2">Pengaturan Jadwal Tetap</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <div>
                          <label className="block text-gray-300 mb-2">Waktu Mulai</label>
                          <input
                            type="time"
                            name="fixed_start_time"
                            value={playboxFormData.fixed_start_time}
                            onChange={handlePlayboxInputChange}
                            className="w-full bg-gray-800 border border-gray-600 rounded p-2"
                            required={playboxFormData.is_fixed_package}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-gray-300 mb-2">Waktu Selesai</label>
                          <input
                            type="time"
                            name="fixed_end_time"
                            value={playboxFormData.fixed_end_time}
                            onChange={handlePlayboxInputChange}
                            className="w-full bg-gray-800 border border-gray-600 rounded p-2"
                            required={playboxFormData.is_fixed_package}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center bg-gray-800 border border-gray-600 rounded p-2 mt-2">
                        <Clock size={16} className="text-purple-400 mr-2" />
                        <span>
                          Durasi: 
                          <span className="font-bold ml-1">
                            {playboxFormData.fixed_duration || calculateDuration(playboxFormData.fixed_start_time, playboxFormData.fixed_end_time)} jam
                          </span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-400 mb-2">Harga Dasar (Rp)</label>
                  <input
                    type="number"
                    name="base_price"
                    value={playboxFormData.base_price}
                    onChange={handlePlayboxInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                    placeholder="Contoh: 50000"
                    required
                    min="0"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {playboxFormData.is_fixed_package
                      ? "Harga total untuk paket waktu tetap"
                      : "Harga dasar untuk sewa Playbox (ditambah tarif per jam untuk durasi tambahan)"}
                  </p>
                </div>
                
                {/* Hanya tampilkan field tarif per jam & minimum jam jika bukan paket tetap */}
                {!playboxFormData.is_fixed_package && (
                  <>
                    <div className="mb-4">
                      <label className="block text-gray-400 mb-2">Harga Per Jam (Rp)</label>
                      <input
                        type="number"
                        name="hourly_rate"
                        value={playboxFormData.hourly_rate}
                        onChange={handlePlayboxInputChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                        placeholder="Contoh: 10000"
                        required={!playboxFormData.is_fixed_package}
                        min="0"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-400 mb-2">Minimum Jam Sewa</label>
                      <input
                        type="number"
                        name="min_hours"
                        value={playboxFormData.min_hours}
                        onChange={handlePlayboxInputChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                        placeholder="Contoh: 3"
                        required={!playboxFormData.is_fixed_package}
                        min="1"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Minimum jam sewa yang diizinkan
                      </p>
                    </div>
                  </>
                )}
                
                <div className="mb-4">
                  <label className="block text-gray-400 mb-2">Biaya Pengantaran (Rp)</label>
                  <input
                    type="number"
                    name="delivery_fee"
                    value={playboxFormData.delivery_fee}
                    onChange={handlePlayboxInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                    placeholder="Contoh: 20000 (0 untuk gratis)"
                    min="0"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-400 mb-2">Tambahan Biaya Akhir Pekan (%)</label>
                  <input
                    type="number"
                    name="weekend_surcharge"
                    value={playboxFormData.weekend_surcharge}
                    onChange={handlePlayboxInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                    placeholder="Contoh: 10 (untuk 10%)"
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Persentase tambahan biaya jika digunakan pada akhir pekan
                  </p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-400 mb-2">Jumlah Deposit (Rp)</label>
                  <input
                    type="number"
                    name="deposit_amount"
                    value={playboxFormData.deposit_amount}
                    onChange={handlePlayboxInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                    placeholder="Contoh: 300000"
                    min="0"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Deposit yang dikembalikan setelah Playbox dikembalikan dalam kondisi baik
                  </p>
                </div>
                
                {/* Hanya tampilkan paket khusus jika bukan paket tetap */}
                {!playboxFormData.is_fixed_package && (
                  <>
                    <div className="mb-4">
                      <label className="block text-gray-400 mb-2">Harga Paket 12 Jam (Rp)</label>
                      <input
                        type="number"
                        name="package_12h_price"
                        value={playboxFormData.package_12h_price || ''}
                        onChange={handlePlayboxInputChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                        placeholder="Contoh: 180000 (kosongkan jika tidak menawarkan)"
                        min="0"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Harga spesial untuk paket 12 jam (Rekomendasi: 15-20% lebih murah dari tarif per jam)
                      </p>
                    </div>

                    <div className="mb-6">
                      <label className="block text-gray-400 mb-2">Harga Paket 24 Jam (Rp)</label>
                      <input
                        type="number"
                        name="package_24h_price"
                        value={playboxFormData.package_24h_price || ''}
                        onChange={handlePlayboxInputChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                        placeholder="Contoh: 320000 (kosongkan jika tidak menawarkan)"
                        min="0"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Harga spesial untuk paket 24 jam / 1 hari (Rekomendasi: 25-30% lebih murah dari tarif per jam)
                      </p>
                    </div>
                  </>
                )}
                
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
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPrice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="mb-4">
              <div className="flex items-center text-red-500 mb-2">
                <AlertCircle size={24} className="mr-2" />
                <h2 className="text-xl font-bold">Konfirmasi Hapus</h2>
              </div>
              <p>
                Apakah Anda yakin ingin menghapus harga <strong>{selectedPrice.name}</strong>?
                Tindakan ini tidak dapat dikembalikan.
              </p>
              {selectedPrice.is_fixed_package && (
                <div className="mt-3 bg-yellow-900 bg-opacity-20 p-3 rounded-lg text-yellow-400 text-sm">
                  <strong>Perhatian:</strong> Ini adalah paket tetap dengan jadwal khusus.
                </div>
              )}
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

export default PricingManagement;