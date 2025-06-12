const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);  // POST /users/register
router.post('/login', loginUser);        // POST /users/login

// Protected routes
router.get('/profile',s protect, getUserProfile);  // GET /users/profile

// Get all users (for testing - protect in production)
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
