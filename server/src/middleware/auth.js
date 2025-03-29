const jwt = require('jsonwebtoken');
require('dotenv').config();

// server/src/middleware/auth.js
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = decoded;
    
    // Log peran pengguna
    console.log('User role:', req.userData.role);
    
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Autentikasi gagal',
      error: error.message
    });
  }
};