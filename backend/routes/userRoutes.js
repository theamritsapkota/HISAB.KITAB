const express = require('express');
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', protect, getUserProfile);

module.exports = router;