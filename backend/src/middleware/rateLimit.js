const rateLimit = require('express-rate-limit');
const { redis } = require('../config/redis');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per window (tăng từ 100)
  message: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 attempts per 15 minutes (tăng từ 5)
  message: 'Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 15 phút.',
  skipSuccessfulRequests: true
});

// Create room rate limiter
const createRoomLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 rooms per hour (tăng từ 5)
  message: 'Bạn đã tạo quá nhiều phòng stream. Vui lòng thử lại sau 1 giờ.'
});

// Custom Redis-based rate limiter
const redisRateLimit = (keyPrefix, maxRequests, windowSeconds) => {
  return async (req, res, next) => {
    const identifier = req.user?.id || req.ip;
    const key = `${keyPrefix}:${identifier}`;

    try {
      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }

      if (current > maxRequests) {
        const ttl = await redis.ttl(key);
        const minutes = Math.ceil(ttl / 60);
        return res.status(429).json({
          error: `Bạn đã vượt quá giới hạn yêu cầu. Vui lòng thử lại sau ${minutes} phút.`,
          retryAfter: ttl
        });
      }

      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - current));

      next();
    } catch (error) {
      // If Redis fails, allow the request
      next();
    }
  };
};

module.exports = {
  apiLimiter,
  authLimiter,
  createRoomLimiter,
  redisRateLimit
};