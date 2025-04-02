import React, { useState, useEffect } from 'react';
import { Calendar, Mail, Phone, Star, QrCode, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import PrintableMemberCard from './PrintableMemberCard';

const MemberCard = ({ member }) => {
  const [printLoading, setPrintLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const cardRef = React.useRef();
  const printableCardRef = React.useRef();

  const handlePrint = useReactToPrint({
    content: () => printableCardRef.current,
    onBeforeGetContent: () => setPrintLoading(true),
    onAfterPrint: () => setPrintLoading(false),
    pageStyle: '@page { size: 88mm 54mm; margin: 0mm; }' // Mengatur ukuran halaman cetak
  });

  // Generate QR code when member changes
  useEffect(() => {
    if (member) {
      generateQRCode();
    }
  }, [member]);

  // Function to generate QR code
  const generateQRCode = () => {
    if (!member) return;

    // Buat string data yang lebih sederhana untuk QR code
    const dataString = `KENZIE-${member.membership_id}-${member.name}`;
    
    // Generate QR code URL menggunakan QR Server API (alternatif Google Charts API)
    // Menggunakan format yang lebih sederhana dan lebih stabil
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(dataString)}`;
    
    console.log("QR URL generated:", qrUrl);
    setQrCodeUrl(qrUrl);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Jika tidak ada member yang dipilih, tampilkan pesan untuk memilih member
  if (!member) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-5 h-full flex items-center justify-center">
        <div className="text-center text-gray-400">
          <QrCode size={48} className="mx-auto mb-3 opacity-30" />
          <p>Pilih member untuk melihat dan mencetak kartu</p>
        </div>
      </div>
    );
  }

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
          {printLoading ? 'Memproses...' : (
            <span className="flex items-center">
              <Printer size={14} className="mr-1" /> Cetak Kartu
            </span>
          )}
        </button>
      </div>
      
      {/* Kartu untuk ditampilkan di antarmuka */}
      <div ref={cardRef} className="p-2">
        <div className="bg-gradient-to-r from-gray-900 to-blue-900 rounded-lg overflow-hidden shadow-lg p-5">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-xs text-gray-400">Membership ID</div>
              <div className="text-xl font-bold">{member.membership_id}</div>
            </div>
            <div className={`flex items-center px-2 py-1 rounded text-xs ${
              member.status === 'Active' ? 'bg-green-600' :
              member.status === 'Expired' ? 'bg-yellow-600' :
              'bg-red-600'
            }`}>
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
            {qrCodeUrl ? (
              <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center overflow-hidden p-1">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code Member" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.error("Error loading QR code image");
                    e.target.onerror = null;
                    e.target.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IndoaXRlIi8+PHRleHQgeD0iNTAiIHk9IjUwIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iYmxhY2siPnsgbWVtYmVyLm1lbWJlcnNoaXBfaWQgfTwvdGV4dD48L3N2Zz4=";
                  }}
                />
              </div>
            ) : (
              <div className="w-24 h-24 bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-gray-600">Memuat QR...</div>
              </div>
            )}
            <div className="text-right">
              <div className="text-lg font-bold">Kenzie Gaming</div>
              <div className="text-xs text-gray-400">Rental PlayStation</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Komponen yang khusus untuk pencetakan - tersembunyi di UI tetapi digunakan saat mencetak */}
      <div className="hidden">
        <PrintableMemberCard ref={printableCardRef} member={member} qrCodeUrl={qrCodeUrl} />
      </div>
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        * Kartu member ini akan dicetak dan dipotong sesuai dengan ukuran standar kartu.
      </div>

      <div className="mt-4 bg-gray-700 rounded-lg p-3">
        <h4 className="text-sm font-medium mb-2">Informasi QR Code</h4>
        <p className="text-xs text-gray-400">
          QR Code berisi data ID Member, nama, status, tanggal kadaluarsa, dan jumlah poin.
          Scan QR Code untuk memverifikasi identitas member secara cepat di kasir.
        </p>
      </div>
    </div>
  );
};

export default MemberCard;