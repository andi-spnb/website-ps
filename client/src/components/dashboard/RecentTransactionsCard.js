import React, { useState, useEffect } from 'react';
import { FileText, CreditCard, Coffee, Monitor, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const RecentTransactionsCard = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = async () => {
    try {
      setRefreshing(true);
      const response = await api.get('/reports/recent-transactions?limit=5');
      setTransactions(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Gagal memuat data transaksi. Silakan coba lagi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
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

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <FileText className="mr-2" size={20} />
          Transaksi Terbaru
        </h3>
        <button 
          onClick={fetchTransactions} 
          disabled={refreshing}
          className="p-1 rounded-full hover:bg-gray-700"
          title="Refresh"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900 bg-opacity-50 border border-red-800 rounded-lg text-sm text-red-200">
          {error}
          <button 
            onClick={fetchTransactions}
            className="ml-2 underline"
          >
            Coba lagi
          </button>
        </div>
      )}
      
      {transactions.length === 0 && !error ? (
        <div className="text-center py-4 text-gray-400">
          <FileText size={36} className="mx-auto mb-3 opacity-30" />
          <p>Belum ada transaksi</p>
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
                      ? `${transaction.reference?.device_name || 'PlayStation'} (${transaction.reference?.device_type || 'Device'})` 
                      : transaction.type === 'Food'
                        ? (transaction.reference?.items?.join(', ') || 'Food & Beverage')
                        : 'Transaksi Lainnya'
                    }
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(transaction.transaction_time).toLocaleString()} - {transaction.payment_method}
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
      
      <Link to="/reports" className="block w-full mt-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-center">
        Lihat Semua Transaksi
      </Link>
    </div>
  );
};

export default RecentTransactionsCard;