const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { validateRegister, validateLogin, validateUpdateProfile } = require('../middleware/validation');

// Public routes
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, validateUpdateProfile, authController.updateProfile);
router.post('/refresh', authMiddleware, authController.refreshToken);
router.put('/password', authMiddleware, authController.changePassword);

module.exports = router;