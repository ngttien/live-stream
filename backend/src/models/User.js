const db = require('../config/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const logger = require('../utils/logger');

class User {
  /**
   * Create new user
   */
  static async create({ username, email, password }) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const streamKey = crypto.randomBytes(16).toString('hex');

      const result = await db.query(
        `INSERT INTO users (username, email, password_hash, stream_key)
         VALUES ($1, $2, $3, $4)
         RETURNING id, username, email, stream_key, created_at`,
        [username, email, hashedPassword, streamKey]
      );

      logger.info(`User created: ${username}`);
      return result.rows[0];
    } catch (error) {
      logger.error('User creation error:', error);
      throw error;
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    const result = await db.query(
      `SELECT id, username, email, display_name, avatar_url, bio, 
              is_streaming, follower_count, created_at, last_login
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  /**
   * Find user by username
   */
  static async findByUsername(username) {
    const result = await db.query(
      `SELECT id, username, email, display_name, avatar_url, bio, 
              is_streaming, follower_count, created_at
       FROM users WHERE username = $1`,
      [username]
    );
    return result.rows[0];
  }

  /**
   * Find user by stream key
   */
  static async findByStreamKey(streamKey) {
    const result = await db.query(
      'SELECT * FROM users WHERE stream_key = $1',
      [streamKey]
    );
    return result.rows[0];
  }

  /**
   * Verify password
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId, { displayName, bio, avatarUrl }) {
    const result = await db.query(
      `UPDATE users 
       SET display_name = COALESCE($1, display_name),
           bio = COALESCE($2, bio),
           avatar_url = COALESCE($3, avatar_url)
       WHERE id = $4
       RETURNING id, username, display_name, bio, avatar_url`,
      [displayName, bio, avatarUrl, userId]
    );
    return result.rows[0];
  }

  /**
   * Update last login
   */
  static async updateLastLogin(userId) {
    await db.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [userId]
    );
  }

  /**
   * Update streaming status
   */
  static async updateStreamingStatus(userId, isStreaming) {
    await db.query(
      'UPDATE users SET is_streaming = $1 WHERE id = $2',
      [isStreaming, userId]
    );
  }

  /**
   * Update follower count
   */
  static async updateFollowerCount(userId) {
    await db.query(
      `UPDATE users 
       SET follower_count = (
         SELECT COUNT(*) FROM follows WHERE following_id = $1
       )
       WHERE id = $1`,
      [userId]
    );
  }

  /**
   * Search users
   */
  static async search(query, limit = 20) {
    const result = await db.query(
      `SELECT id, username, display_name, avatar_url, is_streaming, follower_count
       FROM users
       WHERE username ILIKE $1 OR display_name ILIKE $1
       ORDER BY follower_count DESC
       LIMIT $2`,
      [`%${query}%`, limit]
    );
    return result.rows;
  }

  /**
   * Get user stats
   */
  static async getStats(userId) {
    const result = await db.query(
      `SELECT 
         (SELECT COUNT(*) FROM follows WHERE follower_id = $1) as following_count,
         (SELECT COUNT(*) FROM follows WHERE following_id = $1) as follower_count,
         (SELECT COUNT(*) FROM rooms WHERE streamer_id = $1) as total_streams,
         (SELECT SUM(peak_viewers) FROM rooms WHERE streamer_id = $1) as total_views
       FROM users WHERE id = $1`,
      [userId]
    );
    return result.rows[0];
  }
}

module.exports = User;