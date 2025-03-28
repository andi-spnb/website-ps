module.exports = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.userData) {
      return res.status(401).json({ message: 'Autentikasi gagal' });
    }

    if (allowedRoles.includes(req.userData.role)) {
      next();
    } else {
      return res.status(403).json({ message: 'Akses ditolak. Anda tidak memiliki izin yang cukup.' });
    }
  };
};