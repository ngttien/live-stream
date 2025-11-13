// File: backend/scripts/seed.js
const db = require('../src/config/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const logger = require('../src/utils/logger');

async function seedDatabase() {
  try {
    logger.info('Starting database seeding...');

    // Create test users
    const users = [
      { username: 'streamer1', email: 'streamer1@test.com', displayName: 'Pro Streamer' },
      { username: 'streamer2', email: 'streamer2@test.com', displayName: 'Gaming Master' },
      { username: 'viewer1', email: 'viewer1@test.com', displayName: 'Regular Viewer' },
      { username: 'viewer2', email: 'viewer2@test.com', displayName: 'Fan Account' },
      { username: 'admin', email: 'admin@test.com', displayName: 'Administrator' }
    ];

    const password = await bcrypt.hash('password123', 10);
    const createdUsers = [];

    for (const user of users) {
      const streamKey = crypto.randomBytes(16).toString('hex');
      
      const result = await db.query(
        `INSERT INTO users (username, email, password_hash, display_name, stream_key, bio)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (email) DO NOTHING
         RETURNING id, username, email, stream_key`,
        [
          user.username,
          user.email,
          password,
          user.displayName,
          streamKey,
          `This is ${user.displayName}'s bio. Welcome to my channel!`
        ]
      );

      if (result.rows[0]) {
        createdUsers.push(result.rows[0]);
        logger.info(`Created user: ${user.username}`);
      }
    }

    // Create follows
    if (createdUsers.length >= 3) {
      await db.query(
        'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [createdUsers[2].id, createdUsers[0].id]
      );
      await db.query(
        'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [createdUsers[3].id, createdUsers[0].id]
      );
      await db.query(
        'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [createdUsers[3].id, createdUsers[1].id]
      );
      logger.info('Created follow relationships');
    }

    // Create sample rooms (not live)
    const categories = ['gaming', 'music', 'talk', 'creative'];
    
    for (let i = 0; i < 2; i++) {
      const streamer = createdUsers[i];
      const roomId = `room_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      
      await db.query(
        `INSERT INTO rooms (room_id, streamer_id, title, description, category, is_live)
         VALUES ($1, $2, $3, $4, $5, false)`,
        [
          roomId,
          streamer.id,
          `${streamer.username}'s Past Stream`,
          'This was an amazing stream! Thanks for watching.',
          categories[i % categories.length]
        ]
      );
      
      logger.info(`Created sample room for ${streamer.username}`);
    }

    logger.info('Database seeding completed successfully');
    logger.info('\nTest credentials:');
    logger.info('Email: streamer1@test.com | Password: password123');
    logger.info('Email: admin@test.com | Password: password123');
    
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();