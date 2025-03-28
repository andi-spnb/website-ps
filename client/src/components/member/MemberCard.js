import React, { useState } from 'react';
import { Calendar, Mail, Phone, Star } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

const MemberCard = ({ member }) => {
  const [printLoading, setPrintLoading] = useState(false);
  const cardRef = React.useRef();

  const handlePrint = useReactToPrint({
    content: () => cardRef.current,
    onBeforeGetContent: () => setPrintLoading(true),
    onAfterPrint: () => setPrintLoading(false),
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Kartu Member</h3>
        <button
          onClick={handlePrint}
          disabled={printLoading}
          className={`px-3 py-1.5 rounded text-sm ${
            printLoading
              ? 'bg-blue-700 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {printLoading ? 'Memproses...' : 'Cetak Kartu'}
        </button>
      </div>
      
      <div ref={cardRef} className="p-2">
        <div className="bg-gradient-to-r from-gray-900 to-blue-900 rounded-lg overflow-hidden shadow-lg p-5">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-xs text-gray-400">Membership ID</div>
              <div className="text-xl font-bold">{member.membership_id}</div>
            </div>
            <div className="flex items-center bg-blue-600 px-2 py-1 rounded text-xs">
              {member.status === 'Active' && 'AKTIF'}
              {member.status === 'Expired' && 'KADALUARSA'}
              {member.status === 'Blacklisted' && 'DIBLOKIR'}
            </div>
          </div>
          
          <div className="mb-6">
            <div className="text-2xl font-bold">{member.name}</div>
            <div className="flex items-center text-sm text-gray-300 mt-1">
              <Star size={14} className="mr-1 text-yellow-500" />
              <span>{member.reward_points} Poin</span>
            </div>
          </div>
          
          <div className="space-y-1 mb-4">
            {member.phone && (
              <div className="flex items-center text-sm">
                <Phone size={14} className="mr-2 text-gray-400" />
                <span>{member.phone}</span>
              </div>
            )}
            {member.email && (
              <div className="flex items-center text-sm">
                <Mail size={14} className="mr-2 text-gray-400" />
                <span>{member.email}</span>
              </div>
            )}
            <div className="flex items-center text-sm">
              <Calendar size={14} className="mr-2 text-gray-400" />
              <span>Berlaku hingga: {formatDate(member.expiry_date)}</span>
            </div>
          </div>
          
          <div className="mt-6 flex items-center justify-between border-t border-gray-700 pt-4">
            <div className="w-24 h-24 bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-gray-600">QR Code</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">Kenzie Gaming</div>
              <div className="text-xs text-gray-400">Rental PlayStation</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        * Kartu member ini akan dicetak dan dipotong sesuai dengan ukuran standar kartu.
      </div>
    </div>
  );
};

export default MemberCard;