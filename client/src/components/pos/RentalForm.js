import React, { useState, useEffect } from 'react';
import { Monitor, Clock, X, ArrowLeft, Info, User, Award } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import api from '../../services/api';

const DURATION_OPTIONS = [
  { hours: 1, label: '1 Jam' },
  { hours: 2, label: '2 Jam' },
  { hours: 3, label: '3 Jam' },
  { hours: 5, label: '5 Jam' },
  { hours: 10, label: '10 Jam (Seharian)' },
  { hours: 'custom', label: 'Kustom...' }
];

const RentalForm = ({ selectedDevice, onBack }) => {
  const { addRental, member } = useCart();
  const [selectedDuration, setSelectedDuration] = useState(DURATION_OPTIONS[0]);
  const [customHours, setCustomHours] = useState('');
  const [pricing, setPricing] = useState(null);
  const [availablePackages, setAvailablePackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loyaltyBonus, setLoyaltyBonus] = useState(0);
  const [memberSessions, setMemberSessions] = useState(0);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        setLoading(true);
        // Fetch pricing data from API
        const response = await api.get(`/pricing/device-type/${selectedDevice.device_type}`);
        setPricing(response.data);
        
        // Check if there are package options available for this device type
        try {
          // This would fetch all pricing options for this device type to check for packages
          const allPricingResponse = await api.get('/pricing');
          const filteredPackages = allPricingResponse.data.filter(item => 
            item.device_type === selectedDevice.device_type && 
            item.package_amount && 
            item.package_hours
          );
          
          setAvailablePackages(filteredPackages);
        } catch (err) {
          console.error('Error fetching packages:', err);
          setAvailablePackages([]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching pricing:', err);
        setError('Gagal memuat data harga. Menggunakan harga default.');
        
        // Use default pricing as fallback
        const defaultPricing = {
          device_type: selectedDevice.device_type,
          amount_per_hour: 
            selectedDevice.device_type === 'PS5' ? 20000 :
            selectedDevice.device_type === 'PS4' ? 15000 : 10000,
          name: `Default ${selectedDevice.device_type}`
        };
        
        setPricing(defaultPricing);
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
    
    // Jika member dipilih dan device adalah PS4, cek sesi member
    if (member && selectedDevice.device_type === 'PS4') {
      fetchMemberSessions();
    }
  }, [selectedDevice, member]);

  // Fetch member session history for PS4 loyalty
  const fetchMemberSessions = async () => {
    try {
      // Fetch member rental history
      const response = await api.get(`/rentals/history?userId=${member.user_id}&deviceType=PS4`);
      
      // Hitung jumlah sesi rental PS4 yang sudah completed
      const completedSessions = response.data.filter(session => 
        session.status === 'Completed' && 
        session.Device.device_type === 'PS4'
      ).length;
      
      setMemberSessions(completedSessions);
      
      // Hitung bonus jam berdasarkan completed sessions
      if (completedSessions >= 10) {
        setLoyaltyBonus(2); // Free 2 jam untuk 10+ sesi
      } else if (completedSessions >= 5) {
        setLoyaltyBonus(1); // Free 1 jam untuk 5+ sesi
      } else {
        setLoyaltyBonus(0);
      }
      
    } catch (err) {
      console.error('Error fetching member sessions:', err);
      // Fallback untuk demo
      const mockSessions = 7; // Untuk demo, anggap ada 7 sesi
      setMemberSessions(mockSessions);
      setLoyaltyBonus(mockSessions >= 10 ? 2 : mockSessions >= 5 ? 1 : 0);
    }
  };

  const calculatePrice = (hours, basePrice) => {
    // If a package is selected, use the package price
    if (selectedPackage) {
      return selectedPackage.package_amount;
    }
    
    // If custom duration
    if (typeof hours === 'string' && hours === 'custom') {
      const customHoursNum = parseFloat(customHours);
      if (isNaN(customHoursNum) || customHoursNum <= 0) return 0;
      
      // Menghapus diskon durasi
      const subtotal = basePrice * customHoursNum;
      return subtotal;
    }
    
    // Standard hourly pricing tanpa diskon
    const subtotal = basePrice * hours;
    return subtotal;
  };

  const handleSelectDuration = (duration) => {
    setSelectedDuration(duration);
    setSelectedPackage(null); // Clear package selection when duration changes
    
    if (duration.hours === 'custom') {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
    }
  };
  
  const handleSelectPackage = (packageOption) => {
    setSelectedPackage(packageOption);
    
    // Find or create a matching duration option based on package hours
    const matchingDuration = DURATION_OPTIONS.find(opt => opt.hours === packageOption.package_hours);
    if (matchingDuration) {
      setSelectedDuration(matchingDuration);
    } else {
      // If no matching preset, set custom hours
      setSelectedDuration(DURATION_OPTIONS.find(opt => opt.hours === 'custom'));
      setCustomHours(packageOption.package_hours.toString());
      setShowCustomInput(true);
    }
  };

  const getActualHours = () => {
    if (selectedPackage) {
      return selectedPackage.package_hours;
    }
    
    if (selectedDuration.hours === 'custom') {
      const parsed = parseFloat(customHours);
      return isNaN(parsed) ? 0 : parsed;
    }
    return selectedDuration.hours;
  };
  
  // Get total hours including loyalty bonus if applicable
  const getTotalHours = () => {
    const baseHours = getActualHours();
    
    // Hanya berikan bonus jam jika device type adalah PS4 dan ada member
    if (selectedDevice.device_type === 'PS4' && member && loyaltyBonus > 0) {
      return baseHours + loyaltyBonus;
    }
    
    return baseHours;
  };

  const handleAddToCart = () => {
    if (!pricing) {
      alert('Data harga tidak tersedia. Silakan coba lagi nanti.');
      return;
    }
    
    const baseHourlyRate = pricing.amount_per_hour;
    const baseHours = getActualHours();
    const totalHours = getTotalHours();
    
    if (baseHours <= 0) {
      alert('Silakan masukkan durasi yang valid');
      return;
    }
    
    // Hitung harga berdasarkan jam dasar (tanpa bonus jam)
    const totalPrice = calculatePrice(
      selectedDuration.hours === 'custom' ? 'custom' : selectedDuration.hours, 
      baseHourlyRate
    );
    
    addRental(
      selectedDevice,
      totalHours, // Gunakan total hours (termasuk bonus jam) untuk durasi rental
      totalPrice  // Tetapi gunakan base hours untuk perhitungan harga
    );
    
    onBack();
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-12 bg-gray-700 rounded mb-4"></div>
        <div className="h-32 bg-gray-700 rounded mb-4"></div>
        <div className="h-12 bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={onBack}
          className="flex items-center text-gray-400 hover:text-white"
        >
          <ArrowLeft size={18} className="mr-1" />
          <span>Kembali</span>
        </button>
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Detail PlayStation</h3>
        <div className="bg-gray-700 rounded-lg p-4 mb-4">
          <div className="flex items-center mb-2">
            <Monitor size={18} className="mr-2 text-blue-500" />
            <span className="font-medium">{selectedDevice.device_name}</span>
          </div>
          <div className="text-sm text-gray-400 mb-2">Jenis: {selectedDevice.device_type}</div>
          <div className="text-sm text-gray-400">Lokasi: {selectedDevice.location || 'Tidak ditentukan'}</div>
        </div>
        
        {error && (
          <div className="bg-yellow-900 bg-opacity-20 p-3 rounded-lg border border-yellow-800 mb-4">
            <div className="flex items-center text-yellow-500 text-sm">
              <Info size={16} className="mr-2" />
              {error}
            </div>
          </div>
        )}
        
        {pricing && (
          <div className="bg-blue-900 bg-opacity-20 p-3 rounded-lg border border-blue-800 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-medium">{pricing.name}</div>
                <div className="text-xs text-gray-400">
                  {pricing.time_condition === 'Any' ? 'Berlaku kapan saja' : 
                   pricing.time_condition === 'Weekday' ? 'Berlaku hari kerja' :
                   pricing.time_condition === 'Weekend' ? 'Berlaku akhir pekan' : 'Berlaku hari libur'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">Rp{pricing.amount_per_hour.toLocaleString()}</div>
                <div className="text-xs text-gray-400">per jam</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Loyalty Program Banner - Hanya untuk PS4 */}
        {selectedDevice.device_type === 'PS4' && member && (
          <div className="bg-purple-900 bg-opacity-20 p-3 rounded-lg border border-purple-800 mb-4">
            <div className="flex items-center mb-1">
              <Award size={16} className="mr-2 text-purple-400" />
              <span className="font-medium text-purple-300">Program Loyalty PS4</span>
            </div>
            <div className="text-sm text-gray-300">
              Sesi PS4 member: <span className="font-medium">{memberSessions}</span>
              {loyaltyBonus > 0 && (
                <span className="ml-2 text-green-400 font-medium">
                  (Bonus: +{loyaltyBonus} jam gratis!)
                </span>
              )}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              5 sesi = bonus 1 jam, 10 sesi = bonus 2 jam
            </div>
          </div>
        )}
      </div>
      
      {availablePackages.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Paket Tersedia</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availablePackages.map(packageOption => (
              <button
                key={packageOption.price_id}
                onClick={() => handleSelectPackage(packageOption)}
                className={`p-3 rounded-lg ${
                  selectedPackage?.price_id === packageOption.price_id 
                    ? 'bg-blue-600' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <div className="font-medium">{packageOption.name}</div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-400">{packageOption.package_hours} jam</span>
                  <span className="font-bold">Rp{packageOption.package_amount.toLocaleString()}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Pilih Durasi</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {DURATION_OPTIONS.map(option => (
            <button
              key={option.hours}
              onClick={() => handleSelectDuration(option)}
              className={`py-2 px-3 rounded-lg ${
                selectedDuration.hours === option.hours && !selectedPackage
                  ? 'bg-blue-600' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <div className="font-medium">{option.label}</div>
            </button>
          ))}
        </div>
        
        {/* Input untuk durasi kustom */}
        {showCustomInput && (
          <div className="mt-4 bg-gray-700 rounded-lg p-4">
            <label className="block text-gray-400 mb-2">Masukkan Jam (0.5 - 24)</label>
            <div className="flex items-center">
              <input
                type="number"
                value={customHours}
                onChange={(e) => setCustomHours(e.target.value)}
                min="0.5"
                max="24"
                step="0.5"
                className="w-full bg-gray-800 border border-gray-600 rounded p-2"
                placeholder="Contoh: 4.5"
              />
              <div className="ml-2 text-gray-400">jam</div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Ringkasan Biaya</h3>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Durasi Dasar</span>
            <span>
              {selectedPackage ? 
                `${selectedPackage.package_hours} jam (Paket)` :
                selectedDuration.hours === 'custom' ? 
                  customHours ? `${customHours} jam` : '- jam' : 
                  `${selectedDuration.hours} jam`}
            </span>
          </div>
          
          {/* Tampilkan bonus loyalty jika ada */}
          {selectedDevice.device_type === 'PS4' && member && loyaltyBonus > 0 && (
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Bonus Loyalty</span>
              <span className="text-green-400">+{loyaltyBonus} jam</span>
            </div>
          )}
          
          {/* Total durasi termasuk bonus */}
          {selectedDevice.device_type === 'PS4' && member && loyaltyBonus > 0 && (
            <div className="flex justify-between mb-2 font-medium">
              <span className="text-gray-300">Total Durasi</span>
              <span>{getTotalHours()} jam</span>
            </div>
          )}
          
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Harga per jam</span>
            <span>Rp{pricing ? pricing.amount_per_hour.toLocaleString() : 0}</span>
          </div>
          
          {selectedPackage && (
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Paket {selectedPackage.name}</span>
              <span>Rp{selectedPackage.package_amount.toLocaleString()}</span>
            </div>
          )}
          
          <div className="flex justify-between font-semibold border-t border-gray-600 pt-2 mt-2">
            <span>Total</span>
            <span>Rp{calculatePrice(
              selectedDuration.hours, 
              pricing ? pricing.amount_per_hour : 0
            ).toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      <button
        onClick={handleAddToCart}
        disabled={(!pricing) || (selectedDuration.hours === 'custom' && (parseFloat(customHours) <= 0 || isNaN(parseFloat(customHours))))}
        className={`w-full py-3 ${
          (!pricing) || (selectedDuration.hours === 'custom' && (parseFloat(customHours) <= 0 || isNaN(parseFloat(customHours))))
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        } rounded-lg font-medium`}
      >
        Tambahkan ke Keranjang
      </button>
    </div>
  );
};

export default RentalForm;