const db = require('../config/database');
const logger = require('../utils/logger');

class Message {
  /**
   * Create message
   */
  static async create({ roomId, userId, username, content }) {
    try {
      const result = await db.query(
        `INSERT INTO messages (room_id, user_id, username, content)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [roomId, userId, username, content]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Message creation error:', error);
      throw error;
    }
  }

  /**
   * Get messages by room
   */
  static async getByRoom(roomId, limit = 100) {
    const result = await db.query(
      `SELECT m.*, u.avatar_url
       FROM messages m
       LEFT JOIN users u ON m.user_id = u.id
       WHERE m.room_id = $1 AND m.is_deleted = false
       ORDER BY m.created_at DESC
       LIMIT $2`,
      [roomId, limit]
    );
    return result.rows.reverse();
  }

  /**
   * Delete message (soft delete)
   */
  static async softDelete(messageId) {
    await db.query(
      'UPDATE messages SET is_deleted = true WHERE id = $1',
      [messageId]
    );
  }

  /**
   * Delete messages by user in room
   */
  static async deleteByUserInRoom(userId, roomId) {
    const result = await db.query(
      'UPDATE messages SET is_deleted = true WHERE user_id = $1 AND room_id = $2',
      [userId, roomId]
    );
    return result.rowCount;
  }

  /**
   * Get message count
   */
  static async getCountByRoom(roomId) {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM messages WHERE room_id = $1 AND is_deleted = false',
      [roomId]
    );
    return parseInt(result.rows[0].count);
  }

  /**
   * Clean old messages
   */
  static async cleanOldMessages(daysOld = 7) {
    const result = await db.query(
      `DELETE FROM messages 
       WHERE created_at < NOW() - INTERVAL '${daysOld} days'`
    );
    logger.info(`Cleaned ${result.rowCount} old messages`);
    return result.rowCount;
  }
}

module.exports = Message;