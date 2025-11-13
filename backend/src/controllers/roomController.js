const Room = require('../models/Room');
const User = require('../models/User');
const { redis } = require('../config/redis');
const logger = require('../utils/logger');

exports.createRoom = async (req, res, next) => {
  try {
    const { title, description, category } = req.body;
    const streamerId = req.user.id;

    // Check if user already has an active room
    const activeRooms = await Room.getByStreamer(streamerId, 1);
    const hasActiveRoom = activeRooms.some(room => room.is_live);

    if (hasActiveRoom) {
      return res.status(400).json({ error: 'You already have an active stream' });
    }

    // Create room
    const room = await Room.create({
      streamerId,
      title,
      description,
      category
    });

    // Update user streaming status
    await User.updateStreamingStatus(streamerId, true);

    // Cache in Redis
    await redis.hset('live_rooms', room.room_id, JSON.stringify({
      roomId: room.room_id,
      title: room.title,
      streamerId: streamerId,
      streamerUsername: req.user.username,
      viewerCount: 0,
      category: room.category,
      startedAt: room.started_at
    }));

    logger.info(`Room created: ${room.room_id} by ${req.user.username}`);

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      room
    });
  } catch (error) {
    logger.error('Create room error:', error);
    next(error);
  }
};

exports.getRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findByRoomId(roomId);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Get room statistics
    const stats = await Room.getStatistics(roomId);

    res.json({
      success: true,
      room: {
        ...room,
        stats
      }
    });
  } catch (error) {
    logger.error('Get room error:', error);
    next(error);
  }
};

exports.getLiveRooms = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, category } = req.query;

    let rooms;
    if (category) {
      rooms = await Room.getByCategory(category, parseInt(limit));
    } else {
      rooms = await Room.getLiveRooms(parseInt(limit), parseInt(offset));
    }

    res.json({
      success: true,
      count: rooms.length,
      rooms
    });
  } catch (error) {
    logger.error('Get live rooms error:', error);
    next(error);
  }
};

exports.getMyRooms = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;

    const rooms = await Room.getByStreamer(req.user.id, parseInt(limit));

    res.json({
      success: true,
      count: rooms.length,
      rooms
    });
  } catch (error) {
    logger.error('Get my rooms error:', error);
    next(error);
  }
};

exports.updateRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { title, description, category, thumbnailUrl } = req.body;

    // Verify ownership
    const room = await Room.findByRoomId(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.streamer_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this room' });
    }

    // Update room
    const updatedRoom = await Room.update(roomId, {
      title,
      description,
      category,
      thumbnailUrl
    });

    // Update Redis cache
    const cachedRoom = await redis.hget('live_rooms', roomId);
    if (cachedRoom) {
      const roomData = JSON.parse(cachedRoom);
      roomData.title = title || roomData.title;
      roomData.category = category || roomData.category;
      await redis.hset('live_rooms', roomId, JSON.stringify(roomData));
    }

    logger.info(`Room updated: ${roomId}`);

    res.json({
      success: true,
      message: 'Room updated successfully',
      room: updatedRoom
    });
  } catch (error) {
    logger.error('Update room error:', error);
    next(error);
  }
};

exports.endRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    // Verify ownership
    const room = await Room.findByRoomId(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.streamer_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to end this room' });
    }

    // End stream
    await Room.endStream(roomId);

    // Update user streaming status
    await User.updateStreamingStatus(req.user.id, false);

    // Remove from Redis
    await redis.hdel('live_rooms', roomId);

    logger.info(`Room ended: ${roomId}`);

    res.json({
      success: true,
      message: 'Stream ended successfully'
    });
  } catch (error) {
    logger.error('End room error:', error);
    next(error);
  }
};

exports.searchRooms = async (req, res, next) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const rooms = await Room.search(q, parseInt(limit));

    res.json({
      success: true,
      count: rooms.length,
      query: q,
      rooms
    });
  } catch (error) {
    logger.error('Search rooms error:', error);
    next(error);
  }
};