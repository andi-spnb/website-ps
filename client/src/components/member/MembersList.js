import React, { useState } from 'react';
import { Users, Search } from 'lucide-react';

const MembersList = ({ onSelectMember }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data dummy untuk contoh
  const members = [
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
  ];
  
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Daftar Member</h2>
        <button
          className="flex items-center bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg"
        >
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
            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>
      
      {filteredMembers.length === 0 ? (
        <div className="text-center py-8 text-gray-400 bg-gray-800 rounded-lg border border-gray-700">
          <Users size={48} className="mx-auto mb-3 opacity-30" />
          <p>Tidak ada member yang sesuai dengan pencarian</p>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredMembers.map(member => (
                <tr 
                  key={member.user_id} 
                  className="hover:bg-gray-750 cursor-pointer"
                  onClick={() => onSelectMember && onSelectMember(member)}
                >
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MembersList;