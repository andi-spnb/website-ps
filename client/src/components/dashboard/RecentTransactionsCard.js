import React, { useState, useEffect } from 'react';
import { FileText, CreditCard, Coffee, Monitor } from 'lucide-react';
import api from '../../services/api';

const RecentTransactionsCard = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await api.get('/reports/recent-transactions?limit=5');
        setTransactions(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        
        // For demo purposes, we'll set mock data
        setTransactions([
          {
            transaction_id: 1,
            type: 'Rental',
            amount: 30000,
            payment_method: 'Cash',
            transaction_time: new Date().toISOString(),
            reference: { device_name: 'PS-05', device_type: 'PS4' }
          },
          {
            transaction_id: 2,
            type: 'Food',
            amount: 25000,
            payment_method: 'QRIS',
            transaction_time: new Date(Date.now() - 30*60000).toISOString(),
            reference: { items: ['Mie Goreng', 'Coca Cola'] }
          },
          {
            transaction_id: 3,
            type: 'Rental',
            amount: 40000,
            payment_method: 'Cash',
            transaction_time: new Date(Date.now() - 60*60000).toISOString(),
            reference: { device_name: 'PS-02', device_type: 'PS5' }
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const formatCurrency = (amount) => {
    return `Rp${amount.toLocaleString('id-ID')}`;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Rental':
        return <Monitor size={16} className="text-blue-500" />;
      case 'Food':
        return <Coffee size={16} className="text-green-500" />;
      default:
        return <CreditCard size={16} className="text-purple-500" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 shadow border border-gray-700 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          <div className="h-12 bg-gray-700 rounded"></div>
          <div className="h-12 bg-gray-700 rounded"></div>
          <div className="h-12 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 shadow border border-gray-700">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow border border-gray-700">
      <h3 className="text-lg font-semibold flex items-center mb-4">
        <FileText className="mr-2" size={20} />
        Transaksi Terbaru
      </h3>
      
      {transactions.length === 0 ? (
        <div className="text-center py-4 text-gray-400">
          Belum ada transaksi
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map(transaction => (
            <div key={transaction.transaction_id} className="bg-gray-700 rounded-lg p-3 flex justify-between items-center">
              <div className="flex items-center">
                <div className="mr-3 p-2 bg-gray-800 rounded-full">
                  {getTypeIcon(transaction.type)}
                </div>
                <div>
                  <div className="font-medium">
                    {transaction.type === 'Rental' 
                      ? `${transaction.reference.device_name} (${transaction.reference.device_type})` 
                      : transaction.type === 'Food'
                        ? transaction.reference.items.join(', ')
                        : 'Transaksi Lainnya'
                    }
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(transaction.transaction_time).toLocaleTimeString()} - {transaction.payment_method}
                  </div>
                </div>
              </div>
              <div className="text-right font-semibold">
                {formatCurrency(transaction.amount)}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <button className="w-full mt-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">
        Lihat Semua Transaksi
      </button>
    </div>
  );
};

export default RecentTransactionsCard;