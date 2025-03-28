import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShift } from '../contexts/ShiftContext';
import { toast } from 'react-toastify';

// Components
import DeviceSelection from '../components/pos/DeviceSelection';
import RentalForm from '../components/pos/RentalForm';
import FoodItemsList from '../components/pos/FoodItemsList';
import Cart from '../components/pos/Cart';

const POSPage = () => {
  const { currentShift, loading: shiftLoading } = useShift();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ps');
  const [selectedDevice, setSelectedDevice] = useState(null);

  useEffect(() => {
    // Check if shift is active
    if (!shiftLoading && !currentShift) {
      toast.warning('Anda belum memulai shift. Silakan mulai shift terlebih dahulu.');
      navigate('/shift');
    }
  }, [currentShift, shiftLoading, navigate]);

  const handleSelectDevice = (device) => {
    setSelectedDevice(device);
  };

  const handleBackToDevices = () => {
    setSelectedDevice(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Kasir</h1>
        <p className="text-gray-400">
          Proses transaksi untuk rental PlayStation dan penjualan makanan/minuman.
        </p>
      </div>
      
      <div className="flex h-full">
        <div className="w-2/3 pr-4">
          <div className="flex border-b border-gray-700 mb-6">
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'ps' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
              onClick={() => setActiveTab('ps')}
            >
              PlayStation
            </button>
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'food' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
              onClick={() => setActiveTab('food')}
            >
              Makanan & Minuman
            </button>
          </div>
          
          {activeTab === 'ps' && (
            <>
              {selectedDevice ? (
                <RentalForm 
                  selectedDevice={selectedDevice} 
                  onBack={handleBackToDevices} 
                />
              ) : (
                <DeviceSelection onSelectDevice={handleSelectDevice} />
              )}
            </>
          )}
          
          {activeTab === 'food' && <FoodItemsList />}
        </div>
        
        <div className="w-1/3">
          <Cart />
        </div>
      </div>
    </div>
  );
};

export default POSPage;