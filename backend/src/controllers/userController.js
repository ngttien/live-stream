const User = require('../models/User');
const Follow = require('../models/Follow');
const logger = require('../utils/logger');

exports.getUser = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await User.findByUsername(username);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user stats
    const stats = await User.getStats(user.id);

    // Check if current user is following this user
    let isFollowing = false;
    if (req.user) {
      isFollowing = await Follow.isFollowing(req.user.id, user.id);
    }

    res.json({
      success: true,
      user: {
        ...user,
        stats,
        isFollowing
      }
    });
  } catch (error) {
    logger.error('Get user error:', error);
    next(error);
  }
};

exports.followUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    // Can't follow yourself
    if (parseInt(userId) === followerId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // Check if user exists
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Follow user
    await Follow.follow(followerId, parseInt(userId));

    logger.info(`User ${req.user.username} followed user ${userId}`);

    res.json({
      success: true,
      message: 'User followed successfully'
    });
  } catch (error) {
    logger.error('Follow user error:', error);
    next(error);
  }
};

exports.unfollowUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;

    await Follow.unfollow(followerId, parseInt(userId));

    logger.info(`User ${req.user.username} unfollowed user ${userId}`);

    res.json({
      success: true,
      message: 'User unfollowed successfully'
    });
  } catch (error) {
    logger.error('Unfollow user error:', error);
    next(error);
  }
};

exports.getFollowers = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const followers = await Follow.getFollowers(
      user.id,
      parseInt(limit),
      parseInt(offset)
    );

    res.json({
      success: true,
      count: followers.length,
      followers
    });
  } catch (error) {
    logger.error('Get followers error:', error);
    next(error);
  }
};

exports.getFollowing = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const following = await Follow.getFollowing(
      user.id,
      parseInt(limit),
      parseInt(offset)
    );

    res.json({
      success: true,
      count: following.length,
      following
    });
  } catch (error) {
    logger.error('Get following error:', error);
    next(error);
  }
};

exports.getLiveFollowing = async (req, res, next) => {
  try {
    const liveStreams = await Follow.getLiveFollowing(req.user.id);

    res.json({
      success: true,
      count: liveStreams.length,
      streams: liveStreams
    });
  } catch (error) {
    logger.error('Get live following error:', error);
    next(error);
  }
};

exports.searchUsers = async (req, res, next) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const users = await User.search(q, parseInt(limit));

    res.json({
      success: true,
      count: users.length,
      query: q,
      users
    });
  } catch (error) {
    logger.error('Search users error:', error);
    next(error);
  }
};