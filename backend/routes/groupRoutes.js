const express = require('express');
const router = express.Router();
const { createGroup, getGroups, getGroupById } = require('../controllers/groupController');
const protect = require('../middleware/authMiddleware');

// All group routes require authentication
router.use(protect);

// Group routes
router.post('/', createGroup);
router.post('/add', createGroup); // Alternative endpoint for compatibility
router.get('/', getGroups);
router.get('/:id', getGroupById);

module.exports = router;