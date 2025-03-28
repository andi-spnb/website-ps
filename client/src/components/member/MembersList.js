import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Edit, Trash, AlertCircle, Search, X, User, Calendar, Clock } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const MembersList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    membership_id: '',
    expiry_date: '',
    status: 'Active'
  });

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/members');
      setMembers(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Gagal memuat data member');
      
      // Mock data for demo
      setMembers([
        {
          user_id: 1,
          name: 'Budi Santoso',
          phone: '081234567890',
          email: 'budi@example.com',
          membership_id: 'KG-0001',
          registration_date: '2024-01-15T00:00:00Z',
          reward_points: 150,
          expiry_date: '2025-01-15T00:00:00Z',
          status: 'Active'
        },
        {
          user_id: 2,
          name: 'Siti Rahayu',
          phone: '089876543210',
          email: 'siti@example.com',
          membership_id: 'KG-0002',
          registration_date: '2024-02-20T00:00:00Z',
          reward_points: 75,
          expiry_date: '2025-02-20T00:00:00Z',
          status: 'Active'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateMembershipId = () => {
    const prefix = 'KG-';
    const lastId = members.length > 0 
      ? parseInt(members[members.length - 1].membership_id.replace(prefix, '')) 
      : 0;
    const newId = (lastId + 1).toString().padStart(4, '0');
    return `${prefix}${newId}`;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      // Set default values for new member
      const memberData = {
        ...formData,
        membership_id: formData.membership_id || generateMembershipId(),
        registration_date: new Date().toISOString(),
        reward_points: 0,
        status: 'Active'
      };
      
      await api.post('/members', memberData);
      toast.success('Member berhasil ditambahkan');
      setShowAddModal(false);
      setFormData({
        name: '',
        phone: '',
        email: '',
        membership_id: '',
        expiry_date: '',
        status: 'Active'
      });
      fetchMembers();
    } catch (err) {
      console.error('Error adding member:', err);
      toast.error(err.response?.data?.message || 'Gagal menambahkan member');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/members/${selectedMember.user_id}`, formData);
      toast.success('Data member berhasil diperbarui');
      setShowEditModal(false);
      fetchMembers();
    } catch (err) {
      console.error('Error updating member:', err);
      toast.error(err.response?.data?.message || 'Gagal memperbarui data member');
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      await api.delete(`/members/${selectedMember.user_id}`);
      toast.success('Member berhasil dihapus');
      setShowDeleteModal(false);
      fetchMembers();
    } catch (err) {
      console.error('Error deleting member:', err);
      toast.error(err.response?.data?.message || 'Gagal menghapus member');
    }
  };

  const openEditModal = (member) => {
    setSelectedMember(member);
    setFormData({
      name: member.name,
      phone: member.phone || '',
      email: member.email || '',
      membership_id: member.membership_id,
      expiry_date: member.expiry_date ? new Date(member.expiry_date).toISOString().split('T')[0] : '',
      status: member.status
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (member) => {
    setSelectedMember(member);
    setShowDeleteModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <span className="px-2 py-1 bg-green-900 bg-opacity-40 text-green-400 rounded-full text-xs">Aktif</span>;
      case 'Expired':
        return <span className="px-2 py-1 bg-yellow-900 bg-opacity-40 text-yellow-400 rounded-full text-xs">Kadaluarsa</span>;
      case 'Blacklisted':
        return <span className="px-2 py-1 bg-red-900 bg-opacity-40 text-red-400 rounded-full text-xs">Diblokir</span>;
      default:
        return <span className="px-2 py-1 bg-gray-900 bg-opacity-40 text-gray-400 rounded-full text-xs">{status}</span>;
    }
  };

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (member.phone && member.phone.includes(searchQuery)) ||
    (member.email && member.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    member.membership_id.toLowerCase().includes(searchQuery.toLowerCase())
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
        <h2 className="text-xl font-semibold">Daftar Member</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg"
        >
          <UserPlus size={18} className="mr-1" />
          Tambah Member
        </button>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari nama, telepon, email, atau ID member..."
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
      
      {filteredMembers.length === 0 ? (
        <div className="text-center py-8 text-gray-400 bg-gray-800 rounded-lg border border-gray-700">
          <Users size={48} className="mx-auto mb-3 opacity-30" />
          {searchQuery ? (
            <p>Tidak ada member yang sesuai dengan pencarian "{searchQuery}"</p>
          ) : (
            <p>Belum ada member yang terdaftar</p>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg inline-flex items-center"
          >
            <UserPlus size={16} className="mr-1" />
            Tambah Member
          </button>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-left">ID Member</th>
                <th className="py-3 px-4 text-left">Nama</th>
                <th className="py-3 px-4 text-left">Telepon</th>
                <th className="py-3 px-4 text-left">Points</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Kadaluarsa</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredMembers.map(member => (
                <tr key={member.user_id} className="hover:bg-gray-750">
                  <td className="py-3 px-4 font-medium">{member.membership_id}</td>
                  <td className="py-3 px-4">{member.name}</td>
                  <td className="py-3 px-4">{member.phone || '-'}</td>
                  <td className="py-3 px-4">{member.reward_points}</td>
                  <td className="py-3 px-4">{getStatusBadge(member.status)}</td>
                  <td className="py-3 px-4">
                    {member.expiry_date 
                      ? new Date(member.expiry_date).toLocaleDateString() 
                      : '-'
                    }
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openEditModal(member)}
                      className="text-blue-500 hover:text-blue-400 p-1"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(member)}
                      className="text-red-500 hover:text-red-400 p-1 ml-2"
                      title="Hapus"
                    >
                      <Trash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Tambah Member Baru</h2>
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
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Nomor Telepon</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="Contoh: 081234567890"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Email (Opsional)</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="Contoh: nama@email.com"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">ID Member</label>
                <input
                  type="text"
                  name="membership_id"
                  value={formData.membership_id || generateMembershipId()}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="Otomatis dibuat jika kosong"
                  disabled
                />
                <p className="text-xs text-gray-400 mt-1">
                  *ID Member akan dibuat otomatis
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-400 mb-2">Tanggal Kadaluarsa</label>
                <input
                  type="date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  required
                  min={new Date().toISOString().split('T')[0]}
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
      
      {/* Edit Member Modal */}
      {showEditModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Member</h2>
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
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Nomor Telepon</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="Contoh: 081234567890"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Email (Opsional)</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  placeholder="Contoh: nama@email.com"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">ID Member</label>
                <input
                  type="text"
                  name="membership_id"
                  value={formData.membership_id}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  disabled
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  required
                >
                  <option value="Active">Aktif</option>
                  <option value="Expired">Kadaluarsa</option>
                  <option value="Blacklisted">Diblokir</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-400 mb-2">Tanggal Kadaluarsa</label>
                <input
                  type="date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
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
      {showDeleteModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="mb-4">
              <div className="flex items-center text-red-500 mb-2">
                <AlertCircle size={24} className="mr-2" />
                <h2 className="text-xl font-bold">Konfirmasi Hapus</h2>
              </div>
              <p>
                Apakah Anda yakin ingin menghapus member <strong>{selectedMember.name}</strong> ({selectedMember.membership_id})?
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

export default MembersList;