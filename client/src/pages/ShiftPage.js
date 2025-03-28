import React from 'react';
import ShiftManager from '../components/shift/ShiftManager';

const ShiftPage = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Shift</h1>
        <p className="text-gray-400">
          Kelola shift karyawan dan pergantian kasir di Kenzie Gaming.
        </p>
      </div>
      
      <ShiftManager />
    </div>
  );
};

export default ShiftPage;