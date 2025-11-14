const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.user?.id || 'Guest',
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.',
      details: Object.values(err.errors).map(e => e.message)
    });
  }
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token không hợp lệ. Vui lòng đăng nhập lại.'
    });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
    });
  }
  // PostgreSQL errors
  if (err.code === '23505') { // Unique violation
    return res.status(409).json({
      error: 'Dữ liệu đã tồn tại trong hệ thống.',
      detail: err.detail
    });
  }
  if (err.code === '23503') { // Foreign key violation
    return res.status(400).json({
      error: 'Tham chiếu không hợp lệ. Vui lòng kiểm tra lại.',
      detail: err.detail
    });
  }
  if (err.code === '23502') { // Not null violation
    return res.status(400).json({
      error: 'Thiếu thông tin bắt buộc. Vui lòng điền đầy đủ.',
      detail: err.detail
    });
  }
  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.';
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;