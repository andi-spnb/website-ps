import React, { useState } from 'react';
import { User, Mail, Key, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { currentUser, updateProfile } = useAuth();
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Password baru dan konfirmasi password tidak cocok');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password baru minimal 6 karakter');
      return;
    }
    
    try {
      setIsChangingPassword(true);
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success('Password berhasil diubah');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
        console.error('Error changing password:', err);
        toast.error(err.response?.data?.message || 'Gagal mengubah password');
      } finally {
        setIsChangingPassword(false);
      }
    };
  
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Profil</h1>
          <p className="text-gray-400">
            Kelola informasi akun dan ubah password Anda.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-6">Informasi Akun</h2>
              
              <div className="mb-6">
                <div className="flex items-center mb-1">
                  <User size={16} className="text-gray-400 mr-2" />
                  <span className="text-gray-400">Nama</span>
                </div>
                <div className="text-lg font-medium bg-gray-700 p-3 rounded-lg">
                  {currentUser?.name}
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center mb-1">
                  <Mail size={16} className="text-gray-400 mr-2" />
                  <span className="text-gray-400">Username</span>
                </div>
                <div className="text-lg font-medium bg-gray-700 p-3 rounded-lg">
                  {currentUser?.username}
                </div>
              </div>
              
              <div>
                <div className="flex items-center mb-1">
                  <User size={16} className="text-gray-400 mr-2" />
                  <span className="text-gray-400">Peran</span>
                </div>
                <div className="inline-block bg-blue-600 px-3 py-1 rounded-full text-sm">
                  {currentUser?.role}
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <Key size={20} className="mr-2" />
                Ubah Password
              </h2>
              
              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-400 mb-1">Password Saat Ini</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-400 mb-1">Password Baru</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimal 6 karakter
                  </p>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-400 mb-1">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className={`w-full py-2 rounded-lg font-medium flex items-center justify-center ${
                    isChangingPassword
                      ? "bg-blue-800 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isChangingPassword ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </form>
              
              <div className="mt-4 p-3 bg-blue-900 bg-opacity-20 rounded-lg border border-blue-800">
                <div className="flex items-start">
                  <AlertCircle size={16} className="text-blue-500 mr-2 mt-0.5" />
                  <div className="text-sm text-blue-400">
                    Perubahan password akan langsung aktif. Pastikan Anda mengingat password baru Anda.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default ProfilePage;