import React from 'react';
import { Calendar, Mail, Phone, Star } from 'lucide-react';

// Komponen khusus yang optimized untuk pencetakan
const PrintableMemberCard = React.forwardRef(({ member, qrCodeUrl }, ref) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Styling untuk kartu printable
  const style = {
    container: {
      width: '85.60mm', // Ukuran standar kartu kredit dikalikan 1.5
      height: '53.98mm',
      padding: '5mm',
      backgroundColor: '#1a2857',
      background: 'linear-gradient(to right, #121828, #1e3a8a)',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      borderRadius: '2mm',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
      margin: '0 auto',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      pageBreakInside: 'avoid'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '3mm'
    },
    headerLeft: {
      display: 'flex',
      flexDirection: 'column'
    },
    memberIdLabel: {
      fontSize: '2.5mm',
      color: '#cbd5e1',
      marginBottom: '1mm'
    },
    memberId: {
      fontSize: '4mm',
      fontWeight: 'bold'
    },
    statusBadge: {
      padding: '1mm 2mm',
      borderRadius: '1mm',
      fontSize: '2.5mm',
      fontWeight: 'bold'
    },
    memberName: {
      fontSize: '6mm',
      fontWeight: 'bold',
      marginBottom: '1mm'
    },
    pointsRow: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '3mm',
      color: '#f1f5f9',
      marginBottom: '3mm'
    },
    starIcon: {
      width: '3mm',
      height: '3mm',
      marginRight: '1mm',
      color: '#eab308'
    },
    infoRow: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '3mm',
      marginBottom: '1mm'
    },
    infoIcon: {
      width: '3mm',
      height: '3mm',
      marginRight: '1mm',
      color: '#94a3b8'
    },
    footer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTop: '0.2mm solid #475569',
      paddingTop: '3mm',
      marginTop: '3mm'
    },
    qrCode: {
      width: '18mm',
      height: '18mm',
      backgroundColor: 'white',
      borderRadius: '1mm',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    logoArea: {
      textAlign: 'right'
    },
    companyName: {
      fontSize: '4mm',
      fontWeight: 'bold'
    },
    tagline: {
      fontSize: '2.5mm',
      color: '#94a3b8'
    }
  };

  // Penentuan warna badge berdasarkan status
  const getStatusBadgeStyle = (status) => {
    let backgroundColor = '#10b981'; // Default green for Active
    
    if (status === 'Expired') {
      backgroundColor = '#f59e0b'; // Yellow for Expired
    } else if (status === 'Blacklisted') {
      backgroundColor = '#ef4444'; // Red for Blacklisted
    }
    
    return {
      ...style.statusBadge,
      backgroundColor
    };
  };

  // Penentuan text badge berdasarkan status
  const getStatusText = (status) => {
    switch(status) {
      case 'Active': return 'AKTIF';
      case 'Expired': return 'KADALUARSA';
      case 'Blacklisted': return 'DIBLOKIR';
      default: return status;
    }
  };

  return (
    <div ref={ref}>
      <div style={style.container}>
        {/* Header */}
        <div style={style.header}>
          <div style={style.headerLeft}>
            <div style={style.memberIdLabel}>Membership ID</div>
            <div style={style.memberId}>{member.membership_id}</div>
          </div>
          <div style={getStatusBadgeStyle(member.status)}>
            {getStatusText(member.status)}
          </div>
        </div>
        
        {/* Member Name and Points */}
        <div style={style.memberName}>{member.name}</div>
        <div style={style.pointsRow}>
          <svg style={style.starIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <span>{member.reward_points} Poin</span>
        </div>
        
        {/* Member Information */}
        {member.phone && (
          <div style={style.infoRow}>
            <svg style={style.infoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <span>{member.phone}</span>
          </div>
        )}
        
        {member.email && (
          <div style={style.infoRow}>
            <svg style={style.infoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <span>{member.email}</span>
          </div>
        )}
        
        <div style={style.infoRow}>
          <svg style={style.infoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>Berlaku hingga: {formatDate(member.expiry_date)}</span>
        </div>
        
        {/* Footer with QR and Company Info */}
        <div style={style.footer}>
          <div style={style.qrCode}>
            {qrCodeUrl ? (
              <img 
                src={qrCodeUrl} 
                alt="QR Code Member" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={(e) => {
                  console.error("Error loading QR code image in printable card");
                  e.target.onerror = null;
                  e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect fill="white" width="100" height="100"/><text fill="black" font-family="Arial" font-size="10" text-anchor="middle" x="50" y="50">${member.membership_id}</text></svg>`;
                }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333' }}>
                {member.membership_id}
              </div>
            )}
          </div>
          <div style={style.logoArea}>
            <div style={style.companyName}>Kenzie Gaming</div>
            <div style={style.tagline}>Rental PlayStation</div>
          </div>
        </div>
      </div>
      
      {/* Instructions that only show when printing */}
      <div style={{ textAlign: 'center', color: '#475569', fontSize: '3mm', marginTop: '3mm', pageBreakAfter: 'always' }}>
        Potong di sepanjang garis putus-putus - Kartu Kenzie Gaming
      </div>
    </div>
  );
});

export default PrintableMemberCard;