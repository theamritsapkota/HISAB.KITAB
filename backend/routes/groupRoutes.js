// routes/groupRoutes.js
const express = require('express');
const { createGroup, getGroups, getGroupById } = require('../controllers/groupController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// All routes protected - only logged-in users
router.post('/', protect, createGroup);
router.get('/', protect, getGroups);
router.get('/:id', protect, getGroupById);

module.exports = router;
