import React, { useState } from 'react';
import { 
  BarChart, Activity, Users, Coffee, User, Layout, 
  Monitor, Package, AlertTriangle, Download, Calendar 
} from 'lucide-react';

// Impor komponen laporan yang telah dibuat
import SalesReport from '../components/reports/SalesReport';
import RentalUsageReport from '../components/reports/RentalUsageReport';
import PlayStationReport from '../components/reports/PlayStationReport';
import PlayboxReport from '../components/reports/PlayboxReport';
import FoodBeverageReport from '../components/reports/FoodBeverageReport';
import StockAlertSystem from '../components/alerts/StockAlertSystem';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Fungsi untuk mengelola perubahan tanggal
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fungsi untuk mengekspor semua laporan
  const handleExportAllReports = () => {
    // Logika untuk mengekspor semua laporan dalam satu file
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Laporan</h1>
        <p className="text-gray-400">
          Lihat laporan komprehensif untuk semua aspek operasional Kenzie Gaming.
        </p>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex flex-col">
            <label className="text-gray-400 text-sm mb-1">Tanggal Mulai</label>
            <div className="relative">
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className="bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4"
              />
              <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-gray-400 text-sm mb-1">Tanggal Akhir</label>
            <div className="relative">
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                className="bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4"
              />
              <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>
        </div>
        
        <button
          onClick={handleExportAllReports}
          className="flex items-center bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg"
        >
          <Download size={16} className="mr-1" />
          Ekspor Semua Laporan
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <div className="flex border-b border-gray-700 mb-6 whitespace-nowrap">
          <button 
            className={`px-4 py-2 font-medium flex items-center ${activeTab === 'sales' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('sales')}
          >
            <BarChart size={16} className="mr-2" />
            Penjualan
          </button>
          <button 
            className={`px-4 py-2 font-medium flex items-center ${activeTab === 'playstation' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('playstation')}
          >
            <Monitor size={16} className="mr-2" />
            PlayStation
          </button>
          <button 
            className={`px-4 py-2 font-medium flex items-center ${activeTab === 'usage' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('usage')}
          >
            <Activity size={16} className="mr-2" />
            Penggunaan PlayStation
          </button>
          <button 
            className={`px-4 py-2 font-medium flex items-center ${activeTab === 'playbox' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('playbox')}
          >
            <Package size={16} className="mr-2" />
            Playbox
          </button>
          <button 
            className={`px-4 py-2 font-medium flex items-center ${activeTab === 'food' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('food')}
          >
            <Coffee size={16} className="mr-2" />
            Makanan & Minuman
          </button>
          <button 
            className={`px-4 py-2 font-medium flex items-center ${activeTab === 'stockalerts' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('stockalerts')}
          >
            <AlertTriangle size={16} className="mr-2" />
            Peringatan Stok
          </button>
          <button 
            className={`px-4 py-2 font-medium flex items-center ${activeTab === 'members' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('members')}
          >
            <User size={16} className="mr-2" />
            Member
          </button>
          <button 
            className={`px-4 py-2 font-medium flex items-center ${activeTab === 'staff' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('staff')}
          >
            <Users size={16} className="mr-2" />
            Karyawan
          </button>
          <button 
            className={`px-4 py-2 font-medium flex items-center ${activeTab === 'dashboard' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Layout size={16} className="mr-2" />
            Dashboard
          </button>
        </div>
      </div>
      
      {/* Komponen Laporan berdasarkan tab aktif */}
      {activeTab === 'sales' && <SalesReport dateRange={dateRange} />}
      {activeTab === 'usage' && <RentalUsageReport dateRange={dateRange} />}
      {activeTab === 'playstation' && <PlayStationReport dateRange={dateRange} />}
      {activeTab === 'playbox' && <PlayboxReport dateRange={dateRange} />}
      {activeTab === 'food' && <FoodBeverageReport dateRange={dateRange} />}
      {activeTab === 'stockalerts' && <StockAlertSystem />}
      {activeTab === 'members' && <MembersReport dateRange={dateRange} />}
      {activeTab === 'staff' && <StaffPerformanceReport dateRange={dateRange} />}
      {activeTab === 'dashboard' && <AnalyticsDashboard dateRange={dateRange} />}
    </div>
  );
};

// Placeholder untuk komponen yang belum diimplementasikan
const MembersReport = ({ dateRange }) => (
  <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
    <h2 className="text-xl font-semibold mb-6">Laporan Member</h2>
    <p className="text-gray-400">Laporan analisis member akan ditampilkan di sini.</p>
    <div className="bg-blue-900 bg-opacity-20 p-4 rounded-lg border border-blue-800 mt-4">
      <p className="text-blue-400">
        Fitur sedang dalam pengembangan. Akan segera tersedia pada pembaruan berikutnya.
      </p>
    </div>
  </div>
);

const StaffPerformanceReport = ({ dateRange }) => (
  <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
    <h2 className="text-xl font-semibold mb-6">Laporan Performa Karyawan</h2>
    <p className="text-gray-400">Laporan performa karyawan akan ditampilkan di sini.</p>
    <div className="bg-blue-900 bg-opacity-20 p-4 rounded-lg border border-blue-800 mt-4">
      <p className="text-blue-400">
        Fitur sedang dalam pengembangan. Akan segera tersedia pada pembaruan berikutnya.
      </p>
    </div>
  </div>
);

const AnalyticsDashboard = ({ dateRange }) => (
  <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
    <h2 className="text-xl font-semibold mb-6">Dashboard Analitik</h2>
    <p className="text-gray-400">Dashboard analitik kinerja bisnis akan ditampilkan di sini.</p>
    <div className="bg-blue-900 bg-opacity-20 p-4 rounded-lg border border-blue-800 mt-4">
      <p className="text-blue-400">
        Fitur sedang dalam pengembangan. Akan segera tersedia pada pembaruan berikutnya.
      </p>
    </div>
    
    {/* Placeholder untuk dashboard future */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <div className="bg-gray-700 p-4 rounded-lg h-24"></div>
      <div className="bg-gray-700 p-4 rounded-lg h-24"></div>
      <div className="bg-gray-700 p-4 rounded-lg h-24"></div>
      <div className="bg-gray-700 p-4 rounded-lg h-48 md:col-span-2"></div>
      <div className="bg-gray-700 p-4 rounded-lg h-48"></div>
      <div className="bg-gray-700 p-4 rounded-lg h-48"></div>
      <div className="bg-gray-700 p-4 rounded-lg h-48 md:col-span-2"></div>
    </div>
  </div>
);

export default ReportsPage;