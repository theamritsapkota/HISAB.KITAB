const express = require('express');
const { createExpense, getExpensesByGroup, getAllExpenses } = require('../controllers/expenseController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected - require authentication
router.use(protect);

// Create a new expense
router.post('/', createExpense);

// Get all expenses for the authenticated user
router.get('/', getAllExpenses);

// Get expenses for a specific group
router.get('/group/:groupId', getExpensesByGroup);

module.exports = router;