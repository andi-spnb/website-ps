import React, { useState, useEffect } from 'react';
import { User, UserPlus, Edit, Trash, AlertCircle, Search, X } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: 'Cashier',
    username: '',
    password: '',
    status: 'Active'
  });

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
          name: 'Admin',
          role: 'Admin',
          username: 'admin',
          status: 'Active'
        },
        {
          staff_id: 2,
          name: 'Kasir 1',
          role: 'Cashier',
          username: 'kasir1',
          status: 'Active'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/staff', formData);
      toast.success('Karyawan berhasil ditambahkan');
      setShowAddModal(false);
      setFormData({
        name: '',
        role: 'Cashier',
        username: '',
        password: '',
        status: 'Active'
      });
      fetchStaff();
    } catch (err) {
      console.error('Error adding staff:', err);
      toast.error(err.response?.data?.message || 'Gagal menambahkan karyawan');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/staff/${selectedStaff.staff_id}`, formData);
      toast.success('Data karyawan berhasil diperbarui');
      setShowEditModal(false);
      fetchStaff();
    } catch (err) {
      console.error('Error updating staff:', err);
      toast.error(err.response?.data?.message || 'Gagal memperbarui data karyawan');
    }
  };

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

  const openEditModal = (staff) => {
    setSelectedStaff(staff);
    setFormData({
      name: staff.name,
      role: staff.role,
      username: staff.username,
      password: '', // Don't populate password
      status: staff.status
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (staff) => {
    setSelectedStaff(staff);
    setShowDeleteModal(true);
  };

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="h-12 bg-gray-700 rounded mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Daftar Karyawan</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg"
        >
          <UserPlus size={18} className="mr-1" />
          Tambah Karyawan
        </button>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari nama, peran, atau username..."
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
      
      {filteredStaff.length === 0 ? (
        <div className="text-center py-8 text-gray-400 bg-gray-800 rounded-lg border border-gray-700">
          <User size={48} className="mx-auto mb-3 opacity-30" />
          {searchQuery ? (
            <p>Tidak ada karyawan yang sesuai dengan pencarian "{searchQuery}"</p>
          ) : (
            <p>Belum ada karyawan yang terdaftar</p>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg inline-flex items-center"
          >
            <UserPlus size={16} className="mr-1" />
            Tambah Karyawan
          </button>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left">Nama</th>
                <th className="py-3 px-4 text-left">Peran</th>
                <th className="py-3 px-4 text-left">Username</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredStaff.map(staffMember => (
                <tr key={staffMember.staff_id} className="hover:bg-gray-750">
                  <td className="py-3 px-4 font-medium">{staffMember.name}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      staffMember.role === 'Admin' 
                        ? 'bg-purple-900 bg-opacity-40 text-purple-400' 
                        : staffMember.role === 'Owner'
                          ? 'bg-red-900 bg-opacity-40 text-red-400'
                          : 'bg-blue-900 bg-opacity-40 text-blue-400'
                    }`}>
                      {staffMember.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">{staffMember.username}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      staffMember.status === 'Active'
                        ? 'bg-green-900 bg-opacity-40 text-green-400'
                        : 'bg-red-900 bg-opacity-40 text-red-400'
                    }`}>
                      {staffMember.status === 'Active' ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openEditModal(staffMember)}
                      className="text-blue-500 hover:text-blue-400 p-1"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(staffMember)}
                      className="text-red-500 hover:text-red-400 p-1 ml-2"
                      title="Hapus"
                      disabled={staffMember.role === 'Owner'}
                    >
                      <Trash size={16} className={staffMember.role === 'Owner' ? 'opacity-50 cursor-not-allowed' : ''} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Tambah Karyawan</h2>
              <button onClick={() => setShowAddModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit}>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="Masukkan nama karyawan"
                  required
                />
              </div>
              
              <div className="mb-4">
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
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="Masukkan username"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-400 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="Masukkan password"
                  required
                />
              </div>
              
              <div className="flex space-x-3">
                <button 
                  type="button"
                  className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg"
                  onClick={() => setShowAddModal(false)}
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-medium"
                >
                  Tambah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Staff Modal */}
      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Karyawan</h2>
              <button onClick={() => setShowEditModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="Masukkan nama karyawan"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Peran</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  required
                  disabled={selectedStaff.role === 'Owner'}
                >
                  <option value="Cashier">Kasir</option>
                  <option value="Admin">Admin</option>
                  {selectedStaff.role === 'Owner' && <option value="Owner">Owner</option>}
                </select>
                {selectedStaff.role === 'Owner' && (
                  <p className="text-xs text-gray-400 mt-1">Peran Owner tidak dapat diubah</p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="Masukkan username"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Password (Kosongkan jika tidak diubah)</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="Masukkan password baru (opsional)"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-400 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  required
                  disabled={selectedStaff.role === 'Owner'}
                >
                  <option value="Active">Aktif</option>
                  <option value="Inactive">Tidak Aktif</option>
                </select>
                {selectedStaff.role === 'Owner' && (
                  <p className="text-xs text-gray-400 mt-1">Status Owner tidak dapat diubah</p>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button 
                  type="button"
                  className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg"
                  onClick={() => setShowEditModal(false)}
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded-lg font-medium"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
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
                Tindakan ini tidak dapat dikembalikan.
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

export default StaffManagement;