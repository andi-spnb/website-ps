import React from 'react';
import { useReactToPrint } from 'react-to-print';

const ReceiptTemplate = ({ receiptData, onPrint }) => {
  const receiptRef = React.useRef();

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    onAfterPrint: () => {
      if (onPrint) onPrint();
    }
  });

  if (!receiptData) {
    return null;
  }

  const { 
    receipt_id, 
    date, 
    staffName,
    rental,
    foodItems = [],
    payment
  } = receiptData;

  const formatCurrency = (amount) => {
    return `Rp${amount.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="hidden">
        <div ref={receiptRef} className="p-4 bg-white text-black" style={{ width: '80mm', fontFamily: 'monospace' }}>
          <div className="text-center mb-4">
            <div className="text-xl font-bold">KENZIE GAMING</div>
            <div className="text-sm">Jl. Contoh No. 123, Kota</div>
            <div className="text-sm">Telp: 0812-3456-7890</div>
          </div>
          
          <div className="border-t border-b border-gray-300 py-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>No. Struk:</span>
              <span>{receipt_id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tanggal:</span>
              <span>{formatDate(date)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Waktu:</span>
              <span>{formatTime(date)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Kasir:</span>
              <span>{staffName}</span>
            </div>
          </div>
          
          {rental && (
            <div className="mb-4">
              <div className="text-center font-bold border-b border-gray-300 pb-1 mb-2">RENTAL PLAYSTATION</div>
              <div className="flex justify-between">
                <div>{rental.deviceName} ({rental.deviceType})</div>
                <div>{formatCurrency(rental.price)}</div>
              </div>
              <div className="text-sm">
                <div>Durasi: {rental.duration} jam</div>
                <div>Mulai: {formatTime(rental.startTime)}</div>
                <div>Selesai: {formatTime(rental.endTime)}</div>
              </div>
            </div>
          )}
          
          {foodItems.length > 0 && (
            <div className="mb-4">
              <div className="text-center font-bold border-b border-gray-300 pb-1 mb-2">MAKANAN & MINUMAN</div>
              {foodItems.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <div>
                    {item.name} x{item.quantity}
                  </div>
                  <div>{formatCurrency(item.subtotal)}</div>
                </div>
              ))}
            </div>
          )}
          
          <div className="border-t border-gray-300 pt-2 mb-4">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(payment.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>PPN (11%):</span>
              <span>{formatCurrency(payment.tax)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>TOTAL:</span>
              <span>{formatCurrency(payment.total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tunai:</span>
              <span>{formatCurrency(payment.cash)}</span>
            </div>
            <div className="flex justify-between">
              <span>Kembalian:</span>
              <span>{formatCurrency(payment.change)}</span>
            </div>
          </div>
          
          <div className="text-center text-sm mt-4">
            <p>Terima kasih telah bermain di Kenzie Gaming!</p>
            <p>Ikuti kami di @kenziegaming</p>
          </div>
        </div>
      </div>
      
      <button 
        onClick={handlePrint}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center"
      >
        Cetak Struk
      </button>
    </>
  );
};

export default ReceiptTemplate;