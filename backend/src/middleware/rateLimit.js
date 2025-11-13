const rateLimit = require('express-rate-limit');
const { redis } = require('../config/redis');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many login attempts, please try again later',
  skipSuccessfulRequests: true
});

// Create room rate limiter
const createRoomLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 rooms per hour
  message: 'Too many rooms created, please try again later'
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
        return res.status(429).json({
          error: 'Rate limit exceeded',
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