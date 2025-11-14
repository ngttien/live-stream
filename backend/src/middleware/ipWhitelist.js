const logger = require('../utils/logger');
const { redis } = require('../config/redis');

/**
 * IP Whitelist Middleware for Streamers
 * Allows streamers to restrict streaming from specific IPs
 */
exports.checkStreamerIP = async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const clientIP = req.ip || req.connection.remoteAddress;

        // Get room
        const Room = require('../models/Room');
        const room = await Room.findByRoomId(roomId);

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Check if IP whitelist is enabled for this room
        const whitelistKey = `ip_whitelist:${room.id}`;
        const whitelist = await redis.get(whitelistKey);

        if (whitelist) {
            const allowedIPs = JSON.parse(whitelist);

            if (!allowedIPs.includes(clientIP)) {
                logger.warn(`Blocked streaming attempt from unauthorized IP: ${clientIP} for room ${roomId}`);

                // Log security event
                await logSecurityEvent({
                    type: 'IP_BLOCKED',
                    roomId: room.id,
                    userId: req.user?.id,
                    ip: clientIP,
                    details: 'IP not in whitelist'
                });

                return res.status(403).json({
                    error: 'Your IP address is not authorized to stream to this room'
                });
            }
        }

        next();
    } catch (error) {
        logger.error('IP whitelist check error:', error);
        next(error);
    }
};

/**
 * Rate limit by IP
 */
exports.rateLimitByIP = (maxRequests = 100, windowMs = 60000) => {
    return async (req, res, next) => {
        try {
            const clientIP = req.ip || req.connection.remoteAddress;
            const key = `rate_limit:${clientIP}`;

            const current = await redis.incr(key);

            if (current === 1) {
                await redis.expire(key, Math.ceil(windowMs / 1000));
            }

            if (current > maxRequests) {
                logger.warn(`Rate limit exceeded for IP: ${clientIP}`);

                await logSecurityEvent({
                    type: 'RATE_LIMIT_EXCEEDED',
                    ip: clientIP,
                    details: `${current} requests in ${windowMs}ms`
                });

                return res.status(429).json({
                    error: 'Too many requests, please try again later'
                });
            }

            res.setHeader('X-RateLimit-Limit', maxRequests);
            res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - current));

            next();
        } catch (error) {
            logger.error('Rate limit error:', error);
            next();
        }
    };
};

/**
 * Log security events for audit
 */
async function logSecurityEvent(event) {
    try {
        // Log to Redis only (skip database if audit_logs table doesn't exist)
        const logKey = 'security_events';
        await redis.lpush(logKey, JSON.stringify({
            ...event,
            timestamp: Date.now()
        }));
        await redis.ltrim(logKey, 0, 999);

        logger.info(`Security event logged: ${event.type}`);

        // Try to log to database, but don't fail if table doesn't exist
        try {
            const db = require('../config/database');
            await db.query(
                `INSERT INTO audit_logs (event_type, room_id, user_id, ip_address, details, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
                [
                    event.type,
                    event.roomId || null,
                    event.userId || null,
                    event.ip,
                    JSON.stringify(event.details)
                ]
            );
        } catch (dbError) {
            // Silently ignore if audit_logs table doesn't exist
            if (dbError.code !== '42P01') {
                logger.error('Database audit log error:', dbError.message);
            }
        }
    } catch (error) {
        logger.error('Failed to log security event:', error);
    }
}

exports.logSecurityEvent = logSecurityEvent;
