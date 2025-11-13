const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middleware/auth');
const { validateCreateRoom, validateUpdateRoom } = require('../middleware/validation');

// Public routes
router.get('/', roomController.getLiveRooms);
router.get('/search', roomController.searchRooms);
router.get('/:roomId', roomController.getRoom);

// Protected routes
router.post('/', authMiddleware, validateCreateRoom, roomController.createRoom);
router.get('/my/rooms', authMiddleware, roomController.getMyRooms);
router.put('/:roomId', authMiddleware, validateUpdateRoom, roomController.updateRoom);
router.delete('/:roomId', authMiddleware, roomController.endRoom);

module.exports = router;