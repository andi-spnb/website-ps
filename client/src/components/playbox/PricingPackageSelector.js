import React, { useState, useEffect } from 'react';
import { Tag, Check, Info, AlertCircle } from 'lucide-react';

const PricingPackageSelector = ({
  pricingOptions = [],
  selectedPricing,
  onSelectPricing,
  selectedTime,
  selectedDuration,
  isWeekend,
  pickupAtStudio,
  onTimeSelect,
  onDurationChange
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  
  // Calculate the total price for a pricing option based on selected duration
  const calculatePrice = (pricing, duration) => {
    if (!pricing || !duration) return 0;
    
    // Apply weekend surcharge if applicable
    const weekendMultiplier = isWeekend && pricing.weekend_surcharge ? 1 + (pricing.weekend_surcharge / 100) : 1;
    
    // Jika ini adalah paket tetap, gunakan harga dasar
    if (pricing.is_fixed_package) {
      const basePrice = pricing.base_price || 0;
      const deliveryFee = pickupAtStudio ? 0 : (pricing.delivery_fee || 0);
      return (basePrice + deliveryFee) * weekendMultiplier;
    }
    
    // If this is a special duration package (12 or 24 hours)
    if (duration === 12 && pricing.package_12h_price) {
      return pricing.package_12h_price * weekendMultiplier;
    } else if (duration === 24 && pricing.package_24h_price) {
      return pricing.package_24h_price * weekendMultiplier;
    }
    
    // Calculate standard pricing
    const basePrice = pricing.base_price || 0;
    const additionalHours = Math.max(0, duration - pricing.min_hours);
    const hourlyTotal = additionalHours * pricing.hourly_rate;
    const deliveryFee = pickupAtStudio ? 0 : (pricing.delivery_fee || 0);
    
    return (basePrice + hourlyTotal + deliveryFee) * weekendMultiplier;
  };
  
  // Format price for display
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };
  
  // Get savings percentage for a package compared to hourly rate
  const getSavingsPercent = (pricing, duration) => {
    if (!pricing || !duration) return 0;
    
    // Check if this is a special package
    if (duration === 12 && pricing.package_12h_price) {
      const regularPrice = pricing.hourly_rate * 12;
      return Math.round((1 - pricing.package_12h_price / regularPrice) * 100);
    } else if (duration === 24 && pricing.package_24h_price) {
      const regularPrice = pricing.hourly_rate * 24;
      return Math.round((1 - pricing.package_24h_price / regularPrice) * 100);
    }
    
    return 0;
  };
  
  // Show pricing recommendation
  const getRecommendedPricing = () => {
    if (!selectedDuration || pricingOptions.length === 0) return null;
    
    // For 12-hour and 24-hour reservations, recommend packages with special pricing
    if (selectedDuration === 12 || selectedDuration === 24) {
      const packagesWithSpecialPricing = pricingOptions.filter(p => 
        (selectedDuration === 12 && p.package_12h_price) || 
        (selectedDuration === 24 && p.package_24h_price)
      );
      
      if (packagesWithSpecialPricing.length > 0) {
        // Find the one with highest savings
        return packagesWithSpecialPricing.reduce((best, current) => 
          getSavingsPercent(current, selectedDuration) > getSavingsPercent(best, selectedDuration) ? current : best
        );
      }
    }
    
    // Otherwise find the cheapest option for this duration
    return pricingOptions.reduce((cheapest, current) => 
      calculatePrice(current, selectedDuration) < calculatePrice(cheapest, selectedDuration) ? current : cheapest
    );
  };
  
  // Effect to auto-select recommended pricing when duration changes
  useEffect(() => {
    if (selectedDuration && (!selectedPricing || selectedDuration === 12 || selectedDuration === 24)) {
      const recommended = getRecommendedPricing();
      if (recommended && recommended !== selectedPricing) {
        onSelectPricing(recommended);
      }
    }
  }, [selectedDuration, pricingOptions]);
  
  if (isLoading) {
    return <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
      <div className="h-8 bg-gray-700 rounded mb-4 w-1/3"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="h-32 bg-gray-700 rounded"></div>
        <div className="h-32 bg-gray-700 rounded"></div>
      </div>
    </div>;
  }
  
  if (error) {
    return <div className="bg-red-900 bg-opacity-20 rounded-lg p-4 border border-red-500">
      <AlertCircle className="text-red-500 mb-2" size={24} />
      <p className="text-red-400">{error}</p>
    </div>;
  }
  
  return (
    <div className="bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-lg p-6 border border-gray-700 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Tag className="mr-2" size={18} />
          Pilih Paket Harga
        </h3>
        <button 
          onClick={() => setShowInfo(!showInfo)}
          className="text-blue-400 hover:text-blue-300 flex items-center text-sm"
        >
          <Info size={15} className="mr-1" />
          Info Paket
        </button>
      </div>
      
      {showInfo && (
        <div className="mb-4 bg-blue-900 bg-opacity-20 rounded-lg p-3 border border-blue-700 text-sm text-blue-300">
          <p className="mb-2">
            <strong>Informasi Paket Harga:</strong>
          </p>
          <ul className="space-y-1 list-disc pl-5">
            <li>Paket Standard: Harga dasar + tarif per jam untuk durasi tambahan</li>
            <li>Paket Tetap: Jadwal dengan jam mulai dan selesai yang sudah ditentukan</li>
            <li>Paket 12 Jam: Harga spesial dengan diskon hingga 20%</li>
            <li>Paket 24 Jam: Harga spesial dengan diskon hingga 30%</li>
            <li>Biaya antar tidak dikenakan jika Anda mengambil sendiri di studio</li>
            {isWeekend && <li className="text-yellow-300">Akhir pekan: Beberapa paket memiliki biaya tambahan</li>}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {pricingOptions.map(pricing => {
          const isSelected = selectedPricing && selectedPricing.price_id === pricing.price_id;
          const totalPrice = calculatePrice(pricing, selectedDuration);
          const isDisabled = !pricing.is_fixed_package && selectedDuration < pricing.min_hours;
          const hasSpecialPackage = (selectedDuration === 12 && pricing.package_12h_price) || 
                                   (selectedDuration === 24 && pricing.package_24h_price);
          const savingsPercent = getSavingsPercent(pricing, selectedDuration);
          
          // Determine if this is the best value
          const isRecommended = pricing === getRecommendedPricing();
          
          return (
            <button
              key={pricing.price_id}
              onClick={() => {
                if (!isDisabled) {
                  onSelectPricing(pricing);
                  // Jika memilih paket tetap, update waktu dan durasi
                  if (pricing.is_fixed_package) {
                    onTimeSelect && onTimeSelect(pricing.fixed_start_time);
                    onDurationChange && onDurationChange(pricing.fixed_duration);
                  }
                }
              }}
              disabled={isDisabled}
              className={`relative p-4 rounded-lg text-left border ${
                isDisabled 
                ? 'bg-gray-900 border-gray-800 opacity-50 cursor-not-allowed' 
                : isSelected
                  ? 'bg-gradient-to-br from-blue-900 to-indigo-900 border-blue-500 shadow-lg'
                  : pricing.is_fixed_package
                    ? 'bg-gradient-to-br from-purple-900 to-indigo-900 border-purple-700 hover:border-purple-500'
                    : hasSpecialPackage
                      ? 'bg-gradient-to-br from-green-900 to-emerald-900 border-green-700 hover:border-green-500'
                      : 'bg-gray-800 border-gray-700 hover:border-blue-500'
              }`}
            >
              {isRecommended && !isDisabled && (
                <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                  Rekomendasi
                </div>
              )}
              
              <div className="font-medium text-lg mb-1">{pricing.name}</div>
              
              {selectedDuration && !isDisabled && (
                <div className="flex items-baseline mb-2">
                  <span className="text-xl font-bold">{formatPrice(totalPrice)}</span>
                  {hasSpecialPackage && savingsPercent > 0 && (
                    <span className="ml-2 text-xs px-1.5 py-0.5 bg-green-900 bg-opacity-40 text-green-400 rounded">
                      Hemat {savingsPercent}%
                    </span>
                  )}
                </div>
              )}
              
              <div className="text-sm text-gray-300 space-y-1">
                <div className="flex items-center">
                  <div className="w-4">{isSelected ? <Check size={14} className="text-blue-400" /> : ''}</div>
                  <span>Durasi minimum: {pricing.is_fixed_package ? pricing.fixed_duration : pricing.min_hours} jam</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4">{isSelected ? <Check size={14} className="text-blue-400" /> : ''}</div>
                  <span>Tarif per jam: {formatPrice(pricing.hourly_rate)}</span>
                </div>
                {!pickupAtStudio && (
                  <div className="flex items-center">
                    <div className="w-4">{isSelected ? <Check size={14} className="text-blue-400" /> : ''}</div>
                    <span>
                      {pricing.delivery_fee > 0 
                        ? `Biaya antar: ${formatPrice(pricing.delivery_fee)}` 
                        : 'Antar gratis'}
                    </span>
                  </div>
                )}
                {pricing.weekend_surcharge > 0 && (
                  <div className={`flex items-center ${isWeekend ? 'text-yellow-300' : ''}`}>
                    <div className="w-4">{isSelected ? <Check size={14} className="text-blue-400" /> : ''}</div>
                    <span>
                      {isWeekend 
                        ? `+${pricing.weekend_surcharge}% akhir pekan (diterapkan)` 
                        : `+${pricing.weekend_surcharge}% akhir pekan`}
                    </span>
                  </div>
                )}
                
                {/* Special package highlights */}
                {pricing.package_12h_price && (
                  <div className={`flex items-center ${selectedDuration === 12 ? 'text-green-400 font-medium' : ''}`}>
                    <div className="w-4">{isSelected && selectedDuration === 12 ? <Check size={14} className="text-green-400" /> : ''}</div>
                    <span>Paket 12 jam: {formatPrice(pricing.package_12h_price)}</span>
                  </div>
                )}
                {pricing.package_24h_price && (
                  <div className={`flex items-center ${selectedDuration === 24 ? 'text-green-400 font-medium' : ''}`}>
                    <div className="w-4">{isSelected && selectedDuration === 24 ? <Check size={14} className="text-green-400" /> : ''}</div>
                    <span>Paket 24 jam: {formatPrice(pricing.package_24h_price)}</span>
                  </div>
                )}
              </div>
              
              {/* Tampilkan informasi paket tetap */}
              {pricing.is_fixed_package && (
                <div className="mt-2 bg-purple-900 bg-opacity-20 p-2 rounded-md text-center">
                  <div className="text-purple-300 text-xs font-medium mb-1">Paket Tetap</div>
                  <div className="text-white">
                    {pricing.fixed_start_time} - {pricing.fixed_end_time}
                    <span className="ml-2 text-purple-300 text-xs">
                      ({pricing.fixed_duration} jam)
                    </span>
                  </div>
                </div>
              )}
              
              {isDisabled && (
                <div className="mt-2 text-xs bg-red-900 bg-opacity-20 text-red-400 p-1.5 rounded">
                  Durasi minimum tidak terpenuhi (min. {pricing.min_hours} jam)
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Deposit info */}
      {selectedPricing && selectedPricing.deposit_amount > 0 && (
        <div className="bg-gray-900 rounded-lg p-3 border border-gray-700 text-sm">
          <div className="flex items-start">
            <Info size={16} className="text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-300">
                <span className="font-medium">Deposit {formatPrice(selectedPricing.deposit_amount)}</span> akan diambil saat pengantaran dan dikembalikan setelah Playbox dikembalikan dalam kondisi baik.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingPackageSelector;