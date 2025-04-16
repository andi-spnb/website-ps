// File: server/src/middleware/uploadIdentity.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Pastikan folder sudah ada dan dapat diakses
const dir = 'uploads/identitas';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dir); // Mengatur tujuan penyimpanan file ke 'uploads/identitas'
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeFilename = file.originalname.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `identitas-${Date.now()}-${safeFilename}`;
    cb(null, filename); // Menyimpan file dengan nama unik
  }
});

// Pastikan jenis file yang diupload sesuai (misalnya .jpg, .png, .pdf)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('File harus berupa gambar (JPEG/PNG) atau PDF'), false);
    }
    cb(null, true);
  };
  
const uploadIdentity = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB maksimum
  }
});

module.exports = uploadIdentity;