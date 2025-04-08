// File: client/src/components/pos/Cart.js
import React, { useState } from 'react';
import { ShoppingCart, User, Trash, Plus, Minus, X, CreditCard, Wallet } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useShift } from '../../contexts/ShiftContext';
import api from '../../services/api';
import { toast } from 'react-toastify';
import MemberSelectionModal from './MemberSelectionModal';

const PaymentMethods = [
  { id: 'cash', name: 'Tunai', icon: <Wallet size={16} /> },
  { id: 'qris', name: 'QRIS', icon: <CreditCard size={16} /> },
  { id: 'ovo', name: 'OVO', icon: <CreditCard size={16} /> },
  { id: 'dana', name: 'DANA', icon: <CreditCard size={16} /> }
];

const Cart = () => {
  const { 
    rentalItem, 
    foodItems, 
    member, 
    removeRental, 
    updateFoodItemQuantity,
    removeFoodItem,
    clearCart,
    calculateTotal,
    setOrderMember
  } = useCart();
  const { currentShift } = useShift();
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(PaymentMethods[0].id);
  const [cashReceived, setCashReceived] = useState('');
  const [processing, setProcessing] = useState(false);
  
  const subtotal = calculateTotal();
  // Menghilangkan PPN
  const total = subtotal; // Tidak ada penambahan tax

  const handleCheckout = async () => {
    if (!currentShift) {
      toast.error('Anda harus memulai shift terlebih dahulu');
      return;
    }
    
    if (foodItems.length === 0 && !rentalItem) {
      toast.error('Keranjang kosong');
      return;
    }
    
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    try {
      setProcessing(true);
      
      // Check cash amount if payment method is cash
      if (selectedPayment === 'cash') {
        const cashAmount = parseFloat(cashReceived.replace(/[^\d]/g, ''));
        if (isNaN(cashAmount) || cashAmount < total) {
          toast.error('Jumlah uang tidak cukup');
          setProcessing(false);
          return;
        }
      }
      
      // Process rental if exists
      if (rentalItem) {
        await api.post('/rentals/start', {
          device_id: rentalItem.device_id,
          user_id: member?.user_id || null,
          duration_hours: rentalItem.duration,
          payment_method: selectedPayment,
          shift_id: currentShift.shift_id
        });
      }
      
      // Process food items if exists
      if (foodItems.length > 0) {
        await api.post('/food/orders', {
          session_id: null, // We're not associating with a rental session
          items: foodItems.map(item => ({
            item_id: item.item_id,
            quantity: item.quantity
          })),
          payment_method: selectedPayment,
          shift_id: currentShift.shift_id
        });
      }
      
      toast.success('Pembayaran berhasil');
      clearCart();
      setShowPaymentModal(false);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Gagal memproses pembayaran');
    } finally {
      setProcessing(false);
    }
  };

  // Fungsi untuk menghapus member dari keranjang
  const handleRemoveMember = () => {
    setOrderMember(null);
    toast.info('Member telah dihapus dari transaksi');
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold flex items-center">
          <ShoppingCart className="mr-2" size={20} />
          Keranjang
        </h3>
      </div>
      
      <div className="p-4 border-b border-gray-700">
        <div className="bg-gray-700 rounded-lg p-3 flex items-center">
          <User className="mr-3 text-gray-400" size={18} />
          <div className="flex-1">
            <p className="text-sm text-gray-400">Pelanggan</p>
            {member ? (
              <div className="flex items-center">
                <p className="font-medium">{member.name}</p>
                <span className="ml-2 text-xs text-yellow-400">{member.reward_points} poin</span>
                <button 
                  onClick={handleRemoveMember} 
                  className="ml-2 text-red-400 hover:text-red-300"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <p>Pelanggan Umum</p>
            )}
          </div>
          <button 
            className="bg-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-700"
            onClick={() => setShowMemberModal(true)}
          >
            {member ? 'Ganti Member' : 'Pilih Member'}
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-auto">
        {rentalItem || foodItems.length > 0 ? (
          <div className="space-y-3">
            {/* Rental item */}
            {rentalItem && (
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{rentalItem.device_name}</h4>
                    <p className="text-sm text-gray-400">{rentalItem.device_type}</p>
                  </div>
                  <button
                    onClick={removeRental}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="text-sm">
                    <span className="text-gray-400">Durasi:</span> {rentalItem.duration} jam
                  </div>
                  <div className="font-semibold">
                    Rp{rentalItem.price.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
            
            {/* Food items */}
            {foodItems.map(item => (
              <div key={item.item_id} className="bg-gray-700 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-400">{item.category}</p>
                  </div>
                  <button
                    onClick={() => removeFoodItem(item.item_id)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateFoodItemQuantity(item.item_id, item.quantity - 1)}
                      className="p-1 bg-gray-600 hover:bg-gray-500 rounded"
                    >
                      <Minus size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateFoodItemQuantity(item.item_id, item.quantity + 1)}
                      className="p-1 bg-gray-600 hover:bg-gray-500 rounded"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="font-semibold">
                    Rp{item.subtotal.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <ShoppingCart size={48} className="mb-2" />
            <p>Keranjang kosong</p>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-700">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-400">Subtotal</span>
            <span>Rp{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold border-t border-gray-700 pt-2">
            <span>Total</span>
            <span>Rp{total.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <button
            onClick={() => clearCart()}
            className="w-full py-2 bg-red-900 hover:bg-red-800 rounded-lg text-sm flex justify-center items-center"
            disabled={foodItems.length === 0 && !rentalItem}
          >
            <Trash size={16} className="mr-2" />
            Kosongkan Keranjang
          </button>
          <button
            onClick={handleCheckout}
            className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium flex justify-center items-center"
            disabled={foodItems.length === 0 && !rentalItem}
          >
            <CreditCard size={18} className="mr-2" />
            Proses Pembayaran
          </button>
        </div>
      </div>
      
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Pembayaran</h2>
              <button onClick={() => setShowPaymentModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="mb-6">
              <h3 className="text-gray-400 mb-2">Pilih Metode Pembayaran</h3>
              <div className="grid grid-cols-2 gap-3">
                {PaymentMethods.map(method => (
                  <button
                    key={method.id}
                    className={`bg-gray-700 hover:bg-gray-600 p-3 rounded-lg flex items-center ${
                      selectedPayment === method.id ? 'border-2 border-blue-500' : ''
                    }`}
                    onClick={() => setSelectedPayment(method.id)}
                  >
                    <span className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      {method.icon}
                    </span>
                    {method.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="border-t border-gray-700 pt-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Total Pembayaran</span>
                <span className="text-xl font-bold">Rp{total.toLocaleString()}</span>
              </div>
              
              {selectedPayment === 'cash' && (
                <div className="mb-4">
                  <label className="block text-gray-400 mb-1">Jumlah Diterima</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                    placeholder="0"
                    value={cashReceived}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d]/g, '');
                      setCashReceived(value ? `Rp${parseInt(value).toLocaleString()}` : '');
                    }}
                  />
                </div>
              )}
              
              {selectedPayment === 'cash' && cashReceived && (
                <div className="flex justify-between text-lg">
                  <span className="text-gray-400">Kembalian</span>
                  <span>
                    {(() => {
                      const cash = parseInt(cashReceived.replace(/[^\d]/g, '')) || 0;
                      const change = cash - total;
                      return change > 0 ? `Rp${change.toLocaleString()}` : 'Rp0';
                    })()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button 
                className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg"
                onClick={() => setShowPaymentModal(false)}
                disabled={processing}
              >
                Batal
              </button>
              <button 
                className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center ${
                  processing 
                    ? 'bg-green-800 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
                onClick={handlePayment}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    <CreditCard size={18} className="mr-2" />
                    Selesaikan Pembayaran
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Selection Modal */}
      {showMemberModal && (
        <MemberSelectionModal
          isOpen={showMemberModal}
          onClose={() => setShowMemberModal(false)}
          onSelectMember={setOrderMember}
        />
      )}
    </div>
  );
};

export default Cart;