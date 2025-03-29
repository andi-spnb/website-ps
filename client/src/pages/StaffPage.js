import React from 'react';
import StaffManagement from '../components/staff/StaffManagement';

const StaffPage = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manajemen Karyawan</h1>
        <p className="text-gray-400">
          Kelola data karyawan Kenzie Gaming.
        </p>
      </div>
      
      <StaffManagement />
    </div>
  );
};

export default StaffPage;