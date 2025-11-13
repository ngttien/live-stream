const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const { redis } = require('../config/redis');
const db = require('../config/database');
const logger = require('../utils/logger');

const roomHandlers = require('./handlers/roomHandlers');
const chatHandlers = require('./handlers/chatHandlers');

class SocketManager {
  constructor(server) {
    this.io = socketIo(server, {
      cors: {
        origin: process.env.CLIENT_URL || '*',
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
      maxHttpBufferSize: 1e6,
      allowEIO3: true
    });

    this.rooms = new Map(); // In-memory room state
    this.setupMiddleware();
    this.setupEventHandlers();
    this.startCleanupInterval();

    logger.info('Socket.io initialized');
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token;

        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.username = decoded.username;
        socket.email = decoded.email;

        logger.debug(`Socket authenticated: ${socket.username} (${socket.id})`);
        next();
      } catch (error) {
        logger.error('Socket auth error:', error);
        next(new Error('Authentication error: Invalid token'));
      }
    });

    // Rate limiting middleware
    this.io.use(async (socket, next) => {
      const ip = socket.handshake.address;
      const key = `socket_connect:${ip}`;

      try {
        const count = await redis.incr(key);
        if (count === 1) {
          await redis.expire(key, 60);
        }

        if (count > 10) { // Max 10 connections per minute per IP
          return next(new Error('Too many connection attempts'));
        }

        next();
      } catch (error) {
        next();
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`User connected: ${socket.username} (${socket.id})`);

      // Track online status
      this.setUserOnline(socket.userId, socket.id);

      // Register event handlers
      roomHandlers(socket, this.io, this.rooms);
      chatHandlers(socket, this.io, this.rooms);

      // Handle disconnect
      socket.on('disconnect', async (reason) => {
        logger.info(`User disconnected: ${socket.username} (${reason})`);

        await this.handleDisconnect(socket);
      });

      // Handle errors
      socket.on('error', (error) => {
        logger.error(`Socket error for ${socket.username}:`, error);
      });

      // Ping-pong for connection health
      socket.on('ping', () => {
        socket.emit('pong');
      });
    });
  }

  async handleDisconnect(socket) {
    try {
      // Remove from online users
      await this.setUserOffline(socket.userId);

      // Handle room cleanup
      if (socket.roomId) {
        const room = this.rooms.get(socket.roomId);

        if (room) {
          if (socket.isStreamer) {
            // Streamer disconnected - end stream
            logger.info(`Streamer disconnected from room: ${socket.roomId}`);

            this.io.to(socket.roomId).emit('stream-ended', {
              reason: 'Streamer disconnected'
            });

            // Update database
            await db.query(
              `UPDATE rooms 
               SET is_live = false, ended_at = NOW(), viewer_count = 0 
               WHERE room_id = $1`,
              [socket.roomId]
            );

            // Update user streaming status
            await db.query(
              'UPDATE users SET is_streaming = false WHERE id = $1',
              [socket.userId]
            );

            // Remove from Redis
            await redis.hdel('live_rooms', socket.roomId);

            // Clean up room
            this.rooms.delete(socket.roomId);
          } else {
            // Viewer disconnected
            room.viewers.delete(socket.id);

            // Update viewer count
            await db.query(
              'UPDATE rooms SET viewer_count = $1 WHERE room_id = $2',
              [room.viewers.size, socket.roomId]
            );

            // Notify others
            this.io.to(socket.roomId).emit('viewer-left', {
              userId: socket.userId,
              username: socket.username,
              viewerCount: room.viewers.size
            });

            logger.debug(`Viewer left room ${socket.roomId}: ${socket.username}`);
          }
        }
      }
    } catch (error) {
      logger.error('Disconnect handler error:', error);
    }
  }

  async setUserOnline(userId, socketId) {
    try {
      await redis.hset('online_users', userId, JSON.stringify({
        socketId,
        timestamp: Date.now()
      }));
    } catch (error) {
      logger.error('Set user online error:', error);
    }
  }

  async setUserOffline(userId) {
    try {
      await redis.hdel('online_users', userId);
    } catch (error) {
      logger.error('Set user offline error:', error);
    }
  }

  startCleanupInterval() {
    // Clean up stale data every 5 minutes
    setInterval(async () => {
      try {
        logger.debug('Running socket cleanup...');

        // Clean up empty rooms
        for (const [roomId, room] of this.rooms.entries()) {
          if (room.viewers.size === 0 && !room.streamerSocketId) {
            this.rooms.delete(roomId);
            logger.debug(`Cleaned up empty room: ${roomId}`);
          }
        }

        // Clean up stale online users
        const onlineUsers = await redis.hgetall('online_users');
        const now = Date.now();

        for (const [userId, data] of Object.entries(onlineUsers)) {
          const userData = JSON.parse(data);
          if (now - userData.timestamp > 300000) { // 5 minutes
            await redis.hdel('online_users', userId);
            logger.debug(`Cleaned up stale online user: ${userId}`);
          }
        }
      } catch (error) {
        logger.error('Cleanup interval error:', error);
      }
    }, 5 * 60 * 1000);
  }

  getIO() {
    return this.io;
  }

  getRooms() {
    return this.rooms;
  }
}

module.exports = SocketManager;