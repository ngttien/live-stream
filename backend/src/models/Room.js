const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class Room {
  /**
   * Create new room
   */
  static async create({ streamerId, title, description, category }) {
    try {
      const roomId = `room_${uuidv4()}`;

      const result = await db.query(
        `INSERT INTO rooms (room_id, streamer_id, title, description, category, is_live, started_at)
         VALUES ($1, $2, $3, $4, $5, true, NOW())
         RETURNING *`,
        [roomId, streamerId, title, description, category]
      );

      logger.info(`Room created: ${roomId} by user ${streamerId}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Room creation error:', error);
      throw error;
    }
  }

  /**
   * Find room by ID
   */
  static async findById(id) {
    const result = await db.query(
      `SELECT r.*, u.username as streamer_username, u.avatar_url as streamer_avatar
       FROM rooms r
       JOIN users u ON r.streamer_id = u.id
       WHERE r.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  /**
   * Find room by room_id
   */
  static async findByRoomId(roomId) {
    const result = await db.query(
      `SELECT r.*, u.username as streamer_username, u.avatar_url as streamer_avatar, u.stream_key
       FROM rooms r
       JOIN users u ON r.streamer_id = u.id
       WHERE r.room_id = $1`,
      [roomId]
    );
    return result.rows[0];
  }

  /**
   * Get all live rooms
   */
  static async getLiveRooms(limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT r.*, u.username as streamer_username, u.avatar_url as streamer_avatar, u.stream_key
       FROM rooms r
       JOIN users u ON r.streamer_id = u.id
       WHERE r.is_live = true
       ORDER BY r.viewer_count DESC, r.started_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  /**
   * Get rooms by category
   */
  static async getByCategory(category, limit = 50) {
    const result = await db.query(
      `SELECT r.*, u.username as streamer_username, u.avatar_url as streamer_avatar
       FROM rooms r
       JOIN users u ON r.streamer_id = u.id
       WHERE r.is_live = true AND r.category = $1
       ORDER BY r.viewer_count DESC
       LIMIT $2`,
      [category, limit]
    );
    return result.rows;
  }

  /**
   * Get rooms by streamer
   */
  static async getByStreamer(streamerId, limit = 20) {
    const result = await db.query(
      `SELECT r.*, u.username as streamer_username
       FROM rooms r
       JOIN users u ON r.streamer_id = u.id
       WHERE r.streamer_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2`,
      [streamerId, limit]
    );
    return result.rows;
  }

  /**
   * Update viewer count
   */
  static async updateViewerCount(roomId, count) {
    await db.query(
      `UPDATE rooms 
       SET viewer_count = $1,
           peak_viewers = GREATEST(peak_viewers, $1)
       WHERE room_id = $2`,
      [count, roomId]
    );
  }

  /**
   * End stream
   */
  static async endStream(roomId) {
    const result = await db.query(
      `UPDATE rooms 
       SET is_live = false, ended_at = NOW(), viewer_count = 0
       WHERE room_id = $1
       RETURNING *`,
      [roomId]
    );

    if (result.rows[0]) {
      logger.info(`Stream ended: ${roomId}`);
    }

    return result.rows[0];
  }

  /**
   * Update room info
   */
  static async update(roomId, { title, description, category, thumbnailUrl }) {
    const result = await db.query(
      `UPDATE rooms 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           category = COALESCE($3, category),
           thumbnail_url = COALESCE($4, thumbnail_url)
       WHERE room_id = $5
       RETURNING *`,
      [title, description, category, thumbnailUrl, roomId]
    );
    return result.rows[0];
  }

  /**
   * Search rooms
   */
  static async search(query, limit = 20) {
    const result = await db.query(
      `SELECT r.*, u.username as streamer_username, u.avatar_url as streamer_avatar
       FROM rooms r
       JOIN users u ON r.streamer_id = u.id
       WHERE r.is_live = true 
         AND (r.title ILIKE $1 OR r.description ILIKE $1 OR u.username ILIKE $1)
       ORDER BY r.viewer_count DESC
       LIMIT $2`,
      [`%${query}%`, limit]
    );
    return result.rows;
  }

  /**
   * Get room statistics
   */
  static async getStatistics(roomId) {
    const result = await db.query(
      `SELECT 
         COUNT(DISTINCT m.user_id) as unique_chatters,
         COUNT(m.id) as total_messages,
         r.peak_viewers,
         EXTRACT(EPOCH FROM (COALESCE(r.ended_at, NOW()) - r.started_at)) as duration_seconds
       FROM rooms r
       LEFT JOIN messages m ON r.id = m.room_id
       WHERE r.room_id = $1
       GROUP BY r.id`,
      [roomId]
    );
    return result.rows[0];
  }

  /**
   * Delete old inactive rooms
   */
  static async deleteOldRooms(daysOld = 30) {
    const result = await db.query(
      `DELETE FROM rooms 
       WHERE is_live = false 
         AND ended_at < NOW() - INTERVAL '${daysOld} days'
       RETURNING id`
    );

    logger.info(`Deleted ${result.rowCount} old rooms`);
    return result.rowCount;
  }
}

module.exports = Room;