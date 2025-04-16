// File: server/src/middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Pastikan folder uploads ada
const uploadDirs = ['uploads', 'uploads/bukti', 'uploads/identitas'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Menentukan folder tujuan berdasarkan field name
    const folder = file.fieldname === 'identity_file' 
      ? 'uploads/identitas' 
      : 'uploads/bukti';
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    // Mendapatkan ekstensi file yang benar
    const ext = path.extname(file.originalname).toLowerCase();
    // Membuat nama file yang aman
    const cleanName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 20); // limit nama file
    
    // Buat nama file dengan format yang konsisten
    const prefix = file.fieldname === 'identity_file' ? 'identitas' : 'bukti';
    const filename = `${prefix}-${Date.now()}-${cleanName}${ext}`;
    
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Hanya file JPEG, PNG, atau PDF yang diperbolehkan!'));
  }
};

// Upload multipart untuk semua jenis file
const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = upload;