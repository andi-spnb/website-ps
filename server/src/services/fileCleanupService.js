// File: server/src/services/fileCleanupService.js
const fs = require('fs');
const path = require('path');
const { CustomerIdentity } = require('../models');
const { Op } = require('sequelize');

// Service untuk membersihkan file-file kadaluarsa
const cleanupExpiredFiles = async () => {
  try {
    console.log('Menjalankan pembersihan file kadaluarsa...');
    
    // Ambil semua identitas yang sudah melewati expiry_date
    const expiredIdentities = await CustomerIdentity.findAll({
      where: {
        expiry_date: {
          [Op.lt]: new Date() // Tanggal kedaluwarsa kurang dari hari ini
        }
      }
    });
    
    console.log(`Ditemukan ${expiredIdentities.length} file identitas yang kadaluarsa.`);
    
    // Hapus file dan record database
    for (const identity of expiredIdentities) {
      const filePath = path.join(__dirname, '../../', identity.identity_file_url);
      
      // Hapus file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`File identitas dihapus: ${filePath}`);
      } else {
        console.log(`File tidak ditemukan: ${filePath}`);
      }
      
      // Hapus record dari database
      await identity.destroy();
      console.log(`Record identitas dihapus dari database: ID ${identity.identity_id}`);
    }
    
    // Juga hapus file-file bukti pembayaran yang kadaluarsa
    // Ini bisa disesuaikan berdasarkan kebutuhan
    const paymentProofDir = path.join(__dirname, '../../uploads/bukti');
    if (fs.existsSync(paymentProofDir)) {
      // Tentukan batas waktu (misalnya 30 hari)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);
      
      const files = fs.readdirSync(paymentProofDir);
      for (const file of files) {
        const filePath = path.join(paymentProofDir, file);
        const stats = fs.statSync(filePath);
        
        // Jika file lebih lama dari batas waktu, hapus
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          console.log(`File bukti pembayaran lama dihapus: ${filePath}`);
        }
      }
    }
    
    console.log('Pembersihan file selesai.');
  } catch (error) {
    console.error('Error dalam pembersihan file:', error);
  }
};

// Jadwalkan pembersihan file untuk dijalankan setiap hari pada pukul 3 pagi
const scheduleFileCleanup = () => {
  console.log('Menjadwalkan pembersihan file otomatis...');
  
  // Jalankan setiap hari pada jam 3 pagi
  const runAt = new Date();
  runAt.setHours(3, 0, 0, 0);
  
  // Jika sudah lewat jam 3 pagi, jadwalkan untuk besok
  if (runAt < new Date()) {
    runAt.setDate(runAt.getDate() + 1);
  }
  
  const timeUntilRun = runAt - new Date();
  console.log(`Pembersihan file akan dijalankan dalam ${Math.floor(timeUntilRun / (1000 * 60 * 60))} jam`);
  
  // Set timeout untuk menjalankan fungsi pada waktu yang ditentukan
  setTimeout(() => {
    cleanupExpiredFiles();
    
    // Kemudian jadwalkan untuk dijalankan setiap 24 jam
    setInterval(cleanupExpiredFiles, 24 * 60 * 60 * 1000);
  }, timeUntilRun);
};

module.exports = {
  cleanupExpiredFiles,
  scheduleFileCleanup
};