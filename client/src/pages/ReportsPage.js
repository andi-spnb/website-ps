import React, { useState } from 'react';
import { FileText, BarChart, Activity } from 'lucide-react';
import SalesReport from '../components/reports/SalesReport';
import RentalUsageReport from '../components/reports/RentalUsageReport';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('sales');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Laporan</h1>
        <p className="text-gray-400">
          Lihat laporan penjualan dan penggunaan PlayStation di Kenzie Gaming.
        </p>
      </div>
      
      <div className="flex border-b border-gray-700 mb-6">
        <button 
          className={`px-4 py-2 font-medium flex items-center ${activeTab === 'sales' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
          onClick={() => setActiveTab('sales')}
        >
          <BarChart size={16} className="mr-2" />
          Penjualan
        </button>
        <button 
          className={`px-4 py-2 font-medium flex items-center ${activeTab === 'usage' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
          onClick={() => setActiveTab('usage')}
        >
          <Activity size={16} className="mr-2" />
          Penggunaan PlayStation
        </button>
      </div>
      
      {activeTab === 'sales' && <SalesReport />}
      {activeTab === 'usage' && <RentalUsageReport />}
    </div>
  );
};

export default ReportsPage;