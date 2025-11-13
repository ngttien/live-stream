const db = require('../config/database');
const logger = require('../utils/logger');

class Follow {
  /**
   * Follow user
   */
  static async follow(followerId, followingId) {
    try {
      await db.query(
        `INSERT INTO follows (follower_id, following_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [followerId, followingId]
      );

      // Update follower count
      await db.query(
        `UPDATE users 
         SET follower_count = (SELECT COUNT(*) FROM follows WHERE following_id = $1)
         WHERE id = $1`,
        [followingId]
      );

      logger.info(`User ${followerId} followed ${followingId}`);
      return true;
    } catch (error) {
      logger.error('Follow error:', error);
      throw error;
    }
  }

  /**
   * Unfollow user
   */
  static async unfollow(followerId, followingId) {
    try {
      await db.query(
        'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
        [followerId, followingId]
      );

      // Update follower count
      await db.query(
        `UPDATE users 
         SET follower_count = (SELECT COUNT(*) FROM follows WHERE following_id = $1)
         WHERE id = $1`,
        [followingId]
      );

      logger.info(`User ${followerId} unfollowed ${followingId}`);
      return true;
    } catch (error) {
      logger.error('Unfollow error:', error);
      throw error;
    }
  }

  /**
   * Check if following
   */
  static async isFollowing(followerId, followingId) {
    const result = await db.query(
      'SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, followingId]
    );
    return result.rows.length > 0;
  }

  /**
   * Get followers
   */
  static async getFollowers(userId, limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT u.id, u.username, u.display_name, u.avatar_url, u.is_streaming, f.created_at as followed_at
       FROM follows f
       JOIN users u ON f.follower_id = u.id
       WHERE f.following_id = $1
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  /**
   * Get following
   */
  static async getFollowing(userId, limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT u.id, u.username, u.display_name, u.avatar_url, u.is_streaming, f.created_at as followed_at
       FROM follows f
       JOIN users u ON f.following_id = u.id
       WHERE f.follower_id = $1
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  /**
   * Get live streams from following
   */
  static async getLiveFollowing(userId) {
    const result = await db.query(
      `SELECT r.*, u.username as streamer_username, u.avatar_url as streamer_avatar
       FROM follows f
       JOIN users u ON f.following_id = u.id
       JOIN rooms r ON r.streamer_id = u.id
       WHERE f.follower_id = $1 AND r.is_live = true
       ORDER BY r.viewer_count DESC`,
      [userId]
    );
    return result.rows;
  }

  /**
   * Get follower count
   */
  static async getFollowerCount(userId) {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM follows WHERE following_id = $1',
      [userId]
    );
    return parseInt(result.rows[0].count);
  }

  /**
   * Get following count
   */
  static async getFollowingCount(userId) {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM follows WHERE follower_id = $1',
      [userId]
    );
    return parseInt(result.rows[0].count);
  }
}

module.exports = Follow;