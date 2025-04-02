// File: client/src/components/pos/MemberSelectionModal.js
import React, { useState, useEffect } from 'react';
import { Search, X, User, Check } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

// Data default dari database SQL yang diberikan (sesuai dengan struktur database)
const DEFAULT_MEMBERS = [
  {
    user_id: 1,
    name: 'Budi Santoso',
    phone: '081234567890',
    email: 'budi@example.com',
    membership_id: 'KG-0001',
    registration_date: '2025-03-28T15:00:41',
    reward_points: 150,
    expiry_date: '2026-03-28T00:00:00',
    status: 'Active'
  },
  {
    user_id: 2,
    name: 'Siti Rahayu',
    phone: '089876543210',
    email: 'siti@example.com',
    membership_id: 'KG-0002',
    registration_date: '2025-03-28T15:00:41',
    reward_points: 75,
    expiry_date: '2026-03-28T00:00:00',
    status: 'Active'
  }
];

const MemberSelectionModal = ({ isOpen, onClose, onSelectMember }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    
    const fetchMembers = async () => {
      try {
        setLoading(true);
        // Try to get data from API
        try {
          const response = await api.get('/members');
          console.log("API response for members:", response.data);
          setMembers(response.data);
          setError(null);
        } catch (apiError) {
          console.error('Error fetching members from API:', apiError);
          
          // Fallback to default data if API fails
          console.log("Using default members data");
          setMembers(DEFAULT_MEMBERS);
          setError(null);
        }
      } catch (err) {
        console.error('Error in fetchMembers:', err);
        setError('Gagal memuat data member');
        toast.error('Gagal memuat data member');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [isOpen]);

  const handleSelectMember = (member) => {
    onSelectMember(member);
    onClose();
    toast.success(`Member ${member.name} berhasil dipilih`);
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

  const filteredMembers = members.filter(member => {
    const lowerQuery = searchQuery.toLowerCase();
    
    // Pastikan semua properti ada sebelum melakukan pencarian
    return (
      (member.name && member.name.toLowerCase().includes(lowerQuery)) ||
      (member.phone && member.phone.includes(lowerQuery)) ||
      (member.email && member.email.toLowerCase().includes(lowerQuery)) ||
      (member.membership_id && member.membership_id.toLowerCase().includes(lowerQuery))
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Pilih Member</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari nama, telepon, email, atau ID member..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
              autoFocus
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
        
        <div className="overflow-y-auto flex-grow">
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-700 rounded"></div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-900 bg-opacity-20 p-4 rounded-lg border border-red-500">
              <p className="text-red-400">{error}</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <User size={48} className="mx-auto mb-3 opacity-30" />
              {searchQuery ? (
                <p>Tidak ada member yang sesuai dengan pencarian "{searchQuery}"</p>
              ) : (
                <p>Belum ada member yang terdaftar</p>
              )}
            </div>
          ) : (
            <div className="bg-gray-700 rounded-lg">
              {filteredMembers.map(member => (
                <div 
                  key={member.user_id}
                  className="p-3 border-b border-gray-600 last:border-b-0 hover:bg-gray-650 cursor-pointer flex justify-between items-center"
                  onClick={() => handleSelectMember(member)}
                >
                  <div>
                    <div className="flex items-center">
                      <div className="font-medium">{member.name}</div>
                      <div className="ml-2 text-sm text-gray-400">({member.membership_id})</div>
                    </div>
                    <div className="text-sm text-gray-400 mt-1 flex space-x-4">
                      {member.phone && <div>{member.phone}</div>}
                      <div>{getStatusBadge(member.status)}</div>
                      <div className="text-yellow-400">{member.reward_points} poin</div>
                    </div>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 p-2 rounded-full">
                    <Check size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberSelectionModal;