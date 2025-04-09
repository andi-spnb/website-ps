import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Monitor, 
  Calendar, 
  Clock, 
  MapPin, 
  ChevronRight, 
  User, 
  Phone, 
  Mail,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Package,
  Tag,
  Info
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const PlayboxReservationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const playboxId = searchParams.get('id');
  
  const [selectedPlaybox, setSelectedPlaybox] = useState(null);
  const [playboxes, setPlayboxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlayboxes, setLoadingPlayboxes] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [bookingCode, setBookingCode] = useState('');
  
  // State untuk pricings
  const [pricingOptions, setPricingOptions] = useState([]);
  const [selectedPricing, setSelectedPricing] = useState(null);
  const [loadingPricing, setLoadingPricing] = useState(true);
  
  // State untuk opsi pengambilan di studio
  const [pickupAtStudio, setPickupAtStudio] = useState(false);
  const studioAddress = "Jl. Contoh No. 123, Kota"; // Alamat studio Anda
  const studioMapsLink = "https://maps.google.com/?q=Kenzie+Gaming+Studio"; // Link Google Maps studio Anda
  
  // Form data
  const [formData, setFormData] = useState({
    playbox_id: playboxId || '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    delivery_address: '',
    reservation_date: '',
    start_time: '',
    duration_hours: 3, // Default ke 3 jam
    payment_method: 'cash',
    notes: ''
  });
  
  // Predefined durations
  const durationOptions = [
    { value: 1, label: '1 Jam' },
    { value: 2, label: '2 Jam' },
    { value: 3, label: '3 Jam' },
    { value: 5, label: '5 Jam' },
    { value: 8, label: '8 Jam' },
    { value: 12, label: '12 Jam' },
    { value: 24, label: '24 Jam (1 Hari)' }
  ];
  
  // Payment methods
  const paymentMethods = [
    { id: 'cash', name: 'Tunai (Bayar di Tempat)' },
    { id: 'transfer', name: 'Transfer Bank' },
    { id: 'qris', name: 'QRIS' }
  ];
  
  useEffect(() => {
    // Fetch all available playboxes
    const fetchPlayboxes = async () => {
      try {
        setLoadingPlayboxes(true);
        const response = await api.get('/playbox/public');
        const availablePlayboxes = response.data.filter(p => p.status === 'Available');
        setPlayboxes(availablePlayboxes);
        
        // If playboxId is provided and valid, set as selected
        if (playboxId) {
          const selectedPb = response.data.find(p => p.playbox_id === parseInt(playboxId));
          if (selectedPb && selectedPb.status === 'Available') {
            setSelectedPlaybox(selectedPb);
            setFormData(prev => ({
              ...prev,
              playbox_id: selectedPb.playbox_id
            }));
          }
        }
        
      } catch (err) {
        console.error('Error fetching playboxes:', err);
        setError('Gagal memuat data Playbox');
      } finally {
        setLoadingPlayboxes(false);
        setLoading(false);
      }
    };

    // Fetch pricing data
    const fetchPricingData = async () => {
      try {
        setLoadingPricing(true);
        console.log('Fetching playbox pricing data...');
        const response = await api.get('/playbox-pricing');
        console.log('Pricing data from API:', response.data);
        
        // Filter hanya yang aktif
        let activePricings = response.data.filter(price => price.is_active);
        
        // Tambahkan opsi harga tanpa paket jika belum ada
        const hasBasicOption = activePricings.some(price => price.is_basic_option);
        
        if (!hasBasicOption && activePricings.length > 0) {
          // Buat opsi dasar berdasarkan harga terendah yang ada
          const lowestPrice = [...activePricings].sort((a, b) => a.hourly_rate - b.hourly_rate)[0];
          
          const basicOption = {
            price_id: 'basic',
            name: 'Tanpa Paket (Standar)',
            base_price: 0, // Tidak ada biaya dasar
            hourly_rate: lowestPrice.hourly_rate,
            min_hours: 1, // Minimum 1 jam
            delivery_fee: lowestPrice.delivery_fee,
            weekend_surcharge: 0,
            deposit_amount: lowestPrice.deposit_amount,
            is_active: true,
            is_basic_option: true // Penanda ini adalah opsi dasar
          };
          
          activePricings = [basicOption, ...activePricings];
        }
        
        setPricingOptions(activePricings);
        
        // Set default pricing jika ada
        if (activePricings.length > 0) {
          setSelectedPricing(activePricings[0]);
        }
      } catch (error) {
        console.error('Error fetching pricing data:', error);
        toast.error('Gagal memuat data harga. Menggunakan data default.');
        
        // Data fallback jika diperlukan
        const fallbackPricing = [
          {
            price_id: 'basic',
            name: 'Tanpa Paket (Standar)',
            base_price: 0,
            hourly_rate: 15000,
            min_hours: 1,
            delivery_fee: 20000,
            weekend_surcharge: 0,
            deposit_amount: 300000,
            is_active: true,
            is_basic_option: true
          },
          {
            price_id: 'package-1',
            name: 'Paket Standar Playbox',
            base_price: 50000,
            hourly_rate: 10000,
            min_hours: 3,
            delivery_fee: 20000,
            weekend_surcharge: 10000,
            deposit_amount: 300000,
            is_active: true
          }
        ];
        
        setPricingOptions(fallbackPricing);
        setSelectedPricing(fallbackPricing[0]);
      } finally {
        setLoadingPricing(false);
      }
    };

    fetchPlayboxes();
    fetchPricingData();
  }, [playboxId]);
  
  // Load available time slots when date changes
  useEffect(() => {
    if (!formData.reservation_date || !formData.playbox_id) {
      setAvailableTimeSlots([]);
      return;
    }
    
    const fetchTimeSlots = async () => {
      try {
        const response = await api.get(`/playbox/public/available?date=${formData.reservation_date}`);
        const selectedPlaybox = response.data.find(p => p.playbox_id === parseInt(formData.playbox_id));
        
        if (selectedPlaybox && selectedPlaybox.timeSlots) {
          setAvailableTimeSlots(selectedPlaybox.timeSlots);
        }
      } catch (err) {
        console.error('Error fetching time slots:', err);
        // Generate default time slots (for demo)
        const defaultSlots = [];
        for (let hour = 8; hour < 22; hour++) {
          const startTime = `${String(hour).padStart(2, '0')}:00`;
          defaultSlots.push({
            hour,
            startTime,
            available: Math.random() > 0.3 // 70% available (for demo)
          });
        }
        setAvailableTimeSlots(defaultSlots);
      }
    };
    
    fetchTimeSlots();
  }, [formData.reservation_date, formData.playbox_id]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If changing playbox, update selected playbox
    if (name === 'playbox_id') {
      const selected = playboxes.find(p => p.playbox_id === parseInt(value));
      setSelectedPlaybox(selected);
    }
  };
  
  // Fungsi untuk menghitung biaya berdasarkan durasi dan harga yang dipilih
  const calculateTotalPrice = () => {
    if (!selectedPricing) return 0;
    
    const hours = parseInt(formData.duration_hours);
    
    // Jika ini adalah opsi tanpa paket (basic option)
    if (selectedPricing.is_basic_option) {
      const hourlyTotal = hours * selectedPricing.hourly_rate;
      const deliveryFee = pickupAtStudio ? 0 : selectedPricing.delivery_fee || 0;
      
      // Tambahkan biaya akhir pekan jika hari ini adalah akhir pekan
      const selectedDate = formData.reservation_date ? new Date(formData.reservation_date) : new Date();
      const isWeekend = [0, 6].includes(selectedDate.getDay()); // 0 = Minggu, 6 = Sabtu
      const weekendSurcharge = isWeekend ? (selectedPricing.weekend_surcharge || 0) : 0;
      
      return hourlyTotal + deliveryFee + weekendSurcharge;
    }
    
    // Untuk paket normal, gunakan logika yang sudah ada
    const actualHours = Math.max(hours, selectedPricing.min_hours);
    const basePrice = selectedPricing.base_price;
    const additionalHours = actualHours - selectedPricing.min_hours;
    const additionalCost = additionalHours > 0 ? additionalHours * selectedPricing.hourly_rate : 0;
    
    // Tambahkan biaya pengantaran jika tidak ambil di studio
    const deliveryFee = pickupAtStudio ? 0 : (selectedPricing.delivery_fee || 0);
    
    // Tambahkan biaya akhir pekan jika hari ini adalah akhir pekan
    const selectedDate = formData.reservation_date ? new Date(formData.reservation_date) : new Date();
    const isWeekend = [0, 6].includes(selectedDate.getDay()); // 0 = Minggu, 6 = Sabtu
    const weekendSurcharge = isWeekend ? (selectedPricing.weekend_surcharge || 0) : 0;
    
    return basePrice + additionalCost + deliveryFee + weekendSurcharge;
  };
  
  // Cek apakah hari yang dipilih adalah akhir pekan
  const isWeekend = () => {
    if (!formData.reservation_date) return false;
    const selectedDate = new Date(formData.reservation_date);
    return [0, 6].includes(selectedDate.getDay()); // 0 = Minggu, 6 = Sabtu
  };
  
  // Hitung jam tambahan
  const getAdditionalHours = () => {
    if (!selectedPricing) return 0;
    const hours = parseInt(formData.duration_hours);
    const minHours = selectedPricing.min_hours;
    return Math.max(0, hours - minHours);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.playbox_id) {
      setError('Silakan pilih Playbox');
      return;
    }
    
    if (!formData.reservation_date) {
      setError('Silakan pilih tanggal reservasi');
      return;
    }
    
    if (!formData.start_time) {
      setError('Silakan pilih jam mulai');
      return;
    }
    
    if (!selectedPricing) {
      setError('Silakan pilih paket harga');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Format start_time to full ISO datetime
      const startDateTime = new Date(`${formData.reservation_date}T${formData.start_time}`);
      
      const reservationData = {
        playbox_id: parseInt(formData.playbox_id),
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email,
        delivery_address: formData.delivery_address,
        start_time: startDateTime.toISOString(),
        duration_hours: parseInt(formData.duration_hours),
        payment_method: formData.payment_method,
        notes: formData.notes,
        pricing_id: selectedPricing.price_id === 'basic' ? null : selectedPricing.price_id, // Tambahkan pricing_id
        total_amount: calculateTotalPrice(), // Gunakan fungsi perhitungan harga
        deposit_amount: selectedPricing.deposit_amount, // Tambahkan deposit
        pickup_at_studio: pickupAtStudio // Tambahkan info pengambilan di studio
      };
      
      console.log('Sending reservation data:', reservationData);
      
      const response = await api.post('/playbox/public/reserve', reservationData);
      
      // Handle success
      setBookingCode(response.data.booking_code);
      setReservationSuccess(true);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Error creating reservation:', err);
      setError(err.response?.data?.message || 'Gagal membuat reservasi');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="h-64 bg-gray-800 rounded-lg mb-6"></div>
              <div className="h-96 bg-gray-800 rounded-lg"></div>
            </div>
            <div>
              <div className="h-80 bg-gray-800 rounded-lg mb-6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (reservationSuccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto bg-gray-800 rounded-lg p-8 border border-green-500">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-900 bg-opacity-30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Reservasi Berhasil!</h2>
            <p className="text-gray-400">
              Reservasi Playbox Anda telah berhasil dibuat. Tim kami akan menghubungi Anda segera untuk konfirmasi.
            </p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <div className="text-center mb-3">
              <div className="text-sm text-gray-400">Kode Booking</div>
              <div className="text-2xl font-bold">{bookingCode}</div>
            </div>
            <p className="text-sm text-center text-gray-400">
              Simpan kode booking ini untuk melacak status reservasi Anda
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <a 
              href={`/playbox/tracking/${bookingCode}`}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium text-center"
            >
              Lacak Reservasi
            </a>
            <a 
              href="/playbox"
              className="bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium text-center"
            >
              Kembali ke Home
            </a>
          </div>
          
          <div className="bg-blue-900 bg-opacity-20 rounded-lg p-4 border border-blue-800">
            <div className="flex">
              <div className="mr-3">
                <AlertCircle size={20} className="text-blue-500" />
              </div>
              <div className="text-sm text-blue-400">
                <p className="font-medium mb-1">Langkah Selanjutnya:</p>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>Tim kami akan menghubungi Anda untuk konfirmasi reservasi.</li>
                  <li>Lakukan pembayaran sesuai metode yang dipilih.</li>
                  {pickupAtStudio ? (
                    <li>Pada hari-H, Anda dapat mengambil Playbox di studio kami sesuai jadwal.</li>
                  ) : (
                    <li>Pada hari-H, Playbox akan diantar ke alamat Anda sesuai jadwal.</li>
                  )}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <a href="/playbox" className="mr-3 text-gray-400 hover:text-white">
          <ArrowLeft size={20} />
        </a>
        <h1 className="text-2xl font-bold">Reservasi Playbox</h1>
      </div>
      
      {error && (
        <div className="bg-red-900 bg-opacity-20 p-4 rounded-lg border border-red-500 mb-6">
          <div className="flex">
            <AlertCircle size={20} className="text-red-500 mr-3" />
            <div>
              <p className="font-medium text-red-500">Error</p>
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Select Playbox */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">1. Pilih Playbox</h2>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Playbox</label>
                <select
                  name="playbox_id"
                  value={formData.playbox_id}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  required
                  disabled={loadingPlayboxes}
                >
                  <option value="">-- Pilih Playbox --</option>
                  {playboxes.map(playbox => (
                    <option key={playbox.playbox_id} value={playbox.playbox_id}>
                      {playbox.playbox_name} - {playbox.tv_size} ({playbox.ps4_model})
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedPlaybox && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Monitor size={18} className="mr-2 text-blue-500" />
                    <span className="font-medium">{selectedPlaybox.playbox_name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-sm">
                      <span className="text-gray-400">TV:</span> {selectedPlaybox.tv_size}
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-400">PS4:</span> {selectedPlaybox.ps4_model}
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-400">Controller:</span> {selectedPlaybox.controllers_count} unit
                    </div>
                    {selectedPlaybox.location && (
                      <div className="text-sm">
                        <span className="text-gray-400">Lokasi:</span> {selectedPlaybox.location}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Step 2: Select Pricing Package */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">2. Pilih Paket Harga</h2>
              
              {loadingPricing ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-16 bg-gray-700 rounded"></div>
                  <div className="h-16 bg-gray-700 rounded"></div>
                </div>
              ) : pricingOptions.length === 0 ? (
                <div className="bg-yellow-900 bg-opacity-20 p-4 rounded-lg border border-yellow-800">
                  <div className="flex items-center">
                    <AlertCircle size={18} className="text-yellow-500 mr-2" />
                    <p className="text-yellow-500">Tidak ada paket harga tersedia. Silakan hubungi admin.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {pricingOptions.map(pricing => (
                    <button
                      key={pricing.price_id}
                      type="button"
                      onClick={() => setSelectedPricing(pricing)}
                      className={`p-4 rounded-lg text-left ${
                        selectedPricing?.price_id === pricing.price_id 
                          ? 'bg-blue-600 border-2 border-blue-500' 
                          : 'bg-gray-700 hover:bg-gray-600 border border-gray-600'
                      }`}
                    >
                      <div className="font-medium text-lg mb-1">{pricing.name}</div>
                      <div className="flex items-center mb-2">
                        <Tag size={14} className="text-blue-400 mr-2" />
                        {pricing.is_basic_option ? (
                          <span className="text-lg font-bold">Rp{pricing.hourly_rate.toLocaleString()}/jam</span>
                        ) : (
                          <span className="text-lg font-bold">Rp{pricing.base_price.toLocaleString()}</span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {pricing.is_basic_option ? (
                          <div className="text-gray-400">
                            Minimum 1 jam
                          </div>
                        ) : (
                          <div className="text-gray-400">
                            Min. {pricing.min_hours} jam
                          </div>
                        )}
                        
                        {!pricing.is_basic_option && (
                          <div className="text-gray-400">
                            +Rp{pricing.hourly_rate.toLocaleString()}/jam tambahan
                          </div>
                        )}
                        
                        <div className="text-gray-400">
                          {pricing.delivery_fee > 0 
                            ? `Antar: Rp${pricing.delivery_fee.toLocaleString()}` 
                            : 'Antar: Gratis'}
                        </div>
                        <div className="text-gray-400">
                          {pricing.deposit_amount > 0 && `Deposit: Rp${pricing.deposit_amount.toLocaleString()}`}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {selectedPricing && selectedPricing.deposit_amount > 0 && (
                <div className="bg-blue-900 bg-opacity-20 p-3 rounded-lg border border-blue-800">
                  <div className="flex items-center text-sm text-blue-400">
                    <Info size={16} className="mr-2" />
                    <span>
                      Deposit sebesar Rp{selectedPricing.deposit_amount.toLocaleString()} akan dikembalikan setelah Playbox dikembalikan dalam kondisi baik
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Step 3: Schedule */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">3. Jadwal Reservasi</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-gray-400 mb-2">Tanggal</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="reservation_date"
                      value={formData.reservation_date}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded p-2 pl-9"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                    <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-400 mb-2">Durasi</label>
                  <div className="relative">
                    <select
                      name="duration_hours"
                      value={formData.duration_hours}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded p-2 pl-9"
                      required
                    >
                      {durationOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <Clock className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  </div>
                </div>
              </div>
              
              {formData.reservation_date && (
                <div>
                  <label className="block text-gray-400 mb-2">Jam Mulai</label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-2">
                    {availableTimeSlots.map(slot => (
                      <button
                        key={slot.hour}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, start_time: `${String(slot.hour).padStart(2, '0')}:00` }))}
                        className={`py-2 text-center rounded ${
                          !slot.available 
                            ? 'bg-red-900 bg-opacity-30 text-gray-500 cursor-not-allowed' 
                            : formData.start_time === `${String(slot.hour).padStart(2, '0')}:00`
                              ? 'bg-blue-600'
                              : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                        disabled={!slot.available}
                      >
                        {`${String(slot.hour).padStart(2, '0')}:00`}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    * Slot waktu berwarna merah sudah dipesan
                  </p>
                </div>
              )}
            </div>
            
            {/* Step 4: Customer Information */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">4. Data Pemesan</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-400 mb-2">Nama Lengkap</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded p-2 pl-9"
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                    <User className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  </div>
                </div>
                
                <div>
                <label className="block text-gray-400 mb-2">Nomor Telepon</label>
                 <div className="relative">
                   <input
                     type="tel"
                     name="customer_phone"
                     value={formData.customer_phone}
                     onChange={handleInputChange}
                     className="w-full bg-gray-700 border border-gray-600 rounded p-2 pl-9"
                     placeholder="Contoh: 08123456789"
                     required
                   />
                   <Phone className="absolute left-3 top-2.5 text-gray-400" size={16} />
                 </div>
               </div>
             </div>
             
             <div className="mb-4">
               <label className="block text-gray-400 mb-2">Email (Opsional)</label>
               <div className="relative">
                 <input
                   type="email"
                   name="customer_email"
                   value={formData.customer_email}
                   onChange={handleInputChange}
                   className="w-full bg-gray-700 border border-gray-600 rounded p-2 pl-9"
                   placeholder="Contoh: nama@email.com"
                 />
                 <Mail className="absolute left-3 top-2.5 text-gray-400" size={16} />
               </div>
             </div>
             
             <div>
               <label className="block text-gray-400 mb-2">Alamat Pengantaran</label>
               
               <div className="mb-3">
                 <label className="flex items-center bg-gray-700 border border-gray-600 rounded-lg p-3 cursor-pointer hover:border-blue-500 mb-3">
                   <input
                     type="checkbox"
                     checked={pickupAtStudio}
                     onChange={() => {
                       setPickupAtStudio(!pickupAtStudio);
                       if (!pickupAtStudio) {
                         // Jika opsi ambil di studio diaktifkan, isi alamat dengan alamat studio
                         setFormData(prev => ({ ...prev, delivery_address: `Ambil di studio: ${studioAddress}` }));
                       } else {
                         // Jika opsi dimatikan, kosongkan alamat
                         setFormData(prev => ({ ...prev, delivery_address: '' }));
                       }
                     }}
                     className="mr-3"
                   />
                   <span className="font-medium">Ambil Sendiri di Studio</span>
                 </label>
                 
                 {pickupAtStudio && (
                   <div className="bg-blue-900 bg-opacity-20 p-3 rounded-lg border border-blue-800 mb-3">
                     <div className="flex items-start">
                       <MapPin size={18} className="text-blue-400 mr-2 mt-0.5" />
                       <div>
                         <p className="text-blue-300 font-medium">Lokasi Studio:</p>
                         <p className="text-blue-300">{studioAddress}</p>
                         <a 
                           href={studioMapsLink}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="text-blue-400 hover:text-blue-300 inline-flex items-center mt-2"
                         >
                           Lihat di Google Maps <ChevronRight size={14} className="ml-1" />
                         </a>
                       </div>
                     </div>
                   </div>
                 )}
               </div>
               
               {!pickupAtStudio && (
                 <>
                   <div className="relative">
                     <textarea
                       name="delivery_address"
                       value={formData.delivery_address}
                       onChange={handleInputChange}
                       className="w-full bg-gray-700 border border-gray-600 rounded p-2 pl-9 min-h-20"
                       placeholder="Masukkan alamat lengkap untuk pengantaran"
                       required
                     ></textarea>
                     <MapPin className="absolute left-3 top-2.5 text-gray-400" size={16} />
                   </div>
                   
                   <div className="mt-2 flex justify-end">
                     <a 
                       href="https://maps.google.com/?q=lokasi+saya"
                       target="_blank"
                       rel="noopener noreferrer"
                       className="text-blue-500 hover:text-blue-400 inline-flex items-center text-sm"
                     >
                       Tampilkan lokasi saya di Google Maps <ChevronRight size={14} className="ml-1" />
                     </a>
                   </div>
                 </>
               )}
             </div>
           </div>
           
           {/* Step 5: Payment Method */}
           <div className="bg-gray-800 rounded-lg p-6 mb-6">
             <h2 className="text-xl font-bold mb-4">5. Metode Pembayaran</h2>
             
             <div className="space-y-3 mb-4">
               {paymentMethods.map(method => (
                 <label 
                   key={method.id} 
                   className={`block bg-gray-700 border ${
                     formData.payment_method === method.id 
                       ? 'border-blue-500' 
                       : 'border-gray-600'
                   } rounded-lg p-3 cursor-pointer hover:border-blue-500`}
                 >
                   <div className="flex items-center">
                     <input
                       type="radio"
                       name="payment_method"
                       value={method.id}
                       checked={formData.payment_method === method.id}
                       onChange={handleInputChange}
                       className="mr-3"
                     />
                     <span>{method.name}</span>
                   </div>
                 </label>
               ))}
             </div>
             
             <div>
               <label className="block text-gray-400 mb-2">Catatan Tambahan (Opsional)</label>
               <textarea
                 name="notes"
                 value={formData.notes}
                 onChange={handleInputChange}
                 className="w-full bg-gray-700 border border-gray-600 rounded p-2 min-h-20"
                 placeholder="Tambahkan catatan khusus jika diperlukan"
               ></textarea>
             </div>
           </div>
           
           <button
             type="submit"
             disabled={submitting}
             className={`w-full py-3 rounded-lg font-medium text-lg ${
               submitting
                 ? 'bg-blue-800 cursor-not-allowed'
                 : 'bg-blue-600 hover:bg-blue-700'
             }`}
           >
             {submitting ? 'Memproses...' : 'Konfirmasi Reservasi'}
           </button>
         </form>
       </div>
       
       <div>
         <div className="bg-gray-800 rounded-lg p-6 sticky top-6">
           <h2 className="text-xl font-bold mb-4">Ringkasan Reservasi</h2>
           
           {!selectedPlaybox ? (
             <div className="text-center py-8 text-gray-400">
               <Monitor size={48} className="mx-auto mb-3 opacity-30" />
               <p>Silakan pilih Playbox terlebih dahulu</p>
             </div>
           ) : (
             <>
               <div className="border-b border-gray-700 pb-4 mb-4">
                 <h3 className="font-medium">{selectedPlaybox.playbox_name}</h3>
                 <div className="text-sm text-gray-400">
                   {selectedPlaybox.tv_size} + {selectedPlaybox.ps4_model}
                 </div>
               </div>
               
               {selectedPricing && (
                 <div className="border-b border-gray-700 pb-4 mb-4">
                   <h3 className="font-medium">{selectedPricing.name}</h3>
                   <div className="text-sm text-gray-400">
                     {selectedPricing.is_basic_option 
                       ? `Rp${selectedPricing.hourly_rate.toLocaleString()}/jam (tanpa paket)` 
                       : `Paket dasar ${selectedPricing.min_hours} jam`}
                   </div>
                 </div>
               )}
               
               <div className="space-y-3 mb-6">
                 {formData.reservation_date && (
                   <div className="flex justify-between">
                     <span className="text-gray-400">Tanggal:</span>
                     <span>{formData.reservation_date}</span>
                   </div>
                 )}
                 
                 {formData.start_time && (
                   <div className="flex justify-between">
                     <span className="text-gray-400">Waktu Mulai:</span>
                     <span>{formData.start_time}</span>
                   </div>
                 )}
                 
                 <div className="flex justify-between">
                   <span className="text-gray-400">Durasi:</span>
                   <span>{formData.duration_hours} jam</span>
                 </div>
                 
                 <div className="flex justify-between">
                   <span className="text-gray-400">Pengambilan:</span>
                   <span>{pickupAtStudio ? 'Ambil di Studio' : 'Diantar ke Alamat'}</span>
                 </div>
                 
                 {selectedPricing && (
                   <>
                     <div className="border-t border-gray-700 pt-3 mt-3">
                       {selectedPricing.is_basic_option ? (
                         <div className="flex justify-between">
                           <span className="text-gray-400">Biaya per Jam (x{formData.duration_hours}):</span>
                           <span>Rp{(selectedPricing.hourly_rate * formData.duration_hours).toLocaleString()}</span>
                         </div>
                       ) : (
                         <>
                           <div className="flex justify-between">
                             <span className="text-gray-400">Paket Dasar:</span>
                             <span>Rp{selectedPricing.base_price.toLocaleString()}</span>
                           </div>
                           
                           {getAdditionalHours() > 0 && (
                             <div className="flex justify-between">
                               <span className="text-gray-400">
                                 Jam Tambahan ({getAdditionalHours()} jam):
                               </span>
                               <span>
                                 Rp{(getAdditionalHours() * selectedPricing.hourly_rate).toLocaleString()}
                               </span>
                             </div>
                           )}
                         </>
                       )}
                       
                       {!pickupAtStudio && selectedPricing.delivery_fee > 0 && (
                         <div className="flex justify-between">
                           <span className="text-gray-400">Biaya Pengantaran:</span>
                           <span>Rp{selectedPricing.delivery_fee.toLocaleString()}</span>
                         </div>
                       )}
                       
                       {pickupAtStudio && (
                         <div className="flex justify-between">
                           <span className="text-gray-400">Biaya Pengantaran:</span>
                           <span className="text-green-500">GRATIS (Ambil di Studio)</span>
                         </div>
                       )}
                       
                       {isWeekend() && selectedPricing.weekend_surcharge > 0 && (
                         <div className="flex justify-between">
                           <span className="text-gray-400">Tambahan Akhir Pekan:</span>
                           <span>Rp{selectedPricing.weekend_surcharge.toLocaleString()}</span>
                         </div>
                       )}
                     </div>
                     
                     <div className="flex justify-between font-bold text-lg border-t border-gray-700 pt-3">
                       <span>Total:</span>
                       <span>Rp{calculateTotalPrice().toLocaleString()}</span>
                     </div>
                     
                     {selectedPricing.deposit_amount > 0 && (
                       <div className="flex justify-between text-blue-400 text-sm">
                         <span>Deposit (dikembalikan):</span>
                         <span>Rp{selectedPricing.deposit_amount.toLocaleString()}</span>
                       </div>
                     )}
                   </>
                 )}
               </div>
               
               <div className="bg-blue-900 bg-opacity-20 rounded-lg p-4 text-sm text-blue-400">
                 <p className="font-medium mb-2">Informasi Pemesanan:</p>
                 <ul className="space-y-1">
                   <li>• Reservasi memerlukan konfirmasi dari staff kami</li>
                   {pickupAtStudio ? (
                     <li>• Pengambilan Playbox di studio 15 menit sebelum waktu mulai</li>
                   ) : (
                     <li>• Pengantaran Playbox dilakukan 30 menit sebelum waktu mulai</li>
                   )}
                   <li>• Pembayaran dapat dilakukan saat pengantaran</li>
                   <li>• Deposit akan dikembalikan setelah Playbox dikembalikan dalam kondisi baik</li>
                 </ul>
               </div>
             </>
           )}
         </div>
       </div>
     </div>
   </div>
 );
};

export default PlayboxReservationPage;