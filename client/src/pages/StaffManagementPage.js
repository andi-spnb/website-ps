import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Edit, Trash, AlertCircle, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const StaffManagementPage = () => {
  const { currentUser } = useAuth() || {};
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await api.get('/staff');
      setStaff(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError('Gagal memuat data karyawan');
      
      // Mock data for demo
      setStaff([
        {
          staff_id: 1,
          name: 'Budi Santoso',
          role: 'Admin',
          username: 'budi',
          status: 'Active',
          createdAt: '2024-03-15T00:00:00Z'
        },
        {
          staff_id: 2,
          name: 'Siti Nuraini',
          role: 'Cashier',
          username: 'siti',
          status: 'Active',
          createdAt: '2024-03-20T00:00:00Z'
        },
        {
          staff_id: 3,
          name: 'Joko Widodo',
          role: 'Owner',
          username: 'joko',
          status: 'Active',
          createdAt: '2024-03-10T00:00:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleDeleteSubmit = async () => {
    try {
      await api.delete(`/staff/${selectedStaff.staff_id}`);
      toast.success('Karyawan berhasil dihapus');
      setShowDeleteModal(false);
      fetchStaff();
    } catch (err) {
      console.error('Error deleting staff:', err);
      toast.error(err.response?.data?.message || 'Gagal menghapus karyawan');
    }
  };

  const openDeleteModal = (staff) => {
    setSelectedStaff(staff);
    setShowDeleteModal(true);
  };

  const updateStaffStatus = async (staffId, status) => {
    try {
      await api.patch(`/staff/${staffId}/status`, { status });
      toast.success(`Status karyawan berhasil diubah menjadi ${status === 'Active' ? 'Aktif' : 'Tidak Aktif'}`);
      fetchStaff();
    } catch (err) {
      console.error('Error updating staff status:', err);
      toast.error(err.response?.data?.message || 'Gagal mengubah status karyawan');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <span className="px-2 py-1 bg-green-900 bg-opacity-40 text-green-400 rounded-full text-xs">Aktif</span>;
      case 'Inactive':
        return <span className="px-2 py-1 bg-red-900 bg-opacity-40 text-red-400 rounded-full text-xs">Tidak Aktif</span>;
      default:
        return <span className="px-2 py-1 bg-gray-900 bg-opacity-40 text-gray-400 rounded-full text-xs">{status}</span>;
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Admin':
        return <span className="px-2 py-1 bg-green-900 bg-opacity-40 text-green-400 rounded-full text-xs">Admin</span>;
      case 'Cashier':
        return <span className="px-2 py-1 bg-blue-900 bg-opacity-40 text-blue-400 rounded-full text-xs">Kasir</span>;
      case 'Owner':
        return <span className="px-2 py-1 bg-purple-900 bg-opacity-40 text-purple-400 rounded-full text-xs">Owner</span>;
      default:
        return <span className="px-2 py-1 bg-gray-900 bg-opacity-40 text-gray-400 rounded-full text-xs">{role}</span>;
    }
  };

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          Anda tidak memiliki hak akses untuk mengelola karyawan.
          Hanya Administrator dan Owner yang dapat mengakses halaman ini.
        </p>
        <Link
          to="/dashboard"
          className="flex items-center bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg inline-block"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Manajemen Karyawan</h1>
        <p className="text-gray-400">
          Kelola akun karyawan dan administrator di Kenzie Gaming.
        </p>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Daftar Karyawan</h2>
        <Link
          to="/register-staff"
          className="flex items-center bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg"
        >
          <UserPlus size={18} className="mr-1" />
          Tambah Karyawan
        </Link>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari nama, username, atau peran..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-900 bg-opacity-20 p-4 rounded-lg border border-red-500 mb-6">
          <div className="flex items-center text-red-500 mb-2">
            <AlertCircle size={18} className="mr-2" />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-red-400">{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="h-12 bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="text-center py-8 text-gray-400 bg-gray-800 rounded-lg border border-gray-700">
          <Users size={48} className="mx-auto mb-3 opacity-30" />
          {searchQuery ? (
            <p>Tidak ada karyawan yang sesuai dengan pencarian "{searchQuery}"</p>
          ) : (
            <p>Belum ada karyawan yang terdaftar</p>
          )}
          <Link
            to="/register-staff"
            className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg inline-flex items-center"
          >
            <UserPlus size={16} className="mr-1" />
            Tambah Karyawan
          </Link>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left">Nama</th>
                <th className="py-3 px-4 text-left">Username</th>
                <th className="py-3 px-4 text-left">Peran</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Terdaftar</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredStaff.map(staffMember => (
                <tr key={staffMember.staff_id} className="hover:bg-gray-750">
                  <td className="py-3 px-4 font-medium">{staffMember.name}</td>
                  <td className="py-3 px-4">{staffMember.username}</td>
                  <td className="py-3 px-4">{getRoleBadge(staffMember.role)}</td>
                  <td className="py-3 px-4">{getStatusBadge(staffMember.status)}</td>
                  <td className="py-3 px-4">
                    {new Date(staffMember.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {staffMember.staff_id !== currentUser?.staff_id && (
                      <>
                        <button
                          onClick={() => updateStaffStatus(staffMember.staff_id, staffMember.status === 'Active' ? 'Inactive' : 'Active')}
                          className={`p-1 mr-2 ${
                            staffMember.status === 'Active' 
                              ? 'text-red-500 hover:text-red-400' 
                              : 'text-green-500 hover:text-green-400'
                          }`}
                          title={staffMember.status === 'Active' ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          {staffMember.status === 'Active' ? <X size={16} /> : <Edit size={16} />}
                        </button>
                        
                        {/* Jangan izinkan menghapus Owner jika bukan Owner */}
                        {(staffMember.role !== 'Owner' || currentUser?.role === 'Owner') && (
                          <button
                            onClick={() => openDeleteModal(staffMember)}
                            className="text-red-500 hover:text-red-400 p-1"
                            title="Hapus"
                          >
                            <Trash size={16} />
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="mb-4">
              <div className="flex items-center text-red-500 mb-2">
                <AlertCircle size={24} className="mr-2" />
                <h2 className="text-xl font-bold">Konfirmasi Hapus</h2>
              </div>
              <p>
                Apakah Anda yakin ingin menghapus karyawan <strong>{selectedStaff.name}</strong>?
                Tindakan ini tidak dapat dikembalikan dan akan menghapus semua data terkait karyawan ini.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button 
                className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg"
                onClick={() => setShowDeleteModal(false)}
              >
                Batal
              </button>
              <button 
                className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-lg font-medium flex justify-center items-center"
                onClick={handleDeleteSubmit}
              >
                <Trash size={16} className="mr-2" />
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagementPage;