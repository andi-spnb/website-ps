import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShift } from '../contexts/ShiftContext';
import { toast } from 'react-toastify';
import { Clock, PlusCircle } from 'lucide-react';

// Components
import DeviceSelection from '../components/pos/DeviceSelection';
import RentalForm from '../components/pos/RentalForm';
import FoodItemsList from '../components/pos/FoodItemsList';
import Cart from '../components/pos/Cart';
import ActiveSessionsList from '../components/pos/ActiveSessionsList';
import ExtendRentalModal from '../components/pos/ExtendRentalModal';
import api from '../services/api';

const POSPage = () => {
  const { currentShift, loading: shiftLoading } = useShift();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ps');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if shift is active
    if (!shiftLoading && !currentShift) {
      toast.warning('Anda belum memulai shift. Silakan mulai shift terlebih dahulu.');
      navigate('/shift');
    }
  }, [currentShift, shiftLoading, navigate]);

  // Mengambil daftar sesi aktif
  const fetchActiveSessions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/rentals/active');
      setActiveSessions(response.data);
    } catch (err) {
      console.error('Error fetching active sessions:', err);
      // Data dummy untuk demo jika API gagal
      setActiveSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveSessions();
    
    // Polling untuk memperbarui data sesi aktif setiap 30 detik
    const interval = setInterval(fetchActiveSessions, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSelectDevice = (device) => {
    setSelectedDevice(device);
  };

  const handleBackToDevices = () => {
    setSelectedDevice(null);
  };

  const handleExtendSession = (session) => {
    setShowExtendModal(true);
  };

  const handleExtendSuccess = () => {
    fetchActiveSessions();
    toast.success('Waktu bermain berhasil diperpanjang');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Kasir</h1>
        <p className="text-gray-400">
          Proses transaksi untuk rental PlayStation dan penjualan makanan/minuman.
        </p>
      </div>
      
      {/* Petunjuk fitur baru */}
      <div className="bg-blue-900 bg-opacity-20 p-4 rounded-lg border border-blue-800 mb-4">
        <h3 className="font-semibold flex items-center mb-2">
          <Clock className="mr-2" size={20} />
          Fitur Baru: Tambah Jam Bermain
        </h3>
        <p className="text-sm text-gray-300 mb-2">
          Fitur ini memungkinkan Anda menambahkan waktu bermain untuk sesi PlayStation yang sedang aktif. 
          Gunakan tombol "Tambah Jam" untuk memperpanjang waktu bermain pelanggan tanpa perlu membuat sesi baru.
        </p>
        <div className="text-sm text-gray-400">
          <p>1. Pilih PlayStation yang ingin diperpanjang waktunya</p>
          <p>2. Tentukan durasi perpanjangan (1-12 jam)</p>
          <p>3. Pilih metode pembayaran</p>
          <p>4. Klik "Perpanjang Waktu" untuk mengonfirmasi</p>
        </div>
      </div>

      {/* Tampilkan daftar sesi aktif */}
      <div className="mb-4">
        <ActiveSessionsList 
          onExtendSession={handleExtendSession} 
        />
      </div>

      {/* Tombol Tambah Jam terpisah yang lebih mencolok */}
      <div className="flex mb-6">
        <button 
          onClick={() => setShowExtendModal(true)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium flex items-center"
        >
          <PlusCircle size={18} className="mr-2" />
          Tambah Jam Bermain
        </button>
        
        <div className="ml-4">
          <button
            onClick={fetchActiveSessions}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-medium"
          >
            Refresh Data Sesi
          </button>
        </div>
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
      
      {/* Modal Extend Rental */}
      <ExtendRentalModal
        isOpen={showExtendModal}
        onClose={() => setShowExtendModal(false)}
        onSuccess={handleExtendSuccess}
        activeSessions={activeSessions}
      />
    </div>
  );
};

export default POSPage;