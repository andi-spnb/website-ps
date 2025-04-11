const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Pastikan folder sudah ada dan dapat diakses
const dir = 'uploads/bukti';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dir); // Mengatur tujuan penyimpanan file ke 'uploads/bukti'
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `bukti-${Date.now()}${ext}`;
    cb(null, filename); // Menyimpan file dengan nama unik
  }
});

// Pastikan jenis file yang diupload sesuai (misalnya .jpg, .png, .pdf)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('File harus berupa gambar atau PDF'), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
