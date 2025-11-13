const db = require('../../config/database');
const { redis } = require('../../config/redis');
const logger = require('../../utils/logger');
const Room = require('../../models/Room');
const User = require('../../models/User');

module.exports = (socket, io, rooms) => {

  // Create room (streamer)
  socket.on('create-room', async (data, callback) => {
    try {
      const { roomId } = data;

      // Verify room exists in database
      const room = await Room.findByRoomId(roomId);
      if (!room) {
        return callback({ error: 'Room not found' });
      }

      // Verify ownership
      if (room.streamer_id !== socket.userId) {
        return callback({ error: 'Not authorized' });
      }

      // Initialize room in memory
      rooms.set(roomId, {
        id: room.id,
        roomId,
        streamerId: socket.userId,
        streamerSocketId: socket.id,
        viewers: new Map(),
        chatHistory: [],
        startedAt: new Date()
      });

      socket.join(roomId);
      socket.roomId = roomId;
      socket.isStreamer = true;

      logger.info(`Room initialized: ${roomId} by ${socket.username}`);

      callback({ success: true, room });

      // Broadcast new stream to all users
      socket.broadcast.emit('new-stream-started', {
        roomId,
        title: room.title,
        category: room.category,
        streamer: socket.username
      });

    } catch (error) {
      logger.error('Create room error:', error);
      callback({ error: 'Failed to create room' });
    }
  });

  // Join room (viewer)
  socket.on('join-room', async (data, callback) => {
    try {
      const { roomId } = data;
      const room = rooms.get(roomId);

      if (!room) {
        return callback({ error: 'Room not found or not live' });
      }

      // Check ban status
      const banCheck = await db.query(
        `SELECT * FROM bans 
         WHERE room_id = $1 AND user_id = $2 
         AND (expires_at IS NULL OR expires_at > NOW())`,
        [room.id, socket.userId]
      );

      if (banCheck.rows.length > 0) {
        const ban = banCheck.rows[0];
        return callback({
          error: 'You are banned from this room',
          reason: ban.reason,
          expiresAt: ban.expires_at
        });
      }

      // Check capacity
      if (room.viewers.size >= 100) {
        return callback({ error: 'Room is full (max 100 viewers)' });
      }

      // Add viewer
      room.viewers.set(socket.id, {
        userId: socket.userId,
        username: socket.username,
        joinedAt: new Date()
      });

      socket.join(roomId);
      socket.roomId = roomId;
      socket.isStreamer = false;

      // Update database
      await Room.updateViewerCount(roomId, room.viewers.size);

      // Update Redis
      await redis.hincrby(`room:${roomId}:stats`, 'totalViews', 1);

      logger.info(`Viewer joined room ${roomId}: ${socket.username}`);

      // Send room info to viewer
      callback({
        success: true,
        room: {
          roomId,
          viewerCount: room.viewers.size,
          chatHistory: room.chatHistory.slice(-50),
          streamer: socket.username
        }
      });

      // Notify everyone
      io.to(roomId).emit('viewer-joined', {
        userId: socket.userId,
        username: socket.username,
        viewerCount: room.viewers.size
      });

      // Notify streamer to send WebRTC offer
      if (room.streamerSocketId) {
        io.to(room.streamerSocketId).emit('new-viewer', {
          viewerId: socket.id,
          username: socket.username
        });
      }

    } catch (error) {
      logger.error('Join room error:', error);
      callback({ error: 'Failed to join room' });
    }
  });

  // Leave room
  socket.on('leave-room', async (callback) => {
    try {
      if (!socket.roomId) {
        return callback({ error: 'Not in a room' });
      }

      const room = rooms.get(socket.roomId);
      const roomId = socket.roomId;

      if (room) {
        if (socket.isStreamer) {
          // Streamer left - end stream
          io.to(roomId).emit('stream-ended', {
            reason: 'Streamer ended the stream'
          });

          await Room.endStream(roomId);
          await User.updateStreamingStatus(socket.userId, false);
          await redis.hdel('live_rooms', roomId);

          rooms.delete(roomId);
          logger.info(`Stream ended by streamer: ${roomId}`);
        } else {
          // Viewer left
          room.viewers.delete(socket.id);
          await Room.updateViewerCount(roomId, room.viewers.size);

          io.to(roomId).emit('viewer-left', {
            userId: socket.userId,
            username: socket.username,
            viewerCount: room.viewers.size
          });
        }
      }

      socket.leave(roomId);
      socket.roomId = null;
      socket.isStreamer = false;

      callback({ success: true });

    } catch (error) {
      logger.error('Leave room error:', error);
      callback({ error: 'Failed to leave room' });
    }
  });

  // Update stream info
  socket.on('update-stream-info', async (data, callback) => {
    try {
      if (!socket.isStreamer || !socket.roomId) {
        return callback({ error: 'Not authorized' });
      }

      const { title, description } = data;

      await Room.update(socket.roomId, { title, description });

      // Notify viewers
      io.to(socket.roomId).emit('stream-info-updated', {
        title,
        description
      });

      logger.info(`Stream info updated: ${socket.roomId}`);
      callback({ success: true });

    } catch (error) {
      logger.error('Update stream info error:', error);
      callback({ error: 'Failed to update stream info' });
    }
  });

  // Get viewer list
  socket.on('get-viewers', (callback) => {
    try {
      if (!socket.roomId) {
        return callback({ error: 'Not in a room' });
      }

      const room = rooms.get(socket.roomId);
      if (!room) {
        return callback({ error: 'Room not found' });
      }

      const viewers = Array.from(room.viewers.values()).map(v => ({
        userId: v.userId,
        username: v.username,
        joinedAt: v.joinedAt
      }));

      callback({ success: true, viewers });

    } catch (error) {
      logger.error('Get viewers error:', error);
      callback({ error: 'Failed to get viewers' });
    }
  });
};