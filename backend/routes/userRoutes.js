const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');

// Public routes
router.post('/add', registerUser);
router.post('/register', registerUser); // Alternative endpoint
router.post('/login', loginUser);

// Protected routes
router.get('/profile', protect, getUserProfile);

// Get all users (for development/testing - should be protected in production)
router.get('/', async (req, res) => {
  try {
    const User = require('../models/User');
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ 
      error: 'Internal server error while fetching users' 
    });
  }
});

module.exports = router;