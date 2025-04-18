import React, { useState } from 'react';
import api from '../../services/api'; // Perbaikan path import
import { toast } from 'react-toastify';

const Register = ({ onToggleForm }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'Cashier' // Default role
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim() || !formData.username.trim() || !formData.password.trim()) {
      toast.error('Semua field harus diisi');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Password dan konfirmasi password tidak cocok');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    
    try {
      setIsLoading(true);
      
      
      toast.success('Pendaftaran berhasil! Silakan login');
      onToggleForm(); // Kembali ke form login
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Pendaftaran gagal. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-6 text-white">Daftar Akun Baru</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-400 mb-2">
            Nama Lengkap
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white"
            placeholder="Masukkan nama lengkap"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-400 mb-2">
            Username
          </label>
          <input
            id="username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white"
            placeholder="Masukkan username"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-400 mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white"
            placeholder="Minimal 6 karakter"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block text-gray-400 mb-2">
            Konfirmasi Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white"
            placeholder="Ketik ulang password"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="role" className="block text-gray-400 mb-2">
            Peran
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white"
            required
          >
            <option value="Cashier">Kasir</option>
            <option value="Admin">Admin</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Pendaftaran Admin perlu persetujuan pengelola sistem
          </p>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 rounded-lg font-medium ${
            isLoading
              ? "bg-blue-800 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isLoading ? "Memproses..." : "Daftar"}
        </button>
        
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={onToggleForm}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Sudah punya akun? Login di sini
          </button>
        </div>
      </form>
    </>
  );
};

export default Register;