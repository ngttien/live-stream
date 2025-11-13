const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');

// Public routes
router.get('/search', userController.searchUsers);
router.get('/:username', optionalAuth, userController.getUser);
router.get('/:username/followers', userController.getFollowers);
router.get('/:username/following', userController.getFollowing);

// Protected routes
router.post('/:userId/follow', authMiddleware, userController.followUser);
router.delete('/:userId/follow', authMiddleware, userController.unfollowUser);
router.get('/following/live', authMiddleware, userController.getLiveFollowing);

module.exports = router;