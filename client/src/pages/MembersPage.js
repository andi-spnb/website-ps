import React, { useState, useEffect } from 'react';
import MembersList from '../components/members/MembersList';
import MemberCard from '../components/members/MemberCard';
import api from '../services/api';

const MembersPage = () => {
  const [selectedMember, setSelectedMember] = useState(null);
  
  // For demo purposes we'll use a mock member
  useEffect(() => {
    const mockMember = {
      user_id: 1,
      name: 'Budi Santoso',
      phone: '081234567890',
      email: 'budi@example.com',
      membership_id: 'KG-0001',
      registration_date: '2024-01-15T00:00:00Z',
      reward_points: 150,
      expiry_date: '2025-01-15T00:00:00Z',
      status: 'Active'
    };
    
    setSelectedMember(mockMember);
    
    // In real implementation you would fetch the selected member
    // const fetchSelectedMember = async (id) => {
    //   try {
    //     const response = await api.get(`/members/${id}`);
    //     setSelectedMember(response.data);
    //   } catch (error) {
    //     console.error('Error fetching member details:', error);
    //   }
    // };
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Member</h1>
        <p className="text-gray-400">
          Kelola member Kenzie Gaming dan cetak kartu member.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MembersList onSelectMember={setSelectedMember} />
        </div>
        <div>
          {selectedMember && (
            <MemberCard member={selectedMember} />
          )}
        </div>
      </div>
    </div>
  );
};

export default MembersPage;