import React, { useState, useEffect } from 'react';
import MembersList from '../components/member/MembersList';
import MemberCard from '../components/member/MemberCard';
import api from '../services/api';
import { toast } from 'react-toastify';
import { AlertCircle } from 'lucide-react';

const MembersPage = () => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fungsi untuk mengambil detail member ketika dipilih
  const fetchMemberDetail = async (memberId) => {
    try {
      setLoading(true);
      const response = await api.get(`/members/${memberId}`);
      setSelectedMember(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching member details:', err);
      setError('Gagal memuat detail member');
      toast.error('Gagal memuat detail member: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Handler ketika member dipilih dari daftar
  const handleSelectMember = (member) => {
    // Jika data member sudah lengkap, gunakan langsung
    if (member && member.user_id) {
      // Fetch dari API untuk mendapatkan data paling baru
      fetchMemberDetail(member.user_id);
    } else {
      setSelectedMember(null);
    }
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Member</h1>
        <p className="text-gray-400">
          Kelola member Kenzie Gaming dan cetak kartu member.
        </p>
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MembersList onSelectMember={handleSelectMember} />
        </div>
        <div>
          {loading ? (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-5 animate-pulse">
              <div className="h-6 bg-gray-700 rounded w-1/2 mb-6"></div>
              <div className="h-64 bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto"></div>
            </div>
          ) : (
            <MemberCard member={selectedMember} />
          )}
        </div>
      </div>
    </div>
  );
};

export default MembersPage;