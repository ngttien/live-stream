const express = require('express');
const router = express.Router();
const streamController = require('../controllers/streamController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/:roomId/stats', streamController.getStreamStats);
router.get('/:roomId/messages', streamController.getStreamMessages);

// Protected routes (streamer only)
router.post('/:roomId/ban/:userId', authMiddleware, streamController.banUser);
router.delete('/:roomId/ban/:userId', authMiddleware, streamController.unbanUser);
router.get('/:roomId/bans', authMiddleware, streamController.getBannedUsers);

module.exports = router;