const Room = require('../models/Room');
const Message = require('../models/Message');
const { redis } = require('../config/redis');
const logger = require('../utils/logger');

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