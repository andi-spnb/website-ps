import React, { useState, useEffect } from 'react';
import { Monitor, Clock, X, ArrowLeft } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import api from '../../services/api';

const DURATION_OPTIONS = [
  { hours: 1, label: '1 Jam' },
  { hours: 2, label: '2 Jam' },
  { hours: 3, label: '3 Jam', discount: 5 },
  { hours: 5, label: '5 Jam', discount: 10 },
  { hours: 10, label: '10 Jam (Seharian)', discount: 20 }
];

const RentalForm = ({ selectedDevice, onBack }) => {
  const { addRental } = useCart();
  const [selectedDuration, setSelectedDuration] = useState(DURATION_OPTIONS[0]);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await api.get(`/pricing/device-type/${selectedDevice.device_type}`);
        setPricing(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching pricing:', err);
        
        // Mock data for demo
        const mockPricing = {
          amount_per_hour: 
            selectedDevice.device_type === 'PS5' ? 20000 :
            selectedDevice.device_type === 'PS4' ? 15000 : 10000
        };
        setPricing(mockPricing);
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, [selectedDevice]);

  const calculatePrice = (hours, basePrice) => {
    const option = DURATION_OPTIONS.find(opt => opt.hours === hours);
    const discount = option?.discount || 0;
    const subtotal = basePrice * hours;
    const discountAmount = subtotal * (discount / 100);
    return subtotal - discountAmount;
  };

  const handleAddToCart = () => {
    const baseHourlyRate = pricing?.amount_per_hour || 0;
    const totalPrice = calculatePrice(selectedDuration.hours, baseHourlyRate);
    
    addRental(
      selectedDevice,
      selectedDuration.hours,
      totalPrice
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
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Pilih Durasi</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {DURATION_OPTIONS.map(option => (
            <button
              key={option.hours}
              onClick={() => setSelectedDuration(option)}
              className={`py-2 px-3 rounded-lg ${
                selectedDuration.hours === option.hours 
                  ? 'bg-blue-600' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <div className="font-medium">{option.label}</div>
              {option.discount > 0 && (
                <div className="text-xs text-green-400">Diskon {option.discount}%</div>
              )}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Ringkasan Biaya</h3>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Durasi</span>
            <span>{selectedDuration.hours} jam</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Harga per jam</span>
            <span>Rp{pricing.amount_per_hour.toLocaleString()}</span>
          </div>
          {selectedDuration.discount > 0 && (
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Diskon</span>
              <span className="text-green-400">{selectedDuration.discount}%</span>
            </div>
          )}
          <div className="flex justify-between font-semibold border-t border-gray-600 pt-2 mt-2">
            <span>Total</span>
            <span>Rp{calculatePrice(selectedDuration.hours, pricing.amount_per_hour).toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      <button
        onClick={handleAddToCart}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
      >
        Tambahkan ke Keranjang
      </button>
    </div>
  );
};

export default RentalForm;