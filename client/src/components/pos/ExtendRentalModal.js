// File: client/src/components/pos/ExtendRentalModal.js
import React, { useState, useEffect } from 'react';
import { X, Clock, Plus, Minus, CreditCard, User, Monitor, Calendar, Info } from 'lucide-react';
import api from '../../services/api';
import { useShift } from '../../contexts/ShiftContext';
import { toast } from 'react-toastify';

const PaymentMethods = [
  { id: 'cash', name: 'Tunai' },
  { id: 'qris', name: 'QRIS' },
  { id: 'ovo', name: 'OVO' },
  { id: 'dana', name: 'DANA' }
];

const ExtendRentalModal = ({ isOpen, onClose, onSuccess, activeSessions }) => {
  const { currentShift } = useShift();
  const [selectedSession, setSelectedSession] = useState(null);
  const [additionalHours, setAdditionalHours] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [hourlyRate, setHourlyRate] = useState(0);
  const [newEndTime, setNewEndTime] = useState(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedSession(null);
      setAdditionalHours(1);
      setPaymentMethod('cash');
      setNewEndTime(null);
    }
  }, [isOpen]);

  // Set hourly rate based on device type and calculate new end time
  useEffect(() => {
    if (selectedSession) {
      let rate = 15000; // Default rate
      
      switch (selectedSession.Device.device_type) {
        case 'PS5':
          rate = 20000;
          break;
        case 'PS4':
          rate = 15000;
          break;
        case 'PS3':
          rate = 10000;
          break;
        default:
          rate = 15000;
      }
      
      setHourlyRate(rate);
      
      // Calculate new end time
      calculateNewEndTime(additionalHours);
    }
  }, [selectedSession]);
  
  // Update new end time when additional hours change
  useEffect(() => {
    if (selectedSession) {
      calculateNewEndTime(additionalHours);
    }
  }, [additionalHours]);
  
  // Function to calculate new end time
  const calculateNewEndTime = (hours) => {
    if (!selectedSession) return;
    
    // Get current end time
    const currentEndTime = new Date(selectedSession.end_time);
    
    // Calculate new end time
    const newEnd = new Date(currentEndTime.getTime() + (hours * 60 * 60 * 1000));
    setNewEndTime(newEnd);
  };

  const handleSubmit = async () => {
    if (!selectedSession) {
      toast.error('Silakan pilih sesi yang akan diperpanjang');
      return;
    }

    if (!currentShift) {
      toast.error('Anda harus memulai shift terlebih dahulu');
      return;
    }

    try {
      setLoading(true);
      
      const response = await api.post(`/rentals/${selectedSession.session_id}/extend`, {
        additional_hours: additionalHours,
        payment_method: paymentMethod,
        shift_id: currentShift.shift_id
      });
      
      toast.success('Waktu bermain berhasil diperpanjang');
      
      if (onSuccess) {
        onSuccess(response.data.session);
      }
      
      onClose();
    } catch (error) {
      console.error('Error extending rental:', error);
      toast.error(error.response?.data?.message || 'Gagal memperpanjang waktu bermain');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Tambah Jam Bermain</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        {activeSessions && activeSessions.length > 0 ? (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Pilih PlayStation</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {activeSessions.map((session) => (
                  <div
                    key={session.session_id}
                    onClick={() => setSelectedSession(session)}
                    className={`bg-gray-700 rounded-lg p-3 cursor-pointer ${
                      selectedSession?.session_id === session.session_id
                        ? 'border-2 border-blue-500'
                        : 'border border-gray-600'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{session.Device?.device_name}</h4>
                        <div className="text-sm text-gray-400">{session.Device?.device_type}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400">Sisa Waktu:</div>
                        <div className={session.remaining.is_overdue ? 'text-red-500' : 'text-green-500'}>
                          {session.remaining.is_overdue 
                            ? 'Waktu Habis' 
                            : `${session.remaining.hours}j ${session.remaining.minutes}m`}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="text-gray-400">Pelanggan:</span>{' '}
                      <span>{session.User ? session.User.name : 'Pelanggan Umum'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {selectedSession && (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Detail Perpanjangan</h3>
                  <div className="bg-gray-700 rounded-lg p-4">
                    {/* Informasi sesi saat ini */}
                    <div className="bg-gray-800 rounded-lg p-3 mb-4">
                      <div className="flex items-center mb-2">
                        <Monitor size={16} className="mr-2 text-blue-500" />
                        <span className="font-medium">{selectedSession.Device.device_name}</span>
                      </div>
                      <div className="text-sm flex items-center mb-1">
                        <User size={14} className="mr-2 text-gray-400" />
                        <span>{selectedSession.User ? selectedSession.User.name : 'Pelanggan Umum'}</span>
                      </div>
                      <div className="text-sm flex items-center">
                        <Clock size={14} className="mr-2 text-gray-400" />
                        <span>
                          Waktu Selesai: {new Date(selectedSession.end_time).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    
                    {/* Selector tambahan waktu */}
                    <div className="flex items-center justify-between mb-4">
                      <span>Tambahan Waktu:</span>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setAdditionalHours(Math.max(1, additionalHours - 1))}
                          className="p-1 bg-gray-600 hover:bg-gray-500 rounded-lg"
                          disabled={additionalHours <= 1}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="text-xl font-bold">{additionalHours} Jam</span>
                        <button
                          onClick={() => setAdditionalHours(Math.min(12, additionalHours + 1))}
                          className="p-1 bg-gray-600 hover:bg-gray-500 rounded-lg"
                          disabled={additionalHours >= 12}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Informasi waktu baru setelah perpanjangan */}
                    {newEndTime && (
                      <div className="bg-blue-900 bg-opacity-20 rounded-lg p-3 mb-4 border border-blue-800">
                        <div className="flex items-center mb-2">
                          <Clock size={16} className="mr-2 text-blue-500" />
                          <span className="font-medium">Waktu Selesai Baru</span>
                        </div>
                        <div className="text-xl font-bold text-center text-blue-400">
                          {newEndTime.toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="text-xs text-gray-400 text-center mt-1">
                          {newEndTime.toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Info biaya */}
                    <div className="flex justify-between border-t border-gray-600 pt-3 mt-3">
                      <span>Tarif per jam:</span>
                      <span>Rp{hourlyRate.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between font-bold text-lg mt-2">
                      <span>Total:</span>
                      <span>Rp{(hourlyRate * additionalHours).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Metode Pembayaran</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {PaymentMethods.map(method => (
                      <button
                        key={method.id}
                        className={`bg-gray-700 hover:bg-gray-600 p-3 rounded-lg ${
                          paymentMethod === method.id ? 'border-2 border-blue-500' : 'border border-gray-600'
                        }`}
                        onClick={() => setPaymentMethod(method.id)}
                      >
                        {method.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button 
                    className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Batal
                  </button>
                  <button 
                    className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center ${
                      loading ? 'bg-green-800' : 'bg-green-600 hover:bg-green-700'
                    }`}
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Memproses...
                      </>
                    ) : (
                      <>
                        <CreditCard size={18} className="mr-2" />
                        Perpanjang Waktu
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="bg-gray-700 rounded-lg p-6 text-center">
            <Clock size={48} className="mx-auto mb-3 text-gray-500" />
            <p className="text-gray-400">Tidak ada sesi aktif yang dapat diperpanjang</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExtendRentalModal;