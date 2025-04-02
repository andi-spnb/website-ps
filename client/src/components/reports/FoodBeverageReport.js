import React from 'react';

const FoodBeverageReport = ({ dateRange }) => {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <h2 className="text-xl font-semibold mb-6">Laporan Makanan & Minuman</h2>
      <p className="text-gray-400">Komponen laporan makanan dan minuman akan ditampilkan di sini.</p>
      <div className="bg-blue-900 bg-opacity-20 p-4 rounded-lg border border-blue-800 mt-4">
        <p className="text-blue-400">
          Fitur sedang dalam pengembangan. Akan segera tersedia pada pembaruan berikutnya.
        </p>
      </div>
    </div>
  );
};

export default FoodBeverageReport;