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
  ArrowLeft
} from 'lucide-react';
import api from '../../services/api';

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
  
  // Form data
  const [formData, setFormData] = useState({
    playbox_id: playboxId || '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    delivery_address: '',
    reservation_date: '',
    start_time: '',
    duration_hours: 1,
    payment_method: 'cash',
    notes: ''
  });
  
  // Predefined durations
  const durationOptions = [
    { value: 1, label: '1 Jam' },
    { value: 2, label: '2 Jam' },
    { value: 3, label: '3 Jam' },
    { value: 5, label: '5 Jam' },
    { value: 10, label: '10 Jam (Seharian)' }
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

    fetchPlayboxes();
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
        notes: formData.notes
      };
      
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
  
  // Calculate price
  const calculatePrice = () => {
    if (!formData.duration_hours) return 0;
    
    const basePrice = 50000; // Rp50.000 per hour
    let totalPrice = basePrice * parseInt(formData.duration_hours);
    
    // Apply discounts for longer durations
    if (formData.duration_hours >= 3 && formData.duration_hours < 5) {
      totalPrice = totalPrice * 0.95; // 5% discount
    } else if (formData.duration_hours >= 5 && formData.duration_hours < 10) {
      totalPrice = totalPrice * 0.90; // 10% discount
    } else if (formData.duration_hours >= 10) {
      totalPrice = totalPrice * 0.80; // 20% discount
    }
    
    return Math.round(totalPrice);
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
                  <li>Pada hari-H, Playbox akan diantar ke alamat Anda sesuai jadwal.</li>
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
            
            {/* Step 2: Schedule */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">2. Jadwal Reservasi</h2>
              
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
            
            {/* Step 3: Customer Information */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">3. Data Pemesan</h2>
              
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
              </div>
            </div>
            
            {/* Step 4: Payment Method */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">4. Metode Pembayaran</h2>
              
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
                  
                  <div className="flex justify-between font-medium">
                    <span>Harga:</span>
                    <span>Rp{calculatePrice().toLocaleString('id-ID')}</span>
                  </div>
                </div>
                
                <div className="bg-blue-900 bg-opacity-20 rounded-lg p-4 text-sm text-blue-400">
                  <p className="font-medium mb-2">Informasi Pemesanan:</p>
                  <ul className="space-y-1">
                    <li>• Reservasi memerlukan konfirmasi dari staff kami</li>
                    <li>• Pengantaran Playbox dilakukan 30 menit sebelum waktu mulai</li>
                    <li>• Pembayaran dapat dilakukan saat pengantaran</li>
                    <li>• Harga sudah termasuk pengantaran (maksimal 5km)</li>
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