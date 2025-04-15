import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Monitor, 
  Calendar, 
  Clock, 
  MapPin, 
  ChevronRight, 
  Star, 
  CheckCircle, 
  Users,
  ArrowRight,
  X,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';

// Fungsi untuk mengecek apakah suatu tanggal adalah hari ini
const isToday = (date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

// Komponen PlayboxCard yang akan menampilkan status ketersediaan berdasarkan slot waktu
const PlayboxCard = ({ playbox }) => {
  const [availabilityStatus, setAvailabilityStatus] = useState({
    isAvailableToday: true,
    availableSlots: [],
    statusText: 'Tersedia'
  });
  
  useEffect(() => {
    // Cek ketersediaan untuk hari ini
    const checkAvailability = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await api.get(`/playbox/public/available?date=${today}`);
        
        const playboxData = response.data.find(p => p.playbox_id === playbox.playbox_id);
        
        if (playboxData && playboxData.timeSlots) {
          const availableSlots = playboxData.timeSlots.filter(slot => slot.available);
          
          setAvailabilityStatus({
            isAvailableToday: availableSlots.length > 0,
            availableSlots: availableSlots,
            statusText: availableSlots.length === 0 
              ? 'Full Booking Hari Ini' 
              : availableSlots.length < playboxData.timeSlots.length 
                ? 'Tersedia Beberapa Slot' 
                : 'Tersedia Penuh'
          });
        }
      } catch (err) {
        console.error('Error checking availability:', err);
      }
    };
    
    // Cek ketersediaan terlepas dari status Playbox
    // Playbox bisa saja status Maintenance tapi kita masih bisa memesan untuk besok
    checkAvailability();
  }, [playbox.playbox_id]);
  
  // Tentukan warna label status
  let statusColor = 'bg-green-900 text-green-400'; // Default: Tersedia
  
  if (playbox.status === 'Maintenance') {
    statusColor = 'bg-red-900 text-red-400'; // Maintenance
  } else if (!availabilityStatus.isAvailableToday) {
    statusColor = 'bg-orange-900 text-orange-400'; // Full Booking
  } else if (availabilityStatus.availableSlots.length < 14) { // Asumsi 14 slot waktu (8-22)
    statusColor = 'bg-yellow-900 text-yellow-400'; // Tersedia Sebagian
  }
  
  // Tentukan status yang ditampilkan
  let displayStatus = playbox.status;
  
  if (playbox.status === 'Available' || playbox.status === 'In Use') {
    // Kalau status fisik Available/In Use, tampilkan ketersediaan slot waktu
    displayStatus = availabilityStatus.statusText;
  } else if (playbox.status === 'Maintenance') {
    displayStatus = 'Dalam Perbaikan';
  } else if (playbox.status === 'In Transit') {
    displayStatus = 'Dalam Perjalanan';
  }
  
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition-all">
      <div className="h-48 bg-gray-900 relative">
        {playbox.image_url ? (
          <img 
            src={playbox.image_url} 
            alt={playbox.playbox_name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Monitor size={64} className="text-gray-700" />
          </div>
        )}
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs ${statusColor}`}>
          {displayStatus}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{playbox.playbox_name}</h3>
        <div className="mb-4">
          <div className="flex items-center text-gray-400 mb-1">
            <Monitor size={14} className="mr-2" />
            <span>TV {playbox.tv_size} + {playbox.ps4_model}</span>
          </div>
          <div className="flex items-center text-gray-400 mb-1">
            <Users size={14} className="mr-2" />
            <span>{playbox.controllers_count} Controller</span>
          </div>
          {playbox.location && (
            <div className="flex items-center text-gray-400">
              <MapPin size={14} className="mr-2" />
              <span>{playbox.location}</span>
            </div>
          )}
        </div>
        
        {/* Tampilkan informasi slot tersedia jika ada */}
        {availabilityStatus.isAvailableToday && availabilityStatus.availableSlots.length > 0 && (
          <div className="mb-4 bg-gray-700 p-2 rounded">
            <div className="text-sm text-gray-300 mb-1">Slot tersedia hari ini:</div>
            <div className="flex flex-wrap gap-1">
              {availabilityStatus.availableSlots.slice(0, 5).map(slot => (
                <span key={slot.hour} className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded">
                  {slot.startTime}
                </span>
              ))}
              {availabilityStatus.availableSlots.length > 5 && (
                <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                  +{availabilityStatus.availableSlots.length - 5} lagi
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Tampilkan informasi jika Full Booking hari ini */}
        {!availabilityStatus.isAvailableToday && playbox.status !== 'Maintenance' && (
          <div className="mb-4 bg-gray-700 p-2 rounded flex items-start">
            <AlertCircle size={16} className="text-orange-400 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-300">
              Full booking hari ini, tetapi tersedia untuk pemesanan di hari lain
            </div>
          </div>
        )}
        
        {playbox.PlayboxGames && playbox.PlayboxGames.length > 0 && (
          <div className="mb-4">
            <div className="text-sm text-gray-400 mb-2">Game Terpopuler:</div>
            <div className="space-y-1">
              {playbox.PlayboxGames.slice(0, 3).map(game => (
                <div key={game.playbox_game_id} className="flex items-center">
                  <Star size={12} className="text-yellow-500 mr-2" />
                  <span>{game.game_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <Link 
          to={`/playbox/reservation?id=${playbox.playbox_id}`}
          className={`w-full py-2 rounded text-center font-medium block ${
            playbox.status === 'Maintenance'
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          onClick={(e) => playbox.status === 'Maintenance' && e.preventDefault()}
        >
          {playbox.status === 'Maintenance' ? 'Dalam Perbaikan' : 'Pesan Sekarang'}
        </Link>
      </div>
    </div>
  );
};

const PlayboxLandingPage = () => {
  const [playboxes, setPlayboxes] = useState([]);
  const [featuredPlaybox, setFeaturedPlaybox] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayboxes = async () => {
      try {
        setLoading(true);
        const response = await api.get('/playbox/public');
        setPlayboxes(response.data);
        
        // Find featured playbox or use first one
        const featured = response.data.find(p => p.featured) || response.data[0];
        setFeaturedPlaybox(featured);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching playboxes:', err);
        setError('Gagal memuat data Playbox');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayboxes();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        {/* Hero section skeleton */}
        <div className="h-96 bg-gray-800 rounded-lg"></div>
        
        {/* Info section skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-40 bg-gray-800 rounded-lg"></div>
          <div className="h-40 bg-gray-800 rounded-lg"></div>
          <div className="h-40 bg-gray-800 rounded-lg"></div>
        </div>
        
        {/* Playboxes list skeleton */}
        <div className="h-8 bg-gray-800 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-80 bg-gray-800 rounded-lg"></div>
          <div className="h-80 bg-gray-800 rounded-lg"></div>
          <div className="h-80 bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 bg-opacity-20 p-8 rounded-lg border border-red-500 text-center">
        <h2 className="text-xl font-bold text-red-500 mb-4">Error</h2>
        <p className="text-white mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="pb-16">
      {/* Hero Section */}
      <div className="relative mb-16 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-900 to-blue-600">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              PLAYBOX KENZIE GAMING
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Nikmati pengalaman bermain PlayStation 4 kapan saja dan di mana saja dengan Playbox, PS4 portabel lengkap dengan TV dan controller. TINGAL CULUK..
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/playbox/reservation" 
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center"
              >
                Pesan Sekarang
                <ArrowRight className="ml-2" size={18} />
              </Link>
              <a 
                href="#playboxes" 
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center"
              >
                Lihat Playbox
                <ChevronRight className="ml-2" size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Info Section */}
      <div className="container mx-auto px-4 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Apa itu Playbox?</h2>
          <p className="text-gray-400 max-w-3xl mx-auto">
            Playbox adalah solusi gaming portabel yang menggabungkan PlayStation 4 dengan TV dalam satu paket yang mudah dibawa. 
            Nikmati gaming kapan saja dan di mana saja!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Monitor size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Paket Lengkap</h3>
            <p className="text-gray-400">
              Setiap Playbox dilengkapi dengan PS4, TV LED, 2 controller, dan game terbaru yang siap dimainkan.
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Fleksibel</h3>
            <p className="text-gray-400">
              Sewa sesuai kebutuhan Anda, mulai dari 3 jam hingga beberapa hari untuk acara atau kompetisi.
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Diantar ke Lokasi</h3>
            <p className="text-gray-400">
              Kami akan mengantarkan Playbox ke alamat Anda dan membantu pemasangan hingga siap digunakan.
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Ambil Di Lokasi</h3>
            <p className="text-gray-400">
            Anda dapat mengambil Playbox ke Studio kami.
            </p>
          </div>
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="container mx-auto px-4 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Cara Kerja</h2>
          <p className="text-gray-400 max-w-3xl mx-auto">
            Menyewa Playbox sangat mudah dengan langkah-langkah berikut
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 relative">
            <div className="absolute top-4 right-4 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="font-bold">1</span>
            </div>
            <h3 className="text-lg font-bold mb-3">Pilih Playbox</h3>
            <p className="text-gray-400">
              Pilih Playbox yang tersedia sesuai dengan kebutuhan Anda.
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 relative">
            <div className="absolute top-4 right-4 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="font-bold">2</span>
            </div>
            <h3 className="text-lg font-bold mb-3">Isi Form Pemesanan</h3>
            <p className="text-gray-400">
              Isi detail pemesanan termasuk tanggal, durasi, dan alamat pengantaran/pengambilan.
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 relative">
            <div className="absolute top-4 right-4 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="font-bold">3</span>
            </div>
            <h3 className="text-lg font-bold mb-3">Konfirmasi & Pembayaran</h3>
            <p className="text-gray-400">
              Lakukan pembayaran untuk mengkonfirmasi pemesanan Anda.
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 relative">
            <div className="absolute top-4 right-4 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="font-bold">4</span>
            </div>
            <h3 className="text-lg font-bold mb-3">Nikmati Gaming</h3>
            <p className="text-gray-400">
              Playbox siap untuk dimainkan!
            </p>
          </div>
        </div>
      </div>
      
      {/* Featured Playbox */}
      {featuredPlaybox && (
        <div className="container mx-auto px-4 mb-16">
          <div className="bg-gradient-to-r from-blue-900 to-blue-600 rounded-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="bg-white text-blue-600 inline-block px-3 py-1 rounded-full text-sm font-medium mb-4">
                  Playbox Unggulan
                </div>
                <h2 className="text-3xl font-bold mb-4">{featuredPlaybox.playbox_name}</h2>
                <p className="text-white mb-6">
                  {featuredPlaybox.description || `PlayStation 4 portabel dengan TV ${featuredPlaybox.tv_size} yang siap diantar ke lokasi Anda. Dilengkapi dengan ${featuredPlaybox.controllers_count} controller dan berbagai game populer.`}
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-black bg-opacity-20 p-3 rounded-lg">
                    <div className="text-sm text-gray-300">TV Size</div>
                    <div className="font-medium">{featuredPlaybox.tv_size}</div>
                  </div>
                  <div className="bg-black bg-opacity-20 p-3 rounded-lg">
                    <div className="text-sm text-gray-300">PS4 Model</div>
                    <div className="font-medium">{featuredPlaybox.ps4_model}</div>
                  </div>
                  <div className="bg-black bg-opacity-20 p-3 rounded-lg">
                    <div className="text-sm text-gray-300">Controller</div>
                    <div className="font-medium">{featuredPlaybox.controllers_count} Unit</div>
                  </div>
                  <div className="bg-black bg-opacity-20 p-3 rounded-lg">
                    <div className="text-sm text-gray-300">Status</div>
                    <div className="font-medium">
                      {featuredPlaybox.status === 'Available' ? 'Tersedia' : 'Tidak Tersedia'}
                    </div>
                  </div>
                </div>
                <Link 
                  to={`/playbox/reservation?id=${featuredPlaybox.playbox_id}`}
                  className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium inline-flex items-center"
                >
                  Pesan Sekarang
                  <ArrowRight className="ml-2" size={18} />
                </Link>
              </div>
              <div className="bg-gray-900 h-64 md:h-auto">
                {featuredPlaybox.image_url ? (
                  <img 
                    src={featuredPlaybox.image_url} 
                    alt={featuredPlaybox.playbox_name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Monitor size={96} className="text-gray-700" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Playboxes List */}
      <div id="playboxes" className="container mx-auto px-4 mb-16">
        <h2 className="text-3xl font-bold mb-8">Playbox Tersedia</h2>
        
        {playboxes.length === 0 ? (
          <div className="text-center py-16 bg-gray-800 rounded-lg">
            <Monitor size={64} className="mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-bold mb-2">Belum ada Playbox</h3>
            <p className="text-gray-400">
              Maaf, belum ada Playbox yang tersedia saat ini. Silakan cek kembali nanti.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playboxes.map(playbox => (
              <PlayboxCard key={playbox.playbox_id} playbox={playbox} />
            ))}
          </div>
        )}
      </div>
      
      {/* FAQ Section */}
      <div className="container mx-auto px-4 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Pertanyaan Umum</h2>
          <p className="text-gray-400 max-w-3xl mx-auto">
            Jawaban untuk pertanyaan yang sering diajukan tentang layanan Playbox
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-2">Berapa lama saya bisa menyewa Playbox?</h3>
            <p className="text-gray-400">
              Anda dapat menyewa Playbox mulai dari 3 jam hingga beberapa hari. Durasi minimum penyewaan adalah 3 jam.
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-2">Bagaimana jika saya ingin memperpanjang waktu sewa?</h3>
            <p className="text-gray-400">
              Anda dapat memperpanjang waktu sewa dengan menghubungi kami melalui WhatsApp atau melalui halaman tracking reservasi.
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-2">Apakah saya perlu menyediakan peralatan tambahan?</h3>
            <p className="text-gray-400">
              Tidak, Playbox sudah lengkap dengan PS4, TV, controller, dan kabel yang diperlukan. Anda hanya perlu menyediakan stopkontak listrik.
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-2">Bagaimana jika ada kerusakan pada Playbox?</h3>
            <p className="text-gray-400">
              Jika terjadi kerusakan selama penggunaan, segera hubungi kami. Jika kerusakan disebabkan oleh penggunaan normal, kami akan mengganti unit. Jika disebabkan oleh kelalaian, ada biaya perbaikan.
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-2">Berapa biaya pengantaran Playbox?</h3>
            <p className="text-gray-400">
              Biaya pengantaran sudah termasuk dalam harga sewa untuk area tertentu. Untuk lokasi di luar area tersebut, akan ada biaya tambahan tergantung jarak.
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-2">Bagaimana cara membatalkan reservasi?</h3>
            <p className="text-gray-400">
              Anda dapat membatalkan reservasi melalui halaman tracking dengan kode booking Anda. Pembatalan 24 jam sebelum waktu pengantaran akan mendapatkan pengembalian dana penuh.
            </p>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-blue-900 to-blue-600 rounded-lg p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Siap Untuk Memulai Petualangan Gaming?</h2>
          <p className="text-gray-200 mb-8 max-w-2xl mx-auto">
            Pesan Playbox sekarang dan nikmati pengalaman bermain PlayStation 4 di mana saja!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/playbox/reservation" 
              className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium flex items-center justify-center"
            >
              Pesan Sekarang
              <ArrowRight className="ml-2" size={18} />
            </Link>
            <a 
              href="https://wa.me/62895386763040?text=Halo,%20saya%20ingin%20bertanya%20tentang%20Playbox" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center"
            >
              Hubungi via WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayboxLandingPage;