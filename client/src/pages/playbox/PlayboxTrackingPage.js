import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Monitor, 
  Calendar, 
  Clock, 
  MapPin, 
  ChevronRight, 
  User, 
  Phone, 
  Mail,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Timer,
  Truck,
  Home,
  Wrench, // Ubah Tool menjadi Wrench
  Check,
  X,
  ArrowRight
} from 'lucide-react';
import api from '../../services/api';

const PlayboxTrackingPage = () => {
  const { bookingCode } = useParams();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOvertime: false
  });
  
  useEffect(() => {
    if (!bookingCode) return;
    
    const fetchReservation = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/playbox/public/reservation/${bookingCode}`);
        setReservation(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching reservation:', err);
        setError('Reservasi tidak ditemukan atau kode booking tidak valid');
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchReservation, 30000);
    return () => clearInterval(interval);
  }, [bookingCode]);
  
  // Timer update for active playbox
  useEffect(() => {
    if (!reservation || reservation.status !== 'In Use') return;
    
    const startTime = new Date(reservation.start_time);
    const endTime = new Date(reservation.end_time);
    
    const timer = setInterval(() => {
      const now = new Date();
      
      if (now < startTime) {
        // Not started yet
        setTimeLeft({
          hours: 0,
          minutes: 0,
          seconds: 0,
          isOvertime: false
        });
        return;
      }
      
      if (now > endTime) {
        // Time finished
        setTimeLeft({
          hours: 0,
          minutes: 0,
          seconds: 0,
          isOvertime: true
        });
        return;
      }
      
      // Calculate time left
      const timeDiff = endTime - now;
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      
      setTimeLeft({
        hours,
        minutes,
        seconds,
        isOvertime: false
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [reservation]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6 max-w-3xl mx-auto">
          <div className="h-8 bg-gray-700 rounded w-1/4"></div>
          <div className="h-16 bg-gray-800 rounded-lg"></div>
          <div className="h-64 bg-gray-800 rounded-lg"></div>
          <div className="h-48 bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center mb-6">
            <Link to="/playbox" className="mr-3 text-gray-400 hover:text-white">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold">Tracking Reservasi</h1>
          </div>
          
          <div className="bg-red-900 bg-opacity-20 p-6 rounded-lg border border-red-500 text-center">
            <div className="w-16 h-16 bg-red-900 bg-opacity-30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">Reservasi Tidak Ditemukan</h2>
            <p className="text-red-400 mb-6">{error}</p>
            <Link 
              to="/playbox"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center"
            >
              Kembali ke Home
              <ArrowRight className="ml-2" size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  if (!reservation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center mb-6">
            <Link to="/playbox" className="mr-3 text-gray-400 hover:text-white">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold">Tracking Reservasi</h1>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
            <h2 className="text-xl font-bold mb-2">Masukkan Kode Booking</h2>
            <p className="text-gray-400 mb-4">
              Masukkan kode booking untuk melacak status reservasi Playbox Anda
            </p>
            <div className="mb-4">
              <input 
                type="text" 
                className="w-full bg-gray-700 border border-gray-600 rounded py-2 px-4 text-center uppercase"
                placeholder="Contoh: PB-ABC12"
                maxLength={8}
              />
            </div>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center"
            >
              Lacak Reservasi
              <ArrowRight className="ml-2" size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Format date & time
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get status information
  const getStatusInfo = () => {
    switch (reservation.status) {
      case 'Pending':
        return {
          icon: <Clock size={24} className="text-yellow-500" />,
          title: 'Menunggu Konfirmasi',
          description: 'Reservasi Anda sedang menunggu konfirmasi dari staff kami',
          color: 'yellow'
        };
      case 'Confirmed':
        return {
          icon: <CheckCircle size={24} className="text-green-500" />,
          title: 'Reservasi Dikonfirmasi',
          description: 'Reservasi Anda telah dikonfirmasi dan akan disiapkan',
          color: 'green'
        };
      case 'In Preparation':
        return {
          icon: <Wrench size={24} className="text-blue-500" />,
          title: 'Dalam Persiapan',
          description: 'Playbox Anda sedang disiapkan oleh tim kami',
          color: 'blue'
        };
      case 'In Transit':
        return {
          icon: <Truck size={24} className="text-purple-500" />,
          title: 'Dalam Perjalanan',
          description: 'Playbox Anda sedang dalam perjalanan ke lokasi Anda',
          color: 'purple'
        };
      case 'In Use':
        return {
          icon: <Monitor size={24} className="text-green-500" />,
          title: 'Sedang Digunakan',
          description: 'Playbox sedang aktif digunakan',
          color: 'green'
        };
      case 'Returning':
        return {
          icon: <Truck size={24} className="text-orange-500" />,
          title: 'Dalam Perjalanan Kembali',
          description: 'Playbox sedang dalam perjalanan kembali',
          color: 'orange'
        };
      case 'Completed':
        return {
          icon: <Check size={24} className="text-green-500" />,
          title: 'Selesai',
          description: 'Reservasi Anda telah selesai',
          color: 'green'
        };
      case 'Cancelled':
        return {
          icon: <X size={24} className="text-red-500" />,
          title: 'Dibatalkan',
          description: 'Reservasi Anda telah dibatalkan',
          color: 'red'
        };
      default:
        return {
          icon: <AlertCircle size={24} className="text-gray-500" />,
          title: 'Status Tidak Diketahui',
          description: 'Status reservasi tidak dapat ditentukan',
          color: 'gray'
        };
    }
  };
  
  const statusInfo = getStatusInfo();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Link to="/playbox" className="mr-3 text-gray-400 hover:text-white">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Tracking Reservasi</h1>
        </div>
        
        {/* Booking info card */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-400">Kode Booking</div>
              <div className="text-xl font-bold">{reservation.booking_code}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Status</div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm bg-${statusInfo.color}-900 bg-opacity-20 text-${statusInfo.color}-500`}>
                {statusInfo.icon}
                <span className="ml-2">{statusInfo.title}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center mb-4">
            <Monitor size={20} className="text-blue-500 mr-2" />
            <span className="font-medium">{reservation.Playbox.playbox_name}</span>
            <span className="mx-2 text-gray-600">•</span>
            <span className="text-gray-400">{reservation.Playbox.tv_size} + {reservation.Playbox.ps4_model}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <Calendar size={18} className="text-gray-400 mr-2 mt-0.5" />
              <div>
                <div className="text-sm text-gray-400">Tanggal & Waktu</div>
                <div>{formatDate(reservation.start_time)}</div>
                <div>{formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}</div>
              </div>
            </div>
            <div className="flex items-start">
              <MapPin size={18} className="text-gray-400 mr-2 mt-0.5" />
              <div>
                <div className="text-sm text-gray-400">Alamat Pengantaran</div>
                <div>{reservation.delivery_address}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Timer for active sessions */}
        {reservation.status === 'In Use' && (
          <div className={`bg-${timeLeft.isOvertime ? 'red' : 'blue'}-900 bg-opacity-20 rounded-lg p-6 border border-${timeLeft.isOvertime ? 'red' : 'blue'}-800 mb-6`}>
            <div className="flex items-center mb-3">
              <Timer size={24} className={`text-${timeLeft.isOvertime ? 'red' : 'blue'}-500 mr-2`} />
              <h2 className="text-xl font-bold">{timeLeft.isOvertime ? 'Waktu Habis' : 'Waktu Tersisa'}</h2>
            </div>
            
            {timeLeft.isOvertime ? (
              <div>
                <p className="text-red-400 mb-4">
                  Waktu penggunaan Playbox Anda telah habis. Tim kami akan segera mengambil kembali Playbox.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="https://wa.me/6285975418797?text=Halo,%20saya%20ingin%20memperpanjang%20waktu%20sewa%20Playbox.%20Kode%20booking:%20PB-ABC12"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-center font-medium inline-flex items-center justify-center"
                  >
                    Perpanjang via WhatsApp
                  </a>
                  <button
                    className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-center font-medium inline-flex items-center justify-center"
                  >
                    Selesai
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-3xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
                    <div className="text-xs text-gray-400">Jam</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-3xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
                    <div className="text-xs text-gray-400">Menit</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-3xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
                    <div className="text-xs text-gray-400">Detik</div>
                  </div>
                </div>
                
                <a
                  href="https://wa.me/6285975418797?text=Halo,%20saya%20ingin%20memperpanjang%20waktu%20sewa%20Playbox.%20Kode%20booking:%20PB-ABC12"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-center font-medium block"
                >
                  Perpanjang Waktu
                </a>
              </div>
            )}
          </div>
        )}
        
        {/* Status tracking */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
          <h2 className="text-xl font-bold mb-4">Status Reservasi</h2>
          
          <div className="space-y-6">
            <StatusStep 
              status="Pending"
              title="Menunggu Konfirmasi"
              time={reservation.created_at}
              isCompleted={['Pending', 'Confirmed', 'In Preparation', 'In Transit', 'In Use', 'Returning', 'Completed'].includes(reservation.status)}
              isActive={reservation.status === 'Pending'}
            />
            
            <StatusStep 
              status="Confirmed"
              title="Reservasi Dikonfirmasi"
              isCompleted={['Confirmed', 'In Preparation', 'In Transit', 'In Use', 'Returning', 'Completed'].includes(reservation.status)}
              isActive={reservation.status === 'Confirmed'}
            />
            
            <StatusStep 
              status="In Preparation"
              title="Playbox Sedang Disiapkan"
              isCompleted={['In Preparation', 'In Transit', 'In Use', 'Returning', 'Completed'].includes(reservation.status)}
              isActive={reservation.status === 'In Preparation'}
            />
            
            <StatusStep 
              status="In Transit"
              title="Dalam Perjalanan ke Lokasi Anda"
              isCompleted={['In Transit', 'In Use', 'Returning', 'Completed'].includes(reservation.status)}
              isActive={reservation.status === 'In Transit'}
            />
            
            <StatusStep 
              status="In Use"
              title="Sedang Digunakan"
              time={reservation.start_time}
              isCompleted={['In Use', 'Returning', 'Completed'].includes(reservation.status)}
              isActive={reservation.status === 'In Use'}
            />
            
            <StatusStep 
              status="Returning"
              title="Playbox Dalam Perjalanan Kembali"
              isCompleted={['Returning', 'Completed'].includes(reservation.status)}
              isActive={reservation.status === 'Returning'}
            />
            
            <StatusStep 
              status="Completed"
              title="Reservasi Selesai"
              time={reservation.actual_end_time}
              isCompleted={['Completed'].includes(reservation.status)}
              isActive={reservation.status === 'Completed'}
              isLast={true}
            />
            
            {reservation.status === 'Cancelled' && (
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-red-900 bg-opacity-20 flex items-center justify-center mr-4">
                  <X size={16} className="text-red-500" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-red-500">Reservasi Dibatalkan</div>
                  <div className="text-sm text-red-400">
                    Reservasi ini telah dibatalkan
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Support & Help */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4">Bantuan & Dukungan</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="https://wa.me/6285975418797?text=Halo,%20saya%20butuh%20bantuan%20terkait%20reservasi%20Playbox%20dengan%20kode%20booking:%20PB-ABC12"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-center"
            >
              <div className="font-medium mb-1">Hubungi via WhatsApp</div>
              <div className="text-sm text-green-300">Respon Cepat</div>
            </a>
            
            <a
              href="tel:+6285975418797"
              className="bg-blue-900 bg-opacity-40 hover:bg-opacity-60 p-4 rounded-lg text-center"
            >
              <div className="font-medium mb-1">Hubungi via Telepon</div>
              <div className="text-sm text-blue-300">+6285975418797</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Status Step Component
const StatusStep = ({ status, title, time, isCompleted, isActive, isLast = false }) => {
  return (
    <div className="flex">
      <div className="mr-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isCompleted
            ? 'bg-green-900 bg-opacity-20'
            : isActive
              ? 'bg-blue-900 bg-opacity-20 border-2 border-blue-500'
              : 'bg-gray-700'
        }`}>
          {isCompleted ? (
            <Check size={16} className="text-green-500" />
          ) : (
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-blue-500' : 'bg-gray-500'}`}></div>
          )}
        </div>
        
        {!isLast && (
          <div className={`w-0.5 h-12 ml-4 ${
            isCompleted ? 'bg-green-500' : 'bg-gray-700'
          }`}></div>
        )}
      </div>
      
      <div className="flex-1 pb-6">
        <div className={`font-medium ${
          isActive ? 'text-blue-500' : isCompleted ? 'text-white' : 'text-gray-400'
        }`}>
          {title}
        </div>
        
        {time && (
          <div className="text-sm text-gray-400">
            {new Date(time).toLocaleString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayboxTrackingPage;