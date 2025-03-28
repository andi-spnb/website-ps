import React from 'react';
import DevicesList from '../components/devices/DevicesList';

const DevicesPage = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">PlayStation</h1>
        <p className="text-gray-400">
          Kelola perangkat PlayStation yang tersedia di Kenzie Gaming.
        </p>
      </div>
      
      <DevicesList />
    </div>
  );
};

export default DevicesPage;