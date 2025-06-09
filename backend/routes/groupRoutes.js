const express = require('express');
const { createGroup, getGroups, getGroupById } = require('../controllers/groupController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected - require authentication
router.use(protect);

// Create a new group
router.post('/', createGroup);

// Get all groups for the authenticated user
router.get('/', getGroups);

// Get a specific group by ID
router.get('/:id', getGroupById);

module.exports = router;