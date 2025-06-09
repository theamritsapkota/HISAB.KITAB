// routes/expenseRoutes.js
const express = require('express');
const { addExpense, getExpensesByGroup } = require('../controllers/expenseController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// All routes protected
router.post('/', protect, addExpense);
router.get('/group/:groupId', protect, getExpensesByGroup);

module.exports = router;
