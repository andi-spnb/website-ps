import React, { useState, useEffect } from 'react';
import { Clock, DollarSign, User, Check, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useShift } from '../../contexts/ShiftContext';
import api from '../../services/api';
import { toast } from 'react-toastify';

const ShiftManager = () => {
  const { currentUser } = useAuth();
  const { currentShift, loading: shiftLoading, startShift, endShift } = useShift();
  const [openingBalance, setOpeningBalance] = useState('');
  const [closingBalance, setClosingBalance] = useState('');
  const [notes, setNotes] = useState('');
  const [shiftHistory, setShiftHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showEndShiftModal, setShowEndShiftModal] = useState(false);
  const [processingStart, setProcessingStart] = useState(false);
  const [processingEnd, setProcessingEnd] = useState(false);

  const fetchShiftHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await api.get('/shifts/history?limit=5');
      setShiftHistory(response.data);
    } catch (err) {
      console.error('Error fetching shift history:', err);
      
      // Mock data for demo
      setShiftHistory([
        {
          shift_id: 1,
          staff: { name: 'Budi', role: 'Cashier' },
          start_time: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          end_time: new Date(Date.now() - 60000000).toISOString(),
          opening_balance: 500000,
          closing_balance: 1250000,
          total_sales: 750000,
          status: 'Closed'
        },
        {
          shift_id: 2,
          staff: { name: 'Siti', role: 'Cashier' },
          start_time: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          end_time: new Date(Date.now() - 146400000).toISOString(),
          opening_balance: 500000,
          closing_balance: 1100000,
          total_sales: 600000,
          status: 'Closed'
        }
      ]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchShiftHistory();
  }, [currentShift]);

  const handleStartShift = async (e) => {
    e.preventDefault();
    
    if (!openingBalance || parseFloat(openingBalance) <= 0) {
      toast.error('Saldo awal harus diisi dengan nilai lebih dari 0');
      return;
    }
    
    try {
      setProcessingStart(true);
      await startShift(parseFloat(openingBalance));
      toast.success('Shift berhasil dimulai');
      setOpeningBalance('');
    } catch (err) {
      console.error('Error starting shift:', err);
      toast.error(err.response?.data?.message || 'Gagal memulai shift');
    } finally {
      setProcessingStart(false);
    }
  };

  const handleEndShift = async (e) => {
    e.preventDefault();
    
    if (!closingBalance || parseFloat(closingBalance) <= 0) {
      toast.error('Saldo akhir harus diisi dengan nilai lebih dari 0');
      return;
    }
    
    try {
      setProcessingEnd(true);
      await endShift(parseFloat(closingBalance), notes);
      toast.success('Shift berhasil diakhiri');
      setClosingBalance('');
      setNotes('');
      setShowEndShiftModal(false);
    } catch (err) {
      console.error('Error ending shift:', err);
      toast.error(err.response?.data?.message || 'Gagal mengakhiri shift');
    } finally {
      setProcessingEnd(false);
    }
  };

  const formatCurrency = (amount) => {
    return `Rp${amount.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (shiftLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-48 bg-gray-700 rounded mb-6"></div>
        <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Current Shift Status */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8">
        {currentShift ? (
          <>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold flex items-center">
                  <Clock size={20} className="mr-2 text-green-500" />
                  Shift Aktif
                </h2>
                <p className="text-gray-400 mt-1">
                  Dimulai pada {formatDate(currentShift.start_time)} pukul {formatTime(currentShift.start_time)}
                </p>
              </div>
              <button
                onClick={() => setShowEndShiftModal(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm flex items-center"
              >
                <X size={16} className="mr-1" />
                Akhiri Shift
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Karyawan</div>
                <div className="flex items-center">
                  <User size={16} className="mr-2 text-blue-500" />
                  <span className="font-medium">{currentUser?.name}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {currentUser?.role}
                </div>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Saldo Awal</div>
                <div className="flex items-center">
                  <DollarSign size={16} className="mr-2 text-yellow-500" />
                  <span className="font-medium">{formatCurrency(currentShift.opening_balance)}</span>
                </div>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Durasi Shift</div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-2 text-purple-500" />
                  <span className="font-medium">
                    {(() => {
                      const start = new Date(currentShift.start_time);
                      const now = new Date();
                      const diffMs = now - start;
                      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                      return `${diffHrs} jam ${diffMins} menit`;
                    })()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-center text-sm text-gray-400">
              Jangan lupa untuk mengakhiri shift Anda sebelum pulang
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-900 bg-opacity-30 rounded-full mb-3">
                <Clock size={32} className="text-blue-500" />
              </div>
              <h2 className="text-xl font-semibold">Belum Ada Shift Aktif</h2>
              <p className="text-gray-400 mt-1">
                Mulai shift baru untuk menggunakan sistem Kenzie Gaming
              </p>
            </div>
            
            <form onSubmit={handleStartShift} className="bg-gray-700 rounded-lg p-4">
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Saldo Awal Kas (Rp)</label>
                <input
                  type="number"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded p-2"
                  placeholder="Contoh: 500000"
                  min="0"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={processingStart}
                className={`w-full py-2 rounded-lg font-medium flex items-center justify-center ${
                  processingStart
                    ? "bg-green-800 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {processingStart ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    <Check size={16} className="mr-1" />
                    Mulai Shift
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
      
      {/* Shift History */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Riwayat Shift</h3>
        
        {loadingHistory ? (
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        ) : shiftHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-400 bg-gray-800 rounded-lg border border-gray-700">
            <Clock size={48} className="mx-auto mb-3 opacity-30" />
            <p>Belum ada riwayat shift</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left">Karyawan</th>
                  <th className="py-3 px-4 text-left">Tanggal</th>
                  <th className="py-3 px-4 text-left">Waktu</th>
                  <th className="py-3 px-4 text-right">Saldo Awal</th>
                  <th className="py-3 px-4 text-right">Penjualan</th>
                  <th className="py-3 px-4 text-right">Saldo Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {shiftHistory.map(shift => (
                  <tr key={shift.shift_id} className="hover:bg-gray-750">
                    <td className="py-3 px-4 font-medium">{shift.staff.name}</td>
                    <td className="py-3 px-4">{formatDate(shift.start_time)}</td>
                    <td className="py-3 px-4">
                      {formatTime(shift.start_time)} - {shift.end_time ? formatTime(shift.end_time) : 'Aktif'}
                    </td>
                    <td className="py-3 px-4 text-right">{formatCurrency(shift.opening_balance)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(shift.total_sales || 0)}</td>
                    <td className="py-3 px-4 text-right">
                      {shift.closing_balance ? formatCurrency(shift.closing_balance) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* End Shift Modal */}
      {showEndShiftModal && currentShift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Akhiri Shift</h2>
              <button onClick={() => setShowEndShiftModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleEndShift}>
              <div className="mb-4">
                <div className="bg-gray-700 rounded-lg p-3 mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Saldo Awal:</span>
                    <span>{formatCurrency(currentShift.opening_balance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Penjualan (sistem):</span>
                    <span>{formatCurrency(currentShift.total_sales || 0)}</span>
                  </div>
                </div>
                
                <label className="block text-gray-400 mb-2">Saldo Akhir Kas (Rp)</label>
                <input
                  type="number"
                  value={closingBalance}
                  onChange={(e) => setClosingBalance(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="Contoh: 1500000"
                  min={currentShift.opening_balance}
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  *Hitung semua uang di kas sebelum mengakhiri shift
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-400 mb-2">Catatan (Opsional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 h-24"
                  placeholder="Masukkan catatan tambahan jika ada"
                ></textarea>
              </div>
              
              <div className="flex space-x-3">
                <button 
                  type="button"
                  className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg"
                  onClick={() => setShowEndShiftModal(false)}
                  disabled={processingEnd}
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={processingEnd}
                  className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center ${
                    processingEnd
                      ? "bg-red-800 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {processingEnd ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <X size={16} className="mr-1" />
                      Akhiri Shift
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftManager;