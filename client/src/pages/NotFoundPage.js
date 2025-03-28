import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="w-20 h-20 bg-red-900 bg-opacity-20 rounded-full flex items-center justify-center">
            <AlertCircle size={48} className="text-red-500" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Halaman yang Anda cari tidak dapat ditemukan. Mungkin halaman tersebut telah dipindahkan atau dihapus.
        </p>
        <Link 
          to="/"
          className="inline-flex items-center bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white"
        >
          <Home size={16} className="mr-2" />
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;