import React from 'react';
import PricingManagement from '../components/pricing/PricingManagement';

const PricingPage = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manajemen Harga</h1>
        <p className="text-gray-400">
          Kelola semua harga layanan PlayStation dan paket Playbox di Kenzie Gaming.
        </p>
      </div>
      
      <PricingManagement />
    </div>
  );
};

export default PricingPage;