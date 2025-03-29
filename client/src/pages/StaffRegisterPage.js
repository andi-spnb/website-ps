import React, { useState } from 'react';
import { UserPlus, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const StaffRegisterPage = () => {
  const { currentUser } = useAuth() || {};
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'Cashier'
  });
  
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi data
    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }
    
    try {
      setProcessing(true);
      setError(null);
      
      const response = await api.post('/auth/register', {
        name: formData.name,
        username: formData.username,
        password: formData.password,
        role: formData.role
      });
      
      setSuccess(true);
      toast.success('Karyawan baru berhasil dibuat');
      
      // Reset form
      setFormData({
        name: '',
        username: '',
        password: '',
        confirmPassword: '',
        role: 'Cashier'
      });
      
    } catch (err) {
      console.error('Error registering staff:', err);
      setError(err.response?.data?.message || 'Gagal membuat akun karyawan');
      toast.error(err.response?.data?.message || 'Gagal membuat akun karyawan');
    } finally {
      setProcessing(false);
    }
  };
  
  const handleBack = () => {
    navigate('/dashboard');
  };
  
  // Cek apakah pengguna memiliki akses (hanya Admin dan Owner)
  const hasAccess = currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Owner');
  
  if (!hasAccess) {
    return (
      <div className="bg-red-900 bg-opacity-20 p-6 rounded-lg border border-red-500">
        <div className="flex items-center text-red-500 mb-4">
          <AlertCircle size={24} className="mr-2" />
          <h2 className="text-xl font-bold">Akses Ditolak</h2>
        </div>
        <p className="text-gray-300 mb-6">
          Anda tidak memiliki hak akses untuk membuat akun karyawan baru.
          Hanya Administrator dan Owner yang dapat mengakses halaman ini.
        </p>
        <button
          onClick={handleBack}
          className="flex items-center bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
        >
          <ArrowLeft size={18} className="mr-2" />
          Kembali ke Dashboard
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tambah Karyawan Baru</h1>
        <p className="text-gray-400">
          Buat akun untuk karyawan atau administrator baru di Kenzie Gaming.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <UserPlus size={20} className="mr-2" />
              Pendaftaran Karyawan
            </h2>
            
            {success && (
              <div className="bg-green-900 bg-opacity-20 p-4 rounded-lg border border-green-500 mb-6">
                <div className="flex items-center text-green-500 mb-2">
                  <CheckCircle size={18} className="mr-2" />
                  <span className="font-medium">Berhasil</span>
                </div>
                <p className="text-green-400">
                  Akun karyawan baru berhasil dibuat. Karyawan sekarang dapat login menggunakan username dan password yang telah didaftarkan.
                </p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-900 bg-opacity-20 p-4 rounded-lg border border-red-500 mb-6">
                <div className="flex items-center text-red-500 mb-2">
                  <AlertCircle size={18} className="mr-2" />
                  <span className="font-medium">Error</span>
                </div>
                <p className="text-red-400">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="Masukkan username untuk login"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Username harus unik dan akan digunakan untuk login
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="Masukkan password"
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimal 6 karakter
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Konfirmasi Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="Konfirmasi password"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-400 mb-2">Peran</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  required
                >
                  <option value="Cashier">Kasir</option>
                  <option value="Admin">Admin</option>
                  {currentUser?.role === 'Owner' && (
                    <option value="Owner">Owner</option>
                  )}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Peran menentukan tingkat akses yang dimiliki karyawan
                </p>
              </div>
              
              <button
                type="submit"
                disabled={processing}
                className={`w-full py-3 rounded-lg font-medium flex items-center justify-center ${
                  processing
                    ? "bg-blue-800 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} className="mr-2" />
                    Daftarkan Karyawan
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
        
        <div>
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4">Informasi Peran</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-blue-500">Kasir</h4>
                <p className="text-sm text-gray-400">
                  Dapat mengoperasikan sistem kasir, mengelola rental PlayStation, dan penjualan makanan/minuman. Tidak bisa mengakses laporan atau menambah karyawan.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-green-500">Admin</h4>
                <p className="text-sm text-gray-400">
                  Memiliki semua akses kasir ditambah kemampuan melihat laporan, mengelola karyawan, dan mengubah pengaturan sistem.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-purple-500">Owner</h4>
                <p className="text-sm text-gray-400">
                  Memiliki akses penuh ke semua fitur sistem termasuk laporan keuangan lengkap dan kemampuan menambah Owner lain.
                </p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-900 bg-opacity-20 rounded-lg border border-blue-800">
              <div className="text-sm text-blue-400">
                <AlertCircle size={16} className="inline-block mr-2" />
                Pastikan untuk menginformasikan username dan password kepada karyawan baru secara langsung. Karyawan dapat mengubah password setelah login pertama.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffRegisterPage;