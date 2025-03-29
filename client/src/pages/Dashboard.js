import React from 'react';

const Dashboard = () => {
  // Ambil user dari localStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-400">
          Selamat datang, {currentUser?.name || 'Admin'}. Berikut adalah ringkasan operasional Kenzie Gaming.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">PlayStation Aktif</h3>
          <div className="text-3xl font-bold">0</div>
          <p className="text-gray-400 mt-2">Tidak ada sesi aktif</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Penjualan Hari Ini</h3>
          <div className="text-3xl font-bold">Rp0</div>
          <p className="text-gray-400 mt-2">Belum ada transaksi</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Status PlayStation</h3>
          <div className="text-3xl font-bold">0 / 0</div>
          <p className="text-gray-400 mt-2">Tersedia / Total</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;