const Room = require('../models/Room');
const Message = require('../models/Message');
const { redis } = require('../config/redis');
const logger = require('../utils/logger');
const crypto = require('crypto');

// Generate signed URL for stream access
exports.getStreamToken = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    const room = await Room.findByRoomId(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (!room.is_live) {
      return res.status(400).json({ error: 'Stream is not live' });
    }

    // Check if user is banned
    const db = require('../config/database');
    const banCheck = await db.query(
      `SELECT * FROM bans 
       WHERE room_id = $1 AND user_id = $2 
       AND (expires_at IS NULL OR expires_at > NOW())`,
      [room.id, userId]
    );

    if (banCheck.rows.length > 0) {
      return res.status(403).json({ error: 'You are banned from this stream' });
    }

    // Generate signed token
    const expires = Date.now() + 3600000; // 1 hour
    const streamSecret = process.env.STREAM_SECRET || process.env.JWT_SECRET;
    const data = `${room.stream_key}:${userId}:${expires}`;
    const signature = crypto
      .createHmac('sha256', streamSecret)
      .update(data)
      .digest('hex');

    // Log access for audit
    await redis.setex(
      `stream_access:${roomId}:${userId}`,
      3600,
      JSON.stringify({
        timestamp: Date.now(),
        ip: req.ip,
        userAgent: req.get('user-agent')
      })
    );

    logger.info(`Stream token generated for user ${userId} in room ${roomId}`);

    res.json({
      success: true,
      token: signature,
      expires: expires,
      streamKey: room.stream_key,
      url: `${process.env.HLS_BASE_URL || 'http://localhost:8000'}/live/${room.stream_key}.flv`
    });
  } catch (error) {
    logger.error('Get stream token error:', error);
    next(error);
  }
};

// Verify stream token (middleware for RTMP/HLS server)
exports.verifyStreamToken = async (req, res, next) => {
  try {
    const { streamKey, token, expires, userId } = req.query;

    if (!streamKey || !token || !expires || !userId) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    // Check expiration
    if (Date.now() > parseInt(expires)) {
      return res.status(410).json({ error: 'Token expired' });
    }

    // Verify signature
    const streamSecret = process.env.STREAM_SECRET || process.env.JWT_SECRET;
    const data = `${streamKey}:${userId}:${expires}`;
    const expectedSignature = crypto
      .createHmac('sha256', streamSecret)
      .update(data)
      .digest('hex');

    if (token !== expectedSignature) {
      logger.warn(`Invalid stream token attempt for stream ${streamKey}`);
      return res.status(403).json({ error: 'Invalid token' });
    }

    res.json({ success: true, valid: true });
  } catch (error) {
    logger.error('Verify stream token error:', error);
    next(error);
  }
};

exports.getStreamStats = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findByRoomId(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Get real-time stats from Redis
    const cachedRoom = await redis.hget('live_rooms', roomId);
    const stats = await Room.getStatistics(roomId);

    let realTimeData = {};
    if (cachedRoom) {
      realTimeData = JSON.parse(cachedRoom);
    }

    res.json({
      success: true,
      stats: {
        ...stats,
        currentViewers: realTimeData.viewerCount || room.viewer_count,
        isLive: room.is_live
      }
    });
  } catch (error) {
    logger.error('Get stream stats error:', error);
    next(error);
  }
};

exports.getStreamMessages = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { limit = 100 } = req.query;

    const room = await Room.findByRoomId(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const messages = await Message.getByRoom(room.id, parseInt(limit));

    res.json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    logger.error('Get stream messages error:', error);
    next(error);
  }
};

exports.banUser = async (req, res, next) => {
  try {
    const { roomId, userId } = req.params;
    const { reason, duration } = req.body; // duration in minutes

    const room = await Room.findByRoomId(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Verify ownership
    if (room.streamer_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const db = require('../config/database');

    // Calculate expiration
    let expiresAt = null;
    if (duration) {
      expiresAt = new Date(Date.now() + duration * 60 * 1000);
    }

    // Create ban
    await db.query(
      `INSERT INTO bans (room_id, user_id, banned_by, reason, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (room_id, user_id) DO UPDATE 
       SET reason = $4, expires_at = $5, created_at = NOW()`,
      [room.id, userId, req.user.id, reason, expiresAt]
    );

    // Delete user's messages
    await Message.deleteByUserInRoom(userId, room.id);

    logger.info(`User ${userId} banned from room ${roomId}`);

    res.json({
      success: true,
      message: 'User banned successfully'
    });
  } catch (error) {
    logger.error('Ban user error:', error);
    next(error);
  }
};

exports.unbanUser = async (req, res, next) => {
  try {
    const { roomId, userId } = req.params;

    const room = await Room.findByRoomId(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Verify ownership
    if (room.streamer_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const db = require('../config/database');
    await db.query(
      'DELETE FROM bans WHERE room_id = $1 AND user_id = $2',
      [room.id, userId]
    );

    logger.info(`User ${userId} unbanned from room ${roomId}`);

    res.json({
      success: true,
      message: 'User unbanned successfully'
    });
  } catch (error) {
    logger.error('Unban user error:', error);
    next(error);
  }
};

exports.getBannedUsers = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findByRoomId(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Verify ownership
    if (room.streamer_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const db = require('../config/database');
    const result = await db.query(
      `SELECT b.*, u.username, u.avatar_url
       FROM bans b
       JOIN users u ON b.user_id = u.id
       WHERE b.room_id = $1
       AND (b.expires_at IS NULL OR b.expires_at > NOW())
       ORDER BY b.created_at DESC`,
      [room.id]
    );

    res.json({
      success: true,
      count: result.rows.length,
      bans: result.rows
    });
  } catch (error) {
    logger.error('Get banned users error:', error);
    next(error);
  }
};