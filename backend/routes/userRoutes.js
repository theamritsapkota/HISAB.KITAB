const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/add', async (req, res) => {
  const { name, email, password } = req.body;

<<<<<<< HEAD
// Protected routes
router.get('/profile', protect, getUserProfile);
=======
  try {
    const newUser = new User({ name, email, password });
    await newUser.save();
    res.status(201).json({ message: 'User created', user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
>>>>>>> cf6e25f

module.exports = router;