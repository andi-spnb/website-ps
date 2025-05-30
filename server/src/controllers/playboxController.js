const { 
  Playbox, 
  PlayboxGame, 
  PlayboxReservation,
  Staff, 
  Transaction,
  Notification,
  PlayboxPricing,
  sequelize,
  CustomerIdentity
} = require('../models');
const { Op } = require('sequelize');
const { generateBookingCode } = require('../utils/helpers');
const path = require('path');

exports.getAllPlayboxes = async (req, res) => {
  try {
    const playboxes = await Playbox.findAll({
      order: [['playbox_name', 'ASC']]
    });
    
    res.json(playboxes);
  } catch (error) {
    console.error('Error fetching playboxes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
exports.getAvailablePlayboxes = async (req, res) => {
  try {
    const { date } = req.query;
    
    // Get all playboxes
    const playboxes = await Playbox.findAll({
      include: [{
        model: PlayboxGame,
        where: { is_featured: true },
        required: false,
        limit: 5
      }],
      order: [['playbox_name', 'ASC']]
    });
    
    if (date) {
      const startDate = new Date(reservationStart);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(reservationStart);
      endDate.setHours(23, 59, 59, 999);
      
      // Get active reservations for the date
      const reservations = await PlayboxReservation.findAll({
        where: {
          start_time: {
            [Op.between]: [startDate, endDate]
          },
          status: {
            [Op.notIn]: ['Cancelled']
          }
        },
        attributes: ['playbox_id', 'start_time', 'end_time', 'status']
      });
      
      // Proses setiap playbox
      const result = playboxes.map(playbox => {
        const playboxData = playbox.toJSON();
        const playboxReservations = reservations.filter(r => r.playbox_id === playbox.playbox_id);
        
        // Tentukan status playbox berdasarkan reservasi pada hari tersebut
        if (playboxReservations.length > 0) {
          // Jika semua slot waktu terisi, tandai sebagai terbooking penuh
          const totalHours = 14; // Misal jam operasi 8:00 - 22:00 (14 jam)
          let bookedHours = 0;
          
          // Hitung jumlah jam yang terbooking
          playboxReservations.forEach(res => {
            const start = new Date(res.start_time);
            const end = new Date(res.end_time);
            const hours = (end - start) / (1000 * 60 * 60);
            bookedHours += hours;
          });
          
          // Jika semua jam terbooking, tandai sebagai "Fully Booked"
          if (bookedHours >= totalHours) {
            playboxData.dailyStatus = 'Fully Booked';
          } else {
            playboxData.dailyStatus = 'Partially Available';
          }
        } else {
          playboxData.dailyStatus = 'Available';
        }
        
        // Buat daftar slot waktu dengan status
        const timeSlots = [];
        for (let hour = 8; hour < 22; hour++) {
          const slotStart = new Date(startDate);
          slotStart.setHours(hour, 0, 0);
          
          const slotEnd = new Date(startDate);
          slotEnd.setHours(hour + 1, 0, 0);
          
          // Cek apakah slot waktu terisi oleh reservasi
          const isBooked = playboxReservations.some(r => {
            const reservationStart = new Date(r.start_time);
            const reservationEnd = new Date(r.end_time);
            return (
              (slotStart >= reservationStart && slotStart < reservationEnd) ||
              (slotEnd > reservationStart && slotEnd <= reservationEnd) ||
              (slotStart <= reservationStart && slotEnd >= reservationEnd)
            );
          });
          
          timeSlots.push({
            hour,
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
            available: !isBooked
          });
        }
        
        playboxData.timeSlots = timeSlots;
        return playboxData;
      });
      
      // Filter hanya playbox yang tersedia
      const availablePlayboxes = result.filter(p => 
        p.status === 'Available' || (p.status === 'In Use' && p.dailyStatus !== 'Fully Booked')
      );
      
      res.json(availablePlayboxes);
    } else {
      // Filter hanya yang available (untuk tampilan umum)
      const availablePlayboxes = playboxes.filter(p => p.status === 'Available');
      res.json(availablePlayboxes);
    }
  } catch (error) {
    console.error('Error fetching available playboxes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Get playbox by ID (public)
exports.getPlayboxById = async (req, res) => {
  try {
    const playbox = await Playbox.findByPk(req.params.id, {
      include: [{
        model: PlayboxGame,
        required: false
      }]
    });
    
    if (!playbox) {
      return res.status(404).json({ message: 'Playbox tidak ditemukan' });
    }
    
    res.json(playbox);
  } catch (error) {
    console.error('Error fetching playbox:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create reservation (public)
exports.createReservation = async (req, res) => {
  const transaction = await sequelize.transaction();
  const proofUrl = req.files?.payment_proof ? `/uploads/bukti/${req.files.payment_proof[0].filename}` : null;
  const proofType = req.body.payment_method === 'qris' ? 'qris' : 'transfer';
  
  // Handle identity file upload
  const identityUrl = req.files?.identity_file ? `/uploads/identitas/${req.files.identity_file[0].filename}` : null;
  const identityType = req.body.identity_type || 'KTP';
  const identityNumber = req.body.identity_number || '';
  
  const playbox_id = parseInt(req.body.playbox_id);
  if (isNaN(playbox_id)) {
    return res.status(400).json({ message: 'Playbox ID tidak valid' });
  }
  
  try {
    const { 
      customer_name,
      customer_phone,
      customer_email,
      delivery_address,
      start_time,
      duration_hours,
      payment_method,
      notes,
      pricing_id,
      total_amount,
    } = req.body;

    const pickup_at_studio = req.body.pickup_at_studio === 'true'; // konversi dari string ke boolean
    
    // Validasi playbox exists and is available
    const playbox = await Playbox.findByPk(playbox_id, { transaction });
    if (!playbox) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Playbox tidak ditemukan' });
    }
    
    if (playbox.status !== 'Available') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Playbox sedang tidak tersedia' });
    }
    
    // Validasi file identitas
    if (!identityUrl) {
      await transaction.rollback();
      return res.status(400).json({ message: 'File identitas wajib diupload' });
    }
    
    // Validasi pricing (jika pricing_id disediakan)
    let pricing = null;
    if (pricing_id) {
      pricing = await PlayboxPricing.findByPk(pricing_id, { transaction });
      if (!pricing) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Data harga tidak ditemukan' });
      }
      
      if (!pricing.is_active) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Paket harga yang dipilih tidak aktif' });
      }
    }
    
    // Calculate end time
    const reservationStart = new Date(start_time);
    const reservationEnd = new Date(reservationStart.getTime() + (duration_hours * 60 * 60 * 1000));

    const overlappingReservation = await PlayboxReservation.findOne({
      where: {
        playbox_id,
        status: {
          [Op.notIn]: ['Cancelled', 'Completed']
        },
        [Op.or]: [
          {
            start_time: {
              [Op.lt]: reservationEnd
            },
            end_time: {
              [Op.gt]: reservationStart
            }
          }
        ]
      },
      transaction
    });
    
    // Tambahkan validasi khusus untuk paket tetap
    if (overlappingReservation) {
      // Cek jika ini adalah paket tetap, berikan pesan error yang lebih spesifik
      if (pricing && pricing.is_fixed_package) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: 'Paket tetap ini sudah dipesan pada waktu yang sama. Silakan pilih waktu atau Playbox lain.' 
        });
      } else {
        await transaction.rollback();
        return res.status(400).json({ 
          message: 'Waktu yang dipilih sudah dipesan oleh pelanggan lain' 
        });
      }
    }
    
    // Calculate total amount (if not provided, use pricing data)
    let calculatedTotal = total_amount;
    if (!calculatedTotal && pricing) {
      // Base price for minimum hours
      calculatedTotal = pricing.base_price;
      
      // Add hourly rate for additional hours
      if (duration_hours > pricing.min_hours) {
        calculatedTotal += pricing.hourly_rate * (duration_hours - pricing.min_hours);
      }
      
      // Add delivery fee
      calculatedTotal += pricing.delivery_fee || 0;
      
      // Add weekend surcharge if applicable
      const isWeekend = [0, 6].includes(reservationStart.getDay()); // 0 = Sunday, 6 = Saturday
      if (isWeekend && pricing.weekend_surcharge) {
        calculatedTotal += pricing.weekend_surcharge;
      }
    }
    
    // Generate unique booking code
    const booking_code = generateBookingCode();
    
    // Create the reservation
    const reservation = await PlayboxReservation.create({
      playbox_id,
      customer_name,
      customer_phone,
      customer_email,
      booking_code,
      delivery_address,
      start_time: reservationStart,
      end_time: reservationEnd,
      status: 'Pending',
      total_amount: calculatedTotal,
      payment_method,
      payment_status: 'Pending',
      notes,
      pricing_id: pricing ? pricing.price_id : null,
      // Tidak menggunakan deposit lagi
      deposit_amount: 0, 
      created_at: new Date(),
      pickup_at_studio,
      payment_proof_url: proofUrl,
      payment_proof_type: proofType
    }, { transaction });
    
    const expiryDate = new Date(reservationEnd);
expiryDate.setDate(expiryDate.getDate() + 1);

await CustomerIdentity.create({
  reservation_id: reservation.reservation_id,
  identity_type: identityType,
  identity_number: identityNumber,
  identity_file_url: identityUrl,
  expiry_date: expiryDate,
  created_at: new Date()
}, { transaction });
    
    // Create notification for staff
    await Notification.create({
      target_id: reservation.reservation_id,
      type: 'NewReservation',
      message: `Reservasi Playbox baru dari ${customer_name}`,
      created_at: new Date(),
      is_read: false
    }, { transaction });
    
    await transaction.commit();
    
    res.status(201).json({
      message: 'Reservasi berhasil dibuat',
      booking_code,
      reservation: {
        ...reservation.toJSON(),
        playbox: playbox.toJSON(),
        pricing: pricing ? pricing.toJSON() : null
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating reservation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Tambahkan fungsi baru untuk mendapatkan identitas pelanggan
exports.getCustomerIdentityByReservationId = async (req, res) => {
  try {
    const { reservation_id } = req.params;
    
    // Cek apakah user adalah admin atau owner
    if (!req.userData || !['Admin', 'Owner'].includes(req.userData.role)) {
      return res.status(403).json({ message: 'Unauthorized access to customer identity' });
    }
    
    const identity = await CustomerIdentity.findOne({
      where: { reservation_id }
    });
    
    if (!identity) {
      return res.status(404).json({ message: 'Data identitas tidak ditemukan' });
    }
    
    res.json(identity);
  } catch (error) {
    console.error('Error fetching customer identity:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get reservation by booking code (public)
exports.getReservationByCode = async (req, res) => {
  try {
    const { booking_code } = req.params;
    
    const reservation = await PlayboxReservation.findOne({
      where: { booking_code },
      include: [{
        model: Playbox,
        include: [{
          model: PlayboxGame,
          where: { is_installed: true },
          required: false
        }]
      }]
    });
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservasi tidak ditemukan' });
    }
    
    res.json(reservation);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add game to playbox (admin only)
exports.addGameToPlaybox = async (req, res) => {
  try {
    const { playbox_id } = req.params;
    const { game_name, game_image_url, category, max_players, is_featured } = req.body;
    
    // Check if playbox exists
    const playbox = await Playbox.findByPk(playbox_id);
    if (!playbox) {
      return res.status(404).json({ message: 'Playbox tidak ditemukan' });
    }
    
    // Check if game already exists for this playbox
    const existingGame = await PlayboxGame.findOne({
      where: {
        playbox_id,
        game_name
      }
    });
    
    if (existingGame) {
      return res.status(400).json({ message: 'Game sudah terinstal di Playbox ini' });
    }
    
    // Create new game
    const newGame = await PlayboxGame.create({
      playbox_id,
      game_name,
      game_image_url,
      category,
      max_players,
      is_featured: is_featured || false,
      is_installed: true
    });
    
    res.status(201).json({
      message: 'Game berhasil ditambahkan ke Playbox',
      game: newGame
    });
  } catch (error) {
    console.error('Error adding game to playbox:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ADMIN FUNCTIONS

// Fungsi confirmReservation yang telah diperbaiki
exports.confirmReservation = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { reservation_id } = req.params;
    const staff_id = req.userData.staff_id;
    
    const reservation = await PlayboxReservation.findByPk(reservation_id, { 
      include: [{ model: Playbox }],
      transaction 
    });
    
    if (!reservation) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Reservasi tidak ditemukan' });
    }
    
    if (reservation.status !== 'Pending') {
      await transaction.rollback();
      return res.status(400).json({ message: `Reservasi sudah ${reservation.status}` });
    }
    
    // Update reservation status
    await reservation.update({
      status: 'Confirmed',
      payment_status: reservation.payment_proof_url ? 'Paid' : 'Pending',
      staff_id
    }, { transaction });
    
    // PERBAIKAN: Jangan ubah status Playbox menjadi 'In Use'
    // Status Playbox tetap 'Available' sehingga masih bisa dipesan untuk slot waktu lain
    // Status Playbox hanya akan berubah ketika benar-benar sedang digunakan
    
    await transaction.commit();
    
    res.json({
      message: 'Reservasi berhasil dikonfirmasi',
      reservation: {
        ...reservation.toJSON()
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error confirming reservation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Fungsi getAvailablePlayboxes yang telah diperbaiki
exports.getAvailablePlayboxes = async (req, res) => {
  try {
    const { date } = req.query;
    
    // Get all playboxes
    const playboxes = await Playbox.findAll({
      include: [{
        model: PlayboxGame,
        where: { is_featured: true },
        required: false,
        limit: 5
      }],
      order: [['playbox_name', 'ASC']]
    });
    
    if (date) {
      // Perbaikan: Gunakan parameter 'date' yang diterima
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);
      
      // Get active reservations for the date
      const reservations = await PlayboxReservation.findAll({
        where: {
          // Gunakan between dengan tanggal yang benar (selectedDate hingga endDate)
          [Op.or]: [
            {
              start_time: {
                [Op.between]: [selectedDate, endDate]
              }
            },
            {
              end_time: {
                [Op.between]: [selectedDate, endDate]
              }
            },
            {
              // Tangkap juga reservasi yang dimulai sebelum dan berakhir setelah tanggal yang dipilih
              [Op.and]: [
                { start_time: { [Op.lt]: selectedDate } },
                { end_time: { [Op.gt]: endDate } }
              ]
            }
          ],
          status: {
            [Op.notIn]: ['Cancelled', 'Completed']
          }
        },
        attributes: ['playbox_id', 'start_time', 'end_time', 'status', 'booking_code']
      });
      
      // Proses setiap playbox
      const result = playboxes.map(playbox => {
        const playboxData = playbox.toJSON();
        const playboxReservations = reservations.filter(r => r.playbox_id === playbox.playbox_id);
        
        // Buat daftar slot waktu dengan status
        const timeSlots = [];
        for (let hour = 8; hour < 22; hour++) {
          const slotStart = new Date(selectedDate);
          slotStart.setHours(hour, 0, 0);
          
          const slotEnd = new Date(selectedDate);
          slotEnd.setHours(hour + 1, 0, 0);
          
          // Cek apakah slot waktu terisi oleh reservasi
          const isBooked = playboxReservations.some(r => {
            const reservationStart = new Date(r.start_time);
            const reservationEnd = new Date(r.end_time);
            
            // Slot waktu tumpang tindih dengan reservasi jika:
            return (
              // Slot dimulai di tengah reservasi
              (slotStart >= reservationStart && slotStart < reservationEnd) ||
              // Slot berakhir di tengah reservasi
              (slotEnd > reservationStart && slotEnd <= reservationEnd) ||
              // Slot sepenuhnya mencakup waktu reservasi
              (slotStart <= reservationStart && slotEnd >= reservationEnd)
            );
          });
          
          timeSlots.push({
            hour,
            startTime: `${String(hour).padStart(2, '0')}:00`,
            available: !isBooked
          });
        }
        
        // Tentukan status Playbox untuk hari ini berdasarkan slot yang tersedia
        const availableSlots = timeSlots.filter(slot => slot.available).length;
        
        if (availableSlots === 0) {
          playboxData.dailyStatus = 'Fully Booked';
        } else if (availableSlots < timeSlots.length) {
          playboxData.dailyStatus = 'Partially Available';
        } else {
          playboxData.dailyStatus = 'Available';
        }
        
        playboxData.timeSlots = timeSlots;
        return playboxData;
      });
      
      // PERBAIKAN: Playbox tersedia untuk booking jika masih ada slot waktu yang tersedia
      // Jadi tidak memfilter berdasarkan status "Available" atau "In Use"
      // Sebaliknya, kita kembalikan semua Playbox dan biarkan frontend menampilkan slot waktu yang tersedia
      res.json(result);
    } else {
      // Jika tidak ada parameter date, tampilkan semua playbox
      // PERBAIKAN: Frontend harus menampilkan slot waktu yang tersedia
      res.json(playboxes);
    }
  } catch (error) {
    console.error('Error fetching available playboxes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Fungsi updateReservationStatus yang telah diperbaiki
exports.updateReservationStatus = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { reservation_id } = req.params;
    const { status, notes } = req.body;
    
    const reservation = await PlayboxReservation.findOne({
      where: { reservation_id },
      include: [{ model: Playbox }],
      transaction
    });
    
    if (!reservation) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Reservasi tidak ditemukan' });
    }
    
    // Update reservation
    await reservation.update({
      status,
      notes: notes ? `${reservation.notes || ''}\n${notes}` : reservation.notes
    }, { transaction });
    
    // Hanya update status Playbox jika benar-benar sedang digunakan
    let playboxStatus = reservation.Playbox.status;
    
    // PERBAIKAN: Hanya ubah status Playbox pada kondisi tertentu
    switch (status) {
      case 'In Use':
        // Playbox sedang aktif digunakan pada slot waktu tertentu
        // Status fisik Playbox diubah menjadi 'In Use'
        playboxStatus = 'In Use';
        break;
      case 'In Transit':
        // Playbox sedang dalam pengiriman
        playboxStatus = 'In Transit';
        break;
      case 'Returning':
        // Playbox sedang dikembalikan
        playboxStatus = 'In Transit';
        break;
      case 'Completed':
      case 'Cancelled':
        // Cek apakah masih ada reservasi aktif lain untuk Playbox ini
        // yang sedang dalam penggunaan pada hari ini atau dalam proses
        const activeReservations = await PlayboxReservation.count({
          where: {
            playbox_id: reservation.playbox_id,
            reservation_id: { [Op.ne]: reservation_id }, // Bukan reservasi saat ini
            status: { [Op.in]: ['In Use', 'In Transit'] }, // Hanya status yang mempengaruhi fisik Playbox
            // Cek reservasi yang sedang aktif hari ini
            [Op.or]: [
              {
                start_time: {
                  [Op.lte]: new Date()
                },
                end_time: {
                  [Op.gte]: new Date()
                }
              }
            ]
          },
          transaction
        });
        
        // Jika tidak ada reservasi aktif lain yang sedang menggunakan Playbox secara fisik,
        // set status Playbox kembali ke Available
        if (activeReservations === 0) {
          playboxStatus = 'Available';
        }
        
        if (status === 'Completed') {
          // Jika completed, set actual_end_time
          await reservation.update({
            actual_end_time: new Date()
          }, { transaction });
        }
        break;
      default:
        // Status lain tidak mengubah status Playbox
        break;
    }
    
    // Update status Playbox jika berubah
    if (playboxStatus !== reservation.Playbox.status) {
      await reservation.Playbox.update({
        status: playboxStatus
      }, { transaction });
    }
    
    await transaction.commit();
    
    res.json({
      message: `Status reservasi berhasil diperbarui ke ${status}`,
      reservation: {
        ...reservation.toJSON()
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating reservation status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllReservationsWithIdentity = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    let whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (startDate && endDate) {
      whereClause.start_time = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereClause.start_time = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereClause.start_time = {
        [Op.lte]: new Date(endDate)
      };
    }
    
    const reservations = await PlayboxReservation.findAll({
      where: whereClause,
      attributes: { 
        exclude: ['pricing_id'] 
      },
      include: [
        { model: Playbox },
        { model: Staff, attributes: ['staff_id', 'name'] },
        { model: CustomerIdentity } // Tambahkan relasi ke CustomerIdentity
      ],
      order: [['start_time', 'ASC']]
    });
    
    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations with identity:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllReservations = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    let whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (startDate && endDate) {
      whereClause.start_time = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereClause.start_time = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereClause.start_time = {
        [Op.lte]: new Date(endDate)
      };
    }
    
    const reservations = await PlayboxReservation.findAll({
      where: whereClause,
      // Tentukan kolom spesifik yang ingin diambil (tanpa pricing_id)
      attributes: { 
        exclude: ['pricing_id'] 
      },
      include: [
        { model: Playbox },
        { model: Staff, attributes: ['staff_id', 'name'] }
      ],
      order: [['start_time', 'ASC']]
    });
    
    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Create a new playbox (admin only)
exports.createPlaybox = async (req, res) => {
  try {
    const { 
      playbox_name, 
      tv_size, 
      ps4_model, 
      controllers_count,
      description,
      image_url,
      location,
      featured 
    } = req.body;
    
    const newPlaybox = await Playbox.create({
      playbox_name,
      tv_size,
      ps4_model,
      controllers_count,
      description,
      image_url,
      status: 'Available',
      location,
      added_date: new Date(),
      featured
    });
    
    res.status(201).json(newPlaybox);
  } catch (error) {
    console.error('Error creating playbox:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a playbox (admin only)
exports.updatePlaybox = async (req, res) => {
  try {
    const { 
      playbox_name, 
      tv_size, 
      ps4_model, 
      controllers_count,
      description,
      image_url,
      status,
      location,
      featured 
    } = req.body;
    
    const playbox = await Playbox.findByPk(req.params.id);
    
    if (!playbox) {
      return res.status(404).json({ message: 'Playbox tidak ditemukan' });
    }
    
    await playbox.update({
      playbox_name,
      tv_size,
      ps4_model,
      controllers_count,
      description,
      image_url,
      status,
      location,
      featured
    });
    
    res.json(playbox);
  } catch (error) {
    console.error('Error updating playbox:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a playbox (admin only)
exports.deletePlaybox = async (req, res) => {
  try {
    const playbox = await Playbox.findByPk(req.params.id);
    
    if (!playbox) {
      return res.status(404).json({ message: 'Playbox tidak ditemukan' });
    }
    
    // Check if playbox has active reservations
    const activeReservation = await PlayboxReservation.findOne({
      where: {
        playbox_id: req.params.id,
        status: {
          [Op.notIn]: ['Completed', 'Cancelled']
        }
      }
    });
    
    if (activeReservation) {
      return res.status(400).json({ message: 'Tidak dapat menghapus Playbox yang memiliki reservasi aktif' });
    }
    
    await playbox.destroy();
    
    res.json({ message: 'Playbox berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting playbox:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};